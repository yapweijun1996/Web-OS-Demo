import { useEffect, useState } from "react";
import {
  ChevronLeft,
  ChevronRight,
  RotateCw,
  Home,
  ExternalLink,
  Star,
  Plus,
  X,
  Trash2,
} from "lucide-react";
import { useBookmarks } from "./store";

const HOME_URL = "https://yapweijun1996.com/";

type Tab = {
  id: string;
  url: string;
  history: string[];
  idx: number;
  reloadKey: number;
};

let tabCounter = 0;
const newTabId = () =>
  `tab-${Date.now().toString(36)}-${(++tabCounter).toString(36)}`;

function makeTab(url: string = HOME_URL): Tab {
  return { id: newTabId(), url, history: [url], idx: 0, reloadKey: 0 };
}

function normalize(input: string): string {
  const trimmed = input.trim();
  if (!trimmed) return HOME_URL;
  if (/^https?:\/\//i.test(trimmed)) return trimmed;
  if (/^[\w-]+(\.[\w-]+)+/.test(trimmed)) return `https://${trimmed}`;
  return `https://search.yapweijun1996.com/search?q=${encodeURIComponent(trimmed)}`;
}

function hostnameOf(url: string): string {
  try {
    return new URL(url).hostname.replace(/^www\./, "");
  } catch {
    return url.slice(0, 24);
  }
}

export function Browser() {
  const [tabs, setTabs] = useState<Tab[]>(() => [makeTab()]);
  const [activeId, setActiveId] = useState<string>(tabs[0].id);
  const [draftUrl, setDraftUrl] = useState<string>(tabs[0].url);

  const ready = useBookmarks((s) => s.ready);
  const bookmarks = useBookmarks((s) => s.bookmarks);
  const hasBookmark = useBookmarks((s) => s.has);
  const addBookmark = useBookmarks((s) => s.add);
  const removeByUrl = useBookmarks((s) => s.removeByUrl);
  const removeBookmark = useBookmarks((s) => s.remove);

  // Lazy-load bookmarks on first mount.
  useEffect(() => {
    if (!ready) useBookmarks.getState().load();
  }, [ready]);

  const active = tabs.find((t) => t.id === activeId) ?? tabs[0];

  // Keep the URL bar in sync when active tab changes.
  useEffect(() => {
    setDraftUrl(active.url);
  }, [active.id, active.url]);

  const updateTab = (id: string, patch: (t: Tab) => Tab) => {
    setTabs((cur) => cur.map((t) => (t.id === id ? patch(t) : t)));
  };

  const navigate = (raw: string) => {
    const url = normalize(raw);
    updateTab(active.id, (t) => ({
      ...t,
      url,
      history: [...t.history.slice(0, t.idx + 1), url],
      idx: t.idx + 1,
    }));
    setDraftUrl(url);
  };

  const goBack = () => {
    if (active.idx <= 0) return;
    updateTab(active.id, (t) => {
      const newIdx = t.idx - 1;
      return { ...t, idx: newIdx, url: t.history[newIdx] };
    });
  };

  const goForward = () => {
    if (active.idx >= active.history.length - 1) return;
    updateTab(active.id, (t) => {
      const newIdx = t.idx + 1;
      return { ...t, idx: newIdx, url: t.history[newIdx] };
    });
  };

  const reload = () => {
    updateTab(active.id, (t) => ({ ...t, reloadKey: t.reloadKey + 1 }));
  };

  const newTab = (url: string = HOME_URL) => {
    const t = makeTab(url);
    setTabs((cur) => [...cur, t]);
    setActiveId(t.id);
  };

  const closeTab = (id: string) => {
    setTabs((cur) => {
      const remaining = cur.filter((t) => t.id !== id);
      if (remaining.length === 0) {
        // Always keep at least one tab open.
        const fresh = makeTab();
        setActiveId(fresh.id);
        return [fresh];
      }
      if (id === activeId) {
        const idx = cur.findIndex((t) => t.id === id);
        const next = remaining[Math.max(0, idx - 1)];
        setActiveId(next.id);
      }
      return remaining;
    });
  };

  const toggleBookmarkCurrent = async () => {
    if (hasBookmark(active.url)) {
      await removeByUrl(active.url);
    } else {
      const name = hostnameOf(active.url);
      await addBookmark(name, active.url);
    }
  };

  const isBookmarked = hasBookmark(active.url);

  return (
    <div className="h-full flex flex-col">
      {/* Tab strip */}
      <div
        className="flex items-end px-1 pt-1 gap-1 border-b overflow-x-auto"
        style={{
          borderColor: "var(--os-border)",
          background: "var(--os-hover)",
        }}
      >
        {tabs.map((t) => {
          const isActive = t.id === activeId;
          return (
            <div
              key={t.id}
              className="group/tab flex items-center gap-2 px-3 py-1 rounded-t cursor-default text-[11px] max-w-[200px] min-w-[100px]"
              onClick={() => setActiveId(t.id)}
              style={{
                background: isActive
                  ? "var(--os-bg-strong)"
                  : "transparent",
                color: isActive ? "var(--os-text)" : "var(--os-text-dim)",
                borderTop: isActive
                  ? `1px solid var(--os-border)`
                  : "1px solid transparent",
                borderLeft: isActive
                  ? `1px solid var(--os-border)`
                  : "1px solid transparent",
                borderRight: isActive
                  ? `1px solid var(--os-border)`
                  : "1px solid transparent",
                marginBottom: isActive ? "-1px" : "0",
              }}
            >
              <span className="truncate flex-1">{hostnameOf(t.url)}</span>
              <button
                type="button"
                onClick={(e) => {
                  e.stopPropagation();
                  closeTab(t.id);
                }}
                className="opacity-0 group-hover/tab:opacity-60 hover:opacity-100"
                aria-label="Close tab"
              >
                <X size={11} />
              </button>
            </div>
          );
        })}
        <button
          type="button"
          onClick={() => newTab()}
          className="px-2 py-1 rounded hover:bg-[var(--os-hover)] text-xs"
          aria-label="New tab"
          title="New tab"
        >
          <Plus size={14} />
        </button>
      </div>

      {/* Toolbar */}
      <div
        className="flex items-center gap-1 px-2 py-1.5 border-b"
        style={{
          borderColor: "var(--os-border)",
          background: "var(--os-bg-strong)",
        }}
      >
        <button
          type="button"
          onClick={goBack}
          disabled={active.idx <= 0}
          className="w-7 h-7 grid place-items-center rounded hover:bg-[var(--os-hover)] disabled:opacity-30"
          aria-label="Back"
        >
          <ChevronLeft size={16} />
        </button>
        <button
          type="button"
          onClick={goForward}
          disabled={active.idx >= active.history.length - 1}
          className="w-7 h-7 grid place-items-center rounded hover:bg-[var(--os-hover)] disabled:opacity-30"
          aria-label="Forward"
        >
          <ChevronRight size={16} />
        </button>
        <button
          type="button"
          onClick={reload}
          className="w-7 h-7 grid place-items-center rounded hover:bg-[var(--os-hover)]"
          aria-label="Reload"
        >
          <RotateCw size={14} />
        </button>
        <button
          type="button"
          onClick={() => navigate(HOME_URL)}
          className="w-7 h-7 grid place-items-center rounded hover:bg-[var(--os-hover)]"
          aria-label="Home"
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
          className="flex-1 px-3 py-1 text-xs rounded outline-none border"
          style={{
            borderColor: "var(--os-border)",
            background: "var(--os-bg)",
            color: "var(--os-text)",
          }}
          placeholder="Enter URL or search…"
        />
        <button
          type="button"
          onClick={toggleBookmarkCurrent}
          className="w-7 h-7 grid place-items-center rounded hover:bg-[var(--os-hover)]"
          aria-label={isBookmarked ? "Remove bookmark" : "Bookmark this page"}
          title={isBookmarked ? "Remove bookmark" : "Bookmark this page"}
        >
          <Star
            size={14}
            className={isBookmarked ? "fill-amber-400 text-amber-400" : ""}
          />
        </button>
        <a
          href={active.url}
          target="_blank"
          rel="noreferrer noopener"
          className="w-7 h-7 grid place-items-center rounded hover:bg-[var(--os-hover)]"
          aria-label="Open in real browser tab"
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
          background: "var(--os-bg-strong)",
        }}
      >
        {!ready ? (
          <span className="px-2">Loading bookmarks…</span>
        ) : bookmarks.length === 0 ? (
          <span className="px-2">No bookmarks. Click ⭐ to add the current page.</span>
        ) : (
          bookmarks.map((b) => (
            <div
              key={b.id}
              className="group/bm flex items-center rounded hover:bg-[var(--os-hover)]"
            >
              <button
                type="button"
                onClick={() => navigate(b.url)}
                className="px-2 py-0.5 whitespace-nowrap"
                title={b.url}
              >
                {b.name}
              </button>
              <button
                type="button"
                onClick={() => removeBookmark(b.id)}
                className="px-1 opacity-0 group-hover/bm:opacity-50 hover:opacity-100"
                aria-label="Remove bookmark"
                title="Remove bookmark"
              >
                <Trash2 size={10} />
              </button>
            </div>
          ))
        )}
      </div>

      {/* Iframes — render all tabs, hide non-active so each tab keeps state */}
      <div className="flex-1 relative bg-white">
        {tabs.map((t) => (
          <iframe
            key={`${t.id}-${t.reloadKey}`}
            src={t.url}
            title={`Browser tab ${t.id}`}
            className="absolute inset-0 w-full h-full border-0"
            style={{ visibility: t.id === activeId ? "visible" : "hidden" }}
            sandbox="allow-scripts allow-same-origin allow-forms allow-popups allow-popups-to-escape-sandbox"
            referrerPolicy="no-referrer-when-downgrade"
          />
        ))}
      </div>

      {/* Status bar */}
      <div
        className="px-3 py-1 text-[10px] border-t flex justify-between"
        style={{
          color: "var(--os-text-dim)",
          borderColor: "var(--os-border)",
        }}
      >
        <span className="truncate">{active.url}</span>
        <span>
          {tabs.length} {tabs.length === 1 ? "tab" : "tabs"} · history{" "}
          {active.idx + 1} / {active.history.length}
        </span>
      </div>
    </div>
  );
}
