// src/main.tsx
import React from "react";
import { createRoot } from "react-dom/client";
import App from "./App";
import "./index.css";

// ---------------- Vercel Speed Insights (client-only) ----------------
if (typeof window !== "undefined") {
  import("@vercel/speed-insights")
    .then(({ injectSpeedInsights }) => {
      try {
        injectSpeedInsights();
        // optional: console.log("Speed Insights injected");
      } catch (e) {
        console.debug("injectSpeedInsights() failed:", e);
      }
    })
    .catch((err) => {
      console.debug("Failed to import @vercel/speed-insights:", err);
    });
}
// --------------------------------------------------------------------

// ---------------- Vercel Web Analytics (client-only) ----------------
if (typeof window !== "undefined") {
  import("@vercel/analytics")
    .then(({ inject }) => {
      try {
        inject();
        // optional: console.log("Vercel analytics injected");
      } catch (e) {
        console.debug("Vercel analytics inject() failed:", e);
      }
    })
    .catch((err) => {
      console.debug("Failed to import @vercel/analytics:", err);
    });
}
// --------------------------------------------------------------------

const rootEl = document.getElementById("root");
if (!rootEl) throw new Error("#root not found in index.html");

createRoot(rootEl).render(
  <React.StrictMode>
    <App />
  </React.StrictMode>
);
