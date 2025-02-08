"use client";

import { useEffect } from "react";
import { useRouter } from "next/navigation";
import { motion } from "framer-motion";
import { Typewriter } from "react-simple-typewriter";
import { getUser } from "@/hooks/getUser";
import { Button } from "@repo/ui/src/components/button";
import { cn } from "@repo/ui/src/lib/utils";
import { Poppins } from "next/font/google";
import { LoginButton } from "@/components/auth/login-button";

const font = Poppins({
  subsets: ["latin"],
  weight: ["600"],
});

const Home = () => {
  const user = getUser();
  const router = useRouter();
  
  useEffect(() => {
    if (user?.name) {
      setTimeout(() => {
        router.push("/auth/login");
      }, 2500); // Redirect after 3 seconds
    }
  }, [user?.name, router]);

  return (
    <div className="flex justify-center items-center h-screen bg-[radial-gradient(ellipse_at_top,_var(--tw-gradient-stops))] from-sky-400 to-blue-800">
      <div className="flex justify-center flex-col items-center space-y-6">
        {user?.name ? (
          <motion.h1
            initial={{ opacity: 0, y: -10 }}
            animate={{ opacity: 1, y: 0 }}
            transition={{ duration: 0.5 }}
            className={cn("text-5xl font-semibold text-white drop-shadow-md", font.className)}
          >
            <Typewriter words={[`Welcome back, ${user.name} 👋`]} typeSpeed={70} cursor />
          </motion.h1>
        ) : (
          <>
            <h1 className={cn("text-6xl font-semibold text-white drop-shadow-md", font.className)}>🔐 Auth</h1>
            <LoginButton>
              <Button variant={"outline"}>Sign In</Button>
            </LoginButton>
          </>
        )}
      </div>
    </div>
  );
};

export default Home;
