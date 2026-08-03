import { NextRequest, NextResponse } from "next/server";
import { getServerSession } from "next-auth";
import { authOptions } from "@/lib/auth";
import { prisma } from "@/lib/prisma";

async function requireAdmin() {
  const session = await getServerSession(authOptions);
  if (!session || session.user.role !== "ADMIN") return null;
  return session;
}

export async function GET(req: NextRequest) {
  const session = await requireAdmin();
  if (!session) return NextResponse.json({ error: "Forbidden" }, { status: 403 });

  const q = req.nextUrl.searchParams.get("q")?.trim() || "";

  const students = await prisma.user.findMany({
    where: {
      role: "STUDENT",
      ...(q
        ? { OR: [{ name: { contains: q, mode: "insensitive" } }, { email: { contains: q, mode: "insensitive" } }] }
        : {}),
    },
    orderBy: { createdAt: "desc" },
    include: {
      _count: { select: { enrollments: true, certificates: true } },
      loginEvents: { orderBy: { createdAt: "desc" }, take: 1 },
    },
  });

  return NextResponse.json(
    students.map((s) => ({
      id: s.id,
      name: s.name,
      email: s.email,
      isBlocked: s.isBlocked,
      emailVerified: !!s.emailVerified,
      createdAt: s.createdAt,
      lastLogin: s.loginEvents[0]?.createdAt || null,
      coursesEnrolled: s._count.enrollments,
      certificates: s._count.certificates,
    }))
  );
}
