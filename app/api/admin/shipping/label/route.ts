import { NextRequest, NextResponse } from "next/server";
import { auth } from "@/lib/auth";
import { prisma } from "@/lib/prisma";

const ME_TOKEN = process.env.MELHOR_ENVIO_TOKEN;
const ME_BASE  = process.env.MELHOR_ENVIO_SANDBOX === "true"
  ? "https://sandbox.melhorenvio.com.br/api/v2/me"
  : "https://melhorenvio.com.br/api/v2/me";

const ORIGIN_CEP = (process.env.SHIPPING_ORIGIN_CEP ?? "").replace(/\D/g, "");

export async function POST(req: NextRequest) {
  const session = await auth();
  if (session?.user.role !== "ADMIN") return NextResponse.json({ error: "Forbidden" }, { status: 403 });

  if (!ME_TOKEN) return NextResponse.json({ error: "Frete não configurado." }, { status: 503 });

  const { orderId } = await req.json();
  if (!orderId) return NextResponse.json({ error: "orderId obrigatório." }, { status: 400 });

  const order = await prisma.productPurchase.findUnique({
    where: { id: orderId },
    include: {
      user: { select: { name: true, email: true } },
      product: { select: { title: true, weightG: true, heightCm: true, widthCm: true, lengthCm: true } },
    },
  });

  if (!order || !order.shippingCep) {
    return NextResponse.json({ error: "Pedido não encontrado ou sem endereço de entrega." }, { status: 404 });
  }

  const headers = {
    "Accept": "application/json",
    "Content-Type": "application/json",
    "Authorization": `Bearer ${ME_TOKEN}`,
    "User-Agent": "KadimaAcademy/1.0 (deyvved15@gmail.com)",
  };

  // 1. Adicionar ao carrinho Melhor Envio
  const cartPayload = {
    service: order.shippingService,
    agency: null,
    from: {
      name: "Kadima Academy",
      postal_code: ORIGIN_CEP,
      address: "Rua das Flores",
      number: "1",
    },
    to: {
      name: order.shippingName,
      postal_code: order.shippingCep.replace(/\D/g, ""),
      address: order.shippingAddress ?? "",
      number: "s/n",
      city: order.shippingCity ?? "",
      state_abbr: order.shippingState ?? "",
    },
    products: [
      {
        name: order.product.title,
        quantity: 1,
        unitary_value: order.amount,
      },
    ],
    volumes: [
      {
        height: order.product.heightCm ?? 2,
        width:  order.product.widthCm  ?? 20,
        length: order.product.lengthCm ?? 30,
        weight: (order.product.weightG ?? 300) / 1000,
      },
    ],
    options: {
      receipt: false,
      own_hand: false,
      insurance_value: order.amount,
      reverse: false,
      non_commercial: false,
    },
  };

  const cartRes = await fetch(`${ME_BASE}/cart`, {
    method: "POST",
    headers,
    body: JSON.stringify(cartPayload),
  });

  const cartData = await cartRes.json();
  if (!cartRes.ok || !cartData.id) {
    return NextResponse.json({ error: "Erro ao adicionar ao carrinho Melhor Envio.", detail: cartData }, { status: 502 });
  }

  const cartItemId = cartData.id;

  // 2. Fazer checkout do item
  const checkoutRes = await fetch(`${ME_BASE}/shipment/checkout`, {
    method: "POST",
    headers,
    body: JSON.stringify({ orders: [cartItemId] }),
  });

  if (!checkoutRes.ok) {
    const err = await checkoutRes.json();
    return NextResponse.json({ error: "Erro no checkout Melhor Envio.", detail: err }, { status: 502 });
  }

  // 3. Gerar etiqueta
  const labelRes = await fetch(`${ME_BASE}/shipment/generate`, {
    method: "POST",
    headers,
    body: JSON.stringify({ orders: [cartItemId] }),
  });

  if (!labelRes.ok) {
    const err = await labelRes.json();
    return NextResponse.json({ error: "Erro ao gerar etiqueta.", detail: err }, { status: 502 });
  }

  // 4. Obter URL de impressão
  const printRes = await fetch(`${ME_BASE}/shipment/print`, {
    method: "POST",
    headers,
    body: JSON.stringify({ mode: "private", orders: [cartItemId] }),
  });

  const printData = await printRes.json();
  if (!printRes.ok || !printData.url) {
    return NextResponse.json({ error: "Erro ao obter URL de impressão.", detail: printData }, { status: 502 });
  }

  return NextResponse.json({ labelUrl: printData.url });
}
