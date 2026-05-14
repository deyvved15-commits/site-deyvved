import { NextRequest, NextResponse } from "next/server";
import { auth } from "@/lib/auth";
import { prisma } from "@/lib/prisma";

export async function POST(req: NextRequest) {
  const session = await auth();
  if (session?.user.role !== "ADMIN") return NextResponse.json({ error: "Forbidden" }, { status: 403 });

  const data = await req.json();
  const product = await prisma.product.create({
    data: {
      title: data.title,
      description: data.description,
      price: data.price,
      type: data.type,
      thumbnail: data.thumbnail,
      fileUrl: data.fileUrl,
      published: data.published,
    },
  });

  return NextResponse.json(product);
}

export async function GET() {
  const session = await auth();
  if (session?.user.role !== "ADMIN") return NextResponse.json({ error: "Forbidden" }, { status: 403 });

  const products = await prisma.product.findMany({
    orderBy: { createdAt: "desc" },
    include: { _count: { select: { purchases: true } } }
  });

  return NextResponse.json(products);
}
