import { useEffect, useRef, useState } from "react";
import { useWindows } from "../../os/store";
import { useVFS } from "../../os/vfs/store";
import { launchApp } from "../../os/launcher";
import type { VFSId } from "../../os/vfs/types";

export function Notes({ windowId }: { windowId: string }) {
  const setTitle = useWindows((s) => s.setTitle);
  const w = useWindows((s) => s.windows.find((ww) => ww.id === windowId));
  const ready = useVFS((s) => s.ready);
  const getNode = useVFS((s) => s.getNode);
  const createFile = useVFS((s) => s.createFile);
  const writeContent = useVFS((s) => s.writeContent);

  const fileId = w?.appData?.fileId as VFSId | undefined;
  const node = fileId ? getNode(fileId) : undefined;
  const file = node?.type === "file" ? node : undefined;

  const [text, setText] = useState<string>(file?.content ?? "");
  const lastSavedRef = useRef<string>(file?.content ?? "");

  // Hydrate text whenever the bound file changes (or first becomes available).
  useEffect(() => {
    if (file && file.content !== lastSavedRef.current) {
      setText(file.content);
      lastSavedRef.current = file.content;
    }
  }, [file]);

  // Keep window title in sync with file name.
  useEffect(() => {
    if (file && w && w.title !== file.name) setTitle(w.id, file.name);
  }, [file, w, setTitle]);

  // Debounced write.
  useEffect(() => {
    if (!fileId) return;
    if (text === lastSavedRef.current) return;
    const id = setTimeout(() => {
      writeContent(fileId, text);
      lastSavedRef.current = text;
    }, 300);
    return () => clearTimeout(id);
  }, [text, fileId, writeContent]);

  if (!ready) {
    return (
      <div className="p-5 text-xs text-white/60">Loading file system…</div>
    );
  }

  // No file bound — empty Notes window: offer to create one.
  if (!fileId || !file) {
    return (
      <div className="h-full flex flex-col items-center justify-center p-6 text-center text-sm space-y-3">
        <p className="text-white/70">
          No file open. Create a new note to start writing.
        </p>
        <button
          type="button"
          onClick={async () => {
            const name = prompt("New note name:", "Untitled.txt")?.trim();
            if (!name) return;
            const id = await createFile(name, null, "");
            launchApp("notes", { title: name, appData: { fileId: id } });
          }}
          className="px-3 py-1.5 text-xs rounded bg-white/10 hover:bg-white/20 border border-white/20"
        >
          New note
        </button>
        <p className="text-[10px] text-white/40">
          Or open File Explorer and double-click a .txt file
        </p>
      </div>
    );
  }

  return (
    <div className="h-full flex flex-col">
      <textarea
        className="flex-1 w-full p-3 bg-transparent text-sm text-white outline-none resize-none font-mono leading-relaxed placeholder:text-white/30"
        value={text}
        onChange={(e) => setText(e.target.value)}
        placeholder="Type your notes here…"
        spellCheck={false}
      />
      <div className="px-3 py-1 text-[10px] text-white/40 border-t border-white/10 flex justify-between">
        <span>{file.name} · {text.length} chars</span>
        <span>
          {text === lastSavedRef.current ? "saved" : "saving…"} · IndexedDB
        </span>
      </div>
    </div>
  );
}
