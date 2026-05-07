import { useMemo } from "react";
import { useUI } from "../os/ui";
import { useWindows } from "../os/store";
import { APPS } from "../os/apps";

export function AppSwitcher() {
  const open = useUI((s) => s.appSwitcherOpen);
  const idx = useUI((s) => s.appSwitcherIdx);
  const allWindows = useWindows((s) => s.windows);

  // Sorted by recency (highest z first); minimized included so user can restore.
  const sorted = useMemo(
    () => [...allWindows].sort((a, b) => b.z - a.z),
    [allWindows],
  );

  if (!open || sorted.length === 0) return null;

  const wrapped = ((idx % sorted.length) + sorted.length) % sorted.length;

  return (
    <div
      className="absolute inset-0 z-[10003] grid place-items-center"
      style={{ pointerEvents: "none", background: "rgba(0,0,0,0.25)" }}
    >
      <div
        className="flex items-center gap-3 px-4 py-3 rounded-2xl border max-w-[80vw] overflow-x-auto wm-pop-in"
        style={{
          background: "var(--os-bg-strong)",
          color: "var(--os-text)",
          borderColor: "var(--os-border)",
          backdropFilter: "blur(20px) saturate(1.6)",
          WebkitBackdropFilter: "blur(20px) saturate(1.6)",
          boxShadow: "0 30px 80px -20px rgba(0,0,0,0.5)",
        }}
      >
        {sorted.map((w, i) => {
          const app = APPS[w.appId];
          if (!app) return null;
          const Icon = app.icon;
          const selected = i === wrapped;
          return (
            <div
              key={w.id}
              className={`flex flex-col items-center gap-1 p-2 rounded-lg ${
                selected ? "bg-[#007aff]" : ""
              }`}
            >
              <div
                className="w-16 h-16 grid place-items-center rounded-xl border"
                style={{
                  background:
                    "linear-gradient(135deg, rgba(120,120,140,0.45), rgba(40,40,55,0.7))",
                  borderColor: "rgba(255,255,255,0.18)",
                  opacity: w.minimized ? 0.55 : 1,
                }}
              >
                <Icon size={36} className="text-white" />
              </div>
              <span
                className="text-[10px] truncate max-w-[88px]"
                style={{
                  color: selected ? "white" : "var(--os-text-dim)",
                  fontWeight: selected ? 600 : 400,
                }}
              >
                {w.title}
              </span>
            </div>
          );
        })}
      </div>
    </div>
  );
}
