import { useUI } from "../os/ui";

export function ContextMenu() {
  const cm = useUI((s) => s.contextMenu);
  const close = useUI((s) => s.closeContextMenu);

  if (!cm) return null;

  const x = Math.min(cm.x, window.innerWidth - 200);
  const y = Math.min(cm.y, window.innerHeight - cm.items.length * 32 - 16);

  return (
    <div
      className="absolute backdrop-blur border rounded shadow-2xl py-1 text-sm min-w-[180px] wm-pop-in"
      style={{
        left: x,
        top: y,
        zIndex: 10001,
        background: "var(--os-bg-strong)",
        color: "var(--os-text)",
        borderColor: "var(--os-border)",
      }}
      onClick={(e) => e.stopPropagation()}
      onContextMenu={(e) => {
        e.preventDefault();
        e.stopPropagation();
      }}
    >
      {cm.items.map((item, i) => (
        <button
          key={i}
          type="button"
          onClick={() => {
            item.onClick();
            close();
          }}
          className="w-full text-left px-3 py-1.5 hover:bg-[var(--os-hover)]"
        >
          {item.label}
        </button>
      ))}
    </div>
  );
}
