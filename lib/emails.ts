import { getResend, FROM_EMAIL } from "./resend";

export async function sendWelcomeEmail(name: string, email: string) {
  try {
    const resend = getResend();
    await resend.emails.send({
      from: FROM_EMAIL,
      to: email,
      subject: "Bem-vindo à Kadima Academy! 🎓",
      html: `
        <div style="font-family:'Helvetica Neue',Helvetica,Arial,sans-serif;background:#060D1F;padding:40px 20px;min-height:100vh">
          <div style="max-width:520px;margin:0 auto">

            <!-- Header -->
            <div style="text-align:center;margin-bottom:32px">
              <div style="font-family:Georgia,serif;font-size:26px;font-weight:900;letter-spacing:6px;color:#E8D5A8;margin-bottom:4px">KADIMA</div>
              <div style="font-family:Georgia,serif;font-size:11px;letter-spacing:8px;color:#C9A97A;text-transform:uppercase">Academy</div>
              <div style="width:60px;height:1px;background:linear-gradient(90deg,transparent,#C9A97A,transparent);margin:16px auto 0"></div>
            </div>

            <!-- Card -->
            <div style="background:linear-gradient(160deg,#0B1128,#0F1A3D);border:1px solid rgba(201,169,122,0.20);border-radius:20px;overflow:hidden">

              <!-- Card header -->
              <div style="padding:14px 28px;background:rgba(201,169,122,0.04);border-bottom:1px solid rgba(201,169,122,0.10);text-align:center">
                <span style="font-family:Georgia,serif;font-size:10px;letter-spacing:4px;text-transform:uppercase;color:rgba(201,169,122,0.55)">Bem-vindo à Plataforma</span>
              </div>

              <div style="padding:36px 32px">
                <h1 style="font-family:Georgia,serif;font-size:22px;font-weight:700;letter-spacing:2px;color:#E8D5A8;margin:0 0 8px;text-align:center">
                  Olá, ${name.split(" ")[0]}! 👋
                </h1>
                <div style="width:48px;height:2px;background:linear-gradient(90deg,transparent,#C9A97A,transparent);margin:0 auto 28px"></div>

                <p style="color:rgba(255,255,255,0.70);font-size:15px;line-height:1.8;margin:0 0 20px">
                  Sua conta na <strong style="color:#C9A97A">Kadima Academy</strong> foi criada com sucesso!
                  Estamos felizes em tê-lo(a) conosco nessa jornada de aprendizado teológico.
                </p>

                <p style="color:rgba(255,255,255,0.55);font-size:14px;line-height:1.8;margin:0 0 28px">
                  Na plataforma você encontrará cursos, aulas ao vivo, certificados e muito mais.
                  Explore o seu painel e comece a aprender!
                </p>

                <!-- CTA -->
                <div style="text-align:center;margin-bottom:32px">
                  <a href="${process.env.NEXTAUTH_URL}/dashboard"
                    style="display:inline-block;padding:14px 36px;background:linear-gradient(135deg,#C9A97A,#A07840);color:#060D1F;font-family:Georgia,serif;font-size:12px;font-weight:700;letter-spacing:2px;text-transform:uppercase;text-decoration:none;border-radius:12px;box-shadow:0 6px 24px rgba(201,169,122,0.30)">
                    Acessar Minha Área
                  </a>
                </div>

                <!-- Divider -->
                <div style="border-top:1px solid rgba(201,169,122,0.08);padding-top:24px">
                  <p style="color:rgba(255,255,255,0.30);font-size:12px;line-height:1.6;margin:0;text-align:center">
                    Dúvidas? Entre em contato pelo suporte dentro da plataforma.<br/>
                    <strong style="color:rgba(201,169,122,0.50)">Que Deus abençoe sua jornada!</strong>
                  </p>
                </div>
              </div>

              <!-- Footer -->
              <div style="padding:16px 28px;background:rgba(0,0,0,0.25);text-align:center">
                <span style="font-size:11px;color:rgba(255,255,255,0.18)">© ${new Date().getFullYear()} Kadima Academy — Escola Teológica Online</span>
              </div>
            </div>

          </div>
        </div>
      `,
    });
  } catch (err) {
    console.error("[sendWelcomeEmail] Erro ao enviar:", err);
  }
}
