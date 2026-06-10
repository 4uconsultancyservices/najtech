import NextAuth from 'next-auth';
import CredentialsProvider from 'next-auth/providers/credentials';
import GoogleProvider from 'next-auth/providers/google';
import { connectDB } from '@/lib/db/mongoose';
import User from '@/models/User';
import { authConfig as baseConfig } from './auth.config';

export const { handlers, auth, signIn, signOut } = NextAuth({
  ...baseConfig,
  providers: [
    CredentialsProvider({
      name: 'credentials',
      credentials: {
        email: { label: 'Email', type: 'email' },
        password: { label: 'Password', type: 'password' },
      },
      async authorize(credentials) {
        if (!credentials?.email || !credentials?.password) {
          throw new Error('Invalid credentials');
        }

        await connectDB();
        console.log(credentials)
        
        const user = await User.findOne({
          email: credentials.email,
          isActive: true,
        }).select('+password');

        if (!user || !user.password) {
          throw new Error('Invalid email or password');
        }

        const isValid = await user.comparePassword(credentials.password as string);
        if (!isValid) {
          throw new Error('Invalid email or password');
        }

        await User.findByIdAndUpdate(user._id, { lastLogin: new Date() });

        return {
          id: user._id.toString(),
          email: user.email,
          name: user.name,
          role: user.role,
          image: user.avatar || null,
        };
      },
    }),
    ...(process.env.AUTH_GOOGLE_ID
      ? [
          GoogleProvider({
            clientId: process.env.AUTH_GOOGLE_ID!,
            clientSecret: process.env.AUTH_GOOGLE_SECRET!,
          }),
        ]
      : []),
  ],
  callbacks: {
    ...baseConfig.callbacks,
    async signIn({ user, account }) {
      if (account?.provider === 'google') {
        await connectDB();
        const existingUser = await User.findOne({ email: user.email });
        if (!existingUser) {
          await User.create({
            name: user.name,
            email: user.email,
            avatar: user.image,
            isEmailVerified: true,
            role: 'student',
          });
        }
      }
      return true;
    },
  },
});
