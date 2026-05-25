import { NextRequest, NextResponse } from "next/server";
import { prisma } from "@/lib/prisma";

export async function GET(
  req: NextRequest,
  { params }: { params: Promise<{ code: string }> }
) {
  const { code } = await params;

  const affiliate = await prisma.user.findUnique({
    where: { affiliateCode: code },
    select: { id: true },
  });

  const response = NextResponse.redirect(new URL("/loja", req.url));

  if (affiliate) {
    await prisma.affiliateClick.create({
      data: { referrerId: affiliate.id, courseSlug: null },
    });

    response.cookies.set("kadima_ref", code, {
      httpOnly: true,
      secure: process.env.NODE_ENV === "production",
      sameSite: "lax",
      maxAge: 30 * 24 * 60 * 60,
      path: "/",
    });
  }

  return response;
}
