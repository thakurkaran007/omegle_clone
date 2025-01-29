"use client"

import { BackButton } from "../button/BackButton";
import { Header } from "../button/Header";
import { Social } from "../button/Social";
import { Card, CardContent, CardFooter, CardHeader } from "@repo/ui/src/components/card";

interface CardWrapperProps {
    children: React.ReactNode;
    headerLabel: string;
    backButtonLabel: string;
    backButtonhref: string;
    showSocial?: boolean;
}

export const CardWrapper = (
    { children, headerLabel, backButtonLabel, backButtonhref, showSocial }: CardWrapperProps
) => {
    return (    
        <Card className="w-[350px]">

            <CardHeader>
                <Header auth label={headerLabel}/>
            </CardHeader>
            <CardContent>
                {children}
            </CardContent>
            {
                showSocial && (
                    <CardFooter>
                        <Social/>
                    </CardFooter>
                )
            }
            <CardFooter className="flex justify-center ">
                <BackButton href={backButtonhref} label={backButtonLabel}/>
            </CardFooter>
        </Card>
    )
}