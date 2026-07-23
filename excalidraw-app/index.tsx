import { StrictMode } from "react";
import { createRoot } from "react-dom/client";
import { registerSW } from "virtual:pwa-register";

import "../excalidraw-app/sentry";

import ExcalidrawApp from "./App";
import FinanceApp from "./finance/App";

window.__EXCALIDRAW_SHA__ = import.meta.env.VITE_APP_GIT_SHA;
const rootElement = document.getElementById("root")!;
const root = createRoot(rootElement);
registerSW();

// The finance app is the default experience on this domain; the
// Excalidraw whiteboard is opt-in via /draw (kept for room/library links
// and anyone who still wants the whiteboard).
const params = new URLSearchParams(window.location.search);
const isDraw =
  window.location.pathname === "/draw" ||
  params.get("app") === "draw" ||
  params.get("app") === "excalidraw";

root.render(
  <StrictMode>
    {isDraw ? <ExcalidrawApp /> : <FinanceApp />}
  </StrictMode>,
);
