// middleware.ts
import { NextResponse } from "next/server";
import { auth } from "./auth";

export const runtime = 'nodejs';

export default auth(async function middleware(request) {
  const session = request.auth;
  const isAdminPath = request.nextUrl.pathname.startsWith("/admin");

  // Check if the user is trying to access admin routes
  if (isAdminPath) {
    // If not authenticated or not an admin, redirect to the home page
    if (!session || session.user.role !== "ADMIN") {
      const url = new URL("/auth/signin", request.url);
      url.searchParams.set("callbackUrl", encodeURI(request.nextUrl.pathname));
      return NextResponse.redirect(url);
    }
  }

  return NextResponse.next();
});

// See: https://nextjs.org/docs/app/building-your-application/routing/middleware#matcher
export const config = {
  matcher: ["/admin/:path*", "/api/admin/:path*"],
};
