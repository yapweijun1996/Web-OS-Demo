import { StrictMode } from "react";
import { createRoot } from "react-dom/client";
import App from "./App.tsx";
import { hydrate } from "./os/persistence.ts";
import "./styles.css";

// Restore window layout + wallpaper before the first render.
hydrate();

createRoot(document.getElementById("root")!).render(
  <StrictMode>
    <App />
  </StrictMode>,
);
