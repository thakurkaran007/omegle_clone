"use client"

import { Avatar, AvatarFallback, AvatarImage } from "@radix-ui/react-avatar"
import { Button } from "@repo/ui/src/components/button"
import { useSession, signOut } from "next-auth/react"
import { Skeleton } from "@repo/ui/src/components/skeleton"
import { FaUser, FaEye, FaUpload } from "react-icons/fa"
import { useRouter } from "next/navigation"
import {
  DropdownMenu,
  DropdownMenuContent,
  DropdownMenuTrigger,
  DropdownMenuItem,
} from "@radix-ui/react-dropdown-menu"

export function AppBar() {
  const { data: session, status } = useSession();
  const router = useRouter();

  return (
    <header className="w-full px-6 py-4 shadow-md bg-white flex items-center justify-between">
      <h1 className="font-bold tracking-wide hover:cursor-pointer" onClick={() => router.push("/home")}>
        <span className="text-sky-400 text-4xl">𝛀</span>
        <span className="text-orange-600 text-3xl"> Omegle</span>
      </h1>
      
      <div className="flex items-center gap-4">
        {status === "loading" ? (
          <Skeleton className="w-36 h-10 rounded-lg" />
        ) : session?.user ? (
          <div className="flex items-center gap-3">
            <DropdownMenu>
              <DropdownMenuTrigger asChild>
                <Avatar className="w-10 h-10 border border-gray-300 shadow-md rounded-full hover:cursor-pointer transition-transform hover:scale-105">
                  <AvatarImage src={session.user.image || ""} />
                  <AvatarFallback className="flex items-center justify-center w-full h-full bg-gray-100 rounded-full">
                    <FaUser />
                  </AvatarFallback>
                </Avatar>
              </DropdownMenuTrigger>
              <DropdownMenuContent align="start" side="left" className="w-52 bg-white shadow-lg rounded-lg p-2 border border-gray-200">
                <DropdownMenuItem 
                  className="cursor-pointer flex items-center gap-2 px-3 py-2 hover:bg-gray-100 rounded-md text-gray-700"
                  onClick={() => session.user.image && window.open(session.user.image, "_blank")}
                >
                  <FaEye className="text-blue-500" /> View Image
                </DropdownMenuItem>
                <DropdownMenuItem 
                  className="cursor-pointer flex items-center gap-2 px-3 py-2 hover:bg-gray-100 rounded-md text-gray-700"
                  onClick={() => alert("Implement image upload functionality")}
                >
                  <FaUpload className="text-green-500" /> Add New Image
                </DropdownMenuItem>
              </DropdownMenuContent>
            </DropdownMenu>
            <span className="text-sm font-medium text-gray-800">{session.user.name}</span>
            <Button size="sm" className="px-4 rounded-lg" onClick={() => signOut()}>
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
  );
}
