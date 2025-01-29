import { useSession } from "next-auth/react"

export const getUser = () => {
    const session = useSession();
    return session.data?.user;
}