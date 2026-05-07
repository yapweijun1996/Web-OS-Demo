import { Apple } from "lucide-react";
import { Clock } from "./Clock";
import { useWindows, MENU_BAR_H } from "../os/store";
import { APPS } from "../os/apps";

export function MenuBar() {
  const focusedTitle = useWindows((s) => {
    const visible = s.windows.filter((w) => !w.minimized);
    if (!visible.length) return null;
    const top = visible.reduce((a, b) => (a.z > b.z ? a : b));
    return APPS[top.appId]?.name ?? null;
  });

  return (
    <div
      className="absolute top-0 left-0 right-0 flex items-center px-3 text-[12px] backdrop-blur border-b z-[8000]"
      style={{
        height: `${MENU_BAR_H}px`,
        background: "var(--os-bg)",
        color: "var(--os-text)",
        borderColor: "var(--os-border)",
      }}
      onClick={(e) => e.stopPropagation()}
      onContextMenu={(e) => e.stopPropagation()}
    >
      <div className="flex items-center gap-4">
        <Apple size={14} className="opacity-90" />
        <span className="font-semibold">{focusedTitle ?? "Web OS"}</span>
      </div>
      <div className="ml-auto flex items-center gap-3 text-[11px]">
        <Clock />
      </div>
    </div>
  );
}
