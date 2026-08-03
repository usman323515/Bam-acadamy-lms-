import { NextRequest, NextResponse } from "next/server";
import { getServerSession } from "next-auth";
import { authOptions } from "@/lib/auth";
import { prisma } from "@/lib/prisma";

async function requireAdmin() {
  const session = await getServerSession(authOptions);
  if (!session || session.user.role !== "ADMIN") return null;
  return session;
}

export async function GET(_req: NextRequest, { params }: { params: { id: string } }) {
  const session = await requireAdmin();
  if (!session) return NextResponse.json({ error: "Forbidden" }, { status: 403 });

  const student = await prisma.user.findUnique({
    where: { id: params.id },
    include: {
      loginEvents: { orderBy: { createdAt: "desc" }, take: 20 },
      enrollments: { include: { course: true } },
      certificates: { include: { course: true } },
    },
  });
  if (!student || student.role !== "STUDENT") return NextResponse.json({ error: "Not found" }, { status: 404 });

  return NextResponse.json(student);
}

export async function PATCH(req: NextRequest, { params }: { params: { id: string } }) {
  const session = await requireAdmin();
  if (!session) return NextResponse.json({ error: "Forbidden" }, { status: 403 });

  const { isBlocked } = await req.json();
  const student = await prisma.user.update({
    where: { id: params.id },
    data: { isBlocked: !!isBlocked },
  });
  return NextResponse.json({ id: student.id, isBlocked: student.isBlocked });
}

export async function DELETE(_req: NextRequest, { params }: { params: { id: string } }) {
  const session = await requireAdmin();
  if (!session) return NextResponse.json({ error: "Forbidden" }, { status: 403 });

  await prisma.user.delete({ where: { id: params.id } });
  return NextResponse.json({ ok: true });
}
