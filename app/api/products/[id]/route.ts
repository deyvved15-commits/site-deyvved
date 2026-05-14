import { NextRequest, NextResponse } from "next/server";
import { prisma } from "@/lib/prisma";

export async function GET(_req: NextRequest, { params }: { params: Promise<{ id: string }> }) {
  const { id } = await params;

  const product = await prisma.product.findUnique({
    where: { id, published: true },
  });

  if (!product) return NextResponse.json({ error: "Produto não encontrado" }, { status: 404 });

  return NextResponse.json(product);
}
