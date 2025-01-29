"use client"

import { Avatar, AvatarFallback, AvatarImage } from "@radix-ui/react-avatar"
import { Button } from "@repo/ui/src/components/button"
import { useSession, signOut } from "next-auth/react"
import { Skeleton } from "@repo/ui/src/components/skeleton"
import { FaUser } from "react-icons/fa"
import { useRouter } from "next/navigation"

export function AppBar() {
  const { data: session, status } = useSession();
  const router = useRouter();

  return (
    <header className="w-full px-6 py-4 shadow-md bg-white flex items-center justify-between">
      <h1 className="font-bold tracking-wide hover: cursor-pointer" onClick={() => router.push("/home")}><span className="text-sky-400 text-4xl">𝛀</span> <span className="text-orange-600 text-3xl ">Omegle</span></h1>
      <div className="flex items-center gap-4">
        {status === "loading" ? (
          <Skeleton className="w-36 h-10 rounded-lg" />
        ) : session?.user ? (
          <div className="flex items-center gap-3">
            <Avatar className="w-10 h-10 border border-gray-300 shadow-md rounded-3xl hover: cursor-pointer">
              <AvatarImage src={session.user.image || "/default-avatar.png"} alt="User" />
              <AvatarFallback className="flex items-center justify-center w-full h-full bg-gray-100 rounded-3xl">
                <FaUser className=""/>
              </AvatarFallback>
            </Avatar>
            <span className="text-sm font-medium text-gray-800">{session.user.name}</span>
            <Button
              size="sm"
              className="px-4 rounded-lg"
              onClick={() => signOut()}
            >
              Logout
            </Button>
          </div>
        ) : (
          <Button asChild>
            <a href="/api/auth/signin">Login</a>
          </Button>
        )}
      </div>
    </header>
  )
}
