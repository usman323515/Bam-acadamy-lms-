import { NextRequest, NextResponse } from "next/server";
import { z } from "zod";
import { prisma } from "@/lib/prisma";
import { createPasswordResetToken } from "@/lib/tokens";
import { sendPasswordResetEmail } from "@/lib/email";

const schema = z.object({ email: z.string().email() });

export async function POST(req: NextRequest) {
  const body = await req.json();
  const parsed = schema.safeParse(body);
  if (!parsed.success) {
    return NextResponse.json({ error: "Please provide a valid email address" }, { status: 400 });
  }

  const user = await prisma.user.findUnique({ where: { email: parsed.data.email.toLowerCase().trim() } });

  // Always respond success to avoid leaking which emails are registered.
  if (user) {
    const token = await createPasswordResetToken(user.id);
    try {
      await sendPasswordResetEmail(user.email, user.name, token);
    } catch (err) {
      console.error("Failed to send reset email:", err);
    }
  }

  return NextResponse.json({ message: "If an account exists, a reset link has been sent." });
}
