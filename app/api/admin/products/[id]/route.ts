import { NextRequest, NextResponse } from "next/server";
import { auth } from "@/lib/auth";
import { prisma } from "@/lib/prisma";

export async function PATCH(req: NextRequest, { params }: { params: Promise<{ id: string }> }) {
  const session = await auth();
  if (session?.user.role !== "ADMIN") return NextResponse.json({ error: "Forbidden" }, { status: 403 });

  const { id } = await params;
  const data = await req.json();

  const update: Record<string, unknown> = { ...data };
  if ("weightG"  in data) update.weightG  = data.weightG  ? parseInt(data.weightG)  : null;
  if ("heightCm" in data) update.heightCm = data.heightCm ? parseInt(data.heightCm) : null;
  if ("widthCm"  in data) update.widthCm  = data.widthCm  ? parseInt(data.widthCm)  : null;
  if ("lengthCm" in data) update.lengthCm = data.lengthCm ? parseInt(data.lengthCm) : null;

  const product = await prisma.product.update({
    where: { id },
    data: update,
  });

  return NextResponse.json(product);
}

export async function DELETE(req: NextRequest, { params }: { params: Promise<{ id: string }> }) {
  const session = await auth();
  if (session?.user.role !== "ADMIN") return NextResponse.json({ error: "Forbidden" }, { status: 403 });

  const { id } = await params;

  await prisma.product.delete({
    where: { id },
  });

  return NextResponse.json({ ok: true });
}
