import { NextRequest, NextResponse } from "next/server";
import { prisma } from "@/lib/prisma";
import { requireAdminSession } from "@/lib/admin";
import { z } from "zod";

const schema = z.object({
  moduleId: z.string(),
  title: z.string().min(2),
  description: z.string().optional(),
  type: z.enum(["VIDEO", "PDF", "TEXT"]),
  videoUrl: z.string().optional(),
  videoPublicId: z.string().optional(),
  pdfUrl: z.string().optional(),
  pdfPublicId: z.string().optional(),
  textContent: z.string().optional(),
  durationSec: z.number().optional(),
});

export async function POST(req: NextRequest) {
  const session = await requireAdminSession();
  if (!session) return NextResponse.json({ error: "Forbidden" }, { status: 403 });

  const body = await req.json();
  const parsed = schema.safeParse(body);
  if (!parsed.success) return NextResponse.json({ error: parsed.error.errors[0].message }, { status: 400 });

  const count = await prisma.lesson.count({ where: { moduleId: parsed.data.moduleId } });
  const lesson = await prisma.lesson.create({ data: { ...parsed.data, order: count } });
  return NextResponse.json(lesson, { status: 201 });
}
