import { Resend } from "resend";
import bcrypt from "bcryptjs";
import { getVerificationTokenByEmail } from "@/data/verification-token";
import { db } from "@repo/db/src";

const resend = new Resend(process.env.RESEND_KEY);

export const sendVerificationMail = async (email: string, token: string) => {
    const confirmLink = `${process.env.DOMAIN}:3000/auth/new-verification?token=${token}`;
    const htmlContent = `
        <div style="font-family: Arial, sans-serif; max-width: 600px; margin: auto;">
            <h1 style="text-align: center; color: #4CAF50;">Confirm Your Email</h1>
            <p>Hi,</p>
            <p>Thanks for signing up! Please confirm your email address by clicking the link below:</p>
            <a href="${confirmLink}" style="display: inline-block; background-color: #4CAF50; color: white; padding: 10px 20px; text-decoration: none; border-radius: 5px;">Confirm Email</a>
            <p>If you didn’t sign up for this account, please ignore this email.</p>
            <p>Thanks,<br>The Team</p>
        </div>
    `;

    await resend.emails.send({
        from: "thakurkaran0345@gmail.com",
        to: email,
        subject: "Confirm Your Email",
        html: htmlContent,
    });
};

export const sendOtp = async (email: string) => {
    const otp = Math.floor(100000 + Math.random() * 900000).toString();
    const hashedOtp = await bcrypt.hash(otp, 10);
    const expires = new Date(new Date().getTime() + 60 * 1000); // Expires in 1 minute

    const existingToken = await getVerificationTokenByEmail(email);
    if (existingToken) {
        await db.verificationToken.delete({
            where: {
                id: existingToken.id,
            },
        });
    }

    await db.verificationToken.create({
        data: {
            token: hashedOtp,
            expires,
            email,
        },
    });

    const htmlContent = `
        <div style="font-family: Arial, sans-serif; max-width: 600px; margin: auto;">
            <h1 style="text-align: center; color: #4CAF50;">Your OTP Code</h1>
            <p>Hi,</p>
            <p>Your one-time password (OTP) for verification is:</p>
            <p style="font-size: 24px; font-weight: bold; text-align: center; color: #333;">${otp}</p>
            <p>This code is valid for 1 minute. If you didn’t request this, please ignore this email.</p>
            <p>Thanks,<br>The Team</p>
        </div>
    `;

    await resend.emails.send({
        from: "thakurkaran0345@gmail.com",
        to: email,
        subject: "Your OTP Code",
        html: htmlContent,
    });
};
