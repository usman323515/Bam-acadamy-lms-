"use client";
import { useState } from "react";
import { useSession } from "next-auth/react";
import Topbar from "@/components/Topbar";
import toast from "react-hot-toast";

export default function ProfilePage() {
  const { data: session, update } = useSession();
  const [name, setName] = useState(session?.user?.name || "");
  const [saving, setSaving] = useState(false);

  async function save(e: React.FormEvent) {
    e.preventDefault();
    setSaving(true);
    try {
      const res = await fetch("/api/student/profile", {
        method: "PATCH",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify({ name }),
      });
      if (!res.ok) throw new Error((await res.json()).error);
      toast.success("Profile updated");
      await update();
    } catch (err: any) {
      toast.error(err.message);
    } finally {
      setSaving(false);
    }
  }

  return (
    <>
      <Topbar title="Profile" />
      <div className="card p-6 max-w-lg">
        <div className="w-16 h-16 rounded-full bg-brand-green/20 flex items-center justify-center text-brand-green2 font-bold text-2xl mb-6">
          {session?.user?.name?.[0]?.toUpperCase() || "?"}
        </div>
        <form onSubmit={save} className="space-y-4">
          <div>
            <label className="label-field">Full name</label>
            <input className="input-field" value={name} onChange={(e) => setName(e.target.value)} />
          </div>
          <div>
            <label className="label-field">Email</label>
            <input className="input-field opacity-60" value={session?.user?.email || ""} disabled />
            <p className="text-xs text-gray-600 mt-1">Email address cannot be changed.</p>
          </div>
          <button className="btn-primary" disabled={saving}>{saving ? "Saving…" : "Save Changes"}</button>
        </form>
      </div>
    </>
  );
}
