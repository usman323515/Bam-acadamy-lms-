"use client";
import { useState } from "react";
import toast from "react-hot-toast";
import FileUpload from "../FileUpload";

type Course = { id: string; title: string; description: string; thumbnailUrl?: string | null };

export default function CourseSettingsCard({ course }: { course: Course }) {
  const [form, setForm] = useState({
    title: course.title,
    description: course.description,
    thumbnailUrl: course.thumbnailUrl || "",
  });
  const [saving, setSaving] = useState(false);
  const [open, setOpen] = useState(false);

  async function save() {
    setSaving(true);
    try {
      const res = await fetch(`/api/admin/courses/${course.id}`, {
        method: "PATCH",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify(form),
      });
      if (!res.ok) throw new Error("Failed to save course details");
      toast.success("Course details updated");
      setOpen(false);
    } catch (err: any) {
      toast.error(err.message);
    } finally {
      setSaving(false);
    }
  }

  return (
    <div className="card p-5 mb-6">
      <button onClick={() => setOpen((o) => !o)} className="flex items-center justify-between w-full text-left">
        <span className="font-semibold text-sm">Course Details & Thumbnail</span>
        <i className={`fas fa-chevron-${open ? "up" : "down"} text-xs text-gray-500`} />
      </button>
      {open && (
        <div className="mt-4 space-y-4">
          <div>
            <label className="label-field">Title</label>
            <input className="input-field" value={form.title} onChange={(e) => setForm({ ...form, title: e.target.value })} />
          </div>
          <div>
            <label className="label-field">Description</label>
            <textarea rows={3} className="input-field" value={form.description} onChange={(e) => setForm({ ...form, description: e.target.value })} />
          </div>
          <div className="flex items-center gap-4">
            {form.thumbnailUrl && (
              // eslint-disable-next-line @next/next/no-img-element
              <img src={form.thumbnailUrl} alt="Thumbnail" className="w-28 h-20 object-cover rounded-lg border border-line" />
            )}
            <div className="flex-1">
              <FileUpload
                label="Thumbnail"
                accept="image/*"
                resourceType="image"
                folder="bam-academy/thumbnails"
                onUploaded={({ url }) => setForm({ ...form, thumbnailUrl: url })}
              />
            </div>
          </div>
          <button onClick={save} disabled={saving} className="btn-primary text-sm">{saving ? "Saving…" : "Save Course Details"}</button>
        </div>
      )}
    </div>
  );
}
