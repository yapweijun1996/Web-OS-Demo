import { useWindows } from "../../os/store";

export function Hello({ windowId }: { windowId: string }) {
  const w = useWindows((s) => s.windows.find((ww) => ww.id === windowId));
  if (!w) return null;
  return (
    <div className="p-5 space-y-2 text-sm">
      <p className="text-base font-medium">Hello from Web OS</p>
      <p className="text-white/70">window id: <code>{w.id}</code></p>
      <p className="text-white/70">
        position: ({Math.round(w.x)}, {Math.round(w.y)}) ·
        size: {Math.round(w.width)}×{Math.round(w.height)}
      </p>
      <p className="text-white/70">z: {w.z}</p>
    </div>
  );
}
