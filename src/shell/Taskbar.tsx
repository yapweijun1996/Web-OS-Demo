import { LayoutGrid } from "lucide-react";
import { useWindows, TASKBAR_H } from "../os/store";
import { useUI } from "../os/ui";
import { APPS } from "../os/apps";
import { Clock } from "./Clock";

export function Taskbar() {
  const windows = useWindows((s) => s.windows);
  const focus = useWindows((s) => s.focus);
  const toggleMinimize = useWindows((s) => s.toggleMinimize);
  const toggleStart = useUI((s) => s.toggleStartMenu);
  const startOpen = useUI((s) => s.startMenuOpen);

  const visible = windows.filter((w) => !w.minimized);
  const focusedId = visible.length
    ? visible.reduce((a, b) => (a.z > b.z ? a : b)).id
    : null;

  const handleTaskClick = (id: string, minimized: boolean) => {
    if (minimized) {
      toggleMinimize(id);
      focus(id);
    } else if (focusedId === id) {
      toggleMinimize(id);
    } else {
      focus(id);
    }
  };

  return (
    <div
      className="absolute left-0 right-0 bottom-0 backdrop-blur-md border-t flex items-center px-1 gap-1"
      style={{
        height: `${TASKBAR_H}px`,
        zIndex: 9999,
        background: "var(--os-bg)",
        color: "var(--os-text)",
        borderColor: "var(--os-border)",
      }}
      onClick={(e) => e.stopPropagation()}
      onContextMenu={(e) => e.stopPropagation()}
    >
      <button
        type="button"
        onClick={toggleStart}
        aria-label="Start menu"
        className={`px-3 h-9 flex items-center gap-2 rounded hover:bg-[var(--os-hover)] text-sm ${
          startOpen ? "bg-[var(--os-active)]" : ""
        }`}
      >
        <LayoutGrid size={18} />
        <span className="font-medium">Start</span>
      </button>

      <div className="flex-1 flex items-center gap-1 px-2 overflow-hidden">
        {windows.map((w) => {
          const app = APPS[w.appId];
          if (!app) return null;
          const Icon = app.icon;
          const isFocused = focusedId === w.id;
          return (
            <button
              key={w.id}
              type="button"
              onClick={() => handleTaskClick(w.id, w.minimized)}
              title={w.title}
              className={`h-9 px-3 flex items-center gap-2 rounded text-xs hover:bg-[var(--os-hover)] ${
                isFocused
                  ? "bg-[var(--os-active)]"
                  : w.minimized
                    ? "opacity-60"
                    : ""
              }`}
            >
              <Icon size={14} />
              <span className="truncate max-w-[140px]">{w.title}</span>
            </button>
          );
        })}
      </div>

      <Clock />
    </div>
  );
}
