import { APP_LIST } from "../os/apps";
import { launchApp } from "../os/launcher";
import { useUI } from "../os/ui";

export function Desktop() {
  const openContextMenu = useUI((s) => s.openContextMenu);

  return (
    <div
      className="absolute inset-0"
      onContextMenu={(e) => {
        e.preventDefault();
        openContextMenu(e.clientX, e.clientY, [
          {
            label: "Refresh desktop",
            onClick: () => window.location.reload(),
          },
          {
            label: "About Web OS",
            onClick: () => launchApp("about"),
          },
        ]);
      }}
    >
      <div className="flex flex-col flex-wrap content-start gap-1 p-3 h-full">
        {APP_LIST.map((app) => {
          const Icon = app.icon;
          return (
            <button
              key={app.id}
              type="button"
              onDoubleClick={() => launchApp(app.id)}
              className="w-[88px] h-[88px] flex flex-col items-center justify-center gap-1 rounded p-2 text-xs hover:bg-white/10 focus:bg-white/15 focus:outline-none text-center"
              title={`Double-click to open ${app.name}`}
            >
              <Icon size={36} className="opacity-95 drop-shadow" />
              <span className="truncate w-full leading-tight">{app.name}</span>
            </button>
          );
        })}
      </div>
    </div>
  );
}
