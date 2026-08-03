import { NextRequest, NextResponse } from "next/server";
import { prisma } from "@/lib/prisma";
import { requireAdminSession } from "@/lib/admin";
import { z } from "zod";

export async function GET() {
  const session = await requireAdminSession();
  if (!session) return NextResponse.json({ error: "Forbidden" }, { status: 403 });

  const courses = await prisma.course.findMany({
    orderBy: { order: "asc" },
    include: { modules: { include: { lessons: true } }, _count: { select: { enrollments: true } } },
  });
  return NextResponse.json(courses);
}

const schema = z.object({
  title: z.string().min(2),
  description: z.string().min(1),
  thumbnailUrl: z.string().optional(),
  colorTag: z.string().optional(),
  isPublished: z.boolean().optional(),
});

function slugify(title: string) {
  return title.toLowerCase().trim().replace(/[^a-z0-9]+/g, "-").replace(/(^-|-$)/g, "");
}

export async function POST(req: NextRequest) {
  const session = await requireAdminSession();
  if (!session) return NextResponse.json({ error: "Forbidden" }, { status: 403 });

  const body = await req.json();
  const parsed = schema.safeParse(body);
  if (!parsed.success) return NextResponse.json({ error: parsed.error.errors[0].message }, { status: 400 });

  const count = await prisma.course.count();
  let slug = slugify(parsed.data.title);
  const existing = await prisma.course.findUnique({ where: { slug } });
  if (existing) slug = `${slug}-${Date.now().toString(36)}`;

  const course = await prisma.course.create({
    data: { ...parsed.data, slug, order: count },
  });
  return NextResponse.json(course, { status: 201 });
}
