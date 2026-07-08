import { NextRequest, NextResponse } from "next/server";
import { rateLimit, getIp } from "@/lib/rate-limit";

// CEP de origem da Kadima Academy (preencher com o CEP real)
const ORIGIN_CEP = process.env.SHIPPING_ORIGIN_CEP ?? "01310-100";

// Token Melhor Envio (sandbox ou produção)
const ME_TOKEN   = process.env.MELHOR_ENVIO_TOKEN;
const ME_URL     = process.env.MELHOR_ENVIO_SANDBOX === "true"
  ? "https://sandbox.melhorenvio.com.br/api/v2/me/shipment/calculate"
  : "https://melhorenvio.com.br/api/v2/me/shipment/calculate";

export async function POST(req: NextRequest) {
  if (!rateLimit(`shipping:${getIp(req)}`, 15, 60_000)) {
    return NextResponse.json({ error: "Muitas consultas de frete. Aguarde um momento." }, { status: 429 });
  }

  if (!ME_TOKEN) {
    return NextResponse.json({ error: "Frete não configurado." }, { status: 503 });
  }

  const body = await req.json();
  const { cep, weightG, heightCm, widthCm, lengthCm } = body;

  if (!cep || !weightG) {
    return NextResponse.json({ error: "CEP e peso são obrigatórios." }, { status: 400 });
  }

  const payload = {
    from: { postal_code: ORIGIN_CEP.replace(/\D/g, "") },
    to:   { postal_code: cep.replace(/\D/g, "") },
    package: {
      height: heightCm ?? 2,
      width:  widthCm  ?? 20,
      length: lengthCm ?? 30,
      weight: weightG / 1000, // gramas → kg
    },
    options: { receipt: false, own_hand: false },
    services: "1,2,3,4,17", // PAC, SEDEX, SEDEX 10, SEDEX 12, JT Express
  };

  try {
    const res = await fetch(ME_URL, {
      method: "POST",
      headers: {
        "Accept":        "application/json",
        "Content-Type":  "application/json",
        "Authorization": `Bearer ${ME_TOKEN}`,
        "User-Agent":    "KadimaAcademy/1.0 (deyvved15@gmail.com)",
      },
      body: JSON.stringify(payload),
    });

    const data = await res.json();

    if (!res.ok) {
      return NextResponse.json({ error: "Erro ao cotar frete.", detail: data }, { status: 502 });
    }

    // Filtra apenas opções com preço válido e sem erro
    const options = (Array.isArray(data) ? data : [])
      .filter((s: any) => !s.error && s.price)
      .map((s: any) => ({
        id:       s.id,
        name:     s.name,
        company:  s.company?.name ?? s.name,
        price:    parseFloat(s.price),
        days:     s.delivery_time ?? s.custom_delivery_time,
        logoUrl:  s.company?.picture ?? null,
      }))
      .sort((a: any, b: any) => a.price - b.price);

    return NextResponse.json(options);
  } catch {
    return NextResponse.json({ error: "Falha na conexão com Melhor Envio." }, { status: 502 });
  }
}
