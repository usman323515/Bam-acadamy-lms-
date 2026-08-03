# BAM Academy — Learning Management System

A production-ready LMS rebuilt from scratch for MM Empire Academy: Next.js 14 (App Router) + TypeScript + PostgreSQL + Prisma + Auth.js + Resend + Cloudinary.

The app opens directly to `/login`. There is no home, about, pricing, contact, testimonials, or FAQ page, per spec.

## What's preserved from the old site

The old project was a single static `index.html` landing page. Before rebuilding, its course structure was extracted and carried forward as seed data:

- The 10 modules (Introduction → Affiliate Marketing Platforms → WhatsApp Setup → Understand Your Audience → Graphic Design With PixelLab → Facebook & Instagram Advert → TikTok Advert → CapCut Editing → BAM Monetization → Completion/Certificate), in order, with their icons and color tags.
- The visual identity: dark navy background, green/gold/blue/purple accent palette, Poppins (display) + Inter (body).

**Every old Google Drive video/PDF link and every WhatsApp/Telegram community link from the old site has been removed.** Lesson content is now 100% database-driven — the admin uploads real videos/PDFs per lesson from the Admin Dashboard (direct-to-Cloudinary signed upload), and nothing is hardcoded in the code.

## Tech stack

- **Next.js 14 (App Router) + TypeScript**
- **PostgreSQL + Prisma ORM**
- **Auth.js (NextAuth v4)** — credentials provider, JWT sessions, role-based middleware
- **Resend** — verification emails, password reset emails, announcement emails
- **Cloudinary** — video/PDF/thumbnail storage via signed direct-from-browser uploads
- **Tailwind CSS**, **Recharts** (analytics), **react-hot-toast**

## Getting started

1. **Install dependencies**
   ```bash
   npm install
   ```

2. **Provision a Postgres database.** Any of these work: [Neon](https://neon.tech), [Supabase](https://supabase.com), [Railway](https://railway.app), or a local Postgres instance.

3. **Copy the env file and fill in real values**
   ```bash
   cp .env.example .env
   ```
   - `DATABASE_URL` — your Postgres connection string
   - `NEXTAUTH_SECRET` — generate with `openssl rand -base64 32`
   - `NEXTAUTH_URL` / `NEXT_PUBLIC_APP_URL` — `http://localhost:3000` locally, your real domain in production
   - `RESEND_API_KEY`, `EMAIL_FROM` — from [resend.com](https://resend.com); verify your sending domain there
   - `CLOUDINARY_CLOUD_NAME`, `CLOUDINARY_API_KEY`, `CLOUDINARY_API_SECRET` — from your [Cloudinary dashboard](https://cloudinary.com)

4. **Push the schema and seed the database**
   ```bash
   npm run db:push
   SEED_ADMIN_EMAIL=you@yourdomain.com SEED_ADMIN_PASSWORD="SomeStrongPass1" npm run db:seed
   ```
   This creates the admin account, site settings, the "BAM Business African Marketing" course, and the 10 modules (empty — ready for you to fill with lessons). If you skip the env vars it defaults to `admin@bamacademy.com` / `ChangeMe123!` — **change that password immediately after your first login** via Admin → Settings.

5. **Run it**
   ```bash
   npm run dev
   ```
   Visit `http://localhost:3000` — it redirects straight to `/login`.

## Adding lesson content

Log in as admin → **Courses** → **Manage** on a course → expand a module → **Add Lesson**. Pick Video, PDF, or Text, upload the file (goes straight to Cloudinary, signed by your server), and save. Nothing needs a code deploy — content is fully database-driven.

## Deploying

- **App**: Vercel is the simplest target for Next.js. Set all the env vars above in the Vercel project settings.
- **Database**: Neon or Supabase both work well with Vercel's serverless functions.
- Run `npm run db:push` (or `prisma migrate deploy` if you set up migrations) against your production database before first use, then run the seed script once.
- Add your production domain to `NEXTAUTH_URL` / `NEXT_PUBLIC_APP_URL` and to Resend's verified domains so verification/reset emails send from your own domain instead of a shared one.

## Project structure

```
prisma/schema.prisma       All models: User, Course, Module, Lesson, Enrollment,
                            LessonProgress, Certificate, Notification, Announcement,
                            LoginEvent, VerificationToken, PasswordResetToken, SiteSettings
prisma/seed.ts              Seeds admin user + the 10 preserved modules

src/lib/                    auth.ts (NextAuth config), prisma.ts, email.ts (Resend),
                            cloudinary.ts (signed uploads), password.ts, tokens.ts,
                            colorTags.ts (static Tailwind class map), admin.ts (guard)
src/middleware.ts           Route protection + role-based redirects

src/app/(auth)/             login, register, verify-email, forgot-password, reset-password
src/app/(student)/          dashboard, courses, courses/[courseId] (viewer), certificates,
                            profile, settings
src/app/admin/              dashboard, students, students/[id], courses,
                            courses/[courseId] (module/lesson manager), announcements,
                            analytics, settings
src/app/api/                Mirrors the above: auth/*, student/*, admin/*, notifications

src/components/             Shared UI: sidebars, topbar, notification bell, file upload,
                            course viewer
src/components/admin/       Course/module/lesson management UI
```

## Notes on the current build

- I don't have a live database/Resend/Cloudinary connection where this was built, so it hasn't been run through a real `npm run build` — the code was written and manually reviewed for correctness (imports, Prisma key names, client/server boundaries), but do a normal first-run check (`npm run build`) before deploying and let me know if anything surfaces.
- Broadcast ("all students") notifications are stored as a single shared row rather than a per-user row, so the bell treats them as read for that browser session rather than persisting read-state per student — a join table would be the next step if you want durable per-user read receipts at scale.
- Certificates are generated as a styled, printable HTML page (Print → Save as PDF) rather than a server-rendered PDF file, to avoid pulling in a heavy PDF-generation dependency for the MVP.
