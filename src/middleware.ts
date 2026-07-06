import { auth } from "@/lib/auth";
import { NextResponse } from "next/server";

export default auth((req) => {
  const isLoggedIn = !!req.auth;
  const isDashboardRoute = req.nextUrl.pathname.match(
    /^\/(overview|simulation|departments|agents|analytics|customers|inventory|finance|operations|reports|settings)/
  );

  if (isDashboardRoute && !isLoggedIn) {
    const loginUrl = new URL("/login", req.nextUrl.origin);
    return NextResponse.redirect(loginUrl);
  }

  return NextResponse.next();
});

export const config = {
  matcher: [
    "/overview/:path*",
    "/simulation/:path*",
    "/departments/:path*",
    "/agents/:path*",
    "/analytics/:path*",
    "/customers/:path*",
    "/inventory/:path*",
    "/finance/:path*",
    "/operations/:path*",
    "/reports/:path*",
    "/settings/:path*",
  ],
};
