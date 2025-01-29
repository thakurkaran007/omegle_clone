"use client";

import { BeatLoader } from "react-spinners";
import { CardWrapper } from "./CardWrapper"
import { useSearchParams } from "next/navigation";
import { useCallback, useEffect, useState } from "react";
import { newVerification } from "@/actions/verification";
import { FormError, FormSuccess } from "./form-condition";

export const VerificationForm = () => {
    const searchParams = useSearchParams();
    const [success, setSuccess] = useState<string>("");
    const [error, setError] = useState<string>("");
    const token = searchParams.get("token") || '';

    const onSubmit = useCallback(() => {
        if (!token) {
            setError("Missing Token!");
            return;
        }
        newVerification(token)
            .then((res) => {
                if (res.success)  {
                    setSuccess(res.success);
                }
                if (res.error) setError(res.error);
            })
            .catch((e) => {
                setError(e.message);
            })
    }, [token]);

    useEffect(() => {
        onSubmit();
    }, [token, onSubmit]);
    return (
        <CardWrapper
            headerLabel="Confirm your verification"
            backButtonLabel="Back to login"
            backButtonhref="/auth/login"
        >   
            <div className="w-full flex justify-center items-center">
                { !success && !error && <BeatLoader /> }
                { success && !error && <FormSuccess message={success} /> }
                { error && !success && <FormError message={error} /> }
            </div>
        </CardWrapper>
    )
}