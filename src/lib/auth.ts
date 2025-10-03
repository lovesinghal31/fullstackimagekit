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
          if (isPasswordCorrect) {
            return {
              id: user._id.toString(),
            };
          } else {
            throw new Error("Incorrect password");
          }
        } catch (error) {
          if (error instanceof Error) {
            throw new Error(error.message);
          }
          return null;
        }
      },
    }),
    GitHubProvider({
      clientId: process.env.GITHUB_ID,
      clientSecret: process.env.GITHUB_SECRET,
    }),
  ],
  callbacks: {
    async signIn({ user, account }) {
      if (account?.provider === "github") {
        await dbConnect();
        try {
          const existingUser = await UserModel.findOne({ email: user.email });
          if (!existingUser) {
            throw new Error("No user found with the provided email");
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
    async jwt({ token, user }) {
      if (user) {
        token.id = user.id;
      }
      return token;
    },
    async session({ session, token }) {
      if (token) {
        session.user.id = token.id as string;
      }
      return session;
    },
  },
  pages: {
    signIn: "/login",
    error: "/login",
  },
  session: {
    strategy: "jwt",
    maxAge: 30 * 24 * 60 * 60, // 30 days
  },
  secret: process.env.NEXTAUTH_SECRET,
};
