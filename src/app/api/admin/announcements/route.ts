import { NextRequest, NextResponse } from "next/server";
import { prisma } from "@/lib/prisma";
import { requireAdminSession } from "@/lib/admin";
import { sendAnnouncementEmail } from "@/lib/email";
import { z } from "zod";

const schema = z.object({
  title: z.string().min(2),
  message: z.string().min(1),
  audience: z.enum(["ALL", "INDIVIDUAL"]),
  studentId: z.string().optional(),
  sendEmail: z.boolean().optional(),
});

export async function GET() {
  const session = await requireAdminSession();
  if (!session) return NextResponse.json({ error: "Forbidden" }, { status: 403 });
  const items = await prisma.announcement.findMany({ orderBy: { createdAt: "desc" }, take: 30 });
  return NextResponse.json(items);
}

export async function POST(req: NextRequest) {
  const session = await requireAdminSession();
  if (!session) return NextResponse.json({ error: "Forbidden" }, { status: 403 });

  const body = await req.json();
  const parsed = schema.safeParse(body);
  if (!parsed.success) return NextResponse.json({ error: parsed.error.errors[0].message }, { status: 400 });
  const { title, message, audience, studentId, sendEmail } = parsed.data;

  if (audience === "INDIVIDUAL" && !studentId) {
    return NextResponse.json({ error: "Select a student for an individual announcement" }, { status: 400 });
  }

  const announcement = await prisma.announcement.create({
    data: { title, message, sendEmail: !!sendEmail, authorId: session.user.id },
  });

  await prisma.notification.create({
    data: { title, message, audience, userId: audience === "INDIVIDUAL" ? studentId : null },
  });

  if (sendEmail) {
    const recipients =
      audience === "ALL"
        ? await prisma.user.findMany({ where: { role: "STUDENT" }, select: { email: true } })
        : await prisma.user.findMany({ where: { id: studentId }, select: { email: true } });

    for (const r of recipients) {
      try {
        await sendAnnouncementEmail(r.email, title, message);
      } catch (err) {
        console.error("Failed to send announcement email to", r.email, err);
      }
    }
  }

  return NextResponse.json(announcement, { status: 201 });
}
