"use client";
import Link from "next/link";
import { usePathname } from "next/navigation";
import { signOut } from "next-auth/react";
import clsx from "clsx";

const links = [
  { href: "/admin/dashboard", label: "Overview", icon: "fa-gauge" },
  { href: "/admin/students", label: "Students", icon: "fa-users" },
  { href: "/admin/courses", label: "Courses", icon: "fa-book" },
  { href: "/admin/announcements", label: "Announcements", icon: "fa-bullhorn" },
  { href: "/admin/analytics", label: "Analytics", icon: "fa-chart-line" },
  { href: "/admin/settings", label: "Settings", icon: "fa-gear" },
];

export default function AdminSidebar() {
  const pathname = usePathname();
  return (
    <aside className="w-64 shrink-0 bg-bg2 border-r border-line min-h-screen p-5 hidden md:flex md:flex-col">
      <div className="font-display font-extrabold text-xl mb-1 px-2">
        <span className="text-brand-gold">BAM</span> Admin
      </div>
      <p className="text-xs text-gray-500 px-2 mb-8">Control Center</p>
      <nav className="flex-1 space-y-1">
        {links.map((l) => (
          <Link
            key={l.href}
            href={l.href}
            className={clsx(
              "flex items-center gap-3 px-3 py-2.5 rounded-xl text-sm font-medium transition-colors",
              pathname.startsWith(l.href)
                ? "bg-brand-gold/15 text-brand-gold"
                : "text-gray-400 hover:bg-card2 hover:text-white"
            )}
          >
            <i className={`fas ${l.icon} w-4`} />
            {l.label}
          </Link>
        ))}
      </nav>
      <button
        onClick={() => signOut({ callbackUrl: "/login" })}
        className="flex items-center gap-3 px-3 py-2.5 rounded-xl text-sm font-medium text-gray-400 hover:bg-red-500/10 hover:text-red-400 transition-colors"
      >
        <i className="fas fa-right-from-bracket w-4" /> Logout
      </button>
    </aside>
  );
}
