import { useEffect } from "react";
import { Desktop } from "./shell/Desktop";
import { MenuBar } from "./shell/MenuBar";
import { Dock } from "./shell/Dock";
import { Spotlight } from "./shell/Spotlight";
import { AppSwitcher } from "./shell/AppSwitcher";
import { MissionControl } from "./shell/MissionControl";
import { ContextMenu } from "./shell/ContextMenu";
import { WindowHost } from "./shell/WindowHost";
import {
  TOP_INSET,
  BOTTOM_INSET,
  useWindows,
} from "./os/store";
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
    const ui = useUI;
    const ws = useWindows;

    const focusedVisible = () => {
      const v = ws.getState().windows.filter((w) => !w.minimized);
      if (!v.length) return null;
      return v.reduce((a, b) => (a.z > b.z ? a : b));
    };

    const onKeyDown = (e: KeyboardEvent) => {
      const meta = e.metaKey || e.ctrlKey;

      // ESC closes overlays (priority order)
      if (e.key === "Escape") {
        if (ui.getState().appSwitcherOpen) ui.getState().cancelAppSwitcher();
        else closeAll();
        return;
      }

      // F3 or Ctrl+Up → toggle Mission Control
      if (e.key === "F3") {
        e.preventDefault();
        ui.getState().toggleMissionControl();
        return;
      }

      // Tiling: Ctrl+Cmd+arrows  (must check BEFORE plain Ctrl+arrow space switch)
      if (e.metaKey && e.ctrlKey) {
        const w = focusedVisible();
        if (e.key === "ArrowLeft" && w) {
          e.preventDefault();
          ws.getState().snapTo(w.id, "left");
          return;
        }
        if (e.key === "ArrowRight" && w) {
          e.preventDefault();
          ws.getState().snapTo(w.id, "right");
          return;
        }
        if ((e.key === "ArrowUp" || e.key === "ArrowDown") && w) {
          e.preventDefault();
          ws.getState().toggleMaximize(w.id);
          return;
        }
      }

      // Ctrl+Up → Mission Control (Mac convention)
      if (e.ctrlKey && !e.metaKey && e.key === "ArrowUp") {
        e.preventDefault();
        ui.getState().toggleMissionControl();
        return;
      }

      // Ctrl+Left / Ctrl+Right → cycle Spaces
      if (e.ctrlKey && !e.metaKey && e.key === "ArrowLeft") {
        e.preventDefault();
        ws.getState().cycleSpace(-1);
        return;
      }
      if (e.ctrlKey && !e.metaKey && e.key === "ArrowRight") {
        e.preventDefault();
        ws.getState().cycleSpace(1);
        return;
      }

      // Ctrl+1..9 → jump to space N (Mac convention; doesn't interfere with browser)
      if (e.ctrlKey && !e.metaKey && /^[1-9]$/.test(e.key)) {
        const n = parseInt(e.key, 10);
        const spaces = ws.getState().spaces;
        if (n <= spaces.length) {
          e.preventDefault();
          ws.getState().switchSpace(spaces[n - 1].id);
        }
        return;
      }

      // Cmd/Ctrl+Space or Cmd/Ctrl+K → toggle Spotlight
      if (meta && (e.key === " " || e.key.toLowerCase() === "k")) {
        e.preventDefault();
        ui.getState().toggleSpotlight();
        return;
      }

      // Cmd/Ctrl+W → close focused window (skip if Spotlight focused)
      if (meta && e.key.toLowerCase() === "w" && !ui.getState().spotlightOpen) {
        const w = focusedVisible();
        if (w) {
          e.preventDefault();
          ws.getState().close(w.id);
        }
        return;
      }

      // Cmd/Ctrl+Tab → cycle App Switcher
      if (meta && e.key === "Tab") {
        e.preventDefault();
        if (!ui.getState().appSwitcherOpen) {
          ui.getState().openAppSwitcher();
        } else {
          ui.getState().cycleAppSwitcher(e.shiftKey ? -1 : 1);
        }
        return;
      }
    };

    const onKeyUp = (e: KeyboardEvent) => {
      // Releasing Cmd/Ctrl while AppSwitcher is open → commit
      if (
        ui.getState().appSwitcherOpen &&
        (e.key === "Meta" || e.key === "Control")
      ) {
        const ws_ = ws.getState();
        const sorted = [...ws_.windows].sort((a, b) => b.z - a.z);
        if (sorted.length > 0) {
          const idx = ui.getState().appSwitcherIdx;
          const wrapped = ((idx % sorted.length) + sorted.length) % sorted.length;
          const target = sorted[wrapped];
          if (target.minimized) ws_.toggleMinimize(target.id);
          ws_.focus(target.id);
        }
        ui.getState().commitAppSwitcher();
      }
    };

    document.addEventListener("keydown", onKeyDown);
    document.addEventListener("keyup", onKeyUp);
    return () => {
      document.removeEventListener("keydown", onKeyDown);
      document.removeEventListener("keyup", onKeyUp);
    };
  }, [closeAll]);

  return (
    <div
      className={`w-screen h-screen relative bg-gradient-to-br ${wallpaperClasses(wallpaper)} text-white overflow-hidden`}
      onClick={closeAll}
    >
      {/* Desktop layer (icons + right-click target) */}
      <div
        className="absolute left-0 right-0"
        style={{
          top: `${TOP_INSET}px`,
          bottom: `${BOTTOM_INSET}px`,
        }}
      >
        <Desktop />
      </div>

      {/* Window layer */}
      <div
        className="absolute left-0 right-0 pointer-events-none"
        style={{
          top: `${TOP_INSET}px`,
          bottom: `${BOTTOM_INSET}px`,
        }}
      >
        <WindowHost />
      </div>

      {/* OS chrome */}
      <MenuBar />
      <Dock />
      <Spotlight />
      <AppSwitcher />
      <MissionControl />
      <ContextMenu />
    </div>
  );
}
