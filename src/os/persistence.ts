import { useWindows, DEFAULT_SPACE_ID } from "./store";
import {
  useSettings,
  WALLPAPERS,
  type WallpaperId,
  type Theme,
} from "./settings";
import { APPS } from "./apps";
import type { WindowState, Space, SpaceId } from "./types";

const STORAGE_KEY = "webos:state";
const SCHEMA_VERSION = 2;

type Persisted = {
  version: number;
  windows: WindowState[];
  nextZ: number;
  wallpaper: WallpaperId;
  theme?: Theme;
  spaces?: Space[];
  activeSpaceId?: SpaceId;
};

function read(): Persisted | null {
  try {
    const raw = localStorage.getItem(STORAGE_KEY);
    if (!raw) return null;
    const parsed = JSON.parse(raw) as Persisted;
    // Forward-migrate v1 → v2: backfill spaceId on windows + default space.
    if (parsed.version === 1) {
      parsed.windows = parsed.windows.map((w) => ({
        ...w,
        spaceId: w.spaceId ?? DEFAULT_SPACE_ID,
      }));
      parsed.spaces = [{ id: DEFAULT_SPACE_ID, name: "Desktop 1" }];
      parsed.activeSpaceId = DEFAULT_SPACE_ID;
      parsed.version = SCHEMA_VERSION;
    }
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
  const spaces =
    data.spaces && data.spaces.length > 0
      ? data.spaces
      : [{ id: DEFAULT_SPACE_ID, name: "Desktop 1" }];
  const activeSpaceId =
    data.activeSpaceId && spaces.some((s) => s.id === data.activeSpaceId)
      ? data.activeSpaceId
      : spaces[0].id;
  // Defensive: any window referencing a deleted space → fall back to first
  const validSpaceIds = new Set(spaces.map((s) => s.id));
  const reassignedWindows = validWindows.map((w) =>
    validSpaceIds.has(w.spaceId)
      ? w
      : { ...w, spaceId: spaces[0].id },
  );
  useWindows.setState({
    windows: reassignedWindows,
    nextZ:
      Math.max(data.nextZ, ...reassignedWindows.map((w) => w.z), 0) + 1,
    spaces,
    activeSpaceId,
  });

  if (WALLPAPERS.some((w) => w.id === data.wallpaper)) {
    useSettings.setState({ wallpaper: data.wallpaper });
  }
  if (data.theme === "dark" || data.theme === "light") {
    useSettings.setState({ theme: data.theme });
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
      theme: s.theme,
      spaces: w.spaces,
      activeSpaceId: w.activeSpaceId,
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
