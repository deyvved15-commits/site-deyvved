import { NextRequest, NextResponse } from "next/server";
import { prisma } from "@/lib/prisma";

// GET /api/ref?code=JOAO2025&redirect=/curso/hebraico
// Salva cookie de referência e redireciona
export async function GET(req: NextRequest) {
  const { searchParams } = new URL(req.url);
  const code = searchParams.get("code");
  const redirect = searchParams.get("redirect") ?? "/";

  if (!code) {
    return NextResponse.redirect(new URL(redirect, req.url));
  }

  // Valida se o código existe
  const affiliate = await prisma.user.findUnique({
    where: { affiliateCode: code },
    select: { id: true },
  });

  const response = NextResponse.redirect(new URL(redirect, req.url));

  if (affiliate) {
    // Cookie válido por 30 dias
    response.cookies.set("kadima_ref", code, {
      httpOnly: true,
      secure: process.env.NODE_ENV === "production",
      sameSite: "lax",
      maxAge: 30 * 24 * 60 * 60, // 30 dias
      path: "/",
    });
  }

  return response;
}
