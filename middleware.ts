import { NextRequest, NextResponse } from "next/server";
import { getToken } from "next-auth/jwt";

export async function middleware(req: NextRequest) {
  const token = await getToken({
    req,
    secret: process.env.AUTH_SECRET,
    cookieName: req.url.startsWith("https")
      ? "__Secure-authjs.session-token"
      : "authjs.session-token",
  });

  const { pathname } = req.nextUrl;
  const role = token?.role as string | undefined;

  if (pathname === "/login" || pathname === "/cadastro") {
    if (token) {
      return NextResponse.redirect(new URL(role === "ADMIN" ? "/admin" : "/dashboard", req.url));
    }
    return NextResponse.next();
  }

  if (pathname === "/") {
    if (!token) return NextResponse.redirect(new URL("/login", req.url));
    return NextResponse.redirect(new URL(role === "ADMIN" ? "/admin" : "/dashboard", req.url));
  }

  if (!token) return NextResponse.redirect(new URL("/login", req.url));

  if (pathname.startsWith("/admin") && role !== "ADMIN") {
    return NextResponse.redirect(new URL("/dashboard", req.url));
  }

  return NextResponse.next();
}

export const config = {
  matcher: ["/((?!api|_next/static|_next/image|favicon\\.ico|.*\\.(?:png|jpg|jpeg|gif|svg|webp|ico)$).*)"],
};
