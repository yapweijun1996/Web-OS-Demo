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
      className="absolute left-2 w-72 max-h-[60vh] bg-zinc-900/95 backdrop-blur border border-white/10 rounded-md shadow-2xl overflow-hidden flex flex-col"
      style={{ bottom: `${TASKBAR_H + 8}px`, zIndex: 10000 }}
      onClick={(e) => e.stopPropagation()}
      onContextMenu={(e) => e.stopPropagation()}
    >
      <div className="px-4 py-3 text-xs font-medium text-white/60 uppercase tracking-wide border-b border-white/10">
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
              className="w-full flex items-center gap-3 px-3 py-2 rounded text-left hover:bg-white/10 text-sm"
            >
              <Icon size={20} className="text-white/80" />
              <span>{app.name}</span>
            </button>
          );
        })}
      </div>
    </div>
  );
}
