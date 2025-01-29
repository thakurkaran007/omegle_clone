import { LoginButton } from "@/components/auth/login-button";
import { Button } from "@repo/ui/src/components/button";
import { cn } from "@repo/ui/src/lib/utils";
import { Poppins } from "next/font/google";

const font = Poppins({
    subsets: ["latin"],
    weight: ["600"]
})

const Home = () => {

  return (
      <div className="flex justify-center items-center h-screen bg-[radial-gradient(ellipse_at_top,_var(--tw-gradient-stops))] from-sky-400 to-blue-800"> 
          <div className="flex justify-center flex-col items-center space-y-6">
            <h1 className={cn("text-6xl font-semibold text-white drop-shadow-md", font.className)}>🔐 Auth</h1>
              <LoginButton>
                <Button variant={"outline"}>SignIn</Button>
              </LoginButton>
          </div>
      </div>
  )
} 
export default Home;