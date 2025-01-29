"use server"

import { getUserByEmail } from "@/data/user";
import { sendOtp } from "@/lib/mail"

export const send = async (email: string) => {
    try {
        const existingUser = await getUserByEmail(email);
        if (existingUser) return { error: "Email Already in use" };
        await sendOtp(email);
        return { success: "OTP sent" };
    } catch (error) {
        return { error }
    }
}