import { create } from "zustand";

export type Notification = {
  id: string;
  title: string;
  body?: string;
  timestamp: number;
  appId?: string;
};

export type ClipboardEntry = {
  id: string;
  text: string;
  timestamp: number;
};

const MAX_NOTIFS = 30;
const MAX_CLIPBOARD = 12;

let counter = 0;
const newId = () => `n${Date.now().toString(36)}-${(++counter).toString(36)}`;

type NotifStore = {
  notifications: Notification[];
  clipboard: ClipboardEntry[];

  addNotif: (n: Omit<Notification, "id" | "timestamp">) => void;
  removeNotif: (id: string) => void;
  clearNotifs: () => void;

  /**
   * Copy text to the system clipboard AND record it in the in-app history.
   * Components should prefer this over navigator.clipboard.writeText so the
   * Cmd+Shift+V history stays in sync with what the user copied via the app.
   */
  copyText: (text: string) => void;
  removeClipboard: (id: string) => void;
  clearClipboard: () => void;
};

export const useNotifs = create<NotifStore>((set, get) => ({
  notifications: [],
  clipboard: [],

  addNotif: (n) => {
    const entry: Notification = { ...n, id: newId(), timestamp: Date.now() };
    set({ notifications: [entry, ...get().notifications].slice(0, MAX_NOTIFS) });
  },

  removeNotif: (id) =>
    set({ notifications: get().notifications.filter((n) => n.id !== id) }),

  clearNotifs: () => set({ notifications: [] }),

  copyText: (text) => {
    const trimmed = text.trim();
    if (!trimmed) return;
    if (typeof navigator !== "undefined" && navigator.clipboard) {
      navigator.clipboard.writeText(text).catch(() => {});
    }
    // dedup against the most recent entry (same string within 2s)
    const head = get().clipboard[0];
    if (head && head.text === text && Date.now() - head.timestamp < 2000) return;
    const entry: ClipboardEntry = {
      id: newId(),
      text,
      timestamp: Date.now(),
    };
    set({ clipboard: [entry, ...get().clipboard].slice(0, MAX_CLIPBOARD) });
  },

  removeClipboard: (id) =>
    set({ clipboard: get().clipboard.filter((c) => c.id !== id) }),

  clearClipboard: () => set({ clipboard: [] }),
}));

// Global capture: when the user presses ⌘C on any text selection (Notes
// textarea, file metadata, etc.), record it in the in-app clipboard history
// so Cmd+Shift+V can replay it. We do NOT touch navigator.clipboard here
// — the browser's native copy already wrote it.
if (typeof document !== "undefined") {
  document.addEventListener("copy", () => {
    const sel = document.getSelection?.()?.toString() ?? "";
    if (!sel) return;
    const head = useNotifs.getState().clipboard[0];
    if (head && head.text === sel && Date.now() - head.timestamp < 2000)
      return;
    useNotifs.setState((s) => ({
      clipboard: [
        { id: newId(), text: sel, timestamp: Date.now() },
        ...s.clipboard,
      ].slice(0, MAX_CLIPBOARD),
    }));
  });
}
