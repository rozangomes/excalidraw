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

const isFinance =
  window.location.pathname === "/finance" ||
  new URLSearchParams(window.location.search).get("app") === "finance";

root.render(
  <StrictMode>
    {isFinance ? <FinanceApp /> : <ExcalidrawApp />}
  </StrictMode>,
);
