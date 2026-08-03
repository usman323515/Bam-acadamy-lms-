import { getServerSession } from "next-auth";
import { authOptions } from "@/lib/auth";
import { prisma } from "@/lib/prisma";
import Link from "next/link";
import Topbar from "@/components/Topbar";

export default async function StudentDashboard() {
  const session = await getServerSession(authOptions);
  const userId = session!.user.id;

  const [courses, progressRows, certCount] = await Promise.all([
    prisma.course.findMany({
      where: { isPublished: true },
      orderBy: { order: "asc" },
      include: { modules: { include: { lessons: true } } },
    }),
    prisma.lessonProgress.findMany({ where: { userId, completed: true } }),
    prisma.certificate.count({ where: { userId } }),
  ]);

  const completedLessonIds = new Set(progressRows.map((p) => p.lessonId));

  const coursesWithProgress = courses.map((c) => {
    const lessons = c.modules.flatMap((m) => m.lessons);
    const total = lessons.length;
    const completed = lessons.filter((l) => completedLessonIds.has(l.id)).length;
    return { ...c, total, completed, pct: total ? Math.round((completed / total) * 100) : 0 };
  });

  const inProgress = coursesWithProgress.find((c) => c.pct > 0 && c.pct < 100) || coursesWithProgress[0];
  const totalLessons = coursesWithProgress.reduce((a, c) => a + c.total, 0);
  const totalCompleted = coursesWithProgress.reduce((a, c) => a + c.completed, 0);

  return (
    <>
      <Topbar title={`Welcome back, ${session!.user.name?.split(" ")[0]}`} />

      <div className="grid grid-cols-2 md:grid-cols-4 gap-4 mb-8">
        <StatCard icon="fa-layer-group" label="Modules" value={coursesWithProgress.reduce((a, c) => a + c.modules.length, 0)} color="text-brand-green2" />
        <StatCard icon="fa-play" label="Lessons Done" value={`${totalCompleted}/${totalLessons}`} color="text-brand-blue" />
        <StatCard icon="fa-chart-line" label="Overall Progress" value={`${totalLessons ? Math.round((totalCompleted / totalLessons) * 100) : 0}%`} color="text-brand-gold" />
        <StatCard icon="fa-certificate" label="Certificates" value={certCount} color="text-brand-purple" />
      </div>

      {inProgress && (
        <div className="card p-6 mb-8 bg-gradient-to-br from-card to-card2">
          <div className="text-xs uppercase tracking-wide text-brand-green2 font-semibold mb-2">Continue Learning</div>
          <h2 className="text-xl font-display font-bold mb-1">{inProgress.title}</h2>
          <p className="text-gray-500 text-sm mb-4">{inProgress.completed} of {inProgress.total} lessons complete</p>
          <div className="w-full bg-bg2 rounded-full h-2 mb-5 overflow-hidden">
            <div className="bg-brand-green h-full rounded-full transition-all" style={{ width: `${inProgress.pct}%` }} />
          </div>
          <Link href={`/courses/${inProgress.id}`} className="btn-primary inline-block">
            Resume Course <i className="fas fa-arrow-right ml-1" />
          </Link>
        </div>
      )}

      <h2 className="text-lg font-display font-bold mb-4">Your Courses</h2>
      <div className="grid sm:grid-cols-2 lg:grid-cols-3 gap-5">
        {coursesWithProgress.map((c) => (
          <Link key={c.id} href={`/courses/${c.id}`} className="card p-5 hover:border-brand-green/40 transition-colors">
            <div className="w-11 h-11 rounded-xl bg-brand-green/15 flex items-center justify-center text-brand-green2 mb-4">
              <i className="fas fa-book-open" />
            </div>
            <h3 className="font-semibold mb-1">{c.title}</h3>
            <p className="text-gray-500 text-xs mb-3 line-clamp-2">{c.description}</p>
            <div className="w-full bg-bg2 rounded-full h-1.5 overflow-hidden">
              <div className="bg-brand-green h-full rounded-full" style={{ width: `${c.pct}%` }} />
            </div>
            <div className="text-xs text-gray-500 mt-2">{c.pct}% complete</div>
          </Link>
        ))}
        {coursesWithProgress.length === 0 && (
          <div className="col-span-full text-center text-gray-500 py-12">
            No courses published yet. Check back soon.
          </div>
        )}
      </div>
    </>
  );
}

function StatCard({ icon, label, value, color }: { icon: string; label: string; value: string | number; color: string }) {
  return (
    <div className="card p-4">
      <i className={`fas ${icon} ${color} mb-2`} />
      <div className="text-xl font-display font-bold">{value}</div>
      <div className="text-xs text-gray-500">{label}</div>
    </div>
  );
}
