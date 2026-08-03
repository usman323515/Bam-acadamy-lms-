import { NextRequest, NextResponse } from "next/server";
import { requireAdminSession } from "@/lib/admin";
import { generateUploadSignature } from "@/lib/cloudinary";

// Returns a signed payload the browser uses to upload directly to Cloudinary
// (video, PDF, or thumbnail), so large files never pass through our server.
export async function POST(req: NextRequest) {
  const session = await requireAdminSession();
  if (!session) return NextResponse.json({ error: "Forbidden" }, { status: 403 });

  const { folder } = await req.json();
  const targetFolder = folder && typeof folder === "string" ? folder : "bam-academy";

  const { signature, timestamp, apiKey, cloudName } = generateUploadSignature({ folder: targetFolder });

  return NextResponse.json({ signature, timestamp, apiKey, cloudName, folder: targetFolder });
}
