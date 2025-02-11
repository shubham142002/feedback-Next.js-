import { NextAuthOptions } from 'next-auth';
import CredentialsProvider from 'next-auth/providers/credentials';
import bcrypt from 'bcryptjs';
import dbConnect from '@/lib/dbConnect';
import UserModel from '@/model/User';
import { User } from 'next-auth';

interface DbUser {
  _id: string;
  email: string;
  username: string;
  password: string;
  isVerified: boolean;
  image?: string;
}

export const authOptions: NextAuthOptions = {
  providers: [
    CredentialsProvider({
      id: 'credentials',
      name: 'Credentials',
      credentials: {
        email: { label: 'Email', type: 'text' },
        password: { label: 'Password', type: 'password' },
      },
      async authorize(
        credentials: Record<"email" | "password", string> | undefined
      ): Promise<User | null> {
        if (!credentials) return null;
        await dbConnect();
        try {
          const user = await UserModel.findOne({
            $or: [
              { email: credentials.email },
              { username: credentials.email },
            ],
          }).lean() as DbUser | null;
          
          if (!user) return null;
          if (!user.isVerified) {
            throw new Error('Please verify your account before logging in');
          }
          const isPasswordCorrect = await bcrypt.compare(
            credentials.password,
            user.password
          );
          if (isPasswordCorrect) {
            return {
              id: user._id.toString(),
              email: user.email,
              name: user.username,
              image: user.image
            };
          }
          return null;
        } catch (err: unknown) {
          throw new Error(err instanceof Error ? err.message : 'Authentication error');
        }
      },
    }),
  ],
  callbacks: {
    async jwt({ token, user }) {
      if (user) {
        token._id = user._id?.toString() || token._id;
        token.isVerified = user.isVerified ?? token.isVerified;
        token.isAcceptingMessages = user.isAcceptingMessages ?? token.isAcceptingMessages;
        token.username = user.username || token.username;
      }
      return token;
    },
    async session({ session, token }) {
      if (session.user && token) {
        session.user._id = token._id;
        session.user.isVerified = token.isVerified;
        session.user.isAcceptingMessages = token.isAcceptingMessages;
        session.user.username = token.username;
      }
      return session;
    },
  },
  session: {
    strategy: 'jwt',
  },
  secret: process.env.NEXTAUTH_SECRET,
  pages: {
    signIn: '/sign-in',
  },
};
