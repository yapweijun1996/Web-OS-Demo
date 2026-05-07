import { useWindows } from "./store";
import { APPS } from "./apps";
import type { WindowId } from "./types";

export function launchApp(
  appId: string,
  opts?: { title?: string; appData?: Record<string, unknown> },
): WindowId | null {
  const app = APPS[appId];
  if (!app) return null;
  const s = useWindows.getState();

  if (app.singleton) {
    const existing = s.windows.find((w) => w.appId === appId);
    if (existing) {
      s.focus(existing.id);
      if (existing.minimized) s.toggleMinimize(existing.id);
      return existing.id;
    }
  }

  const offset = (s.windows.length % 8) * 28;
  return s.open({
    appId,
    title: opts?.title ?? app.name,
    x: 80 + offset,
    y: 60 + offset,
    width: app.defaultSize.width,
    height: app.defaultSize.height,
    minimized: false,
    maximized: false,
    appData: opts?.appData,
  });
}
