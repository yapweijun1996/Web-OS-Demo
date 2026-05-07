import { useMemo } from "react";
import { Plus, X } from "lucide-react";
import { useUI } from "../os/ui";
import { useWindows, TOP_INSET, BOTTOM_INSET } from "../os/store";
import { APPS } from "../os/apps";
import type { WindowState } from "../os/types";

const STRIP_H = 110; // height reserved at top of overlay for space thumbnails
const PADDING = 36;
const GAP = 16;

/**
 * Pack windows into a roughly proportional grid. Given count N, choose
 * cols = ceil(sqrt(N)), rows = ceil(N/cols). Each cell shows a mini
 * window preserving aspect ratio of the actual window.
 */
function gridLayout(
  windows: WindowState[],
  areaW: number,
  areaH: number,
): Array<{ id: string; x: number; y: number; w: number; h: number }> {
  if (windows.length === 0) return [];
  const cols = Math.ceil(Math.sqrt(windows.length));
  const rows = Math.ceil(windows.length / cols);
  const cellW = (areaW - GAP * (cols + 1)) / cols;
  const cellH = (areaH - GAP * (rows + 1)) / rows;

  return windows.map((w, i) => {
    const r = Math.floor(i / cols);
    const c = i % cols;
    const fitScale = Math.min(cellW / w.width, cellH / w.height, 1);
    const renderedW = w.width * fitScale;
    const renderedH = w.height * fitScale;
    const cellLeft = GAP + c * (cellW + GAP);
    const cellTop = GAP + r * (cellH + GAP);
    return {
      id: w.id,
      x: cellLeft + (cellW - renderedW) / 2,
      y: cellTop + (cellH - renderedH) / 2,
      w: renderedW,
      h: renderedH,
    };
  });
}

export function MissionControl() {
  const open = useUI((s) => s.missionControlOpen);
  const setOpen = useUI((s) => s.setMissionControl);

  const spaces = useWindows((s) => s.spaces);
  const activeSpaceId = useWindows((s) => s.activeSpaceId);
  const switchSpace = useWindows((s) => s.switchSpace);
  const addSpace = useWindows((s) => s.addSpace);
  const removeSpace = useWindows((s) => s.removeSpace);
  const allWindows = useWindows((s) => s.windows);
  const focus = useWindows((s) => s.focus);
  const toggleMinimize = useWindows((s) => s.toggleMinimize);

  const activeWindows = useMemo(
    () => allWindows.filter((w) => w.spaceId === activeSpaceId),
    [allWindows, activeSpaceId],
  );

  const areaW =
    typeof window === "undefined" ? 1280 : window.innerWidth - PADDING * 2;
  const areaH =
    typeof window === "undefined"
      ? 720 - STRIP_H - PADDING * 2
      : window.innerHeight - STRIP_H - PADDING * 2 - TOP_INSET - BOTTOM_INSET;

  const layout = useMemo(
    () => gridLayout(activeWindows, areaW, areaH),
    [activeWindows, areaW, areaH],
  );

  if (!open) return null;

  const handleWindowClick = (id: string) => {
    const w = allWindows.find((ww) => ww.id === id);
    if (!w) return;
    if (w.minimized) toggleMinimize(w.id);
    focus(w.id);
    setOpen(false);
  };

  return (
    <div
      className="absolute inset-0 z-[10004] flex flex-col"
      style={{
        background: "rgba(0,0,0,0.45)",
        backdropFilter: "blur(20px) saturate(1.4)",
        WebkitBackdropFilter: "blur(20px) saturate(1.4)",
      }}
      onClick={() => setOpen(false)}
    >
      {/* Top: space thumbnails strip */}
      <div
        className="flex items-center justify-center gap-3 px-4 pt-3 pb-2 select-none"
        style={{ minHeight: STRIP_H }}
        onClick={(e) => e.stopPropagation()}
      >
        {spaces.map((sp) => {
          const isActive = sp.id === activeSpaceId;
          const count = allWindows.filter((w) => w.spaceId === sp.id).length;
          return (
            <div
              key={sp.id}
              className={`relative flex flex-col items-center gap-1 group/space cursor-pointer`}
              onClick={() => switchSpace(sp.id)}
            >
              <div
                className={`w-32 h-20 rounded-md border-2 backdrop-blur ${
                  isActive ? "border-white shadow-lg" : "border-white/30"
                }`}
                style={{
                  background:
                    "linear-gradient(135deg, rgba(120,150,200,0.35), rgba(60,80,140,0.5))",
                }}
              >
                <div className="text-[10px] text-white/80 px-2 pt-1">
                  {count} {count === 1 ? "window" : "windows"}
                </div>
              </div>
              <div className="flex items-center gap-1">
                <span className="text-[11px] text-white/85">{sp.name}</span>
                {spaces.length > 1 && (
                  <button
                    type="button"
                    onClick={(e) => {
                      e.stopPropagation();
                      removeSpace(sp.id);
                    }}
                    className="opacity-0 group-hover/space:opacity-100 text-white/60 hover:text-red-400 transition-opacity"
                    aria-label="Delete space"
                  >
                    <X size={11} />
                  </button>
                )}
              </div>
            </div>
          );
        })}
        <button
          type="button"
          onClick={() => addSpace()}
          className="w-32 h-20 rounded-md border-2 border-dashed border-white/30 hover:border-white/60 grid place-items-center text-white/50 hover:text-white/80 transition-colors"
          aria-label="Add space"
        >
          <Plus size={20} />
        </button>
      </div>

      {/* Bottom: window grid */}
      <div
        className="relative flex-1"
        style={{ padding: PADDING }}
        onClick={(e) => e.stopPropagation()}
      >
        {activeWindows.length === 0 ? (
          <div className="absolute inset-0 grid place-items-center text-white/60 text-sm">
            No windows on {spaces.find((s) => s.id === activeSpaceId)?.name}.
            Press ESC to close.
          </div>
        ) : (
          layout.map((rect) => {
            const w = activeWindows.find((ww) => ww.id === rect.id)!;
            const app = APPS[w.appId];
            if (!app) return null;
            const Icon = app.icon;
            return (
              <button
                key={rect.id}
                type="button"
                onClick={() => handleWindowClick(rect.id)}
                className="absolute rounded-lg overflow-hidden border border-white/20 hover:border-white shadow-2xl text-left transition-transform hover:scale-105"
                style={{
                  left: rect.x,
                  top: rect.y,
                  width: rect.w,
                  height: rect.h,
                  background:
                    "linear-gradient(180deg, rgba(40,40,55,0.92), rgba(20,20,30,0.92))",
                }}
              >
                <div className="flex items-center gap-2 h-6 px-2 border-b border-white/10 text-[10px] text-white/85">
                  <Icon size={11} />
                  <span className="truncate">{w.title}</span>
                </div>
                <div className="grid place-items-center p-3" style={{ height: rect.h - 24 }}>
                  <Icon size={Math.min(rect.h / 3, rect.w / 3, 64)} className="text-white/40" />
                </div>
              </button>
            );
          })
        )}
      </div>
    </div>
  );
}
