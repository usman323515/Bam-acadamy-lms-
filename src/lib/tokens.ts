import crypto from "crypto";
import { prisma } from "./prisma";

const VERIFICATION_TTL_HOURS = 24;
const RESET_TTL_MINUTES = 60;

export function generateToken(): string {
  return crypto.randomBytes(32).toString("hex");
}

export async function createVerificationToken(userId: string) {
  const token = generateToken();
  const expiresAt = new Date(Date.now() + VERIFICATION_TTL_HOURS * 60 * 60 * 1000);
  await prisma.verificationToken.create({ data: { token, userId, expiresAt } });
  return token;
}

export async function createPasswordResetToken(userId: string) {
  const token = generateToken();
  const expiresAt = new Date(Date.now() + RESET_TTL_MINUTES * 60 * 1000);
  await prisma.passwordResetToken.create({ data: { token, userId, expiresAt } });
  return token;
}

export function generateCertificateNumber(): string {
  const rand = crypto.randomBytes(4).toString("hex").toUpperCase();
  const year = new Date().getFullYear();
  return `BAM-${year}-${rand}`;
}
