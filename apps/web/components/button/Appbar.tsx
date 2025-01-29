"use client";

import { Button } from "@repo/ui/src/components/button";
import { signOut } from "next-auth/react";


const AppBar = () => {
    return <div className="flex justify-between border-b-black px-4">
        <div className="flex flex-col justify-center text-lg">
            PayTM
        </div>
        <div className="flex flex-col justify-center pt-2 pb-2">
            <Button onClick={() => signOut()}>Logout</Button>
        </div>
    </div>
}
export default AppBar;