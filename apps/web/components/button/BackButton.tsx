"use client";

import Link from "next/link";
import { Button } from "@repo/ui/src/components/button";

interface backButtonProps {
    label: string;
    href: string;
}

export const BackButton = ({label, href}: backButtonProps) => {    
    return (
        <Button variant={"link"}>
            <Link href={href}>{label}</Link>
        </Button>
    )
}