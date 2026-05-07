import { Sun, Moon, Download, CheckCircle2 } from "lucide-react";
import { useSettings, WALLPAPERS } from "../../os/settings";
import { resetAndReload } from "../../os/persistence";
import { usePWA } from "../../os/pwa";

export function Settings() {
  const wallpaper = useSettings((s) => s.wallpaper);
  const setWallpaper = useSettings((s) => s.setWallpaper);
  const theme = useSettings((s) => s.theme);
  const setTheme = useSettings((s) => s.setTheme);
  const installPrompt = usePWA((s) => s.installPrompt);
  const installed = usePWA((s) => s.installed);
  const promptInstall = usePWA((s) => s.promptInstall);

  return (
    <div className="p-5 space-y-5 text-sm">
      <section>
        <h3
          className="text-xs uppercase tracking-wide mb-2"
          style={{ color: "var(--os-text-dim)" }}
        >
          Theme
        </h3>
        <div className="flex gap-2">
          {(["dark", "light"] as const).map((t) => {
            const selected = theme === t;
            const Icon = t === "dark" ? Moon : Sun;
            return (
              <button
                key={t}
                type="button"
                onClick={() => setTheme(t)}
                className={`flex-1 flex items-center justify-center gap-2 h-10 rounded border-2 capitalize ${
                  selected
                    ? "border-white"
                    : "border-transparent hover:bg-[var(--os-hover)]"
                }`}
                style={{ background: selected ? "var(--os-active)" : "transparent" }}
              >
                <Icon size={14} /> {t}
              </button>
            );
          })}
        </div>
      </section>

      <section>
        <h3
          className="text-xs uppercase tracking-wide mb-2"
          style={{ color: "var(--os-text-dim)" }}
        >
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
                } transition-colors text-left p-2 text-xs font-medium text-white`}
              >
                {w.name}
              </button>
            );
          })}
        </div>
      </section>

      <section>
        <h3
          className="text-xs uppercase tracking-wide mb-2"
          style={{ color: "var(--os-text-dim)" }}
        >
          Shortcuts
        </h3>
        <ul className="text-xs space-y-1" style={{ color: "var(--os-text-dim)" }}>
          <li><kbd className="px-1 rounded bg-[var(--os-hover)]">⌘ + K</kbd> or <kbd className="px-1 rounded bg-[var(--os-hover)]">⌘ + Space</kbd> — Spotlight search</li>
          <li><kbd className="px-1 rounded bg-[var(--os-hover)]">⌘ + Tab</kbd> — switch windows (hold ⇧ to reverse)</li>
          <li><kbd className="px-1 rounded bg-[var(--os-hover)]">⌘ + W</kbd> — close focused window</li>
          <li><kbd className="px-1 rounded bg-[var(--os-hover)]">⌃⌘ + ←/→</kbd> — snap window to half · <kbd className="px-1 rounded bg-[var(--os-hover)]">↑</kbd> maximize</li>
          <li><kbd className="px-1 rounded bg-[var(--os-hover)]">⌃ + ↑</kbd> or <kbd className="px-1 rounded bg-[var(--os-hover)]">F3</kbd> — Mission Control (overview)</li>
          <li><kbd className="px-1 rounded bg-[var(--os-hover)]">⌃ + ←/→</kbd> — cycle Spaces · <kbd className="px-1 rounded bg-[var(--os-hover)]">⌃ + 1..9</kbd> — jump to Space N</li>
          <li><kbd className="px-1 rounded bg-[var(--os-hover)]">Esc</kbd> — dismiss menus / cancel switcher</li>
        </ul>
      </section>

      <section>
        <h3
          className="text-xs uppercase tracking-wide mb-2"
          style={{ color: "var(--os-text-dim)" }}
        >
          Install as app
        </h3>
        {installed ? (
          <div
            className="flex items-center gap-2 text-xs"
            style={{ color: "var(--os-text-dim)" }}
          >
            <CheckCircle2 size={14} className="text-emerald-500" /> Installed —
            running in standalone mode
          </div>
        ) : installPrompt ? (
          <button
            type="button"
            onClick={() => promptInstall()}
            className="px-3 py-1.5 text-xs rounded flex items-center gap-2 bg-[var(--os-active)] hover:bg-[var(--os-hover)] border border-[var(--os-border)]"
          >
            <Download size={14} /> Install Web OS Demo
          </button>
        ) : (
          <p className="text-xs" style={{ color: "var(--os-text-dim)" }}>
            Install option unavailable — open in a Chromium-based browser over
            HTTPS or localhost. (On iOS, use Safari → Share → Add to Home
            Screen.)
          </p>
        )}
      </section>

      <section>
        <h3
          className="text-xs uppercase tracking-wide mb-2"
          style={{ color: "var(--os-text-dim)" }}
        >
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
