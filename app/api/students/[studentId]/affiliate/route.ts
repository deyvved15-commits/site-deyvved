import { NextRequest, NextResponse } from "next/server";
import { auth } from "@/lib/auth";
import { prisma } from "@/lib/prisma";
import { z } from "zod";

const schema = z.object({
  affiliatePercentage: z.number().min(0).max(100).nullable(),
});

export async function PATCH(
  req: NextRequest,
  { params }: { params: Promise<{ studentId: string }> }
) {
  const session = await auth();
  if (!session || session.user.role !== "ADMIN")
    return NextResponse.json({ error: "Forbidden" }, { status: 403 });

  const { studentId } = await params;
  const body = await req.json();
  const parsed = schema.safeParse(body);
  if (!parsed.success) return NextResponse.json({ error: parsed.error.flatten() }, { status: 400 });

  const user = await prisma.user.update({
    where: { id: studentId },
    data: { affiliatePercentage: parsed.data.affiliatePercentage },
    select: { affiliatePercentage: true },
  });

  return NextResponse.json(user);
}
