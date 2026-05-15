import { NextRequest, NextResponse } from "next/server";
import { getToken } from "next-auth/jwt";

export async function middleware(req: NextRequest) {
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

    // 1. Rotas que SEMPRE são públicas
    if (pathname === "/login" || pathname === "/cadastro") {
      if (token) {
        if (role === "ADMIN") return redirectTo("/admin");
        if (role === "TEACHER") return redirectTo("/professor");
        return redirectTo("/dashboard");
      }
      return NextResponse.next();
    }

    // 2. Rotas que PODEM ser públicas (Cursos, Checkout e APIs públicas)
    if (
      pathname.startsWith("/curso") ||
      pathname.startsWith("/checkout") ||
      pathname.startsWith("/api/")
    ) {
      return NextResponse.next();
    }

    // 3. Rota Raiz (redireciona conforme o papel ou login)
    if (pathname === "/") {
      if (!token) return redirectTo("/login");
      if (role === "ADMIN") return redirectTo("/admin");
      if (role === "TEACHER") return redirectTo("/professor");
      return redirectTo("/dashboard");
    }

    // 4. Todas as outras rotas exigem LOGIN
    if (!token) return redirectTo("/login");

    // 5. Proteção por Role
    if (pathname.startsWith("/admin") && role !== "ADMIN") {
      return redirectTo("/dashboard");
    }

    if (pathname.startsWith("/professor") && role !== "TEACHER" && role !== "ADMIN") {
      return redirectTo("/dashboard");
    }

    return NextResponse.next();
  } catch (error) {
    console.error("Middleware error:", error);
    const url = req.nextUrl.clone();
    url.pathname = "/login";
    return NextResponse.redirect(url);
  }
}

export const config = {
  matcher: ["/((?!api|_next/static|_next/image|favicon\\.ico|.*\\.(?:png|jpg|jpeg|gif|svg|webp|ico|json|js|css|woff|woff2|ttf)$).*)"],
};
