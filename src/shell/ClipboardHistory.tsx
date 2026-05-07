import { useState, useEffect } from "react";
import { Clipboard, Trash2 } from "lucide-react";
import { useUI } from "../os/ui";
import { useNotifs } from "../os/notifications";

export function ClipboardHistory() {
  const open = useUI((s) => s.clipboardOpen);
  const setOpen = useUI((s) => s.toggleClipboard);
  const items = useNotifs((s) => s.clipboard);
  const copyText = useNotifs((s) => s.copyText);
  const removeClipboard = useNotifs((s) => s.removeClipboard);
  const clearClipboard = useNotifs((s) => s.clearClipboard);
  const [sel, setSel] = useState(0);

  useEffect(() => {
    if (open) setSel(0);
  }, [open]);

  if (!open) return null;

  const onKey = (e: React.KeyboardEvent) => {
    if (e.key === "ArrowDown") {
      e.preventDefault();
      setSel((i) => Math.min(items.length - 1, i + 1));
    } else if (e.key === "ArrowUp") {
      e.preventDefault();
      setSel((i) => Math.max(0, i - 1));
    } else if (e.key === "Enter" && items[sel]) {
      e.preventDefault();
      copyText(items[sel].text);
      setOpen();
    } else if (e.key === "Escape") {
      e.preventDefault();
      setOpen();
    }
  };

  return (
    <div
      className="absolute inset-0 z-[10006] flex items-start justify-center pt-[14vh] bg-black/20"
      onClick={() => setOpen()}
    >
      <div
        className="w-[520px] max-h-[60vh] flex flex-col rounded-xl border overflow-hidden wm-pop-in outline-none"
        style={{
          background: "var(--os-bg-strong)",
          color: "var(--os-text)",
          borderColor: "var(--os-border)",
          backdropFilter: "blur(24px) saturate(1.6)",
          WebkitBackdropFilter: "blur(24px) saturate(1.6)",
          boxShadow: "0 30px 80px -20px rgba(0,0,0,0.5)",
        }}
        tabIndex={0}
        autoFocus
        onKeyDown={onKey}
        ref={(el) => el?.focus()}
        onClick={(e) => e.stopPropagation()}
      >
        <div
          className="flex items-center px-4 py-3 border-b gap-3"
          style={{ borderColor: "var(--os-border)" }}
        >
          <Clipboard size={16} style={{ color: "var(--os-text-dim)" }} />
          <span className="text-sm font-semibold flex-1">
            Clipboard history
          </span>
          {items.length > 0 && (
            <button
              type="button"
              onClick={clearClipboard}
              className="text-[11px] opacity-60 hover:opacity-100 flex items-center gap-1"
            >
              <Trash2 size={11} /> Clear
            </button>
          )}
        </div>
        <div className="overflow-auto p-1.5">
          {items.length === 0 ? (
            <div
              className="p-8 text-center text-sm"
              style={{ color: "var(--os-text-dim)" }}
            >
              Nothing copied yet. Select text in any window and press ⌘C.
            </div>
          ) : (
            items.map((item, i) => {
              const selected = i === sel;
              const preview = item.text.length > 100
                ? item.text.slice(0, 100) + "…"
                : item.text;
              return (
                <button
                  key={item.id}
                  type="button"
                  onClick={() => {
                    copyText(item.text);
                    setOpen();
                  }}
                  onMouseEnter={() => setSel(i)}
                  className="w-full flex items-start gap-3 px-3 py-2 rounded text-left text-sm group/item"
                  style={{
                    background: selected ? "#007aff" : "transparent",
                    color: selected ? "white" : "inherit",
                  }}
                >
                  <span className="flex-1 min-w-0 whitespace-pre-wrap break-words font-mono text-[12px] leading-snug">
                    {preview}
                  </span>
                  <span
                    className="flex-shrink-0 text-[10px] opacity-60"
                    style={{ color: selected ? "rgba(255,255,255,0.85)" : "var(--os-text-dim)" }}
                  >
                    {item.text.length} chars
                  </span>
                  <button
                    type="button"
                    onClick={(e) => {
                      e.stopPropagation();
                      removeClipboard(item.id);
                    }}
                    className="opacity-0 group-hover/item:opacity-60 hover:opacity-100"
                    aria-label="Remove"
                  >
                    <Trash2 size={12} />
                  </button>
                </button>
              );
            })
          )}
        </div>
      </div>
    </div>
  );
}
