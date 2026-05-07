import { APP_LIST } from "../os/apps";
import { launchApp } from "../os/launcher";
import { useUI } from "../os/ui";
import { TASKBAR_H } from "../os/store";

export function StartMenu() {
  const open = useUI((s) => s.startMenuOpen);
  const setStartMenu = useUI((s) => s.setStartMenu);

  if (!open) return null;

  return (
    <div
      className="absolute left-2 w-72 max-h-[60vh] backdrop-blur border rounded-md shadow-2xl overflow-hidden flex flex-col wm-pop-in"
      style={{
        bottom: `${TASKBAR_H + 8}px`,
        zIndex: 10000,
        background: "var(--os-bg-strong)",
        color: "var(--os-text)",
        borderColor: "var(--os-border)",
      }}
      onClick={(e) => e.stopPropagation()}
      onContextMenu={(e) => e.stopPropagation()}
    >
      <div
        className="px-4 py-3 text-xs font-medium uppercase tracking-wide border-b"
        style={{
          color: "var(--os-text-dim)",
          borderColor: "var(--os-border)",
        }}
      >
        All apps
      </div>
      <div className="overflow-auto p-1">
        {APP_LIST.map((app) => {
          const Icon = app.icon;
          return (
            <button
              key={app.id}
              type="button"
              onClick={() => {
                launchApp(app.id);
                setStartMenu(false);
              }}
              className="w-full flex items-center gap-3 px-3 py-2 rounded text-left hover:bg-[var(--os-hover)] text-sm"
            >
              <Icon size={20} style={{ color: "var(--os-text-dim)" }} />
              <span>{app.name}</span>
            </button>
          );
        })}
      </div>
    </div>
  );
}
