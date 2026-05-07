import { useSettings, WALLPAPERS } from "../../os/settings";
import { resetAndReload } from "../../os/persistence";

export function Settings() {
  const wallpaper = useSettings((s) => s.wallpaper);
  const setWallpaper = useSettings((s) => s.setWallpaper);

  return (
    <div className="p-5 space-y-5 text-sm">
      <section>
        <h3 className="text-xs uppercase tracking-wide text-white/60 mb-2">
          Wallpaper
        </h3>
        <div className="grid grid-cols-2 gap-3">
          {WALLPAPERS.map((w) => {
            const selected = wallpaper === w.id;
            return (
              <button
                key={w.id}
                type="button"
                onClick={() => setWallpaper(w.id)}
                className={`h-20 rounded-md bg-gradient-to-br ${w.classes} border-2 ${
                  selected
                    ? "border-white shadow-lg"
                    : "border-white/10 hover:border-white/40"
                } transition-colors text-left p-2 text-xs font-medium`}
              >
                {w.name}
              </button>
            );
          })}
        </div>
      </section>

      <section>
        <h3 className="text-xs uppercase tracking-wide text-white/60 mb-2">
          Storage
        </h3>
        <button
          type="button"
          onClick={() => {
            if (confirm("Wipe saved window layout + wallpaper and reload?")) {
              resetAndReload();
            }
          }}
          className="px-3 py-1.5 text-xs rounded bg-red-500/20 hover:bg-red-500/40 border border-red-500/40"
        >
          Reset desktop
        </button>
      </section>
    </div>
  );
}
