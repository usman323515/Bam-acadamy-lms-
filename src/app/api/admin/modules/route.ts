import { NextRequest, NextResponse } from "next/server";
import { prisma } from "@/lib/prisma";
import { requireAdminSession } from "@/lib/admin";
import { z } from "zod";

const schema = z.object({
  courseId: z.string(),
  title: z.string().min(2),
  description: z.string().optional(),
  icon: z.string().optional(),
  colorTag: z.string().optional(),
});

export async function POST(req: NextRequest) {
  const session = await requireAdminSession();
  if (!session) return NextResponse.json({ error: "Forbidden" }, { status: 403 });

  const body = await req.json();
  const parsed = schema.safeParse(body);
  if (!parsed.success) return NextResponse.json({ error: parsed.error.errors[0].message }, { status: 400 });

  const count = await prisma.module.count({ where: { courseId: parsed.data.courseId } });
  const mod = await prisma.module.create({ data: { ...parsed.data, order: count } });
  return NextResponse.json(mod, { status: 201 });
}
