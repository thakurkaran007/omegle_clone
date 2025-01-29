import { auth } from "@/auth";
import { cn } from "@repo/ui/src/lib/utils";
import "@repo/ui/src/styles/globals.css";
import { SessionProvider } from "next-auth/react";
import { Montserrat } from "next/font/google";

const font = Montserrat({
  subsets: ["vietnamese"],
  weight: "400"
})

export default async function RootLayout({ children }: { children: React.ReactNode }) {
  const session = await auth();
  return (
    <html lang="en">
      <body className={cn(font.className)}>
        <SessionProvider session={session}>
          {children}
        </SessionProvider>
      </body>
    </html>
  );
}
