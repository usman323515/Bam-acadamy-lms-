import { NextRequest, NextResponse } from "next/server";
import { prisma } from "@/lib/prisma";
import { requireAdminSession } from "@/lib/admin";
import { deleteCloudinaryAsset } from "@/lib/cloudinary";

export async function PATCH(req: NextRequest, { params }: { params: { id: string } }) {
  const session = await requireAdminSession();
  if (!session) return NextResponse.json({ error: "Forbidden" }, { status: 403 });

  const body = await req.json();
  const lesson = await prisma.lesson.update({
    where: { id: params.id },
    data: {
      title: body.title, description: body.description, type: body.type,
      videoUrl: body.videoUrl, videoPublicId: body.videoPublicId,
      pdfUrl: body.pdfUrl, pdfPublicId: body.pdfPublicId,
      textContent: body.textContent, durationSec: body.durationSec, order: body.order,
    },
  });
  return NextResponse.json(lesson);
}

export async function DELETE(_req: NextRequest, { params }: { params: { id: string } }) {
  const session = await requireAdminSession();
  if (!session) return NextResponse.json({ error: "Forbidden" }, { status: 403 });

  const lesson = await prisma.lesson.findUnique({ where: { id: params.id } });
  if (lesson) {
    if (lesson.videoPublicId) await deleteCloudinaryAsset(lesson.videoPublicId, "video").catch(() => {});
    if (lesson.pdfPublicId) await deleteCloudinaryAsset(lesson.pdfPublicId, "raw").catch(() => {});
  }
  await prisma.lesson.delete({ where: { id: params.id } });
  return NextResponse.json({ ok: true });
}
