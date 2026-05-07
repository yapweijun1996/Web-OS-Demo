import { useEffect, useState } from "react";

const STORAGE_KEY = "app:notes:content";

export function Notes() {
  const [text, setText] = useState<string>(
    () => localStorage.getItem(STORAGE_KEY) ?? "",
  );

  useEffect(() => {
    const id = setTimeout(
      () => localStorage.setItem(STORAGE_KEY, text),
      300,
    );
    return () => clearTimeout(id);
  }, [text]);

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
        <span>{text.length} chars</span>
        <span>autosaved · localStorage</span>
      </div>
    </div>
  );
}
