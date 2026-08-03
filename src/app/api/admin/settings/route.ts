import { NextRequest, NextResponse } from "next/server";
import { prisma } from "@/lib/prisma";
import { requireAdminSession } from "@/lib/admin";

export async function GET() {
  const session = await requireAdminSession();
  if (!session) return NextResponse.json({ error: "Forbidden" }, { status: 403 });

  const settings = await prisma.siteSettings.upsert({
    where: { id: "singleton" },
    update: {},
    create: { id: "singleton" },
  });
  return NextResponse.json(settings);
}

export async function PATCH(req: NextRequest) {
  const session = await requireAdminSession();
  if (!session) return NextResponse.json({ error: "Forbidden" }, { status: 403 });

  const body = await req.json();
  const settings = await prisma.siteSettings.upsert({
    where: { id: "singleton" },
    update: {
      siteName: body.siteName, supportEmail: body.supportEmail,
      logoUrl: body.logoUrl, maintenanceMode: body.maintenanceMode,
    },
    create: { id: "singleton", ...body },
  });
  return NextResponse.json(settings);
}
