"use client";

import { useRouter } from "next/navigation";

interface LoginButtonProps {
    children: React.ReactNode;  
}

export const LoginButton = ({ children }: LoginButtonProps) => {
    const router = useRouter();
    const click = () => {
        router.push("/auth/login");
    }
    return (
        <span className="cursor-pointer" onClick={click}>{children}</span>
    );
};  