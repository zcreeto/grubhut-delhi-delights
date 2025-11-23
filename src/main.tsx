import React from "react";
import { createRoot } from "react-dom/client";
import App from "./App";

if (typeof window !== "undefined") {
  import("@vercel/speed-insights")
    .then(({ injectSpeedInsights }) => injectSpeedInsights())
    .catch((err) => console.debug("Speed Insights injection failed", err));
}

createRoot(document.getElementById("root")).render(
  <React.StrictMode>
    <App />
  </React.StrictMode>
);
import { createRoot } from "react-dom/client";
import App from "./App.tsx";
import "./index.css";

createRoot(document.getElementById("root")!).render(<App />);
