import { useState } from "react";
import { APP_LIST } from "../os/apps";
import { launchApp } from "../os/launcher";
import { useWindows, DOCK_H, DOCK_MARGIN } from "../os/store";

export function Dock() {
  const windows = useWindows((s) => s.windows);
  const focus = useWindows((s) => s.focus);
  const toggleMinimize = useWindows((s) => s.toggleMinimize);
  const [hoverIdx, setHoverIdx] = useState<number | null>(null);

  const handleClick = (appId: string) => {
    const instances = windows.filter((w) => w.appId === appId);
    if (instances.length === 0) {
      launchApp(appId);
      return;
    }
    // Bring most recent (highest z) to front; restore from minimized.
    const top = instances.reduce((a, b) => (a.z > b.z ? a : b));
    if (top.minimized) toggleMinimize(top.id);
    focus(top.id);
  };

  return (
    <div
      className="absolute left-1/2 -translate-x-1/2 flex items-end gap-1 px-2 py-2 backdrop-blur rounded-2xl border z-[8000]"
      style={{
        bottom: `${DOCK_MARGIN}px`,
        height: `${DOCK_H}px`,
        background: "var(--os-bg)",
        borderColor: "var(--os-border)",
      }}
      onClick={(e) => e.stopPropagation()}
      onContextMenu={(e) => e.stopPropagation()}
      onMouseLeave={() => setHoverIdx(null)}
    >
      {APP_LIST.map((app, i) => {
        const Icon = app.icon;
        const distance = hoverIdx === null ? 99 : Math.abs(hoverIdx - i);
        const scale =
          hoverIdx === null ? 1 : Math.max(1, 1.55 - distance * 0.22);
        const offset = hoverIdx === null ? 0 : Math.max(0, 6 - distance * 2);
        const hasInstance = windows.some((w) => w.appId === app.id);
        return (
          <button
            key={app.id}
            type="button"
            onMouseEnter={() => setHoverIdx(i)}
            onClick={() => handleClick(app.id)}
            title={app.name}
            className="relative flex flex-col items-center"
            style={{
              transform: `translateY(${-offset}px) scale(${scale})`,
              transformOrigin: "bottom center",
              transition: "transform 120ms cubic-bezier(0.32,0.72,0,1)",
            }}
          >
            <div
              className="w-12 h-12 grid place-items-center rounded-xl border shadow-md"
              style={{
                background:
                  "linear-gradient(135deg, rgba(120,120,140,0.4), rgba(40,40,55,0.6))",
                borderColor: "rgba(255,255,255,0.15)",
              }}
            >
              <Icon size={28} className="text-white drop-shadow" />
            </div>
            {hasInstance && (
              <div
                className="absolute -bottom-1.5 w-1 h-1 rounded-full"
                style={{ background: "var(--os-text)" }}
              />
            )}
          </button>
        );
      })}
    </div>
  );
}
