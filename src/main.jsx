import { StrictMode } from "react";
import { createRoot } from "react-dom/client";
import "./index.css";
import Engineer from "./Engineer.jsx";
import { Analytics } from "@vercel/analytics/next";
import App from "./App.jsx";

createRoot(document.getElementById("root")).render(
  <StrictMode>
    {/* <App /> */}
    <Engineer />
  </StrictMode>,
);
