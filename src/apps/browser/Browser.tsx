import { useRef, useState } from "react";
import {
  ChevronLeft,
  ChevronRight,
  RotateCw,
  Home,
  ExternalLink,
} from "lucide-react";

const HOME_URL = "https://yapweijun1996.com/";

const BOOKMARKS: { name: string; url: string }[] = [
  { name: "yapweijun1996.com", url: "https://yapweijun1996.com/" },
  { name: "GitHub", url: "https://github.com/yapweijun1996" },
  { name: "Web OS Repo", url: "https://github.com/yapweijun1996/Web-OS-Demo" },
  { name: "search.yapweijun1996.com", url: "https://search.yapweijun1996.com/" },
];

function normalize(input: string): string {
  const trimmed = input.trim();
  if (!trimmed) return HOME_URL;
  if (/^https?:\/\//i.test(trimmed)) return trimmed;
  if (/^[\w-]+(\.[\w-]+)+/.test(trimmed)) return `https://${trimmed}`;
  // treat as a search query against the user's self-hosted SearXNG
  return `https://search.yapweijun1996.com/search?q=${encodeURIComponent(trimmed)}`;
}

export function Browser() {
  const [history, setHistory] = useState<string[]>([HOME_URL]);
  const [idx, setIdx] = useState(0);
  const [draftUrl, setDraftUrl] = useState(HOME_URL);
  const [reloadKey, setReloadKey] = useState(0);
  const iframeRef = useRef<HTMLIFrameElement>(null);

  const currentUrl = history[idx];
  const canBack = idx > 0;
  const canForward = idx < history.length - 1;

  const navigate = (raw: string) => {
    const url = normalize(raw);
    setHistory((h) => [...h.slice(0, idx + 1), url]);
    setIdx((i) => i + 1);
    setDraftUrl(url);
  };

  const goBack = () => {
    if (!canBack) return;
    const newIdx = idx - 1;
    setIdx(newIdx);
    setDraftUrl(history[newIdx]);
  };

  const goForward = () => {
    if (!canForward) return;
    const newIdx = idx + 1;
    setIdx(newIdx);
    setDraftUrl(history[newIdx]);
  };

  const reload = () => setReloadKey((k) => k + 1);

  return (
    <div className="h-full flex flex-col">
      {/* Toolbar */}
      <div
        className="flex items-center gap-1 px-2 py-1.5 border-b"
        style={{
          borderColor: "var(--os-border)",
          background: "var(--os-hover)",
        }}
      >
        <button
          type="button"
          onClick={goBack}
          disabled={!canBack}
          className="w-7 h-7 grid place-items-center rounded hover:bg-[var(--os-hover)] disabled:opacity-30"
          aria-label="Back"
          title="Back"
        >
          <ChevronLeft size={16} />
        </button>
        <button
          type="button"
          onClick={goForward}
          disabled={!canForward}
          className="w-7 h-7 grid place-items-center rounded hover:bg-[var(--os-hover)] disabled:opacity-30"
          aria-label="Forward"
          title="Forward"
        >
          <ChevronRight size={16} />
        </button>
        <button
          type="button"
          onClick={reload}
          className="w-7 h-7 grid place-items-center rounded hover:bg-[var(--os-hover)]"
          aria-label="Reload"
          title="Reload"
        >
          <RotateCw size={14} />
        </button>
        <button
          type="button"
          onClick={() => navigate(HOME_URL)}
          className="w-7 h-7 grid place-items-center rounded hover:bg-[var(--os-hover)]"
          aria-label="Home"
          title="Home"
        >
          <Home size={14} />
        </button>
        <input
          type="text"
          value={draftUrl}
          onChange={(e) => setDraftUrl(e.target.value)}
          onKeyDown={(e) => {
            if (e.key === "Enter") navigate(draftUrl);
          }}
          spellCheck={false}
          className="flex-1 px-3 py-1 text-xs rounded bg-[var(--os-bg-strong)] outline-none border"
          style={{
            borderColor: "var(--os-border)",
            color: "var(--os-text)",
          }}
          placeholder="Enter URL or search…"
        />
        <a
          href={currentUrl}
          target="_blank"
          rel="noreferrer noopener"
          className="w-7 h-7 grid place-items-center rounded hover:bg-[var(--os-hover)]"
          aria-label="Open in new tab"
          title="Open in real browser tab"
        >
          <ExternalLink size={14} />
        </a>
      </div>

      {/* Bookmarks bar */}
      <div
        className="flex items-center gap-1 px-2 py-1 border-b text-[11px] overflow-x-auto"
        style={{
          borderColor: "var(--os-border)",
          color: "var(--os-text-dim)",
        }}
      >
        {BOOKMARKS.map((b) => (
          <button
            key={b.url}
            type="button"
            onClick={() => navigate(b.url)}
            className="px-2 py-0.5 rounded hover:bg-[var(--os-hover)] whitespace-nowrap"
          >
            {b.name}
          </button>
        ))}
      </div>

      {/* Iframe content */}
      <div className="flex-1 relative bg-white">
        <iframe
          ref={iframeRef}
          key={`${currentUrl}-${reloadKey}`}
          src={currentUrl}
          title="Browser"
          className="absolute inset-0 w-full h-full border-0"
          sandbox="allow-scripts allow-same-origin allow-forms allow-popups allow-popups-to-escape-sandbox"
          referrerPolicy="no-referrer-when-downgrade"
        />
      </div>

      {/* Status bar */}
      <div
        className="px-3 py-1 text-[10px] border-t flex justify-between"
        style={{
          color: "var(--os-text-dim)",
          borderColor: "var(--os-border)",
        }}
      >
        <span className="truncate">{currentUrl}</span>
        <span>
          {history.length > 1
            ? `${idx + 1} / ${history.length}`
            : "sandboxed iframe"}
        </span>
      </div>
    </div>
  );
}
