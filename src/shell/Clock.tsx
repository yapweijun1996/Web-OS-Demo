import { useEffect, useState } from "react";

export function Clock() {
  const [now, setNow] = useState(() => new Date());
  useEffect(() => {
    const id = setInterval(() => setNow(new Date()), 1000);
    return () => clearInterval(id);
  }, []);
  const time = now.toLocaleTimeString([], {
    hour: "2-digit",
    minute: "2-digit",
  });
  const date = now.toLocaleDateString([], { month: "short", day: "numeric" });
  return (
    <div className="flex flex-col items-end leading-tight px-3 text-xs select-none">
      <span>{time}</span>
      <span className="text-white/60">{date}</span>
    </div>
  );
}
