import { Rnd } from "react-rnd";
import { Minus, Square, X } from "lucide-react";
import { useWindows } from "../os/store";
import { APPS } from "../os/apps";
import type { WindowState } from "../os/types";

export function Window({ w }: { w: WindowState }) {
  const focus = useWindows((s) => s.focus);
  const move = useWindows((s) => s.move);
  const resize = useWindows((s) => s.resize);
  const minimize = useWindows((s) => s.minimize);
  const toggleMaximize = useWindows((s) => s.toggleMaximize);
  const close = useWindows((s) => s.close);

  if (w.minimized) return null;

  const app = APPS[w.appId];
  if (!app) return null;
  const Body = app.Component;

  return (
    <Rnd
      size={{ width: w.width, height: w.height }}
      position={{ x: w.x, y: w.y }}
      onDragStart={() => focus(w.id)}
      onDragStop={(_e, d) => move(w.id, d.x, d.y)}
      onResizeStart={() => focus(w.id)}
      onResizeStop={(_e, _dir, ref, _delta, pos) =>
        resize(w.id, pos.x, pos.y, ref.offsetWidth, ref.offsetHeight)
      }
      minWidth={240}
      minHeight={120}
      bounds="parent"
      dragHandleClassName="wm-titlebar"
      style={{ zIndex: w.z, position: "absolute", pointerEvents: "auto" }}
      disableDragging={w.maximized}
      enableResizing={!w.maximized}
    >
      <div
        className="w-full h-full flex flex-col rounded-md shadow-2xl backdrop-blur overflow-hidden border wm-pop-in"
        style={{
          background: "var(--os-bg-strong)",
          color: "var(--os-text)",
          borderColor: "var(--os-border)",
        }}
        onMouseDown={() => focus(w.id)}
      >
        <div
          className="wm-titlebar h-9 flex items-center pl-3 pr-1 select-none cursor-grab active:cursor-grabbing border-b"
          style={{ borderColor: "var(--os-border)" }}
          onDoubleClick={() => toggleMaximize(w.id)}
        >
          <span className="text-sm font-medium truncate flex-1">
            {w.title}
          </span>
          <div className="flex items-center gap-1">
            <button
              type="button"
              onClick={() => minimize(w.id)}
              aria-label="Minimize"
              className="w-7 h-7 grid place-items-center rounded hover:bg-[var(--os-hover)]"
            >
              <Minus size={14} />
            </button>
            <button
              type="button"
              onClick={() => toggleMaximize(w.id)}
              aria-label="Maximize"
              className="w-7 h-7 grid place-items-center rounded hover:bg-[var(--os-hover)]"
            >
              <Square size={12} />
            </button>
            <button
              type="button"
              onClick={() => close(w.id)}
              aria-label="Close"
              className="w-7 h-7 grid place-items-center rounded hover:bg-red-500/80"
            >
              <X size={14} />
            </button>
          </div>
        </div>
        <div className="flex-1 overflow-auto">
          <Body windowId={w.id} />
        </div>
      </div>
    </Rnd>
  );
}
