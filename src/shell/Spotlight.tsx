import { useEffect, useMemo, useRef, useState } from "react";
import { Search, FileText, Calculator } from "lucide-react";
import { APP_LIST } from "../os/apps";
import { launchApp } from "../os/launcher";
import { useUI } from "../os/ui";
import { useVFS } from "../os/vfs/store";
import type { ComponentType } from "react";

type Item = {
  kind: "app" | "file" | "calc";
  label: string;
  hint?: string;
  Icon: ComponentType<{ size?: number; className?: string }>;
  action: () => void;
};

/**
 * Tiny safe arithmetic evaluator — supports + - * / ( ) decimal, no identifiers.
 * Returns null on syntax error or non-arithmetic input.
 */
function tryCalc(input: string): string | null {
  const trimmed = input.trim();
  if (!/[\d.]/.test(trimmed)) return null;
  if (!/^[\d\s+\-*/().]+$/.test(trimmed)) return null;
  try {
    // eslint-disable-next-line @typescript-eslint/no-implied-eval
    const fn = new Function(`"use strict"; return (${trimmed});`);
    const out = fn();
    if (typeof out !== "number" || !isFinite(out)) return null;
    return String(out);
  } catch {
    return null;
  }
}

export function Spotlight() {
  const open = useUI((s) => s.spotlightOpen);
  const setOpen = useUI((s) => s.setSpotlight);
  const [q, setQ] = useState("");
  const [sel, setSel] = useState(0);
  const inputRef = useRef<HTMLInputElement>(null);

  const allFiles = useVFS((s) => s.nodes);

  // Reset on each open.
  useEffect(() => {
    if (open) {
      setQ("");
      setSel(0);
      requestAnimationFrame(() => inputRef.current?.focus());
    }
  }, [open]);

  const items = useMemo<Item[]>(() => {
    const query = q.trim().toLowerCase();
    const matches: Item[] = [];

    const calc = tryCalc(q);
    if (calc !== null) {
      matches.push({
        kind: "calc",
        label: `${q.trim()} = ${calc}`,
        hint: "press Enter to copy",
        Icon: Calculator,
        action: () => {
          navigator.clipboard?.writeText(calc).catch(() => {});
        },
      });
    }

    for (const app of APP_LIST) {
      if (!query || app.name.toLowerCase().includes(query)) {
        matches.push({
          kind: "app",
          label: app.name,
          hint: "Application",
          Icon: app.icon,
          action: () => launchApp(app.id),
        });
      }
    }

    if (query) {
      for (const node of Object.values(allFiles)) {
        if (node.type !== "file") continue;
        if (!node.name.toLowerCase().includes(query)) continue;
        matches.push({
          kind: "file",
          label: node.name,
          hint: `File · ${node.content.length} chars`,
          Icon: FileText,
          action: () =>
            launchApp("notes", {
              title: node.name,
              appData: { fileId: node.id },
            }),
        });
      }
    }
    return matches.slice(0, 12);
  }, [q, allFiles]);

  // Clamp selection within range.
  useEffect(() => {
    if (sel >= items.length) setSel(Math.max(0, items.length - 1));
  }, [items.length, sel]);

  if (!open) return null;

  const onKeyDown = (e: React.KeyboardEvent) => {
    if (e.key === "ArrowDown") {
      e.preventDefault();
      setSel((i) => Math.min(items.length - 1, i + 1));
    } else if (e.key === "ArrowUp") {
      e.preventDefault();
      setSel((i) => Math.max(0, i - 1));
    } else if (e.key === "Enter") {
      e.preventDefault();
      items[sel]?.action();
      setOpen(false);
    } else if (e.key === "Escape") {
      e.preventDefault();
      setOpen(false);
    }
  };

  return (
    <div
      className="absolute inset-0 z-[10002] flex items-start justify-center pt-[14vh] bg-black/20"
      onClick={() => setOpen(false)}
    >
      <div
        className="w-[600px] max-h-[60vh] flex flex-col rounded-xl border overflow-hidden wm-pop-in"
        style={{
          background: "var(--os-bg-strong)",
          color: "var(--os-text)",
          borderColor: "var(--os-border)",
          backdropFilter: "blur(24px) saturate(1.6)",
          WebkitBackdropFilter: "blur(24px) saturate(1.6)",
          boxShadow: "0 30px 80px -20px rgba(0,0,0,0.5)",
        }}
        onClick={(e) => e.stopPropagation()}
      >
        <div
          className="flex items-center px-4 py-3 border-b gap-3"
          style={{ borderColor: "var(--os-border)" }}
        >
          <Search size={18} style={{ color: "var(--os-text-dim)" }} />
          <input
            ref={inputRef}
            type="text"
            value={q}
            onChange={(e) => {
              setQ(e.target.value);
              setSel(0);
            }}
            onKeyDown={onKeyDown}
            placeholder="Spotlight Search"
            className="flex-1 bg-transparent outline-none text-base placeholder:opacity-50"
          />
        </div>
        <div className="overflow-auto p-1.5">
          {items.length === 0 ? (
            <div
              className="p-6 text-center text-sm"
              style={{ color: "var(--os-text-dim)" }}
            >
              {q ? "No matches" : "Type to search apps, files, or do math"}
            </div>
          ) : (
            items.map((item, i) => {
              const selected = i === sel;
              return (
                <button
                  key={`${item.kind}-${item.label}-${i}`}
                  type="button"
                  onClick={() => {
                    item.action();
                    setOpen(false);
                  }}
                  onMouseEnter={() => setSel(i)}
                  className="w-full flex items-center gap-3 px-3 py-2 rounded text-left text-sm"
                  style={{
                    background: selected ? "#007aff" : "transparent",
                    color: selected ? "white" : "inherit",
                  }}
                >
                  <item.Icon size={18} />
                  <span className="flex-1 truncate">{item.label}</span>
                  {item.hint && (
                    <span
                      className="text-[11px] truncate"
                      style={{
                        color: selected
                          ? "rgba(255,255,255,0.85)"
                          : "var(--os-text-dim)",
                      }}
                    >
                      {item.hint}
                    </span>
                  )}
                </button>
              );
            })
          )}
        </div>
      </div>
    </div>
  );
}
