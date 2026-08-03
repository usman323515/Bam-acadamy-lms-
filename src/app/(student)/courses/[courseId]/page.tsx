import { getServerSession } from "next-auth";
import { authOptions } from "@/lib/auth";
import { prisma } from "@/lib/prisma";
import { notFound } from "next/navigation";
import CourseViewer from "@/components/CourseViewer";

export default async function CourseDetailPage({ params }: { params: { courseId: string } }) {
  const session = await getServerSession(authOptions);
  const userId = session!.user.id;

  const course = await prisma.course.findUnique({
    where: { id: params.courseId },
    include: {
      modules: { orderBy: { order: "asc" }, include: { lessons: { orderBy: { order: "asc" } } } },
    },
  });
  if (!course) notFound();

  const progress = await prisma.lessonProgress.findMany({
    where: { userId, lesson: { module: { courseId: course.id } } },
  });

  await prisma.enrollment.upsert({
    where: { userId_courseId: { userId, courseId: course.id } },
    update: {},
    create: { userId, courseId: course.id },
  });

  const completedIds = progress.filter((p) => p.completed).map((p) => p.lessonId);

  return <CourseViewer course={course} completedLessonIds={completedIds} />;
}
