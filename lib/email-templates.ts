const base = (content: string) => `<!DOCTYPE html>
<html lang="pt-BR">
<head>
  <meta charset="UTF-8"/>
  <meta name="viewport" content="width=device-width,initial-scale=1"/>
  <title>Kadima Academy</title>
</head>
<body style="margin:0;padding:0;background:#060D1F;font-family:'Helvetica Neue',Arial,sans-serif;">
  <table width="100%" cellpadding="0" cellspacing="0" style="background:#060D1F;padding:40px 16px;">
    <tr><td align="center">
      <table width="100%" style="max-width:560px;">

        <!-- Header -->
        <tr><td style="text-align:center;padding-bottom:32px;">
          <div style="display:inline-block;width:64px;height:64px;border-radius:50%;background:linear-gradient(135deg,#E8D5A8,#C9A97A);line-height:64px;font-size:28px;margin-bottom:14px;">📖</div>
          <div style="font-size:22px;font-weight:700;letter-spacing:5px;color:#F5ECD7;text-transform:uppercase;">KADIMA</div>
          <div style="font-size:11px;letter-spacing:6px;color:#C9A97A;text-transform:uppercase;">Academy</div>
        </td></tr>

        <!-- Card -->
        <tr><td style="background:linear-gradient(160deg,#0F1A3D,#0A122D);border:1px solid rgba(201,169,122,0.18);border-radius:20px;padding:36px 36px 32px;box-shadow:0 24px 60px rgba(0,0,0,0.5);">
          ${content}
        </td></tr>

        <!-- Footer -->
        <tr><td style="text-align:center;padding-top:28px;">
          <p style="font-size:11px;color:rgba(255,255,255,0.25);line-height:1.7;margin:0;">
            Kadima Academy · Escola Teológica Online<br/>
            Você está recebendo este e-mail por ser aluno da plataforma.
          </p>
        </td></tr>

      </table>
    </td></tr>
  </table>
</body>
</html>`;

const divider = `<div style="height:1px;background:linear-gradient(90deg,transparent,rgba(201,169,122,0.30),transparent);margin:24px 0;"></div>`;

const badge = (text: string, color = "#C9A97A") =>
  `<span style="display:inline-block;padding:3px 10px;border-radius:20px;border:1px solid ${color};color:${color};font-size:10px;letter-spacing:2px;text-transform:uppercase;font-weight:600;">${text}</span>`;

const btn = (url: string, label: string) =>
  `<a href="${url}" style="display:inline-block;padding:13px 32px;border-radius:12px;background:linear-gradient(135deg,#C9A97A,#A07840);color:#060D1F;font-size:11px;font-weight:700;letter-spacing:2px;text-transform:uppercase;text-decoration:none;box-shadow:0 4px 16px rgba(201,169,122,0.35);">${label}</a>`;

// ─── Templates ──────────────────────────────────────────────────────────────

export function emailBoasVindas({ name, email, password }: { name: string; email: string; password: string }) {
  const appUrl = process.env.AUTH_URL ?? "https://kadima.academy";
  return base(`
    <div style="margin-bottom:8px;">${badge("Bem-vindo")}</div>
    <h1 style="font-size:24px;font-weight:700;letter-spacing:2px;color:#F5ECD7;margin:16px 0 8px;text-transform:uppercase;">
      Olá, ${name}!
    </h1>
    <p style="font-size:14px;color:rgba(255,255,255,0.65);line-height:1.8;margin:0 0 24px;">
      Sua conta na <strong style="color:#C9A97A;">Kadima Academy</strong> foi criada com sucesso.
      Você já tem acesso à plataforma e pode começar seus estudos agora mesmo.
    </p>
    ${divider}
    <div style="background:rgba(201,169,122,0.06);border:1px solid rgba(201,169,122,0.14);border-radius:12px;padding:16px 20px;margin-bottom:28px;">
      <p style="font-size:10px;letter-spacing:3px;text-transform:uppercase;color:#C9A97A;font-weight:600;margin:0 0 12px;">Seus dados de acesso</p>
      <p style="font-size:13px;color:rgba(255,255,255,0.80);margin:0 0 6px;"><strong style="color:rgba(255,255,255,0.45);font-weight:400;">E-mail:</strong> ${email}</p>
      <p style="font-size:13px;color:rgba(255,255,255,0.80);margin:0;"><strong style="color:rgba(255,255,255,0.45);font-weight:400;">Senha:</strong> ${password}</p>
    </div>
    <div style="text-align:center;">
      ${btn(`${appUrl}/login`, "Acessar a Plataforma")}
    </div>
    <p style="font-size:11px;color:rgba(255,255,255,0.30);text-align:center;margin:20px 0 0;line-height:1.6;">
      Recomendamos alterar sua senha após o primeiro acesso<br/>em <strong>Meu Perfil</strong>.
    </p>
  `);
}

export function emailConfirmacaoPagamento({
  name,
  courseName,
  amount,
  isMonthly,
}: {
  name: string;
  courseName: string;
  amount: number;
  isMonthly: boolean;
}) {
  const appUrl = process.env.AUTH_URL ?? "https://kadima.academy";
  const formatted = amount.toFixed(2).replace(".", ",");
  return base(`
    <div style="margin-bottom:8px;">${badge("Pagamento Aprovado", "#6ee7b7")}</div>
    <h1 style="font-size:24px;font-weight:700;letter-spacing:2px;color:#F5ECD7;margin:16px 0 8px;text-transform:uppercase;">
      Pagamento confirmado!
    </h1>
    <p style="font-size:14px;color:rgba(255,255,255,0.65);line-height:1.8;margin:0 0 24px;">
      Olá, <strong style="color:#F5ECD7;">${name}</strong>! Seu pagamento foi aprovado e seu acesso já está liberado.
    </p>
    ${divider}
    <div style="background:rgba(110,231,183,0.06);border:1px solid rgba(110,231,183,0.15);border-radius:12px;padding:16px 20px;margin-bottom:28px;">
      <p style="font-size:10px;letter-spacing:3px;text-transform:uppercase;color:#6ee7b7;font-weight:600;margin:0 0 12px;">Resumo da compra</p>
      <p style="font-size:13px;color:rgba(255,255,255,0.80);margin:0 0 6px;">
        <strong style="color:rgba(255,255,255,0.45);font-weight:400;">Curso:</strong> ${courseName}
      </p>
      <p style="font-size:13px;color:rgba(255,255,255,0.80);margin:0 0 6px;">
        <strong style="color:rgba(255,255,255,0.45);font-weight:400;">Valor:</strong> R$ ${formatted}
      </p>
      <p style="font-size:13px;color:rgba(255,255,255,0.80);margin:0;">
        <strong style="color:rgba(255,255,255,0.45);font-weight:400;">Tipo:</strong> ${isMonthly ? "Mensalidade (acesso por 30 dias)" : "Pagamento único (acesso vitalício)"}
      </p>
    </div>
    <div style="text-align:center;">
      ${btn(`${appUrl}/cursos`, "Acessar Meus Cursos")}
    </div>
  `);
}

export function emailCampanha({
  name,
  subject,
  body,
  ctaUrl,
  ctaLabel,
}: {
  name: string;
  subject: string;
  body: string;
  ctaUrl?: string;
  ctaLabel?: string;
}) {
  const appUrl = process.env.AUTH_URL ?? "https://kadimaacademy.com.br";
  const bodyHtml = body
    .split("\n\n")
    .map(p => `<p style="font-size:14px;color:rgba(255,255,255,0.70);line-height:1.85;margin:0 0 16px;">${p.replace(/\n/g, "<br/>")}</p>`)
    .join("");

  return base(`
    <h1 style="font-size:22px;font-weight:700;letter-spacing:2px;color:#F5ECD7;margin:0 0 20px;text-transform:uppercase;line-height:1.3;">
      ${subject}
    </h1>
    <p style="font-size:12px;color:rgba(201,169,122,0.70);margin:0 0 20px;">Olá, <strong style="color:#C9A97A;">${name}</strong> — aqui está uma mensagem da Kadima Academy:</p>
    ${divider}
    <div style="margin:8px 0 28px;">${bodyHtml}</div>
    ${ctaUrl && ctaLabel ? `<div style="text-align:center;margin-bottom:8px;">${btn(ctaUrl, ctaLabel)}</div>` : ""}
    ${divider}
    <p style="font-size:11px;color:rgba(255,255,255,0.25);text-align:center;margin:0;line-height:1.7;">
      Para acessar a plataforma: <a href="${appUrl}/dashboard" style="color:#C9A97A;text-decoration:none;">${appUrl}</a>
    </p>
  `);
}

export function emailAvisoRenovacao({
  name,
  courseName,
  daysLeft,
  courseId,
}: {
  name: string;
  courseName: string;
  daysLeft: number;
  courseId: string;
}) {
  const appUrl = process.env.AUTH_URL ?? "https://kadima.academy";
  const renewUrl = `${appUrl}/checkout/${courseId}?renovar=1`;
  return base(`
    <div style="margin-bottom:8px;">${badge("Aviso de Renovação", "#FBBF24")}</div>
    <h1 style="font-size:24px;font-weight:700;letter-spacing:2px;color:#F5ECD7;margin:16px 0 8px;text-transform:uppercase;">
      Seu acesso expira em breve
    </h1>
    <p style="font-size:14px;color:rgba(255,255,255,0.65);line-height:1.8;margin:0 0 24px;">
      Olá, <strong style="color:#F5ECD7;">${name}</strong>! Seu acesso ao curso <strong style="color:#C9A97A;">${courseName}</strong> expira em <strong style="color:#FBBF24;">${daysLeft} dia${daysLeft !== 1 ? "s" : ""}</strong>.
    </p>
    ${divider}
    <p style="font-size:14px;color:rgba(255,255,255,0.55);line-height:1.8;margin:0 0 28px;">
      Para continuar seus estudos sem interrupção, renove seu acesso agora mesmo com apenas um clique.
    </p>
    <div style="text-align:center;">
      ${btn(renewUrl, "Renovar Acesso")}
    </div>
    <p style="font-size:11px;color:rgba(255,255,255,0.30);text-align:center;margin:20px 0 0;line-height:1.6;">
      Ignorar este e-mail significa perder o acesso após o vencimento.
    </p>
  `);
}
