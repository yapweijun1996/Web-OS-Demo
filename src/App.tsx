import { useEffect } from "react";
import { Desktop } from "./shell/Desktop";
import { Taskbar } from "./shell/Taskbar";
import { StartMenu } from "./shell/StartMenu";
import { ContextMenu } from "./shell/ContextMenu";
import { WindowHost } from "./shell/WindowHost";
import { TASKBAR_H } from "./os/store";
import { useUI } from "./os/ui";
import { useSettings, wallpaperClasses } from "./os/settings";
import { startAutosave } from "./os/persistence";

export default function App() {
  const closeAll = useUI((s) => s.closeAll);
  const wallpaper = useSettings((s) => s.wallpaper);

  useEffect(() => startAutosave(), []);

  useEffect(() => {
    const onKey = (e: KeyboardEvent) => {
      if (e.key === "Escape") closeAll();
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
