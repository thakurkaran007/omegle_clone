import Credentials from "next-auth/providers/credentials";
import type { NextAuthConfig } from "next-auth";
import { LoginSchema } from "./schema";
import { getUserByEmail } from "./data/user";
import bcrypt from 'bcryptjs';
import Github from "next-auth/providers/github";
import Google from "next-auth/providers/google";

const authConfig: NextAuthConfig = {
    providers: [
        Github({
            clientId: process.env.GITHUB_ID,
            clientSecret: process.env.GITHUB_SECRET
        }),
        Google({
            clientId: process.env.GOOGLE_ID,
            clientSecret: process.env.GOOGLE_SECRET
        }),
        Credentials({
            async authorize(credentials) {
                const validation = LoginSchema.safeParse(credentials);
                if (validation.success) {
                    const { email, password } = validation.data;

                    const user = await getUserByEmail(email);
                    if (!user || !user.password) return null;

                    const passMatch = await bcrypt.compare(password, user.password);
                    if (passMatch) {
                        return user;
                    }
                    return null;    
                }
                return null;
            }
        })
    ],
};

export default authConfig;