"use server";

import { getVerificationTokenByEmail } from "@/data/verification-token";
import { db } from "@repo/db/src/index";
import bcrypt from "bcryptjs"

export const verifyOtp = async (otp: string, email: string) => {
    const token = await getVerificationTokenByEmail(email);
    if (token) {
        const actual = bcrypt.compare(token?.token, otp);
        if (!actual) {
        return { error: "Invalid OTP" };
        }  

        await db.verificationToken.delete({
            where: {
                id: token.id
            }
        })  

        return { success: "Verified" };
    }    
    return { error: "Token not found" };
}