"use client"

import { BackButton } from "../button/BackButton"
import { Header } from "../button/Header"
import { Card, CardHeader } from "@repo/ui/src/components/card"

const ErrorCard = () => {
    return (
    <div>
        <Card className="w-96">
            <CardHeader>
                <Header label="Oops! Something Went Wrong"/>
                <div className="w-full flex items-center justify-center">
                </div>
                <BackButton label="Back to login" href="/auth/login" />
            </CardHeader>
        </Card>
    </div>
    )
}
export default ErrorCard;