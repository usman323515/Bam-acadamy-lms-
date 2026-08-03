"use client";
import { useEffect, useState } from "react";
import { useSession } from "next-auth/react";
import Topbar from "@/components/Topbar";
import toast from "react-hot-toast";

export default function AdminSettingsPage() {
  const { data: session } = useSession();
  const [settings, setSettings] = useState({ siteName: "", supportEmail: "", maintenanceMode: false });
  const [pwForm, setPwForm] = useState({ currentPassword: "", newPassword: "", confirmPassword: "" });
  const [saving, setSaving] = useState(false);
  const [savingPw, setSavingPw] = useState(false);

  useEffect(() => {
    fetch("/api/admin/settings").then((r) => r.json()).then(setSettings);
  }, []);

  async function saveSettings(e: React.FormEvent) {
    e.preventDefault();
    setSaving(true);
    try {
      const res = await fetch("/api/admin/settings", {
        method: "PATCH",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify(settings),
      });
      if (!res.ok) throw new Error("Failed to save settings");
      toast.success("Settings saved");
    } catch (err: any) {
      toast.error(err.message);
    } finally {
      setSaving(false);
    }
  }

  async function changePassword(e: React.FormEvent) {
    e.preventDefault();
    if (pwForm.newPassword !== pwForm.confirmPassword) {
      toast.error("New passwords do not match");
      return;
    }
    setSavingPw(true);
    try {
      const res = await fetch("/api/student/change-password", {
        method: "POST",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify({ currentPassword: pwForm.currentPassword, newPassword: pwForm.newPassword }),
      });
      const data = await res.json();
      if (!res.ok) throw new Error(data.error);
      toast.success("Password changed");
      setPwForm({ currentPassword: "", newPassword: "", confirmPassword: "" });
    } catch (err: any) {
      toast.error(err.message);
    } finally {
      setSavingPw(false);
    }
  }

  return (
    <>
      <Topbar title="Website Settings" />
      <div className="grid lg:grid-cols-2 gap-6">
        <form onSubmit={saveSettings} className="card p-6 space-y-4">
          <h2 className="font-semibold">Site Settings</h2>
          <div>
            <label className="label-field">Site name</label>
            <input className="input-field" value={settings.siteName} onChange={(e) => setSettings({ ...settings, siteName: e.target.value })} />
          </div>
          <div>
            <label className="label-field">Support email</label>
            <input type="email" className="input-field" value={settings.supportEmail} onChange={(e) => setSettings({ ...settings, supportEmail: e.target.value })} />
          </div>
          <label className="flex items-center gap-2 text-sm text-gray-400">
            <input type="checkbox" checked={settings.maintenanceMode} onChange={(e) => setSettings({ ...settings, maintenanceMode: e.target.checked })} />
            Maintenance mode
          </label>
          <button disabled={saving} className="btn-primary">{saving ? "Saving…" : "Save Settings"}</button>
        </form>

        <div className="space-y-6">
          <div className="card p-6">
            <h2 className="font-semibold mb-2">Admin Profile</h2>
            <p className="text-sm text-gray-400">{session?.user?.name}</p>
            <p className="text-xs text-gray-500">{session?.user?.email}</p>
          </div>
          <form onSubmit={changePassword} className="card p-6 space-y-4">
            <h2 className="font-semibold">Change Admin Password</h2>
            <input type="password" required placeholder="Current password" className="input-field" value={pwForm.currentPassword}
              onChange={(e) => setPwForm({ ...pwForm, currentPassword: e.target.value })} />
            <input type="password" required minLength={8} placeholder="New password" className="input-field" value={pwForm.newPassword}
              onChange={(e) => setPwForm({ ...pwForm, newPassword: e.target.value })} />
            <input type="password" required placeholder="Confirm new password" className="input-field" value={pwForm.confirmPassword}
              onChange={(e) => setPwForm({ ...pwForm, confirmPassword: e.target.value })} />
            <button disabled={savingPw} className="btn-primary">{savingPw ? "Saving…" : "Update Password"}</button>
          </form>
        </div>
      </div>
    </>
  );
}
