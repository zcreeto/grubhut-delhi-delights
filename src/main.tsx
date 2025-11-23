import React from "react";
import { createRoot } from "react-dom/client";
import App from "./App";
import "./index.css";

// ---------------- VERCEL SPEED INSIGHTS ----------------
if (typeof window !== "undefined") {
  import("@vercel/speed-insights")
    .then(({ injectSpeedInsights }) => {
      try {
        injectSpeedInsights();
      } catch (e) {
        console.debug("Speed Insights failed:", e);
      }
    })
    .catch((err) => {
      console.debug("Speed Insights import failed:", err);
    });
}
// --------------------------------------------------------

// ---------------- VERCEL ANALYTICS ----------------------
if (typeof window !== "undefined") {
  import("@vercel/analytics")
    .then(({ inject }) => {
      try {
        inject(); // initializes analytics
      } catch (e) {
        console.debug("Analytics failed:", e);
      }
    })
    .catch((err) => {
      console.debug("Analytics import failed:", err);
    });
}
// --------------------------------------------------------

const rootEl = document.getElementById("root");
if (!rootEl) throw new Error("#root not found in index.html");

createRoot(rootEl).render(
  <React.StrictMode>
    <App />
  </React.StrictMode>
);
