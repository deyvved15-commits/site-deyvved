import { NextRequest, NextResponse } from "next/server";
import { getToken } from "next-auth/jwt";

export async function proxy(req: NextRequest) {
  try {
    const token = await getToken({
      req,
      secret: process.env.AUTH_SECRET,
      cookieName: req.url.startsWith("https")
        ? "__Secure-authjs.session-token"
        : "authjs.session-token",
    });

    const { pathname } = req.nextUrl;
    const role = token?.role as string | undefined;

    const redirectTo = (path: string) => {
      const url = req.nextUrl.clone();
      url.pathname = path;
      return NextResponse.redirect(url);
    };

    if (pathname === "/login" || pathname === "/cadastro") {
      if (token) return redirectTo(role === "ADMIN" ? "/admin" : "/dashboard");
      return NextResponse.next();
    }

    if (pathname === "/") {
      if (!token) return redirectTo("/login");
      return redirectTo(role === "ADMIN" ? "/admin" : "/dashboard");
    }

    if (!token) return redirectTo("/login");

    if (pathname.startsWith("/admin") && role !== "ADMIN") {
      return redirectTo("/dashboard");
    }

    return NextResponse.next();
  } catch {
    const url = req.nextUrl.clone();
    url.pathname = "/login";
    return NextResponse.redirect(url);
  }
}

export const config = {
  matcher: ["/((?!api|_next/static|_next/image|favicon\\.ico|.*\\.(?:png|jpg|jpeg|gif|svg|webp|ico)$).*)"],
};
