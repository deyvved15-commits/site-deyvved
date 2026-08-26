import { NextRequest, NextResponse } from "next/server";
import { auth } from "@/lib/auth";

export async function GET(req: NextRequest) {
  const session = await auth();
  if (!session) return NextResponse.json({ error: "Unauthorized" }, { status: 401 });

  const url = req.nextUrl.searchParams.get("url");
  if (!url) return NextResponse.json({ error: "URL obrigatória" }, { status: 400 });

  let fetchUrl = url;

  // Converte link do Google Drive para download direto com confirm (bypass aviso de vírus)
  const driveMatch = url.match(/drive\.google\.com\/file\/d\/([^/?]+)/);
  if (driveMatch) {
    fetchUrl = `https://drive.google.com/uc?export=download&confirm=t&id=${driveMatch[1]}`;
  }

  try {
    const res = await fetch(fetchUrl, {
      redirect: "follow",
      headers: {
        "User-Agent": "Mozilla/5.0 (compatible; KadimaAcademy/1.0)",
      },
    });

    if (!res.ok) {
      return NextResponse.json({ error: "Falha ao buscar arquivo" }, { status: 502 });
    }

    const contentType = res.headers.get("content-type") ?? "application/pdf";

    // Se o Drive retornou HTML (página de confirmação), falha com mensagem clara
    if (contentType.includes("text/html")) {
      return NextResponse.json({ error: "Google Drive bloqueou o download. Tente um link direto." }, { status: 502 });
    }

    const buffer = await res.arrayBuffer();

    return new NextResponse(buffer, {
      headers: {
        "Content-Type": "application/pdf",
        "Content-Disposition": "inline",
        "Cache-Control": "private, max-age=3600",
        "Access-Control-Allow-Origin": "*",
      },
    });
  } catch {
    return NextResponse.json({ error: "Erro ao carregar PDF" }, { status: 500 });
  }
}
