"use client";
import { useState } from "react";
import toast from "react-hot-toast";
import { colorTagClass } from "@/lib/colorTags";
import LessonEditor from "./LessonEditor";

type Lesson = {
  id: string; title: string; description: string | null; type: "VIDEO" | "PDF" | "TEXT";
  videoUrl: string | null; pdfUrl: string | null; textContent: string | null;
};
type Module = { id: string; title: string; description: string | null; icon: string; colorTag: string; lessons: Lesson[] };
type Course = { id: string; title: string; description: string; modules: Module[] };

export default function CourseManager({ course: initialCourse }: { course: Course }) {
  const [modules, setModules] = useState<Module[]>(initialCourse.modules);
  const [newModuleTitle, setNewModuleTitle] = useState("");
  const [addingModule, setAddingModule] = useState(false);
  const [expandedModule, setExpandedModule] = useState<string | null>(null);

  async function addModule(e: React.FormEvent) {
    e.preventDefault();
    if (!newModuleTitle.trim()) return;
    const res = await fetch("/api/admin/modules", {
      method: "POST",
      headers: { "Content-Type": "application/json" },
      body: JSON.stringify({ courseId: initialCourse.id, title: newModuleTitle }),
    });
    if (res.ok) {
      const mod = await res.json();
      setModules((prev) => [...prev, { ...mod, lessons: [] }]);
      setNewModuleTitle("");
      setAddingModule(false);
      toast.success("Module added");
    }
  }

  async function deleteModule(id: string) {
    if (!confirm("Delete this module and all its lessons?")) return;
    await fetch(`/api/admin/modules/${id}`, { method: "DELETE" });
    setModules((prev) => prev.filter((m) => m.id !== id));
    toast.success("Module deleted");
  }

  function addLessonToState(moduleId: string, lesson: Lesson) {
    setModules((prev) => prev.map((m) => (m.id === moduleId ? { ...m, lessons: [...m.lessons, lesson] } : m)));
  }
  function updateLessonInState(moduleId: string, lesson: Lesson) {
    setModules((prev) =>
      prev.map((m) => (m.id === moduleId ? { ...m, lessons: m.lessons.map((l) => (l.id === lesson.id ? lesson : l)) } : m))
    );
  }
  function removeLessonFromState(moduleId: string, lessonId: string) {
    setModules((prev) =>
      prev.map((m) => (m.id === moduleId ? { ...m, lessons: m.lessons.filter((l) => l.id !== lessonId) } : m))
    );
  }

  return (
    <div className="space-y-4">
      {modules.map((m) => (
        <div key={m.id} className="card overflow-hidden">
          <div className="flex items-center justify-between p-4">
            <button
              onClick={() => setExpandedModule(expandedModule === m.id ? null : m.id)}
              className="flex items-center gap-3 flex-1 text-left"
            >
              <i className={`fas ${m.icon} ${colorTagClass(m.colorTag)}`} />
              <span className="font-medium">{m.title}</span>
              <span className="text-xs text-gray-500">{m.lessons.length} lessons</span>
            </button>
            <div className="flex items-center gap-2">
              <button onClick={() => setExpandedModule(expandedModule === m.id ? null : m.id)} className="text-xs px-2.5 py-1.5 rounded-lg bg-card2 border border-line">
                {expandedModule === m.id ? "Collapse" : "Manage Lessons"}
              </button>
              <button onClick={() => deleteModule(m.id)} className="text-xs px-2.5 py-1.5 rounded-lg bg-red-500/10 text-red-400">
                <i className="fas fa-trash" />
              </button>
            </div>
          </div>
          {expandedModule === m.id && (
            <div className="border-t border-line p-4 bg-bg2 space-y-3">
              {m.lessons.map((l) => (
                <LessonEditor
                  key={l.id}
                  moduleId={m.id}
                  lesson={l}
                  onUpdated={(lesson) => updateLessonInState(m.id, lesson)}
                  onDeleted={() => removeLessonFromState(m.id, l.id)}
                />
              ))}
              <LessonEditor
                moduleId={m.id}
                lesson={null}
                onCreated={(lesson) => addLessonToState(m.id, lesson)}
              />
            </div>
          )}
        </div>
      ))}

      {addingModule ? (
        <form onSubmit={addModule} className="card p-4 flex gap-3">
          <input
            autoFocus
            className="input-field flex-1"
            placeholder="Module title (e.g. WhatsApp Setup)"
            value={newModuleTitle}
            onChange={(e) => setNewModuleTitle(e.target.value)}
          />
          <button className="btn-primary">Add</button>
          <button type="button" onClick={() => setAddingModule(false)} className="btn-secondary">Cancel</button>
        </form>
      ) : (
        <button onClick={() => setAddingModule(true)} className="btn-secondary w-full">
          <i className="fas fa-plus mr-1" /> Add Module
        </button>
      )}
    </div>
  );
}
