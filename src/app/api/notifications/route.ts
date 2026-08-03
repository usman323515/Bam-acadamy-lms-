import { NextRequest, NextResponse } from "next/server";
import { getServerSession } from "next-auth";
import { authOptions } from "@/lib/auth";
import { prisma } from "@/lib/prisma";

export async function GET() {
  const session = await getServerSession(authOptions);
  if (!session) return NextResponse.json({ error: "Unauthorized" }, { status: 401 });

  const items = await prisma.notification.findMany({
    where: {
      OR: [
        { audience: "ALL" },
        { audience: "INDIVIDUAL", userId: session.user.id },
      ],
    },
    orderBy: { createdAt: "desc" },
    take: 30,
  });
  return NextResponse.json(items);
}

export async function PATCH(req: NextRequest) {
  const session = await getServerSession(authOptions);
  if (!session) return NextResponse.json({ error: "Unauthorized" }, { status: 401 });
  const { id } = await req.json();

  // Individual notifications are owned by one user, so we can mark them read directly.
  // Broadcast (ALL) notifications are a shared row; persisting per-user read state for
  // those would need a join table, so the bell treats them as read for this session only.
  const notif = await prisma.notification.findUnique({ where: { id } });
  if (notif && notif.userId === session.user.id) {
    await prisma.notification.update({ where: { id }, data: { readAt: new Date() } });
  }
  return NextResponse.json({ ok: true });
}
