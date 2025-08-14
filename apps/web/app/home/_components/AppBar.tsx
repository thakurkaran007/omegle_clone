import { auth } from "@/auth";
import { AppBarClient } from "./AppBarClient";


export const AppBar = async () => {
    const session = await auth();
    return <AppBarClient session={session} status={session ? "authenticated" : "unauthenticated"} />;
}
