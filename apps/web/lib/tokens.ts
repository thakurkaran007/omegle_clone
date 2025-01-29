import { getVerificationTokenByEmail } from '@/data/verification-token';
import { v4 as uuidv4 } from 'uuid';
import { db } from '@repo/db/src';
export const generatetVerificationToken = async (email: string) => {   
    const token = uuidv4();
    const expires = new Date(new Date().getTime() + 3600 * 1000);

    const existingToken = await getVerificationTokenByEmail(email);
    if (existingToken) {
        await db.verificationToken.delete({
            where: {
                id: existingToken.id
            }
        })
    }
    const verificationtToken = await db.verificationToken.create({
        data: {
            token,
            expires,
            email
        }
    });
    return verificationtToken;
}