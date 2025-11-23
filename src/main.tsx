import React from "react";
import { createRoot } from "react-dom/client";
import App from "./App";
import "./index.css";

// --- Vercel Speed Insights (client-only) ---
if (typeof window !== "undefined") {
  import("@vercel/speed-insights")
    .then(({ injectSpeedInsights }) => {
      try {
        injectSpeedInsights();
      } catch (e) {
        // graceful fallback if injection fails
        console.debug("injectSpeedInsights() failed:", e);
      }
    })
    .catch((err) => {
      // import failed (adblocker or network) — do nothing
      console.debug("Failed to load @vercel/speed-insights:", err);
    });
}
// -----------------------------------------------------

const rootElement = document.getElementById("root");
if (!rootElement) {
  throw new Error("Root element #root not found in index.html");
}

createRoot(rootElement).render(
  <React.StrictMode>
    <App />
  </React.StrictMode>
);
