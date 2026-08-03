"use client";
import { useEffect, useState, useRef } from "react";
import { formatDistanceToNow } from "date-fns";

type Notif = { id: string; title: string; message: string; readAt: string | null; createdAt: string };

export default function NotificationBell() {
  const [open, setOpen] = useState(false);
  const [items, setItems] = useState<Notif[]>([]);
  const ref = useRef<HTMLDivElement>(null);

  async function load() {
    const res = await fetch("/api/notifications");
    if (res.ok) setItems(await res.json());
  }

  useEffect(() => {
    load();
    const interval = setInterval(load, 30000);
    return () => clearInterval(interval);
  }, []);

  useEffect(() => {
    function onClick(e: MouseEvent) {
      if (ref.current && !ref.current.contains(e.target as Node)) setOpen(false);
    }
    document.addEventListener("click", onClick);
    return () => document.removeEventListener("click", onClick);
  }, []);

  const unread = items.filter((i) => !i.readAt).length;

  async function markRead(id: string) {
    await fetch("/api/notifications", {
      method: "PATCH",
      headers: { "Content-Type": "application/json" },
      body: JSON.stringify({ id }),
    });
    setItems((prev) => prev.map((i) => (i.id === id ? { ...i, readAt: new Date().toISOString() } : i)));
  }

  return (
    <div className="relative" ref={ref}>
      <button
        onClick={() => setOpen((o) => !o)}
        className="relative w-10 h-10 rounded-xl bg-card2 border border-line flex items-center justify-center hover:border-brand-green/50 transition-colors"
      >
        <i className="fas fa-bell text-gray-300" />
        {unread > 0 && (
          <span className="absolute -top-1 -right-1 bg-red-500 text-white text-[10px] font-bold rounded-full w-4 h-4 flex items-center justify-center">
            {unread}
          </span>
        )}
      </button>
      {open && (
        <div className="absolute right-0 mt-2 w-80 max-h-96 overflow-y-auto bg-card border border-line rounded-2xl shadow-2xl z-50">
          <div className="p-4 border-b border-line font-semibold text-sm">Notifications</div>
          {items.length === 0 && (
            <div className="p-6 text-center text-gray-500 text-sm">No notifications yet.</div>
          )}
          {items.map((n) => (
            <button
              key={n.id}
              onClick={() => markRead(n.id)}
              className={`w-full text-left p-4 border-b border-line last:border-0 hover:bg-card2 transition-colors ${
                !n.readAt ? "bg-brand-green/5" : ""
              }`}
            >
              <div className="flex items-center justify-between gap-2">
                <div className="font-medium text-sm">{n.title}</div>
                {!n.readAt && <span className="w-2 h-2 rounded-full bg-brand-green shrink-0" />}
              </div>
              <div className="text-gray-500 text-xs mt-1 line-clamp-2">{n.message}</div>
              <div className="text-gray-600 text-[11px] mt-1">
                {formatDistanceToNow(new Date(n.createdAt), { addSuffix: true })}
              </div>
            </button>
          ))}
        </div>
      )}
    </div>
  );
}
