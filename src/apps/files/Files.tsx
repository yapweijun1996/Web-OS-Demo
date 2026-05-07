import { useEffect, useRef, useState } from "react";
import {
  Folder,
  FileText,
  FilePlus,
  FolderPlus,
  Trash2,
  ChevronLeft,
  Eye,
} from "lucide-react";
import { useVFS } from "../../os/vfs/store";
import { useUI } from "../../os/ui";
import { useNotifs } from "../../os/notifications";
import { launchApp } from "../../os/launcher";
import type { VFSId } from "../../os/vfs/types";

const VFS_DRAG_TYPE = "application/x-vfs-file-id";

export function Files() {
  const ready = useVFS((s) => s.ready);
  const childrenOf = useVFS((s) => s.childrenOf);
  const getNode = useVFS((s) => s.getNode);
  const createFile = useVFS((s) => s.createFile);
  const createFolder = useVFS((s) => s.createFolder);
  const remove = useVFS((s) => s.remove);
  const openQuickLook = useUI((s) => s.openQuickLook);
  const addNotif = useNotifs((s) => s.addNotif);

  // re-render when nodes change
  useVFS((s) => s.nodes);

  const [cwd, setCwd] = useState<VFSId | null>(null);
  const [selected, setSelected] = useState<VFSId | null>(null);
  const [dragOver, setDragOver] = useState(false);
  const rootRef = useRef<HTMLDivElement>(null);

  // Spacebar → Quick Look the selected file (only when this Files window is
  // hovered/focused; we use window keydown gated by mouse-inside flag).
  const [hovered, setHovered] = useState(false);
  useEffect(() => {
    if (!hovered) return;
    const onKey = (e: KeyboardEvent) => {
      if (e.key !== " ") return;
      // Don't fire if user is typing in an input
      const tag = (e.target as HTMLElement | null)?.tagName;
      if (tag === "INPUT" || tag === "TEXTAREA") return;
      if (!selected) return;
      const n = getNode(selected);
      if (!n || n.type !== "file") return;
      e.preventDefault();
      openQuickLook(selected);
    };
    document.addEventListener("keydown", onKey);
    return () => document.removeEventListener("keydown", onKey);
  }, [hovered, selected, getNode, openQuickLook]);

  if (!ready) {
    return (
      <div
        className="p-5 text-xs"
        style={{ color: "var(--os-text-dim)" }}
      >
        Loading file system…
      </div>
    );
  }

  const current = cwd ? getNode(cwd) : null;
  const items = childrenOf(cwd);
  const breadcrumb: { id: VFSId | null; name: string }[] = [
    { id: null, name: "Home" },
  ];
  let walk = current;
  const path: { id: VFSId | null; name: string }[] = [];
  while (walk) {
    path.unshift({ id: walk.id, name: walk.name });
    walk = walk.parentId ? (getNode(walk.parentId) ?? null) : null;
  }
  breadcrumb.push(...path);

  const newFile = async () => {
    const name = prompt("New file name:", "Untitled.txt")?.trim();
    if (!name) return;
    const id = await createFile(name, cwd);
    setSelected(id);
  };

  const newFolder = async () => {
    const name = prompt("New folder name:", "New Folder")?.trim();
    if (!name) return;
    await createFolder(name, cwd);
  };

  const open = (id: VFSId) => {
    const n = getNode(id);
    if (!n) return;
    if (n.type === "folder") {
      setCwd(n.id);
      setSelected(null);
    } else {
      launchApp("notes", {
        title: n.name,
        appData: { fileId: n.id },
      });
    }
  };

  const remove1 = async () => {
    if (!selected) return;
    const n = getNode(selected);
    if (!n) return;
    if (
      !confirm(
        `Delete "${n.name}"${n.type === "folder" ? " and all contents" : ""}?`,
      )
    )
      return;
    await remove(selected);
    setSelected(null);
  };

  // Drop handler — accept plain text (creates a new file) or another VFS file
  // (moves it, but we only have flat parent reassignment by moving into cwd).
  const handleDrop = async (e: React.DragEvent) => {
    e.preventDefault();
    setDragOver(false);
    const vfsId = e.dataTransfer.getData(VFS_DRAG_TYPE);
    if (vfsId) {
      // For now: noop — re-parenting needs a ui story (drop on folder vs blank).
      return;
    }
    const text = e.dataTransfer.getData("text/plain");
    if (text) {
      const name =
        prompt(
          "Save dropped text as:",
          `Pasted-${new Date().toISOString().slice(11, 19).replace(/:/g, "")}.txt`,
        )?.trim();
      if (!name) return;
      const id = await createFile(name, cwd, text);
      setSelected(id);
      addNotif({
        title: "File created",
        body: `${name} (${text.length} chars) saved from drag`,
        appId: "files",
      });
    }
  };

  return (
    <div
      ref={rootRef}
      className="h-full flex flex-col text-sm relative"
      onMouseEnter={() => setHovered(true)}
      onMouseLeave={() => setHovered(false)}
      onDragOver={(e) => {
        e.preventDefault();
        setDragOver(true);
      }}
      onDragLeave={(e) => {
        if (e.currentTarget === e.target) setDragOver(false);
      }}
      onDrop={handleDrop}
    >
      {dragOver && (
        <div
          className="absolute inset-0 z-10 pointer-events-none rounded-lg border-2 border-dashed grid place-items-center text-xs font-medium"
          style={{
            borderColor: "#007aff",
            background: "rgba(0,122,255,0.08)",
            color: "var(--os-text)",
          }}
        >
          Drop text here to create a file
        </div>
      )}
      {/* toolbar */}
      <div
        className="flex items-center gap-1 px-2 py-1.5 border-b"
        style={{
          borderColor: "var(--os-border)",
          background: "var(--os-hover)",
        }}
      >
        <button
          type="button"
          onClick={() => {
            if (!current) return;
            setCwd(current.parentId);
            setSelected(null);
          }}
          disabled={!current}
          className="w-7 h-7 grid place-items-center rounded hover:bg-[var(--os-hover)] disabled:opacity-30"
          aria-label="Up"
        >
          <ChevronLeft size={14} />
        </button>
        <div
          className="flex-1 flex items-center text-xs px-2 min-w-0 overflow-hidden"
          style={{ color: "var(--os-text-dim)" }}
        >
          {breadcrumb.map((b, i) => (
            <span key={b.id ?? "root"} className="flex items-center min-w-0">
              {i > 0 && <span className="px-1 opacity-40">/</span>}
              <button
                type="button"
                onClick={() => {
                  setCwd(b.id);
                  setSelected(null);
                }}
                className="hover:underline truncate"
              >
                {b.name}
              </button>
            </span>
          ))}
        </div>
        <button
          type="button"
          onClick={() => selected && openQuickLook(selected)}
          disabled={!selected || getNode(selected!)?.type !== "file"}
          className="px-2 h-7 flex items-center gap-1 rounded hover:bg-[var(--os-hover)] text-xs disabled:opacity-30"
          title="Quick Look (Space)"
        >
          <Eye size={14} />
        </button>
        <button
          type="button"
          onClick={newFile}
          className="px-2 h-7 flex items-center gap-1 rounded hover:bg-[var(--os-hover)] text-xs"
          title="New file"
        >
          <FilePlus size={14} /> File
        </button>
        <button
          type="button"
          onClick={newFolder}
          className="px-2 h-7 flex items-center gap-1 rounded hover:bg-[var(--os-hover)] text-xs"
          title="New folder"
        >
          <FolderPlus size={14} /> Folder
        </button>
        <button
          type="button"
          onClick={remove1}
          disabled={!selected}
          className="px-2 h-7 flex items-center gap-1 rounded hover:bg-red-500/40 text-xs disabled:opacity-30"
          title="Delete selected"
        >
          <Trash2 size={14} />
        </button>
      </div>

      {/* item list */}
      <div className="flex-1 overflow-auto p-1">
        {items.length === 0 ? (
          <div
            className="p-6 text-center text-xs"
            style={{ color: "var(--os-text-dim)" }}
          >
            (empty folder)
          </div>
        ) : (
          items.map((n) => {
            const Icon = n.type === "folder" ? Folder : FileText;
            const isSelected = selected === n.id;
            return (
              <div
                key={n.id}
                role="button"
                tabIndex={0}
                draggable={n.type === "file"}
                onDragStart={(e) => {
                  if (n.type !== "file") return;
                  e.dataTransfer.setData(VFS_DRAG_TYPE, n.id);
                  e.dataTransfer.setData("text/plain", n.content);
                  e.dataTransfer.effectAllowed = "copy";
                }}
                onClick={() => setSelected(n.id)}
                onDoubleClick={() => open(n.id)}
                className={`w-full flex items-center gap-2 px-2 py-1 rounded text-left text-sm cursor-default outline-none ${
                  isSelected
                    ? "bg-[var(--os-active)]"
                    : "hover:bg-[var(--os-hover)]"
                }`}
              >
                <Icon
                  size={16}
                  className={n.type === "folder" ? "text-amber-500" : ""}
                  style={
                    n.type === "folder"
                      ? undefined
                      : { color: "var(--os-text-dim)" }
                  }
                />
                <span className="truncate flex-1">{n.name}</span>
                {n.type === "file" && (
                  <span
                    className="text-[10px]"
                    style={{ color: "var(--os-text-dim)" }}
                  >
                    {n.content.length} chars
                  </span>
                )}
              </div>
            );
          })
        )}
      </div>
    </div>
  );
}
