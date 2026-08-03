"use client";
import { useState } from "react";
import toast from "react-hot-toast";
import FileUpload from "../FileUpload";

type Lesson = {
  id: string; title: string; description: string | null; type: "VIDEO" | "PDF" | "TEXT";
  videoUrl: string | null; pdfUrl: string | null; textContent: string | null;
};

export default function LessonEditor({
  moduleId,
  lesson,
  onCreated,
  onUpdated,
  onDeleted,
}: {
  moduleId: string;
  lesson: Lesson | null;
  onCreated?: (lesson: Lesson) => void;
  onUpdated?: (lesson: Lesson) => void;
  onDeleted?: () => void;
}) {
  const isNew = !lesson;
  const [editing, setEditing] = useState(isNew);
  const [form, setForm] = useState({
    title: lesson?.title || "",
    description: lesson?.description || "",
    type: lesson?.type || "VIDEO",
    videoUrl: lesson?.videoUrl || "",
    videoPublicId: "",
    pdfUrl: lesson?.pdfUrl || "",
    pdfPublicId: "",
    textContent: lesson?.textContent || "",
  });
  const [saving, setSaving] = useState(false);

  async function save() {
    if (!form.title.trim()) {
      toast.error("Lesson title is required");
      return;
    }
    setSaving(true);
    try {
      if (isNew) {
        const res = await fetch("/api/admin/lessons", {
          method: "POST",
          headers: { "Content-Type": "application/json" },
          body: JSON.stringify({ moduleId, ...form }),
        });
        if (!res.ok) throw new Error((await res.json()).error);
        const created = await res.json();
        onCreated?.(created);
        setForm({ title: "", description: "", type: "VIDEO", videoUrl: "", videoPublicId: "", pdfUrl: "", pdfPublicId: "", textContent: "" });
        toast.success("Lesson added");
      } else {
        const res = await fetch(`/api/admin/lessons/${lesson!.id}`, {
          method: "PATCH",
          headers: { "Content-Type": "application/json" },
          body: JSON.stringify(form),
        });
        if (!res.ok) throw new Error((await res.json()).error);
        const updated = await res.json();
        onUpdated?.(updated);
        setEditing(false);
        toast.success("Lesson updated");
      }
    } catch (err: any) {
      toast.error(err.message);
    } finally {
      setSaving(false);
    }
  }

  async function remove() {
    if (!lesson || !confirm("Delete this lesson?")) return;
    await fetch(`/api/admin/lessons/${lesson.id}`, { method: "DELETE" });
    onDeleted?.();
    toast.success("Lesson deleted");
  }

  if (!editing && lesson) {
    return (
      <div className="flex items-center justify-between bg-card rounded-xl px-4 py-3">
        <div className="flex items-center gap-3">
          <i className={`fas ${lesson.type === "VIDEO" ? "fa-play" : lesson.type === "PDF" ? "fa-file-pdf" : "fa-align-left"} text-brand-green2 text-xs`} />
          <span className="text-sm">{lesson.title}</span>
        </div>
        <div className="flex gap-2">
          <button onClick={() => setEditing(true)} className="text-xs px-2.5 py-1 rounded-lg bg-card2 border border-line">Edit</button>
          <button onClick={remove} className="text-xs px-2.5 py-1 rounded-lg bg-red-500/10 text-red-400">Delete</button>
        </div>
      </div>
    );
  }

  return (
    <div className="bg-card rounded-xl p-4 space-y-3">
      <div className="grid sm:grid-cols-2 gap-3">
        <input className="input-field" placeholder="Lesson title" value={form.title}
          onChange={(e) => setForm({ ...form, title: e.target.value })} />
        <select className="input-field" value={form.type}
          onChange={(e) => setForm({ ...form, type: e.target.value as any })}>
          <option value="VIDEO">Video</option>
          <option value="PDF">PDF</option>
          <option value="TEXT">Text</option>
        </select>
      </div>
      <textarea className="input-field" rows={2} placeholder="Short description (optional)" value={form.description}
        onChange={(e) => setForm({ ...form, description: e.target.value })} />

      {form.type === "VIDEO" && (
        <div className="space-y-2">
          <FileUpload
            label="Video"
            accept="video/*"
            resourceType="video"
            folder="bam-academy/videos"
            onUploaded={({ url, publicId }) => setForm({ ...form, videoUrl: url, videoPublicId: publicId })}
          />
          {form.videoUrl && <p className="text-xs text-gray-500 truncate">✓ {form.videoUrl}</p>}
        </div>
      )}
      {form.type === "PDF" && (
        <div className="space-y-2">
          <FileUpload
            label="PDF"
            accept="application/pdf"
            resourceType="raw"
            folder="bam-academy/pdfs"
            onUploaded={({ url, publicId }) => setForm({ ...form, pdfUrl: url, pdfPublicId: publicId })}
          />
          {form.pdfUrl && <p className="text-xs text-gray-500 truncate">✓ {form.pdfUrl}</p>}
        </div>
      )}
      {form.type === "TEXT" && (
        <textarea className="input-field" rows={5} placeholder="Lesson content" value={form.textContent}
          onChange={(e) => setForm({ ...form, textContent: e.target.value })} />
      )}

      <div className="flex gap-2">
        <button onClick={save} disabled={saving} className="btn-primary text-sm">{saving ? "Saving…" : "Save Lesson"}</button>
        {!isNew && <button onClick={() => setEditing(false)} className="btn-secondary text-sm">Cancel</button>}
      </div>
    </div>
  );
}
