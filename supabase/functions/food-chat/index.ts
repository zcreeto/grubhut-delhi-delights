import { corsHeaders } from "npm:@supabase/supabase-js@2/cors";
import { createClient } from "npm:@supabase/supabase-js@2";
import { z } from "npm:zod@3";
import { menuText } from "./menu.ts";

const Body = z.object({
  threadId: z.string().uuid(),
  message: z.string().trim().min(1).max(2000),
});

const json = (status: number, body: unknown) =>
  new Response(JSON.stringify(body), {
    status,
    headers: { ...corsHeaders, "Content-Type": "application/json" },
  });

async function getWeather(): Promise<string> {
  try {
    const r = await fetch(
      "https://api.open-meteo.com/v1/forecast?latitude=28.4595&longitude=77.0266&current=temperature_2m,precipitation,weather_code&timezone=Asia%2FKolkata",
    );
    const d = await r.json();
    const c = d.current;
    return `Gurugram now: ${c.temperature_2m}°C, precipitation ${c.precipitation} mm, weather code ${c.weather_code} (local time ${c.time}).`;
  } catch {
    return "Current weather unavailable.";
  }
}

Deno.serve(async (req) => {
  if (req.method === "OPTIONS") return new Response("ok", { headers: corsHeaders });

  const authHeader = req.headers.get("Authorization");
  if (!authHeader?.startsWith("Bearer ")) return json(401, { error: "Please sign in." });

  const parsed = Body.safeParse(await req.json().catch(() => null));
  if (!parsed.success) return json(400, { error: "Invalid request." });
  const { threadId, message } = parsed.data;

  const supabase = createClient(Deno.env.get("SUPABASE_URL")!, Deno.env.get("SUPABASE_ANON_KEY")!, {
    global: { headers: { Authorization: authHeader } },
  });
  const { data: userData, error: userErr } = await supabase.auth.getUser();
  if (userErr || !userData.user) return json(401, { error: "Please sign in." });
  const userId = userData.user.id;

  const { data: thread } = await supabase.from("chat_threads").select("id,title").eq("id", threadId).maybeSingle();
  if (!thread) return json(404, { error: "Chat not found." });

  const apiKey = Deno.env.get("GOOGLE_API_KEY");
  if (!apiKey) return json(500, { error: "Chatbot is not configured." });

  const { error: insErr } = await supabase
    .from("chat_messages")
    .insert({ thread_id: threadId, user_id: userId, role: "user", content: message });
  if (insErr) return json(500, { error: "Could not save your message." });

  if (thread.title === "New chat") {
    await supabase.from("chat_threads").update({ title: message.slice(0, 50) }).eq("id", threadId);
  }

  const { data: history } = await supabase
    .from("chat_messages")
    .select("role,content")
    .eq("thread_id", threadId)
    .order("created_at")
    .limit(40);

  const weather = await getWeather();
  const instructions = `You are the friendly food guide for Zaika Gharana, a South Indian cloud kitchen in Gurugram.
Suggest dishes ONLY from the menu below, based on the customer's weather, budget, cuisine/region preference, and veg or non-veg choice.
Always show prices in ₹ and give a running total when suggesting a combination. Respect the budget strictly.
If something isn't on the menu, say so and suggest the closest item. Keep replies short and use bullet lists.
Customers add dishes to their cart themselves using the "Add to Cart" buttons on the menu.
${weather}

MENU (name | category | price | veg/non-veg | spice | description):
${menuText()}`;

  // Gemma does not accept system instructions, so they go into the first user turn.
  const contents = (history ?? []).map((m, i) => ({
    role: m.role === "assistant" ? "model" : "user",
    parts: [{ text: i === 0 ? `${instructions}\n\nCustomer: ${m.content}` : m.content }],
  }));

  const model = Deno.env.get("GEMMA_MODEL") || "gemma-4-31b-it";
  const upstream = await fetch(
    `https://generativelanguage.googleapis.com/v1beta/models/${model}:streamGenerateContent?alt=sse`,
    {
      method: "POST",
      headers: { "Content-Type": "application/json", "x-goog-api-key": apiKey },
      body: JSON.stringify({ contents }),
    },
  );

  if (!upstream.ok || !upstream.body) {
    const detail = await upstream.text().catch(() => "");
    console.error("Gemma error", upstream.status, detail);
    const msg =
      upstream.status === 429
        ? "The assistant is busy right now. Please try again in a minute."
        : upstream.status === 403 || upstream.status === 401
          ? "The Google key was rejected. Please check it has Gemma access."
          : upstream.status === 404
            ? `Model "${model}" was not found for this Google key.`
            : "The assistant could not reply right now.";
    return json(upstream.status, { error: msg });
  }

  let full = "";
  const reader = upstream.body.getReader();
  const decoder = new TextDecoder();
  const encoder = new TextEncoder();

  const stream = new ReadableStream({
    async start(controller) {
      let buf = "";
      try {
        while (true) {
          const { done, value } = await reader.read();
          if (done) break;
          buf += decoder.decode(value, { stream: true });
          let idx;
          while ((idx = buf.indexOf("\n")) !== -1) {
            const line = buf.slice(0, idx).trim();
            buf = buf.slice(idx + 1);
            if (!line.startsWith("data:")) continue;
            try {
              const evt = JSON.parse(line.slice(5).trim());
              const parts = evt.candidates?.[0]?.content?.parts ?? [];
              const text = parts.filter((p: any) => !p.thought).map((p: any) => p.text ?? "").join("");
              if (text) {
                full += text;
                controller.enqueue(encoder.encode(text));
              }
            } catch { /* partial line */ }
          }
        }
      } finally {
        if (full) {
          const { error } = await supabase
            .from("chat_messages")
            .insert({ thread_id: threadId, user_id: userId, role: "assistant", content: full });
          if (error) console.error("save assistant failed", error);
          await supabase.from("chat_threads").update({ updated_at: new Date().toISOString() }).eq("id", threadId);
        }
        controller.close();
      }
    },
  });

  return new Response(stream, {
    headers: { ...corsHeaders, "Content-Type": "text/plain; charset=utf-8" },
  });
});
