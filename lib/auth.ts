import NextAuth from "next-auth";
import { PrismaAdapter } from "@auth/prisma-adapter";
import GitHub from "next-auth/providers/github";
import Google from "next-auth/providers/google";
import Credentials from "next-auth/providers/credentials";
import { prisma } from "@/lib/prisma";

export const { handlers, auth, signIn, signOut } = NextAuth({
  adapter: PrismaAdapter(prisma),
  session: { strategy: "jwt" },
  providers: [
    GitHub({
      clientId: process.env.GITHUB_CLIENT_ID,
      clientSecret: process.env.GITHUB_CLIENT_SECRET,
    }),
    Google({
      clientId: process.env.GOOGLE_CLIENT_ID,
      clientSecret: process.env.GOOGLE_CLIENT_SECRET,
    }),
    // Development credentials provider
    Credentials({
      name: "Demo Account",
      credentials: {
        email: { label: "Email", type: "email", placeholder: "demo@example.com" },
      },
      async authorize(credentials) {
        if (!credentials?.email) return null;

        const email = credentials.email as string;

        // Find or create demo user
        let user = await prisma.user.findUnique({
          where: { email },
        });

        if (!user) {
          const baseUsername = email.split("@")[0].toLowerCase().replace(/[^a-z0-9]/g, "");
          user = await prisma.user.create({
            data: {
              email,
              name: baseUsername.charAt(0).toUpperCase() + baseUsername.slice(1),
              username: baseUsername,
            },
          });
        }

        return {
          id: user.id,
          email: user.email,
          name: user.name,
          image: user.image,
        };
      },
    }),
  ],
  pages: {
    signIn: "/login",
    error: "/login",
  },
  callbacks: {
    async jwt({ token, user }) {
      if (user) {
        token.id = user.id;
      }
      return token;
    },
    async session({ session, token }) {
      if (session.user && token.id) {
        session.user.id = token.id as string;
        // Fetch additional user data
        const dbUser = await prisma.user.findUnique({
          where: { id: token.id as string },
          select: { username: true },
        });
        if (dbUser?.username) {
          session.user.username = dbUser.username;
        }
      }
      return session;
    },
  },
  events: {
    async createUser({ user }) {
      // Generate a unique username from email or name
      if (user.email) {
        const baseUsername = user.email.split("@")[0].toLowerCase().replace(/[^a-z0-9]/g, "");
        let username = baseUsername;
        let counter = 1;

        while (await prisma.user.findUnique({ where: { username } })) {
          username = `${baseUsername}${counter}`;
          counter++;
        }

        await prisma.user.update({
          where: { id: user.id },
          data: { username },
        });
      }
    },
  },
});

// Extend the session types
declare module "next-auth" {
  interface Session {
    user: {
      id: string;
      name?: string | null;
      email?: string | null;
      image?: string | null;
      username?: string | null;
    };
  }
}
