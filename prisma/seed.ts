import { PrismaClient } from "@prisma/client";
import bcrypt from "bcryptjs";

const prisma = new PrismaClient();

// Preserved from the original BAM Academy course structure. All old Google Drive
// video/PDF links have been intentionally removed — the admin uploads real lesson
// content (video/PDF) for each module from the Admin Dashboard after seeding.
const MODULES = [
  { title: "Introduction", icon: "fa-flag", colorTag: "blue", description: "Get oriented: what BAM Academy covers and how to get the most out of the program." },
  { title: "Affiliate Marketing Platforms", icon: "fa-link", colorTag: "purple", description: "Explore the affiliate platforms available and how to choose profitable products to promote." },
  { title: "WhatsApp Setup", icon: "fa-whatsapp", colorTag: "gold", description: "Set up WhatsApp Business, broadcast lists, and your product catalog for daily sales." },
  { title: "Understand Your Audience", icon: "fa-users", colorTag: "pink", description: "Learn who you're selling to and how to speak to their needs directly." },
  { title: "Graphic Design With PixelLab", icon: "fa-palette", colorTag: "orange", description: "Create scroll-stopping graphics for your promotions using PixelLab." },
  { title: "Facebook & Instagram Advert", icon: "fa-hashtag", colorTag: "blue", description: "Run and optimize Facebook & Instagram ad campaigns that convert." },
  { title: "TikTok Advert", icon: "fa-music", colorTag: "teal", description: "Master short-form video advertising and organic reach on TikTok." },
  { title: "CapCut Editing", icon: "fa-scissors", colorTag: "red", description: "Edit professional, mobile-shot marketing videos using CapCut." },
  { title: "BAM Monetization", icon: "fa-sack-dollar", colorTag: "gold", description: "Turn everything you've learned into consistent, scalable income." },
  { title: "Completion / Certificate", icon: "fa-award", colorTag: "green", description: "Wrap up the program and claim your BAM Academy certificate." },
];

async function main() {
  await prisma.siteSettings.upsert({
    where: { id: "singleton" },
    update: {},
    create: { id: "singleton", siteName: "BAM Academy", supportEmail: "support@bamacademy.com" },
  });

  const adminEmail = process.env.SEED_ADMIN_EMAIL || "admin@bamacademy.com";
  const adminPassword = process.env.SEED_ADMIN_PASSWORD || "ChangeMe123!";
  const adminHash = await bcrypt.hash(adminPassword, 12);

  await prisma.user.upsert({
    where: { email: adminEmail },
    update: {},
    create: {
      name: "BAM Admin",
      email: adminEmail,
      passwordHash: adminHash,
      role: "ADMIN",
      emailVerified: new Date(),
    },
  });

  const course = await prisma.course.upsert({
    where: { slug: "bam-business-african-marketing" },
    update: {},
    create: {
      title: "BAM Business African Marketing",
      slug: "bam-business-african-marketing",
      description: "The complete BAM Academy program — from affiliate marketing fundamentals to monetization, built for the English and Hausa-speaking market.",
      colorTag: "green",
      isPublished: true,
      order: 0,
    },
  });

  for (let i = 0; i < MODULES.length; i++) {
    const m = MODULES[i];
    const existing = await prisma.module.findFirst({ where: { courseId: course.id, title: m.title } });
    if (!existing) {
      await prisma.module.create({
        data: { courseId: course.id, order: i, ...m },
      });
    }
  }

  console.log("Seed complete.");
  console.log(`Admin login -> email: ${adminEmail}  password: ${adminPassword}`);
  console.log("Change this password immediately after first login.");
}

main()
  .catch((e) => {
    console.error(e);
    process.exit(1);
  })
  .finally(async () => {
    await prisma.$disconnect();
  });
