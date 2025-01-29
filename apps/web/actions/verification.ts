"use server"

import { getUserByEmail } from "@/data/user";
import { getVerificationTokenByToken } from "@/data/verification-token"
import { db } from "@repo/db/src/index";

export const newVerification = async (token: string) => {
    const existingToken = await getVerificationTokenByToken(token);
    if (!existingToken)  {
        return { error: "Token not found" }
    }
    const hasExpired = new Date(existingToken.expires) < new Date();

    if (hasExpired) {
        return { error: "Token has expired" }
    }

    const user = await getUserByEmail(existingToken.email);
    if (!user) {
        return { error: "User not found" }
    }

    await db.user.update({
        where: {
            id: user.id
        },
        data: {
            emailVerified: new Date(),
            email: existingToken.email
        }
    })
    await db.verificationToken.delete({
        where: {
            id: existingToken.id
        }
    })
    return { success: "Email Verified" };
}