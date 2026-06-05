import { NextRequest, NextResponse } from "next/server";
import { auth } from "@/lib/auth";
import { prisma } from "@/lib/prisma";
import { revalidatePath } from "next/cache";

export async function GET() {
  const session = await auth();
  if (!session || session.user.role !== "ADMIN") {
    return NextResponse.json({ error: "Unauthorized" }, { status: 401 });
  }

  const config = await prisma.siteConfig.findUnique({ where: { id: "singleton" } });
  return NextResponse.json(config ?? { pixelMeta: null, pixelGtm: null, pixelGa: null, pixelCustom: null });
}

export async function PATCH(req: NextRequest) {
  const session = await auth();
  if (!session || session.user.role !== "ADMIN") {
    return NextResponse.json({ error: "Unauthorized" }, { status: 401 });
  }

  const body = await req.json();
  const { pixelMeta, pixelGtm, pixelGa, pixelCustom } = body;

  const config = await prisma.siteConfig.upsert({
    where: { id: "singleton" },
    create: { id: "singleton", pixelMeta, pixelGtm, pixelGa, pixelCustom },
    update: { pixelMeta, pixelGtm, pixelGa, pixelCustom },
  });

  revalidatePath("/", "layout");

  return NextResponse.json(config);
}
