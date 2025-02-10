"use server";

import { getUserByEmail } from "@/data/user";
import { sendOtp } from "@/lib/mail";

export const send = async (email: string, token: string) => {
    const RECAPTCHA_SECRET_KEY = process.env.RECAPTCHA_SECRET_KEY!;

    try {
        // Verify reCAPTCHA
        const response = await fetch(
            "https://challenges.cloudflare.com/turnstile/v0/siteverify",
            {
                method: "POST",
                headers: { "Content-Type": "application/x-www-form-urlencoded" },
                body: new URLSearchParams({
                    secret: RECAPTCHA_SECRET_KEY,
                    response: token,
                }),
            }
        );

        const { success } = await response.json();
        if (!success) return { error: "Captcha verification failed" };

        // Check if user exists
        if (await getUserByEmail(email)) {
            return { error: "Email already in use" };
        }

        // Send OTP
        await sendOtp(email);
        return { success: "OTP sent" };
    } catch (error) {
        return { error: "Something went wrong" };
    }
};
