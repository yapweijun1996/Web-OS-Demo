import { StrictMode } from "react";
import { createRoot } from "react-dom/client";
import App from "./App.tsx";
import { hydrate } from "./os/persistence.ts";
import { useVFS } from "./os/vfs/store.ts";
import "./os/pwa.ts"; // side-effect: register beforeinstallprompt listener
import "./styles.css";

// Restore window layout + wallpaper before the first render.
hydrate();
// Load the virtual file system in parallel with React mount; Files/Notes
// gate their UI on `ready`.
useVFS.getState().load();

createRoot(document.getElementById("root")!).render(
  <StrictMode>
    <App />
  </StrictMode>,
);
