import { NextRequest, NextResponse } from "next/server";
import { prisma } from "@/lib/prisma";
import { requireAdminSession } from "@/lib/admin";

export async function PATCH(req: NextRequest, { params }: { params: { id: string } }) {
  const session = await requireAdminSession();
  if (!session) return NextResponse.json({ error: "Forbidden" }, { status: 403 });

  const body = await req.json();
  const mod = await prisma.module.update({
    where: { id: params.id },
    data: {
      title: body.title, description: body.description,
      icon: body.icon, colorTag: body.colorTag, order: body.order,
    },
  });
  return NextResponse.json(mod);
}

export async function DELETE(_req: NextRequest, { params }: { params: { id: string } }) {
  const session = await requireAdminSession();
  if (!session) return NextResponse.json({ error: "Forbidden" }, { status: 403 });

  await prisma.module.delete({ where: { id: params.id } });
  return NextResponse.json({ ok: true });
}
