import { NextRequest, NextResponse } from "next/server";
import { auth } from "@/lib/auth";

export async function GET(req: NextRequest) {
  const session = await auth();
  if (!session) return NextResponse.json({ error: "Unauthorized" }, { status: 401 });

  const url = req.nextUrl.searchParams.get("url");
  if (!url) return NextResponse.json({ error: "URL obrigatória" }, { status: 400 });

  let fetchUrl = url;

  // Converte link de visualização do Google Drive para link de download direto
  const driveMatch = url.match(/drive\.google\.com\/file\/d\/([^/]+)/);
  if (driveMatch) {
    fetchUrl = `https://drive.google.com/uc?export=download&id=${driveMatch[1]}`;
  }

  try {
    const res = await fetch(fetchUrl, {
      headers: {
        "User-Agent": "Mozilla/5.0 (compatible; KadimaAcademy/1.0)",
      },
    });

    if (!res.ok) {
      return NextResponse.json({ error: "Falha ao buscar arquivo" }, { status: 502 });
    }

    const contentType = res.headers.get("content-type") ?? "application/pdf";
    const buffer = await res.arrayBuffer();

    return new NextResponse(buffer, {
      headers: {
        "Content-Type": contentType,
        "Content-Disposition": "inline",
        "Cache-Control": "private, max-age=3600",
        "Access-Control-Allow-Origin": "*",
      },
    });
  } catch {
    return NextResponse.json({ error: "Erro ao carregar PDF" }, { status: 500 });
  }
}
