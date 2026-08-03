import { NextResponse } from "next/server";
import { prisma } from "@/lib/prisma";
import { requireAdminSession } from "@/lib/admin";

export async function GET() {
  const session = await requireAdminSession();
  if (!session) return NextResponse.json({ error: "Forbidden" }, { status: 403 });

  const [totalStudents, totalCourses, totalLessons, totalCertificates, completedLessons] = await Promise.all([
    prisma.user.count({ where: { role: "STUDENT" } }),
    prisma.course.count(),
    prisma.lesson.count(),
    prisma.certificate.count(),
    prisma.lessonProgress.count({ where: { completed: true } }),
  ]);

  const since = new Date();
  since.setDate(since.getDate() - 30);
  const registrations = await prisma.user.findMany({
    where: { role: "STUDENT", createdAt: { gte: since } },
    select: { createdAt: true },
  });

  const byDay: Record<string, number> = {};
  for (const r of registrations) {
    const key = r.createdAt.toISOString().slice(0, 10);
    byDay[key] = (byDay[key] || 0) + 1;
  }

  const courses = await prisma.course.findMany({
    include: { _count: { select: { enrollments: true } } },
    orderBy: { order: "asc" },
  });

  return NextResponse.json({
    totalStudents,
    totalCourses,
    totalLessons,
    totalCertificates,
    completedLessons,
    registrationsByDay: Object.entries(byDay).map(([date, count]) => ({ date, count })),
    courseEnrollments: courses.map((c) => ({ title: c.title, enrollments: c._count.enrollments })),
  });
}
