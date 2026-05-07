import { useEffect } from "react";
import { Desktop } from "./shell/Desktop";
import { Taskbar } from "./shell/Taskbar";
import { StartMenu } from "./shell/StartMenu";
import { ContextMenu } from "./shell/ContextMenu";
import { WindowHost } from "./shell/WindowHost";
import { TASKBAR_H, useWindows } from "./os/store";
import { useUI } from "./os/ui";
import { useSettings, wallpaperClasses } from "./os/settings";
import { startAutosave } from "./os/persistence";

export default function App() {
  const closeAll = useUI((s) => s.closeAll);
  const wallpaper = useSettings((s) => s.wallpaper);
  const theme = useSettings((s) => s.theme);

  useEffect(() => startAutosave(), []);

  // Sync theme class to <html> so CSS vars cascade everywhere.
  useEffect(() => {
    const root = document.documentElement;
    root.classList.toggle("theme-dark", theme === "dark");
    root.classList.toggle("theme-light", theme === "light");
  }, [theme]);

  useEffect(() => {
    const onKey = (e: KeyboardEvent) => {
      if (e.key === "Escape") {
        closeAll();
        return;
      }
      const meta = e.metaKey || e.ctrlKey;
      if (!meta) return;

      // Cmd/Ctrl+W → close focused window
      if (e.key.toLowerCase() === "w") {
        const ws = useWindows.getState();
        const visible = ws.windows.filter((w) => !w.minimized);
        if (visible.length === 0) return;
        e.preventDefault();
        const focused = visible.reduce((a, b) => (a.z > b.z ? a : b));
        ws.close(focused.id);
      }
      // Cmd/Ctrl+K → toggle start menu (Cmd+P collides with browser print)
      if (e.key.toLowerCase() === "k") {
        e.preventDefault();
        useUI.getState().toggleStartMenu();
      }
    };
    document.addEventListener("keydown", onKey);
    return () => document.removeEventListener("keydown", onKey);
  }, [closeAll]);

  return (
    <div
      className={`w-screen h-screen relative bg-gradient-to-br ${wallpaperClasses(wallpaper)} text-white overflow-hidden`}
      onClick={closeAll}
    >
      {/* Desktop layer (icons + right-click target) */}
      <div
        className="absolute left-0 right-0 top-0"
        style={{ bottom: `${TASKBAR_H}px` }}
      >
        <Desktop />
      </div>

      {/* Window layer (wrapper is pointer-events-none so empty areas pass clicks
          through to the Desktop layer beneath; individual <Window> elements
          re-enable pointer events on themselves) */}
      <div
        className="absolute left-0 right-0 top-0 pointer-events-none"
        style={{ bottom: `${TASKBAR_H}px` }}
      >
        <WindowHost />
      </div>

      {/* OS chrome */}
      <Taskbar />
      <StartMenu />
      <ContextMenu />
    </div>
  );
}
