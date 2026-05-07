import { create } from "zustand";
import { openDB, type IDBPDatabase } from "idb";

export type Bookmark = {
  id: string;
  name: string;
  url: string;
  createdAt: number;
};

const DB_NAME = "webos-browser";
const STORE = "bookmarks";
const DB_VERSION = 1;

let dbPromise: Promise<IDBPDatabase> | null = null;
function getDB() {
  if (!dbPromise) {
    dbPromise = openDB(DB_NAME, DB_VERSION, {
      upgrade(db) {
        db.createObjectStore(STORE, { keyPath: "id" });
      },
    });
  }
  return dbPromise;
}

let counter = 0;
const newId = () =>
  `bm${Date.now().toString(36)}-${(++counter).toString(36)}`;

const DEFAULT_BOOKMARKS: Bookmark[] = [
  {
    id: "seed-1",
    name: "yapweijun1996.com",
    url: "https://yapweijun1996.com/",
    createdAt: 0,
  },
  {
    id: "seed-2",
    name: "GitHub",
    url: "https://github.com/yapweijun1996",
    createdAt: 0,
  },
  {
    id: "seed-3",
    name: "Web OS Repo",
    url: "https://github.com/yapweijun1996/Web-OS-Demo",
    createdAt: 0,
  },
  {
    id: "seed-4",
    name: "SearXNG",
    url: "https://search.yapweijun1996.com/",
    createdAt: 0,
  },
];

type BookmarkStore = {
  bookmarks: Bookmark[];
  ready: boolean;
  load: () => Promise<void>;
  add: (name: string, url: string) => Promise<void>;
  remove: (id: string) => Promise<void>;
  rename: (id: string, name: string) => Promise<void>;
  has: (url: string) => boolean;
  removeByUrl: (url: string) => Promise<void>;
};

export const useBookmarks = create<BookmarkStore>((set, get) => ({
  bookmarks: [],
  ready: false,

  load: async () => {
    const db = await getDB();
    const all = (await db.getAll(STORE)) as Bookmark[];
    if (all.length === 0) {
      // First-run seed
      const tx = db.transaction(STORE, "readwrite");
      await Promise.all([
        ...DEFAULT_BOOKMARKS.map((b) => tx.store.put(b)),
        tx.done,
      ]);
      set({ bookmarks: DEFAULT_BOOKMARKS, ready: true });
      return;
    }
    set({
      bookmarks: all.sort((a, b) => a.createdAt - b.createdAt),
      ready: true,
    });
  },

  add: async (name, url) => {
    const entry: Bookmark = {
      id: newId(),
      name,
      url,
      createdAt: Date.now(),
    };
    const db = await getDB();
    await db.put(STORE, entry);
    set({ bookmarks: [...get().bookmarks, entry] });
  },

  remove: async (id) => {
    const db = await getDB();
    await db.delete(STORE, id);
    set({ bookmarks: get().bookmarks.filter((b) => b.id !== id) });
  },

  rename: async (id, name) => {
    const b = get().bookmarks.find((x) => x.id === id);
    if (!b) return;
    const updated = { ...b, name };
    const db = await getDB();
    await db.put(STORE, updated);
    set({
      bookmarks: get().bookmarks.map((x) => (x.id === id ? updated : x)),
    });
  },

  has: (url) => get().bookmarks.some((b) => b.url === url),

  removeByUrl: async (url) => {
    const matches = get().bookmarks.filter((b) => b.url === url);
    if (matches.length === 0) return;
    const db = await getDB();
    const tx = db.transaction(STORE, "readwrite");
    await Promise.all([...matches.map((b) => tx.store.delete(b.id)), tx.done]);
    set({
      bookmarks: get().bookmarks.filter((b) => b.url !== url),
    });
  },
}));
