import { NextRequest, NextResponse } from "next/server";
import { prisma } from "@/lib/prisma";
import { getResend, FROM_EMAIL } from "@/lib/resend";
import crypto from "crypto";

export async function POST(req: NextRequest) {
  const { email } = await req.json();
  if (!email || typeof email !== "string") {
    return NextResponse.json({ error: "E-mail inválido" }, { status: 400 });
  }

  const user = await prisma.user.findUnique({ where: { email: email.toLowerCase().trim() } });

  // Always return success to avoid user enumeration
  if (!user) {
    return NextResponse.json({ ok: true });
  }

  // Invalidate existing tokens for this email
  await prisma.passwordResetToken.deleteMany({ where: { email: user.email } });

  const token = crypto.randomBytes(32).toString("hex");
  const expires = new Date(Date.now() + 1000 * 60 * 60); // 1 hour

  await prisma.passwordResetToken.create({
    data: { email: user.email, token, expires },
  });

  const resetUrl = `${process.env.NEXTAUTH_URL}/redefinir-senha?token=${token}`;

  try {
    const resend = getResend();
    await resend.emails.send({
      from: FROM_EMAIL,
      to: user.email,
      subject: "Redefinição de senha — Kadima Academy",
      html: `
        <div style="font-family:'Helvetica Neue',Helvetica,Arial,sans-serif;background:#060D1F;padding:40px 20px;min-height:100vh">
          <div style="max-width:480px;margin:0 auto;background:linear-gradient(160deg,#0B1128,#0F1A3D);border:1px solid rgba(201,169,122,0.20);border-radius:20px;overflow:hidden">
            <div style="padding:12px 24px;background:rgba(201,169,122,0.04);border-bottom:1px solid rgba(201,169,122,0.10);text-align:center">
              <span style="font-family:Georgia,serif;font-size:10px;letter-spacing:4px;text-transform:uppercase;color:rgba(201,169,122,0.55)">KADIMA ACADEMY</span>
            </div>
            <div style="padding:36px 32px">
              <h1 style="font-family:Georgia,serif;font-size:20px;font-weight:700;letter-spacing:2px;color:#E8D5A8;text-align:center;margin:0 0 8px">Redefinição de Senha</h1>
              <div style="width:48px;height:2px;background:linear-gradient(90deg,transparent,#C9A97A,transparent);margin:0 auto 24px"></div>
              <p style="color:rgba(255,255,255,0.65);font-size:14px;line-height:1.7;margin:0 0 24px">
                Olá, ${user.name}. Recebemos uma solicitação para redefinir a senha da sua conta Kadima Academy.
              </p>
              <p style="color:rgba(255,255,255,0.65);font-size:14px;line-height:1.7;margin:0 0 28px">
                Clique no botão abaixo para criar uma nova senha. Este link é válido por <strong style="color:#C9A97A">1 hora</strong>.
              </p>
              <div style="text-align:center;margin-bottom:28px">
                <a href="${resetUrl}" style="display:inline-block;padding:14px 32px;background:linear-gradient(135deg,#C9A97A,#A07840);color:#060D1F;font-family:Georgia,serif;font-size:12px;font-weight:700;letter-spacing:2px;text-transform:uppercase;text-decoration:none;border-radius:12px">
                  Redefinir Senha
                </a>
              </div>
              <p style="color:rgba(255,255,255,0.35);font-size:12px;line-height:1.6;margin:0;text-align:center">
                Se você não solicitou a redefinição de senha, ignore este e-mail.<br/>Sua senha permanecerá a mesma.
              </p>
            </div>
            <div style="padding:16px 24px;background:rgba(0,0,0,0.20);text-align:center">
              <span style="font-size:11px;color:rgba(255,255,255,0.20)">© ${new Date().getFullYear()} Kadima Academy — Escola Teológica Online</span>
            </div>
          </div>
        </div>
      `,
    });
  } catch (err) {
    console.error("[ForgotPassword] Erro ao enviar e-mail:", err);
  }

  return NextResponse.json({ ok: true });
}
