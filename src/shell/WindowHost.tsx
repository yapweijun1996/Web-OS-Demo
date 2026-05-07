import { useMemo } from "react";
import { useWindows } from "../os/store";
import { Window } from "./Window";

export function WindowHost() {
  // NOTE: subscribe to raw fields, then derive — a selector that returns
  // a fresh `.filter(...)` array each render is reference-unstable and
  // throws zustand into an infinite re-subscribe loop.
  const allWindows = useWindows((s) => s.windows);
  const activeSpaceId = useWindows((s) => s.activeSpaceId);
  const windows = useMemo(
    () => allWindows.filter((w) => w.spaceId === activeSpaceId),
    [allWindows, activeSpaceId],
  );
  return (
    <div className="absolute inset-0 pointer-events-none">
      {windows.map((w) => (
        <Window key={w.id} w={w} />
      ))}
    </div>
  );
}
