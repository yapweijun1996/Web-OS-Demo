import { WindowHost } from "./shell/WindowHost";
import { TASKBAR_H, useWindows } from "./os/store";
import { launchApp } from "./os/launcher";
import { APP_LIST } from "./os/apps";

export default function App() {
  const windowCount = useWindows((s) => s.windows.length);

  return (
    <div className="w-screen h-screen relative bg-gradient-to-br from-sky-700 via-indigo-800 to-indigo-900 text-white overflow-hidden">
      {/* Desktop layer (Phase 3 will replace) */}
      <div className="absolute inset-0 grid place-items-center pointer-events-none">
        <div className="text-center space-y-4 pointer-events-auto">
          <h1 className="text-3xl font-semibold">Web OS Demo</h1>
          <p className="text-white/70">
            Phase 2 — window manager. {windowCount} window(s) open.
          </p>
          <div className="flex justify-center gap-2">
            {APP_LIST.map((app) => (
              <button
                key={app.id}
                onClick={() => launchApp(app.id)}
                className="px-4 py-2 rounded bg-white/10 hover:bg-white/20 border border-white/20 text-sm"
              >
                Open {app.name}
              </button>
            ))}
          </div>
        </div>
      </div>

      {/* Window host (clickable areas auto via pointer-events on Window itself) */}
      <div
        className="absolute left-0 right-0 top-0"
        style={{ bottom: `${TASKBAR_H}px` }}
      >
        <WindowHost />
      </div>

      {/* Taskbar placeholder — Phase 3 will replace */}
      <div
        className="absolute left-0 right-0 bottom-0 bg-zinc-900/80 backdrop-blur border-t border-white/10 flex items-center px-3 text-xs text-white/60"
        style={{ height: `${TASKBAR_H}px`, zIndex: 9999 }}
      >
        Taskbar (Phase 3)
      </div>
    </div>
  );
}
