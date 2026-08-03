import { NextAuthOptions } from "next-auth";
import CredentialsProvider from "next-auth/providers/credentials";
import { prisma } from "./prisma";
import { verifyPassword } from "./password";

export const authOptions: NextAuthOptions = {
  session: { strategy: "jwt", maxAge: 30 * 24 * 60 * 60 },
  pages: { signIn: "/login" },
  providers: [
    CredentialsProvider({
      name: "credentials",
      credentials: {
        email: { label: "Email", type: "email" },
        password: { label: "Password", type: "password" },
      },
      async authorize(credentials, req) {
        if (!credentials?.email || !credentials?.password) {
          throw new Error("Email and password are required");
        }
        const user = await prisma.user.findUnique({
          where: { email: credentials.email.toLowerCase().trim() },
        });
        if (!user) throw new Error("No account found with this email");
        if (!user.emailVerified) throw new Error("Please verify your email before logging in");
        if (user.isBlocked) throw new Error("Your account has been blocked. Contact support.");

        const valid = await verifyPassword(credentials.password, user.passwordHash);
        if (!valid) throw new Error("Incorrect password");

        const forwardedFor = req?.headers?.["x-forwarded-for"] as string | undefined;
        await prisma.loginEvent.create({
          data: {
            userId: user.id,
            ipAddress: forwardedFor?.split(",")[0]?.trim() || null,
            userAgent: (req?.headers?.["user-agent"] as string) || null,
          },
        });

        return {
          id: user.id,
          name: user.name,
          email: user.email,
          role: user.role,
          image: user.avatarUrl || undefined,
        };
      },
    }),
  ],
  callbacks: {
    async jwt({ token, user, trigger, session }) {
      if (user) {
        token.id = (user as any).id;
        token.role = (user as any).role;
      }
      if (trigger === "update") {
        const fresh = await prisma.user.findUnique({ where: { id: token.id as string } });
        if (fresh) {
          token.name = fresh.name;
          token.picture = fresh.avatarUrl || undefined;
        }
      }
      return token;
    },
    async session({ session, token }) {
      if (session.user) {
        (session.user as any).id = token.id;
        (session.user as any).role = token.role;
      }
      return session;
    },
  },
  secret: process.env.NEXTAUTH_SECRET,
};
