import { NextRequest, NextResponse } from "next/server";
import { getServerSession } from "next-auth";
import { authOptions } from "@/lib/auth";
import { prisma } from "@/lib/prisma";
import { generateCertificateNumber } from "@/lib/tokens";

export async function POST(req: NextRequest) {
  const session = await getServerSession(authOptions);
  if (!session) return NextResponse.json({ error: "Unauthorized" }, { status: 401 });

  const { courseId } = await req.json();
  const course = await prisma.course.findUnique({
    where: { id: courseId },
    include: { modules: { include: { lessons: true } } },
  });
  if (!course) return NextResponse.json({ error: "Course not found" }, { status: 404 });

  const lessonIds = course.modules.flatMap((m) => m.lessons.map((l) => l.id));
  if (lessonIds.length === 0) {
    return NextResponse.json({ error: "This course has no lessons yet" }, { status: 400 });
  }

  const completedCount = await prisma.lessonProgress.count({
    where: { userId: session.user.id, lessonId: { in: lessonIds }, completed: true },
  });

  if (completedCount < lessonIds.length) {
    return NextResponse.json({ error: "Course not yet fully completed" }, { status: 400 });
  }

  const certificate = await prisma.certificate.upsert({
    where: { userId_courseId: { userId: session.user.id, courseId } },
    update: {},
    create: {
      userId: session.user.id,
      courseId,
      certificateNo: generateCertificateNumber(),
    },
  });

  return NextResponse.json(certificate);
}
