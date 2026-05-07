import { create } from "zustand";
import { openDB, type IDBPDatabase } from "idb";
import type { VFSNode, VFSFile, VFSFolder, VFSId } from "./types";

const DB_NAME = "webos-vfs";
const STORE = "nodes";
const DB_VERSION = 1;

let dbPromise: Promise<IDBPDatabase> | null = null;
function getDB() {
  if (!dbPromise) {
    dbPromise = openDB(DB_NAME, DB_VERSION, {
      upgrade(db) {
        const store = db.createObjectStore(STORE, { keyPath: "id" });
        store.createIndex("parent", "parentId");
      },
    });
  }
  return dbPromise;
}

let counter = 0;
const newId = (): VFSId =>
  `n${Date.now().toString(36)}-${(++counter).toString(36)}`;

type VFSStore = {
  nodes: Record<VFSId, VFSNode>;
  ready: boolean;

  load: () => Promise<void>;
  createFile: (
    name: string,
    parentId: VFSId | null,
    content?: string,
  ) => Promise<VFSId>;
  createFolder: (name: string, parentId: VFSId | null) => Promise<VFSId>;
  rename: (id: VFSId, name: string) => Promise<void>;
  remove: (id: VFSId) => Promise<void>;
  writeContent: (id: VFSId, content: string) => Promise<void>;
  childrenOf: (parentId: VFSId | null) => VFSNode[];
  getNode: (id: VFSId) => VFSNode | undefined;
};

const ALPHABETICAL = (a: VFSNode, b: VFSNode) => {
  if (a.type !== b.type) return a.type === "folder" ? -1 : 1;
  return a.name.localeCompare(b.name);
};

export const useVFS = create<VFSStore>((set, get) => ({
  nodes: {},
  ready: false,

  load: async () => {
    const db = await getDB();
    const all = (await db.getAll(STORE)) as VFSNode[];
    const nodes: Record<VFSId, VFSNode> = {};
    for (const n of all) nodes[n.id] = n;

    // First-run seed (also migrates legacy single-blob notes).
    if (all.length === 0) {
      const legacy = localStorage.getItem("app:notes:content");
      const welcome: VFSFile = {
        type: "file",
        id: newId(),
        name: "Welcome.txt",
        parentId: null,
        content:
          legacy && legacy.length > 0
            ? legacy
            : "Welcome to Web OS Demo!\n\n" +
              "• Open File Explorer to manage files (this Notes too)\n" +
              "• Press Cmd+P or Win key to open Start Menu\n" +
              "• Right-click the desktop for context menu\n" +
              "• Drag titlebar to move windows; corners to resize\n" +
              "• Settings → switch wallpaper, theme, or reset\n",
        createdAt: Date.now(),
        updatedAt: Date.now(),
      };
      await db.put(STORE, welcome);
      nodes[welcome.id] = welcome;
      if (legacy !== null) {
        try {
          localStorage.removeItem("app:notes:content");
        } catch {
          /* ignore */
        }
      }
    }

    set({ nodes, ready: true });
  },

  createFile: async (name, parentId, content = "") => {
    const id = newId();
    const node: VFSFile = {
      type: "file",
      id,
      name,
      parentId,
      content,
      createdAt: Date.now(),
      updatedAt: Date.now(),
    };
    const db = await getDB();
    await db.put(STORE, node);
    set({ nodes: { ...get().nodes, [id]: node } });
    return id;
  },

  createFolder: async (name, parentId) => {
    const id = newId();
    const node: VFSFolder = {
      type: "folder",
      id,
      name,
      parentId,
      createdAt: Date.now(),
    };
    const db = await getDB();
    await db.put(STORE, node);
    set({ nodes: { ...get().nodes, [id]: node } });
    return id;
  },

  rename: async (id, name) => {
    const node = get().nodes[id];
    if (!node) return;
    const updated = { ...node, name } as VFSNode;
    const db = await getDB();
    await db.put(STORE, updated);
    set({ nodes: { ...get().nodes, [id]: updated } });
  },

  remove: async (id) => {
    const db = await getDB();
    const all = get().nodes;
    const toDelete = new Set<VFSId>([id]);
    let added = true;
    while (added) {
      added = false;
      for (const n of Object.values(all)) {
        if (n.parentId && toDelete.has(n.parentId) && !toDelete.has(n.id)) {
          toDelete.add(n.id);
          added = true;
        }
      }
    }
    const tx = db.transaction(STORE, "readwrite");
    await Promise.all([
      ...Array.from(toDelete).map((nid) => tx.store.delete(nid)),
      tx.done,
    ]);
    const next = { ...all };
    for (const nid of toDelete) delete next[nid];
    set({ nodes: next });
  },

  writeContent: async (id, content) => {
    const node = get().nodes[id];
    if (!node || node.type !== "file") return;
    const updated: VFSFile = { ...node, content, updatedAt: Date.now() };
    const db = await getDB();
    await db.put(STORE, updated);
    set({ nodes: { ...get().nodes, [id]: updated } });
  },

  childrenOf: (parentId) =>
    Object.values(get().nodes)
      .filter((n) => n.parentId === parentId)
      .sort(ALPHABETICAL),

  getNode: (id) => get().nodes[id],
}));
