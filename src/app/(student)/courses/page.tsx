import { getServerSession } from "next-auth";
import { authOptions } from "@/lib/auth";
import { prisma } from "@/lib/prisma";
import Link from "next/link";
import Topbar from "@/components/Topbar";

export default async function CoursesPage() {
  const session = await getServerSession(authOptions);
  const userId = session!.user.id;

  const [courses, progressRows] = await Promise.all([
    prisma.course.findMany({
      where: { isPublished: true },
      orderBy: { order: "asc" },
      include: { modules: { include: { lessons: true } } },
    }),
    prisma.lessonProgress.findMany({ where: { userId, completed: true } }),
  ]);
  const completedLessonIds = new Set(progressRows.map((p) => p.lessonId));

  return (
    <>
      <Topbar title="My Courses" />
      <div className="grid sm:grid-cols-2 lg:grid-cols-3 gap-5">
        {courses.map((c) => {
          const lessons = c.modules.flatMap((m) => m.lessons);
          const completed = lessons.filter((l) => completedLessonIds.has(l.id)).length;
          const pct = lessons.length ? Math.round((completed / lessons.length) * 100) : 0;
          return (
            <Link key={c.id} href={`/courses/${c.id}`} className="card p-5 hover:border-brand-green/40 transition-colors">
              <div className="w-11 h-11 rounded-xl bg-brand-green/15 flex items-center justify-center text-brand-green2 mb-4">
                <i className="fas fa-book-open" />
              </div>
              <h3 className="font-semibold mb-1">{c.title}</h3>
              <p className="text-gray-500 text-xs mb-3 line-clamp-2">{c.description}</p>
              <div className="text-xs text-gray-500 mb-2">{c.modules.length} modules · {lessons.length} lessons</div>
              <div className="w-full bg-bg2 rounded-full h-1.5 overflow-hidden">
                <div className="bg-brand-green h-full rounded-full" style={{ width: `${pct}%` }} />
              </div>
              <div className="text-xs text-gray-500 mt-2">{pct}% complete</div>
            </Link>
          );
        })}
        {courses.length === 0 && <div className="col-span-full text-center text-gray-500 py-12">No courses available yet.</div>}
      </div>
    </>
  );
}
