import { db } from "@repo/db/src";

export const getVerificationTokenByToken = async (token: string) => {
    try {
        const t = await db.verificationToken.findUnique({ where: { token } });
        return t;
    } catch (error) {
        return null;
    }
};
export const getVerificationTokenByEmail= async(email: string) => {
    try {
        const token = await db.verificationToken.findFirst({ where: { email } });
        return token;
    } catch (error) {
        return null;
    }
};