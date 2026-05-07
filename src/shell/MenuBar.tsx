import { Apple } from "lucide-react";
import { Clock } from "./Clock";
import { useWindows, MENU_BAR_H } from "../os/store";
import { useUI } from "../os/ui";
import { APPS } from "../os/apps";

export function MenuBar() {
  const focusedTitle = useWindows((s) => {
    const visible = s.windows.filter(
      (w) => !w.minimized && w.spaceId === s.activeSpaceId,
    );
    if (!visible.length) return null;
    const top = visible.reduce((a, b) => (a.z > b.z ? a : b));
    return APPS[top.appId]?.name ?? null;
  });
  const spaces = useWindows((s) => s.spaces);
  const activeSpaceId = useWindows((s) => s.activeSpaceId);
  const switchSpace = useWindows((s) => s.switchSpace);
  const toggleMissionControl = useUI((s) => s.toggleMissionControl);
  const toggleNotifCenter = useUI((s) => s.toggleNotifCenter);
  const activeSpace = spaces.find((s) => s.id === activeSpaceId);

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
      <div className="ml-auto flex items-center gap-4 text-[11px]">
        {spaces.length > 1 && (
          <div className="flex items-center gap-1">
            {spaces.map((sp) => (
              <button
                key={sp.id}
                type="button"
                onClick={() => switchSpace(sp.id)}
                title={sp.name}
                className={`w-2 h-2 rounded-full transition-opacity ${
                  sp.id === activeSpaceId
                    ? "bg-current opacity-90"
                    : "bg-current opacity-25 hover:opacity-50"
                }`}
              />
            ))}
          </div>
        )}
        <button
          type="button"
          onClick={() => toggleMissionControl()}
          title="Mission Control (⌃↑ or F3)"
          className="opacity-70 hover:opacity-100"
        >
          {activeSpace?.name ?? "Desktop"}
        </button>
        <button
          type="button"
          onClick={() => toggleNotifCenter()}
          title="Notification Center"
          className="hover:opacity-100"
        >
          <Clock />
        </button>
      </div>
    </div>
  );
}
