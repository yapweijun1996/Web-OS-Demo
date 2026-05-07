import { useWindows } from "../os/store";
import { Window } from "./Window";

export function WindowHost() {
  const windows = useWindows((s) => s.windows);
  return (
    <div className="absolute inset-0 pointer-events-none">
      {windows.map((w) => (
        <Window key={w.id} w={w} />
      ))}
    </div>
  );
}
