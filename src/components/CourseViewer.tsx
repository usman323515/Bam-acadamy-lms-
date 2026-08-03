"use client";
import { useState, useMemo } from "react";
import { useRouter } from "next/navigation";
import toast from "react-hot-toast";
import Topbar from "./Topbar";
import { colorTagClass } from "@/lib/colorTags";

type Lesson = {
  id: string; title: string; description: string | null; type: "VIDEO" | "PDF" | "TEXT";
  videoUrl: string | null; pdfUrl: string | null; textContent: string | null; order: number;
};
type Module = { id: string; title: string; description: string | null; icon: string; colorTag: string; order: number; lessons: Lesson[] };
type Course = { id: string; title: string; description: string; modules: Module[] };

export default function CourseViewer({ course, completedLessonIds }: { course: Course; completedLessonIds: string[] }) {
  const router = useRouter();
  const allLessons = useMemo(() => course.modules.flatMap((m) => m.lessons), [course]);
  const [completed, setCompleted] = useState<Set<string>>(new Set(completedLessonIds));
  const [activeLesson, setActiveLesson] = useState<Lesson | null>(allLessons[0] || null);
  const [openModule, setOpenModule] = useState<string | null>(course.modules[0]?.id || null);
  const [marking, setMarking] = useState(false);

  const totalPct = allLessons.length ? Math.round((completed.size / allLessons.length) * 100) : 0;

  async function markComplete(lessonId: string) {
    setMarking(true);
    try {
      const res = await fetch("/api/student/progress", {
        method: "POST",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify({ lessonId }),
      });
      if (!res.ok) throw new Error("Failed to update progress");
      setCompleted((prev) => new Set(prev).add(lessonId));
      toast.success("Marked as complete");

      if (completed.size + 1 === allLessons.length) {
        const certRes = await fetch("/api/student/certificate", {
          method: "POST",
          headers: { "Content-Type": "application/json" },
          body: JSON.stringify({ courseId: course.id }),
        });
        if (certRes.ok) {
          toast.success("🎉 Course complete! Your certificate is ready.");
          router.refresh();
        }
      }
    } catch (err: any) {
      toast.error(err.message);
    } finally {
      setMarking(false);
    }
  }

  return (
    <>
      <Topbar title={course.title} />
      <div className="grid lg:grid-cols-[1fr_380px] gap-6">
        <div className="card p-5 md:p-6">
          {!activeLesson && <p className="text-gray-500">This course has no lessons yet.</p>}
          {activeLesson && (
            <>
              <div className="aspect-video bg-black rounded-xl overflow-hidden mb-5">
                {activeLesson.type === "VIDEO" && activeLesson.videoUrl && (
                  <video key={activeLesson.id} src={activeLesson.videoUrl} controls className="w-full h-full" />
                )}
                {activeLesson.type === "PDF" && activeLesson.pdfUrl && (
                  <iframe src={activeLesson.pdfUrl} className="w-full h-full" title={activeLesson.title} />
                )}
                {activeLesson.type === "TEXT" && (
                  <div className="w-full h-full overflow-y-auto p-6 bg-bg2 whitespace-pre-wrap text-sm text-gray-300">
                    {activeLesson.textContent}
                  </div>
                )}
                {activeLesson.type !== "TEXT" && !activeLesson.videoUrl && !activeLesson.pdfUrl && (
                  <div className="w-full h-full flex items-center justify-center text-gray-600 text-sm">
                    Content not uploaded yet
                  </div>
                )}
              </div>
              <h2 className="text-lg font-display font-bold mb-1">{activeLesson.title}</h2>
              {activeLesson.description && <p className="text-gray-500 text-sm mb-5">{activeLesson.description}</p>}
              {completed.has(activeLesson.id) ? (
                <div className="inline-flex items-center gap-2 text-brand-green2 text-sm font-medium">
                  <i className="fas fa-circle-check" /> Completed
                </div>
              ) : (
                <button onClick={() => markComplete(activeLesson.id)} disabled={marking} className="btn-primary">
                  {marking ? "Saving…" : "Mark as Complete"}
                </button>
              )}
            </>
          )}
        </div>

        <div className="card p-4 h-fit">
          <div className="flex items-center justify-between mb-1">
            <div className="text-sm font-semibold">Course Content</div>
            <div className="text-xs text-gray-500">{totalPct}%</div>
          </div>
          <div className="w-full bg-bg2 rounded-full h-1.5 mb-4 overflow-hidden">
            <div className="bg-brand-green h-full rounded-full" style={{ width: `${totalPct}%` }} />
          </div>
          <div className="space-y-2 max-h-[65vh] overflow-y-auto pr-1">
            {course.modules.map((m) => (
              <div key={m.id} className="border border-line rounded-xl overflow-hidden">
                <button
                  onClick={() => setOpenModule(openModule === m.id ? null : m.id)}
                  className="w-full flex items-center justify-between px-3 py-2.5 bg-bg2 text-sm font-medium"
                >
                  <span className="flex items-center gap-2">
                    <i className={`fas ${m.icon} ${colorTagClass(m.colorTag)}`} /> {m.title}
                  </span>
                  <i className={`fas fa-chevron-${openModule === m.id ? "up" : "down"} text-xs text-gray-500`} />
                </button>
                {openModule === m.id && (
                  <div className="divide-y divide-line">
                    {m.lessons.map((l) => (
                      <button
                        key={l.id}
                        onClick={() => setActiveLesson(l)}
                        className={`w-full text-left px-3 py-2.5 text-xs flex items-center gap-2 hover:bg-card2 ${
                          activeLesson?.id === l.id ? "bg-brand-green/10 text-brand-green2" : "text-gray-400"
                        }`}
                      >
                        <i className={`fas ${completed.has(l.id) ? "fa-circle-check text-brand-green2" : "fa-circle text-gray-600"}`} />
                        {l.title}
                      </button>
                    ))}
                    {m.lessons.length === 0 && (
                      <div className="px-3 py-2.5 text-xs text-gray-600">No lessons yet</div>
                    )}
                  </div>
                )}
              </div>
            ))}
          </div>
        </div>
      </div>
    </>
  );
}
