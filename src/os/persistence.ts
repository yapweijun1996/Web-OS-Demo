import { useWindows } from "./store";
import { useSettings, WALLPAPERS, type WallpaperId } from "./settings";
import { APPS } from "./apps";
import type { WindowState } from "./types";

const STORAGE_KEY = "webos:state";
const SCHEMA_VERSION = 1;

type Persisted = {
  version: number;
  windows: WindowState[];
  nextZ: number;
  wallpaper: WallpaperId;
};

function read(): Persisted | null {
  try {
    const raw = localStorage.getItem(STORAGE_KEY);
    if (!raw) return null;
    const parsed = JSON.parse(raw) as Persisted;
    if (parsed.version !== SCHEMA_VERSION) return null;
    return parsed;
  } catch {
    return null;
  }
}

function write(data: Persisted) {
  try {
    localStorage.setItem(STORAGE_KEY, JSON.stringify(data));
  } catch {
    /* quota exceeded or storage disabled — silently drop */
  }
}

/**
 * Restore persisted state into the stores. Call once, synchronously, before
 * the React tree mounts to avoid a "flash of empty desktop".
 */
export function hydrate(): void {
  const data = read();
  if (!data) return;

  const validWindows = data.windows.filter((w) => APPS[w.appId]);
  useWindows.setState({
    windows: validWindows,
    nextZ: Math.max(data.nextZ, ...validWindows.map((w) => w.z), 0) + 1,
  });

  if (WALLPAPERS.some((w) => w.id === data.wallpaper)) {
    useSettings.setState({ wallpaper: data.wallpaper });
  }
}

/**
 * Subscribe to both stores; debounce-write the snapshot to localStorage.
 * Returns an unsubscribe function for React useEffect cleanup.
 */
export function startAutosave(debounceMs = 300): () => void {
  let timer: number | undefined;

  const flush = () => {
    timer = undefined;
    const w = useWindows.getState();
    const s = useSettings.getState();
    write({
      version: SCHEMA_VERSION,
      windows: w.windows,
      nextZ: w.nextZ,
      wallpaper: s.wallpaper,
    });
  };

  const schedule = () => {
    if (timer !== undefined) clearTimeout(timer);
    timer = window.setTimeout(flush, debounceMs);
  };

  const unsubW = useWindows.subscribe(schedule);
  const unsubS = useSettings.subscribe(schedule);

  return () => {
    unsubW();
    unsubS();
    if (timer !== undefined) clearTimeout(timer);
  };
}

/** Wipe persisted state and reload — exposed so Settings can offer a reset. */
export function resetAndReload(): void {
  try {
    localStorage.removeItem(STORAGE_KEY);
  } catch {
    /* ignore */
  }
  window.location.reload();
}
