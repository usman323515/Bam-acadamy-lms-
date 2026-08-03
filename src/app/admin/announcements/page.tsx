"use client";
import { useEffect, useState } from "react";
import Topbar from "@/components/Topbar";
import toast from "react-hot-toast";
import { formatDistanceToNow } from "date-fns";

type Student = { id: string; name: string; email: string };
type Announcement = { id: string; title: string; message: string; sendEmail: boolean; createdAt: string };

export default function AdminAnnouncementsPage() {
  const [students, setStudents] = useState<Student[]>([]);
  const [items, setItems] = useState<Announcement[]>([]);
  const [form, setForm] = useState({ title: "", message: "", audience: "ALL" as "ALL" | "INDIVIDUAL", studentId: "", sendEmail: false });
  const [sending, setSending] = useState(false);

  useEffect(() => {
    fetch("/api/admin/students").then((r) => r.json()).then(setStudents);
    fetch("/api/admin/announcements").then((r) => r.json()).then(setItems);
  }, []);

  async function send(e: React.FormEvent) {
    e.preventDefault();
    setSending(true);
    try {
      const res = await fetch("/api/admin/announcements", {
        method: "POST",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify(form),
      });
      const data = await res.json();
      if (!res.ok) throw new Error(data.error);
      toast.success("Announcement sent");
      setItems((prev) => [data, ...prev]);
      setForm({ title: "", message: "", audience: "ALL", studentId: "", sendEmail: false });
    } catch (err: any) {
      toast.error(err.message);
    } finally {
      setSending(false);
    }
  }

  return (
    <>
      <Topbar title="Announcements" />
      <div className="grid lg:grid-cols-[1fr_380px] gap-6">
        <form onSubmit={send} className="card p-6 space-y-4">
          <div>
            <label className="label-field">Title</label>
            <input required className="input-field" value={form.title} onChange={(e) => setForm({ ...form, title: e.target.value })} />
          </div>
          <div>
            <label className="label-field">Message</label>
            <textarea required rows={5} className="input-field" value={form.message} onChange={(e) => setForm({ ...form, message: e.target.value })} />
          </div>
          <div className="grid sm:grid-cols-2 gap-3">
            <div>
              <label className="label-field">Send to</label>
              <select className="input-field" value={form.audience} onChange={(e) => setForm({ ...form, audience: e.target.value as any })}>
                <option value="ALL">All Students</option>
                <option value="INDIVIDUAL">Individual Student</option>
              </select>
            </div>
            {form.audience === "INDIVIDUAL" && (
              <div>
                <label className="label-field">Student</label>
                <select required className="input-field" value={form.studentId} onChange={(e) => setForm({ ...form, studentId: e.target.value })}>
                  <option value="">Select…</option>
                  {students.map((s) => <option key={s.id} value={s.id}>{s.name} ({s.email})</option>)}
                </select>
              </div>
            )}
          </div>
          <label className="flex items-center gap-2 text-sm text-gray-400">
            <input type="checkbox" checked={form.sendEmail} onChange={(e) => setForm({ ...form, sendEmail: e.target.checked })} />
            Also send as email
          </label>
          <button disabled={sending} className="btn-primary">{sending ? "Sending…" : "Send Announcement"}</button>
        </form>

        <div className="card p-5">
          <h2 className="font-semibold mb-4 text-sm">Recent Announcements</h2>
          <div className="space-y-3 max-h-[28rem] overflow-y-auto">
            {items.map((a) => (
              <div key={a.id} className="border-b border-line pb-3 last:border-0">
                <div className="font-medium text-sm">{a.title}</div>
                <p className="text-gray-500 text-xs line-clamp-2 mt-0.5">{a.message}</p>
                <p className="text-gray-600 text-[11px] mt-1">{formatDistanceToNow(new Date(a.createdAt), { addSuffix: true })}</p>
              </div>
            ))}
            {items.length === 0 && <p className="text-gray-500 text-sm">No announcements sent yet.</p>}
          </div>
        </div>
      </div>
    </>
  );
}
