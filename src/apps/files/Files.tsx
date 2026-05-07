import { useState } from "react";
import {
  Folder,
  FileText,
  FilePlus,
  FolderPlus,
  Trash2,
  ChevronLeft,
} from "lucide-react";
import { useVFS } from "../../os/vfs/store";
import { launchApp } from "../../os/launcher";
import type { VFSId } from "../../os/vfs/types";

export function Files() {
  const ready = useVFS((s) => s.ready);
  const childrenOf = useVFS((s) => s.childrenOf);
  const getNode = useVFS((s) => s.getNode);
  const createFile = useVFS((s) => s.createFile);
  const createFolder = useVFS((s) => s.createFolder);
  const remove = useVFS((s) => s.remove);

  // re-render when nodes change
  useVFS((s) => s.nodes);

  const [cwd, setCwd] = useState<VFSId | null>(null);
  const [selected, setSelected] = useState<VFSId | null>(null);

  if (!ready) {
    return (
      <div className="p-5 text-xs text-white/60">Loading file system…</div>
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
    if (!confirm(`Delete "${n.name}"${n.type === "folder" ? " and all contents" : ""}?`))
      return;
    await remove(selected);
    setSelected(null);
  };

  return (
    <div className="h-full flex flex-col text-sm">
      {/* toolbar */}
      <div className="flex items-center gap-1 px-2 py-1.5 border-b border-white/10 bg-white/5">
        <button
          type="button"
          onClick={() => {
            if (!current) return;
            setCwd(current.parentId);
            setSelected(null);
          }}
          disabled={!current}
          className="w-7 h-7 grid place-items-center rounded hover:bg-white/10 disabled:opacity-30"
          aria-label="Up"
        >
          <ChevronLeft size={14} />
        </button>
        <div className="flex-1 flex items-center text-xs text-white/70 px-2 min-w-0 overflow-hidden">
          {breadcrumb.map((b, i) => (
            <span key={b.id ?? "root"} className="flex items-center min-w-0">
              {i > 0 && <span className="px-1 text-white/30">/</span>}
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
          onClick={newFile}
          className="px-2 h-7 flex items-center gap-1 rounded hover:bg-white/10 text-xs"
          title="New file"
        >
          <FilePlus size={14} /> File
        </button>
        <button
          type="button"
          onClick={newFolder}
          className="px-2 h-7 flex items-center gap-1 rounded hover:bg-white/10 text-xs"
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
          <div className="p-6 text-center text-xs text-white/40">
            (empty folder)
          </div>
        ) : (
          items.map((n) => {
            const Icon = n.type === "folder" ? Folder : FileText;
            const isSelected = selected === n.id;
            return (
              <button
                key={n.id}
                type="button"
                onClick={() => setSelected(n.id)}
                onDoubleClick={() => open(n.id)}
                className={`w-full flex items-center gap-2 px-2 py-1 rounded text-left text-sm ${
                  isSelected ? "bg-white/15" : "hover:bg-white/10"
                }`}
              >
                <Icon
                  size={16}
                  className={
                    n.type === "folder" ? "text-amber-300" : "text-white/70"
                  }
                />
                <span className="truncate flex-1">{n.name}</span>
                {n.type === "file" && (
                  <span className="text-[10px] text-white/40">
                    {n.content.length} chars
                  </span>
                )}
              </button>
            );
          })
        )}
      </div>
    </div>
  );
}
