"use client";
import { useSession } from "next-auth/react";
import NotificationBell from "./NotificationBell";

export default function Topbar({ title }: { title: string }) {
  const { data: session } = useSession();
  return (
    <div className="flex items-center justify-between mb-8">
      <h1 className="text-2xl font-display font-bold">{title}</h1>
      <div className="flex items-center gap-4">
        <NotificationBell />
        <div className="flex items-center gap-2.5">
          <div className="w-9 h-9 rounded-full bg-brand-green/20 flex items-center justify-center text-brand-green2 font-bold text-sm">
            {session?.user?.name?.[0]?.toUpperCase() || "?"}
          </div>
          <div className="hidden sm:block text-sm">
            <div className="font-semibold leading-tight">{session?.user?.name}</div>
            <div className="text-gray-500 text-xs leading-tight capitalize">
              {session?.user?.role?.toLowerCase()}
            </div>
          </div>
        </div>
      </div>
    </div>
  );
}
