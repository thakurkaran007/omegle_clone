import authConfig from "./auth.config";
import NextAuth from "next-auth";
import { apiAuthRoute, authRoutes, DEFAULT_LOGIN_REDIRECT, publicRoutes } from "@/route";

const { auth } = NextAuth(authConfig);

export default auth((req) => {
    const isLoggedIn = !!req.auth;
    const { nextUrl } = req;
    const isApiAuthRoute = nextUrl.pathname.startsWith(apiAuthRoute);
    const isPublicRoute = publicRoutes.includes(nextUrl.pathname);
    const isAuthRoute = authRoutes.includes(nextUrl.pathname);
    console.log("path: ", nextUrl.pathname);
    console.log("isAuthroute: ", isAuthRoute);
    console.log("isApiAuthroute: ", isApiAuthRoute);
    console.log("isLoggedIn: ", isLoggedIn);

    if (isApiAuthRoute) {
        return;
    }
    if (isAuthRoute) {
        if (isLoggedIn) {
            return Response.redirect(new URL(DEFAULT_LOGIN_REDIRECT, nextUrl))
        }
        return;
    }
    if (!isLoggedIn && !isPublicRoute) {
        return Response.redirect(new URL('/auth/login', nextUrl))
    }
    return;
})

export const config = {
    matcher: ['/((?!.+\\.[\\w]+$|_next).*)', '/', '/(api|trpc)(.*)']
}