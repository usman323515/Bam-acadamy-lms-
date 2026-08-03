"use client";
import { useEffect, useState } from "react";
import Topbar from "@/components/Topbar";
import Link from "next/link";
import toast from "react-hot-toast";
import { COLOR_TAGS, colorTagClass } from "@/lib/colorTags";
import FileUpload from "@/components/FileUpload";

type Course = {
  id: string; title: string; description: string; colorTag: string; isPublished: boolean;
  modules: { id: string; lessons: any[] }[]; _count: { enrollments: number };
};

export default function AdminCoursesPage() {
  const [courses, setCourses] = useState<Course[]>([]);
  const [showForm, setShowForm] = useState(false);
  const [form, setForm] = useState({ title: "", description: "", colorTag: "green", thumbnailUrl: "" });
  const [saving, setSaving] = useState(false);

  async function load() {
    const res = await fetch("/api/admin/courses");
    if (res.ok) setCourses(await res.json());
  }
  useEffect(() => { load(); }, []);

  async function createCourse(e: React.FormEvent) {
    e.preventDefault();
    setSaving(true);
    try {
      const res = await fetch("/api/admin/courses", {
        method: "POST",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify(form),
      });
      if (!res.ok) throw new Error((await res.json()).error);
      toast.success("Course created");
      setForm({ title: "", description: "", colorTag: "green", thumbnailUrl: "" });
      setShowForm(false);
      load();
    } catch (err: any) {
      toast.error(err.message);
    } finally {
      setSaving(false);
    }
  }

  async function togglePublish(id: string, isPublished: boolean) {
    await fetch(`/api/admin/courses/${id}`, {
      method: "PATCH",
      headers: { "Content-Type": "application/json" },
      body: JSON.stringify({ isPublished: !isPublished }),
    });
    load();
  }

  async function remove(id: string) {
    if (!confirm("Delete this course and all its modules/lessons? This cannot be undone.")) return;
    await fetch(`/api/admin/courses/${id}`, { method: "DELETE" });
    toast.success("Course deleted");
    load();
  }

  return (
    <>
      <Topbar title="Course Management" />
      <button onClick={() => setShowForm((s) => !s)} className="btn-primary mb-6">
        <i className="fas fa-plus mr-1" /> New Course
      </button>

      {showForm && (
        <form onSubmit={createCourse} className="card p-6 mb-6 space-y-4 max-w-xl">
          <div>
            <label className="label-field">Title</label>
            <input required className="input-field" value={form.title} onChange={(e) => setForm({ ...form, title: e.target.value })} />
          </div>
          <div>
            <label className="label-field">Description</label>
            <textarea required rows={3} className="input-field" value={form.description} onChange={(e) => setForm({ ...form, description: e.target.value })} />
          </div>
          <div>
            <label className="label-field">Color</label>
            <div className="flex gap-2 flex-wrap">
              {COLOR_TAGS.map((c) => (
                <button type="button" key={c} onClick={() => setForm({ ...form, colorTag: c })}
                  className={`px-3 py-1.5 rounded-lg text-xs border ${form.colorTag === c ? "border-brand-green" : "border-line"} ${colorTagClass(c)}`}>
                  {c}
                </button>
              ))}
            </div>
          </div>
          <FileUpload
            label="Thumbnail"
            accept="image/*"
            resourceType="image"
            folder="bam-academy/thumbnails"
            onUploaded={({ url }) => setForm({ ...form, thumbnailUrl: url })}
          />
          {form.thumbnailUrl && (
            // eslint-disable-next-line @next/next/no-img-element
            <img src={form.thumbnailUrl} alt="Thumbnail preview" className="w-32 h-20 object-cover rounded-lg" />
          )}
          <button disabled={saving} className="btn-primary">{saving ? "Creating…" : "Create Course"}</button>
        </form>
      )}

      <div className="grid sm:grid-cols-2 lg:grid-cols-3 gap-5">
        {courses.map((c) => {
          const lessons = c.modules.flatMap((m) => m.lessons);
          return (
            <div key={c.id} className="card p-5">
              <div className={`w-10 h-10 rounded-xl flex items-center justify-center mb-3 ${colorTagClass(c.colorTag)}`}>
                <i className="fas fa-book" />
              </div>
              <h3 className="font-semibold mb-1">{c.title}</h3>
              <p className="text-gray-500 text-xs mb-3 line-clamp-2">{c.description}</p>
              <div className="text-xs text-gray-500 mb-4">
                {c.modules.length} modules · {lessons.length} lessons · {c._count.enrollments} enrolled
              </div>
              <div className="flex items-center gap-2">
                <Link href={`/admin/courses/${c.id}`} className="btn-secondary text-xs flex-1 text-center">Manage</Link>
                <button onClick={() => togglePublish(c.id, c.isPublished)} className="text-xs px-2.5 py-1.5 rounded-lg bg-card2 border border-line">
                  {c.isPublished ? "Unpublish" : "Publish"}
                </button>
                <button onClick={() => remove(c.id)} className="text-xs px-2.5 py-1.5 rounded-lg bg-red-500/10 text-red-400">
                  <i className="fas fa-trash" />
                </button>
              </div>
            </div>
          );
        })}
        {courses.length === 0 && <div className="col-span-full text-center text-gray-500 py-12">No courses yet. Create your first one.</div>}
      </div>
    </>
  );
}
