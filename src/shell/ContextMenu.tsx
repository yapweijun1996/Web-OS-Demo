import { useUI } from "../os/ui";

export function ContextMenu() {
  const cm = useUI((s) => s.contextMenu);
  const close = useUI((s) => s.closeContextMenu);

  if (!cm) return null;

  const x = Math.min(cm.x, window.innerWidth - 200);
  const y = Math.min(cm.y, window.innerHeight - cm.items.length * 32 - 16);

  return (
    <div
      className="absolute bg-zinc-900/95 backdrop-blur border border-white/10 rounded shadow-2xl py-1 text-sm min-w-[180px]"
      style={{ left: x, top: y, zIndex: 10001 }}
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
          className="w-full text-left px-3 py-1.5 hover:bg-white/10"
        >
          {item.label}
        </button>
      ))}
    </div>
  );
}
