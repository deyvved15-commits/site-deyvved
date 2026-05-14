import { NextRequest, NextResponse } from "next/server";
import { getResend, FROM_EMAIL } from "@/lib/resend";

export async function GET(req: NextRequest) {
  const { searchParams } = new URL(req.url);
  const to = searchParams.get("to");

  if (!to) {
    return NextResponse.json({ error: "Informe o parâmetro ?to=seu@email.com" }, { status: 400 });
  }

  try {
    const { data, error } = await getResend().emails.send({
      from: FROM_EMAIL,
      to: [to],
      subject: "Teste de E-mail - Kadima Academy",
      html: "<h1>Teste de funcionamento</h1><p>Se você recebeu este e-mail, a configuração do Resend está correta.</p>",
    });

    if (error) {
      return NextResponse.json({ success: false, error }, { status: 500 });
    }

    return NextResponse.json({ success: true, data });
  } catch (err: any) {
    return NextResponse.json({ success: false, error: err.message }, { status: 500 });
  }
}
