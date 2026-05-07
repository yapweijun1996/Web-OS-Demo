import { useState } from "react";
import { Rnd } from "react-rnd";
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
  const focusedId = useWindows((s) => {
    const visible = s.windows.filter((ww) => !ww.minimized);
    return visible.length
      ? visible.reduce((a, b) => (a.z > b.z ? a : b)).id
      : null;
  });
  const [hoveringTitle, setHoveringTitle] = useState(false);

  if (w.minimized) return null;

  const app = APPS[w.appId];
  if (!app) return null;
  const Body = app.Component;
  const isFocused = focusedId === w.id;

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
      minWidth={260}
      minHeight={140}
      bounds="parent"
      dragHandleClassName="wm-titlebar"
      style={{ zIndex: w.z, position: "absolute", pointerEvents: "auto" }}
      disableDragging={w.maximized}
      enableResizing={!w.maximized && !w.snap}
    >
      <div
        className="w-full h-full flex flex-col rounded-xl overflow-hidden border wm-pop-in"
        style={{
          background: "var(--os-bg-strong)",
          color: "var(--os-text)",
          borderColor: "var(--os-border)",
          boxShadow: isFocused
            ? "0 24px 60px -12px rgba(0,0,0,0.45), 0 4px 12px rgba(0,0,0,0.2)"
            : "0 12px 28px -10px rgba(0,0,0,0.3), 0 2px 6px rgba(0,0,0,0.15)",
          backdropFilter: "blur(20px) saturate(1.6)",
          WebkitBackdropFilter: "blur(20px) saturate(1.6)",
        }}
        onMouseDown={() => focus(w.id)}
      >
        <div
          className="wm-titlebar h-7 flex items-center pl-3 pr-3 select-none cursor-grab active:cursor-grabbing border-b relative"
          style={{ borderColor: "var(--os-border)" }}
          onDoubleClick={() => toggleMaximize(w.id)}
          onMouseEnter={() => setHoveringTitle(true)}
          onMouseLeave={() => setHoveringTitle(false)}
        >
          {/* Mac traffic lights — LEFT */}
          <div className="flex items-center gap-[6px]">
            <TrafficLight
              color="#ff5f57"
              focused={isFocused}
              hovering={hoveringTitle}
              ariaLabel="Close"
              symbol="x"
              onClick={(e) => {
                e.stopPropagation();
                close(w.id);
              }}
            />
            <TrafficLight
              color="#febc2e"
              focused={isFocused}
              hovering={hoveringTitle}
              ariaLabel="Minimize"
              symbol="minus"
              onClick={(e) => {
                e.stopPropagation();
                minimize(w.id);
              }}
            />
            <TrafficLight
              color="#28c840"
              focused={isFocused}
              hovering={hoveringTitle}
              ariaLabel="Maximize"
              symbol="plus"
              onClick={(e) => {
                e.stopPropagation();
                toggleMaximize(w.id);
              }}
            />
          </div>

          {/* Centered title */}
          <span
            className="absolute left-1/2 -translate-x-1/2 text-[12px] font-semibold truncate max-w-[60%]"
            style={{ opacity: isFocused ? 1 : 0.5 }}
          >
            {w.title}
          </span>

          {/* Right spacer for layout symmetry */}
          <div className="ml-auto w-[54px]" />
        </div>

        <div className="flex-1 overflow-auto">
          <Body windowId={w.id} />
        </div>
      </div>
    </Rnd>
  );
}

function TrafficLight({
  color,
  focused,
  hovering,
  symbol,
  ariaLabel,
  onClick,
}: {
  color: string;
  focused: boolean;
  hovering: boolean;
  symbol: "x" | "minus" | "plus";
  ariaLabel: string;
  onClick: (e: React.MouseEvent) => void;
}) {
  const inactiveColor = "#bfbfbf";
  return (
    <button
      type="button"
      aria-label={ariaLabel}
      onClick={onClick}
      className="w-[12px] h-[12px] rounded-full grid place-items-center transition-colors"
      style={{
        background: focused ? color : inactiveColor,
        boxShadow: focused
          ? "inset 0 0 0 0.5px rgba(0,0,0,0.18)"
          : "inset 0 0 0 0.5px rgba(0,0,0,0.1)",
      }}
    >
      <span
        className="leading-none transition-opacity"
        style={{
          opacity: hovering ? 0.65 : 0,
          fontSize: 9,
          color: "#000",
          fontWeight: 700,
        }}
      >
        {symbol === "x" ? "×" : symbol === "minus" ? "−" : "+"}
      </span>
    </button>
  );
}
