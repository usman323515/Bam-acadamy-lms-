"use client";
import { useState } from "react";
import Topbar from "@/components/Topbar";
import toast from "react-hot-toast";

export default function SettingsPage() {
  const [form, setForm] = useState({ currentPassword: "", newPassword: "", confirmPassword: "" });
  const [saving, setSaving] = useState(false);

  async function save(e: React.FormEvent) {
    e.preventDefault();
    if (form.newPassword !== form.confirmPassword) {
      toast.error("New passwords do not match");
      return;
    }
    setSaving(true);
    try {
      const res = await fetch("/api/student/change-password", {
        method: "POST",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify({ currentPassword: form.currentPassword, newPassword: form.newPassword }),
      });
      const data = await res.json();
      if (!res.ok) throw new Error(data.error);
      toast.success("Password changed");
      setForm({ currentPassword: "", newPassword: "", confirmPassword: "" });
    } catch (err: any) {
      toast.error(err.message);
    } finally {
      setSaving(false);
    }
  }

  return (
    <>
      <Topbar title="Settings" />
      <div className="card p-6 max-w-lg">
        <h2 className="font-semibold mb-4">Change Password</h2>
        <form onSubmit={save} className="space-y-4">
          <div>
            <label className="label-field">Current password</label>
            <input type="password" required className="input-field" value={form.currentPassword}
              onChange={(e) => setForm({ ...form, currentPassword: e.target.value })} />
          </div>
          <div>
            <label className="label-field">New password</label>
            <input type="password" required minLength={8} className="input-field" value={form.newPassword}
              onChange={(e) => setForm({ ...form, newPassword: e.target.value })} />
          </div>
          <div>
            <label className="label-field">Confirm new password</label>
            <input type="password" required className="input-field" value={form.confirmPassword}
              onChange={(e) => setForm({ ...form, confirmPassword: e.target.value })} />
          </div>
          <button className="btn-primary" disabled={saving}>{saving ? "Saving…" : "Update Password"}</button>
        </form>
      </div>
    </>
  );
}
