import nodemailer from "nodemailer";

export const FROM_EMAIL = process.env.SMTP_FROM ?? "Kadima Academy <academy@kadimamkt.com.br>";

let _transporter: nodemailer.Transporter | null = null;

function createTransporter() {
  return nodemailer.createTransport({
    host: process.env.SMTP_HOST ?? "smtp.hostinger.com",
    port: Number(process.env.SMTP_PORT ?? 465),
    secure: Number(process.env.SMTP_PORT ?? 465) === 465,
    auth: {
      user: process.env.SMTP_USER,
      pass: process.env.SMTP_PASS,
    },
  });
}

// Mantém a mesma interface de uso: getResend().emails.send({...})
export function getResend() {
  if (!_transporter) {
    _transporter = createTransporter();
  }

  return {
    emails: {
      async send({ from, to, subject, html }: { from: string; to: string | string[]; subject: string; html: string }) {
        try {
          const info = await _transporter!.sendMail({ from, to, subject, html });
          return { data: { id: info.messageId }, error: null };
        } catch (err: unknown) {
          const message = err instanceof Error ? err.message : String(err);
          console.error("[mailer] erro ao enviar:", message);
          return { data: null, error: { message } };
        }
      },
    },
  };
}
