import { prisma } from "@/lib/prisma";
import { notFound } from "next/navigation";
import Topbar from "@/components/Topbar";
import CourseManager from "@/components/admin/CourseManager";
import CourseSettingsCard from "@/components/admin/CourseSettingsCard";

export default async function AdminCourseDetailPage({ params }: { params: { courseId: string } }) {
  const course = await prisma.course.findUnique({
    where: { id: params.courseId },
    include: { modules: { orderBy: { order: "asc" }, include: { lessons: { orderBy: { order: "asc" } } } } },
  });
  if (!course) notFound();

  return (
    <>
      <Topbar title={course.title} />
      <CourseSettingsCard course={JSON.parse(JSON.stringify(course))} />
      <CourseManager course={JSON.parse(JSON.stringify(course))} />
    </>
  );
}
