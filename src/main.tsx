// src/main.tsx
import React from "react";
import { createRoot } from "react-dom/client";
import App from "./App";
import "./index.css";

/**
 * Initialize Vercel Speed Insights and Vercel Analytics.
 * - Run only in the browser (client-only).
 * - Use dynamic import() so bundlers don't include these in SSR/server code.
 * - Fail silently if blocked (adblockers, CSP, network).
 */

// ---------- Speed Insights (client-only) ----------
if (typeof window !== "undefined") {
  import("@vercel/speed-insights")
    .then(({ injectSpeedInsights }) => {
      try {
        injectSpeedInsights();
        // console.debug("Speed Insights injected");
      } catch (e) {
        console.debug("injectSpeedInsights() failed:", e);
      }
    })
    .catch((err) => {
      console.debug("Failed to import @vercel/speed-insights:", err);
    });
}
// ---------------------------------------------------

// ---------- Vercel Web Analytics (client-only) ----
if (typeof window !== "undefined") {
  import("@vercel/analytics")
    .then(({ inject }) => {
      try {
        inject();
        // console.debug("Vercel Analytics injected");
      } catch (e) {
        console.debug("Vercel analytics inject() failed:", e);
      }
    })
    .catch((err) => {
      console.debug("Failed to import @vercel/analytics:", err);
    });
}
// ---------------------------------------------------

const rootEl = document.getElementById("root");
if (!rootEl) throw new Error("Root element with id='root' not found in index.html");

createRoot(rootEl).render(
  <React.StrictMode>
    <App />
  </React.StrictMode>
);
