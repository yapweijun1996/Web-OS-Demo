import { FileText, ArrowUpRight } from "lucide-react";
import { useUI } from "../os/ui";
import { useVFS } from "../os/vfs/store";
import { launchApp } from "../os/launcher";

export function QuickLook() {
  const fileId = useUI((s) => s.quickLookFileId);
  const close = useUI((s) => s.closeQuickLook);
  const node = useVFS((s) => (fileId ? s.nodes[fileId] : undefined));

  if (!fileId || !node || node.type !== "file") return null;

  const openInNotes = () => {
    launchApp("notes", {
      title: node.name,
      appData: { fileId: node.id },
    });
    close();
  };

  return (
    <div
      className="absolute inset-0 z-[10007] grid place-items-center bg-black/40"
      onClick={close}
    >
      <div
        className="w-[640px] max-h-[75vh] flex flex-col rounded-xl border overflow-hidden wm-pop-in"
        style={{
          background: "var(--os-bg-strong)",
          color: "var(--os-text)",
          borderColor: "var(--os-border)",
          backdropFilter: "blur(24px) saturate(1.6)",
          WebkitBackdropFilter: "blur(24px) saturate(1.6)",
          boxShadow: "0 30px 80px -20px rgba(0,0,0,0.55)",
        }}
        onClick={(e) => e.stopPropagation()}
      >
        <div
          className="flex items-center gap-2 px-4 py-3 border-b"
          style={{ borderColor: "var(--os-border)" }}
        >
          <FileText size={16} style={{ color: "var(--os-text-dim)" }} />
          <span className="text-sm font-semibold flex-1 truncate">
            {node.name}
          </span>
          <span
            className="text-[11px]"
            style={{ color: "var(--os-text-dim)" }}
          >
            {node.content.length} chars
          </span>
          <button
            type="button"
            onClick={openInNotes}
            className="ml-2 px-2 py-1 text-[11px] rounded flex items-center gap-1 hover:bg-[var(--os-hover)] border border-[var(--os-border)]"
            title="Open in Notes"
          >
            <ArrowUpRight size={11} /> Open
          </button>
        </div>
        <div
          className="overflow-auto p-5 font-mono text-[13px] leading-relaxed whitespace-pre-wrap break-words"
          style={{ color: "var(--os-text)" }}
        >
          {node.content || (
            <span style={{ color: "var(--os-text-dim)" }}>(empty file)</span>
          )}
        </div>
        <div
          className="px-4 py-2 text-[10px] border-t flex justify-between"
          style={{
            color: "var(--os-text-dim)",
            borderColor: "var(--os-border)",
          }}
        >
          <span>Quick Look · press Space or Esc to close</span>
        </div>
      </div>
    </div>
  );
}
