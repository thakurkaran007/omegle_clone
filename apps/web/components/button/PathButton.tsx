"use client";
import { usePathname } from "next/navigation";
import { Button } from "@repo/ui/src/components/button";
import Link from "next/link";

const PathButton = ({ path, label }: { path: string, label: string }) => {
    const pathname = usePathname();
   return (
    <Button 
        asChild
        variant={pathname === path ? "default" : "outline"}
    >
        <Link href={path}>{label}</Link>
    </Button>
   )
}
export default PathButton;