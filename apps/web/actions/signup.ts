"use server";

import { db } from "@repo/db/src/index";
import bcrypt from "bcryptjs";
import { SignUpSchema } from "@/schema";
import * as z from "zod";

const signup = async(values: z.infer<typeof SignUpSchema>) => {
    const validation = SignUpSchema.safeParse(values);
    if (!validation.success) {
        return { error: "Invalid input" };
    }

    const { email, password1, password2, name } = validation.data;
    
    if (password1 !== password2) {
        return { error: "Passwords do not match" };
    }
    const hashedPassword = await bcrypt.hash(password1, 10);
    const user = await db.user.create({
        data: {
            name,
            email,
            password: hashedPassword
        }
    })
    return { success: "Account Created Successfully!" };
}

export default signup;