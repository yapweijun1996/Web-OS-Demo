import { Bell, X } from "lucide-react";
import { useUI } from "../os/ui";
import { useNotifs } from "../os/notifications";
import { useWindows, MENU_BAR_H } from "../os/store";
import { APPS } from "../os/apps";

function relTime(ts: number): string {
  const d = Date.now() - ts;
  if (d < 60_000) return "just now";
  if (d < 3_600_000) return `${Math.floor(d / 60_000)}m ago`;
  if (d < 86_400_000) return `${Math.floor(d / 3_600_000)}h ago`;
  return `${Math.floor(d / 86_400_000)}d ago`;
}

export function NotificationCenter() {
  const open = useUI((s) => s.notifCenterOpen);
  const close = useUI((s) => s.toggleNotifCenter);
  const notifications = useNotifs((s) => s.notifications);
  const removeNotif = useNotifs((s) => s.removeNotif);
  const clearNotifs = useNotifs((s) => s.clearNotifs);
  const spaces = useWindows((s) => s.spaces);
  const activeSpaceId = useWindows((s) => s.activeSpaceId);
  const allWindows = useWindows((s) => s.windows);

  if (!open) return null;

  const now = new Date();
  const dateStr = now.toLocaleDateString([], {
    weekday: "long",
    month: "long",
    day: "numeric",
  });
  const timeStr = now.toLocaleTimeString([], {
    hour: "2-digit",
    minute: "2-digit",
  });

  return (
    <div
      className="absolute right-2 w-[340px] rounded-2xl border overflow-hidden flex flex-col z-[10005] wm-pop-in"
      style={{
        top: `${MENU_BAR_H + 8}px`,
        bottom: "16px",
        background: "var(--os-bg-strong)",
        color: "var(--os-text)",
        borderColor: "var(--os-border)",
        backdropFilter: "blur(20px) saturate(1.6)",
        WebkitBackdropFilter: "blur(20px) saturate(1.6)",
        boxShadow: "0 24px 60px -12px rgba(0,0,0,0.5)",
      }}
      onClick={(e) => e.stopPropagation()}
      onContextMenu={(e) => e.stopPropagation()}
    >
      {/* Header */}
      <div
        className="flex items-center px-4 py-3 border-b"
        style={{ borderColor: "var(--os-border)" }}
      >
        <Bell size={14} className="mr-2 opacity-70" />
        <span className="text-sm font-semibold flex-1">Notifications</span>
        <button
          type="button"
          onClick={() => close()}
          className="opacity-60 hover:opacity-100"
          aria-label="Close"
        >
          <X size={14} />
        </button>
      </div>

      <div className="overflow-auto flex-1">
        {/* Date widget */}
        <div
          className="m-3 p-4 rounded-xl"
          style={{
            background:
              "linear-gradient(135deg, rgba(120,150,200,0.18), rgba(60,80,140,0.25))",
          }}
        >
          <div className="text-[11px] uppercase tracking-wide opacity-70">
            Today
          </div>
          <div className="text-2xl font-semibold mt-1">{timeStr}</div>
          <div className="text-xs mt-0.5 opacity-80">{dateStr}</div>
        </div>

        {/* Spaces overview */}
        <div className="px-3">
          <div className="text-[11px] uppercase tracking-wide opacity-60 mb-1.5 px-1">
            Spaces
          </div>
          <div className="grid grid-cols-2 gap-2">
            {spaces.map((sp) => {
              const count = allWindows.filter(
                (w) => w.spaceId === sp.id,
              ).length;
              const active = sp.id === activeSpaceId;
              return (
                <div
                  key={sp.id}
                  className="rounded-lg px-2 py-2 border"
                  style={{
                    borderColor: active
                      ? "var(--os-text)"
                      : "var(--os-border)",
                    background: active
                      ? "var(--os-active)"
                      : "var(--os-hover)",
                    opacity: active ? 1 : 0.7,
                  }}
                >
                  <div className="text-xs font-medium truncate">{sp.name}</div>
                  <div className="text-[10px] opacity-70">
                    {count} window{count === 1 ? "" : "s"}
                  </div>
                </div>
              );
            })}
          </div>
        </div>

        {/* Notifications list */}
        <div className="px-3 mt-4 mb-3">
          <div className="flex items-center justify-between mb-1.5 px-1">
            <span className="text-[11px] uppercase tracking-wide opacity-60">
              Recent
            </span>
            {notifications.length > 0 && (
              <button
                type="button"
                onClick={clearNotifs}
                className="text-[11px] opacity-60 hover:opacity-100"
              >
                Clear all
              </button>
            )}
          </div>
          {notifications.length === 0 ? (
            <div
              className="px-2 py-6 text-center text-xs"
              style={{ color: "var(--os-text-dim)" }}
            >
              No notifications.
            </div>
          ) : (
            <div className="space-y-2">
              {notifications.map((n) => {
                const app = n.appId ? APPS[n.appId] : null;
                const Icon = app?.icon ?? Bell;
                return (
                  <div
                    key={n.id}
                    className="rounded-lg p-3 group/notif relative"
                    style={{ background: "var(--os-hover)" }}
                  >
                    <div className="flex items-start gap-2">
                      <Icon size={16} className="mt-[2px] opacity-80" />
                      <div className="flex-1 min-w-0">
                        <div className="text-xs font-semibold flex items-center justify-between gap-2">
                          <span className="truncate">{n.title}</span>
                          <span
                            className="text-[10px] flex-shrink-0"
                            style={{ color: "var(--os-text-dim)" }}
                          >
                            {relTime(n.timestamp)}
                          </span>
                        </div>
                        {n.body && (
                          <div
                            className="text-[11px] mt-1 leading-relaxed"
                            style={{ color: "var(--os-text-dim)" }}
                          >
                            {n.body}
                          </div>
                        )}
                      </div>
                      <button
                        type="button"
                        onClick={() => removeNotif(n.id)}
                        className="opacity-0 group-hover/notif:opacity-60 hover:opacity-100"
                        aria-label="Dismiss"
                      >
                        <X size={12} />
                      </button>
                    </div>
                  </div>
                );
              })}
            </div>
          )}
        </div>
      </div>
    </div>
  );
}
