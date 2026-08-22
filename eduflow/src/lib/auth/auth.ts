import NextAuth from "next-auth";
import Credentials from "next-auth/providers/credentials";
import { PrismaAdapter } from "@auth/prisma-adapter";
import { prisma } from "../db/prisma";
import bcrypt from "bcryptjs";

// Ensure AUTH_SECRET is set in environment (No fallback string permitted)
if (!process.env.AUTH_SECRET) {
  throw new Error("AUTH_SECRET environment variable is required");
}

// In-Memory Login Rate Limiter (Failed Attempts Tracker)
interface FailedAttemptRecord {
  count: number;
  lockedUntil: number;
}

const failedAttemptsStore = new Map<string, FailedAttemptRecord>();
const MAX_FAILED_ATTEMPTS = 5;
const LOCKOUT_DURATION_MS = 15 * 60 * 1000; // 15 minutes

export const { handlers, signIn, signOut, auth } = NextAuth({
  adapter: PrismaAdapter(prisma),
  session: {
    strategy: "jwt",
  },
  providers: [
    Credentials({
      name: "Credentials",
      credentials: {
        email: { label: "Email", type: "email" },
        password: { label: "Password", type: "password" },
      },
      async authorize(credentials) {
        if (!credentials?.email || !credentials?.password) {
          return null;
        }

        const email = String(credentials.email).toLowerCase().trim();
        const password = String(credentials.password);

        // Rate Limiting & Account Lockout Check
        const now = Date.now();
        const attemptRecord = failedAttemptsStore.get(email);

        if (attemptRecord && attemptRecord.lockedUntil > now) {
          const remainingMins = Math.ceil((attemptRecord.lockedUntil - now) / 60000);
          console.warn(`[SECURITY] Rate limit triggered for email ${email}. Locked out for ${remainingMins} more minute(s).`);
          throw new Error(`Too many failed login attempts. Please try again in ${remainingMins} minute(s).`);
        }

        const user = await prisma.user.findUnique({
          where: { email },
        });

        if (!user || !user.passwordHash) {
          recordFailedAttempt(email, now);
          return null;
        }

        const isValid = await bcrypt.compare(password, user.passwordHash);
        if (!isValid) {
          recordFailedAttempt(email, now);
          return null;
        }

        // Reset failed attempt count upon successful authentication
        failedAttemptsStore.delete(email);

        return {
          id: user.id,
          name: user.name,
          email: user.email,
          role: user.role,
          instituteId: user.instituteId,
          image: user.avatarUrl,
        };
      },
    }),
  ],
  callbacks: {
    async jwt({ token, user }) {
      if (user) {
        token.id = user.id;
        token.role = (user as { role?: string }).role;
        token.instituteId = (user as { instituteId?: string }).instituteId;
      }
      return token;
    },
    async session({ session, token }) {
      if (token && session.user) {
        session.user.id = token.id as string;
        session.user.role = token.role as string;
        session.user.instituteId = token.instituteId as string;
      }
      return session;
    },
  },
  pages: {
    signIn: "/login",
  },
  secret: process.env.AUTH_SECRET,
});

function recordFailedAttempt(email: string, now: number) {
  const current = failedAttemptsStore.get(email) || { count: 0, lockedUntil: 0 };
  const newCount = current.count + 1;

  if (newCount >= MAX_FAILED_ATTEMPTS) {
    failedAttemptsStore.set(email, {
      count: newCount,
      lockedUntil: now + LOCKOUT_DURATION_MS,
    });
    console.warn(`[SECURITY] Account ${email} locked out due to ${newCount} failed login attempts.`);
  } else {
    failedAttemptsStore.set(email, {
      count: newCount,
      lockedUntil: 0,
    });
  }
}
