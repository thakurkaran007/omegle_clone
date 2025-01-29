"use client"

import { FcGoogle } from "react-icons/fc";
import { signIn } from "next-auth/react";
import { FaGithub } from "react-icons/fa";
import { Button } from "@repo/ui/src/components/button";
import { DEFAULT_LOGIN_REDIRECT } from "@/route";

export const Social = () => {
    const clickOn = (provider: "google" | "github") => {
        signIn(provider, {
            callbackUrl: DEFAULT_LOGIN_REDIRECT
        })
    }
    return (
        <div className="flex items-center space-x-4 w-full">
            <Button
                size="lg"
                className="w-full"
                variant="outline"
                onClick={() => clickOn("google")}
            >
                <FcGoogle/>
            </Button>
            <Button
                size="lg"
                className="w-full"
                variant="outline"
                onClick={() => clickOn("github")}
                >
                <FaGithub/>
            </Button>
        </div>
    )
}