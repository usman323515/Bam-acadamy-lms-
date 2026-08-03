"use client";
import Link from "next/link";
import { usePathname } from "next/navigation";
import { signOut } from "next-auth/react";
import clsx from "clsx";

const links = [
  { href: "/dashboard", label: "Overview", icon: "fa-gauge" },
  { href: "/courses", label: "My Courses", icon: "fa-book-open" },
  { href: "/certificates", label: "Certificates", icon: "fa-certificate" },
  { href: "/profile", label: "Profile", icon: "fa-user" },
  { href: "/settings", label: "Settings", icon: "fa-gear" },
];

export default function StudentSidebar() {
  const pathname = usePathname();
  return (
    <aside className="w-64 shrink-0 bg-bg2 border-r border-line min-h-screen p-5 hidden md:flex md:flex-col">
      <div className="font-display font-extrabold text-xl mb-8 px-2">
        <span className="text-brand-green">BAM</span> Academy
      </div>
      <nav className="flex-1 space-y-1">
        {links.map((l) => (
          <Link
            key={l.href}
            href={l.href}
            className={clsx(
              "flex items-center gap-3 px-3 py-2.5 rounded-xl text-sm font-medium transition-colors",
              pathname === l.href
                ? "bg-brand-green/15 text-brand-green2"
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
