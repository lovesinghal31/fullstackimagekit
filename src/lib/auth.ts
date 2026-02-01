import { NextAuthOptions, User } from "next-auth";
import CredentialsProvider from "next-auth/providers/credentials";
import GitHubProvider from "next-auth/providers/github";
import { dbConnect } from "./dbConnect";
import UserModel from "@/models/User";
import bcrypt from "bcryptjs";

if (!process.env.NEXTAUTH_SECRET) {
  throw new Error("NEXTAUTH_SECRET is not set");
}
if (!process.env.GITHUB_ID || !process.env.GITHUB_SECRET) {
  throw new Error("GitHub OAuth environment variables are not set");
}

interface Credentials {
  email: string;
  password: string;
}

export const authOptions: NextAuthOptions = {
  providers: [
    // ✅ Custom Email + Password Login
    CredentialsProvider({
      name: "Credentials",
      credentials: {
        email: { label: "Email", type: "text" },
        password: { label: "Password", type: "password" },
      },
      async authorize(
        credentials: Credentials | undefined
      ): Promise<User | null> {
        if (!credentials) {
          throw new Error("No credentials provided");
        }

        try {
          await dbConnect();
          const user = await UserModel.findOne({ email: credentials.email });
          if (!user) {
            throw new Error("No user found with the provided email");
          }

          const isPasswordCorrect = await bcrypt.compare(
            credentials.password,
            user.password
          );

          if (!isPasswordCorrect) {
            throw new Error("Incorrect password");
          }

          return { id: user._id.toString(), email: user.email };
        } catch (error) {
          if (error instanceof Error) throw new Error(error.message);
          return null;
        }
      },
    }),

    // ✅ GitHub OAuth Provider
    GitHubProvider({
      clientId: process.env.GITHUB_ID,
      clientSecret: process.env.GITHUB_SECRET,
    }),
  ],

  callbacks: {
    // ✅ GitHub Sign-in with Auto-Signup if new user
    async signIn({ user, account }) {
      await dbConnect();

      if (account?.provider === "github") {
        try {
          let existingUser = await UserModel.findOne({ email: user.email });

          // Auto-create user if not found (GitHub Signup)
          if (!existingUser) {
            existingUser = await UserModel.create({
              username: user.name || user.email?.split("@")[0],
              email: user.email,
              password: null, // OAuth users don't have passwords
              provider: "github",
              image: user.image,
            });
          }

          user.id = existingUser._id.toString();
          return true;
        } catch (error) {
          console.error("Error during GitHub sign in:", error);
          return false;
        }
      }

      return true;
    },

    // ✅ Add user ID to JWT
    async jwt({ token, user }) {
      if (user) {
        token.id = user.id;
      }
      return token;
    },

    // ✅ Add user ID to Session
    async session({ session, token }) {
      if (token && session.user) {
        session.user.id = token.id as string;
      }
      return session;
    },
  },

  // ✅ Custom pages
  pages: {
    signIn: "/login",
    error: "/login",
  },

  // ✅ Session Config
  session: {
    strategy: "jwt",
    maxAge: 30 * 24 * 60 * 60, // 30 days
  },

  secret: process.env.NEXTAUTH_SECRET,
};
