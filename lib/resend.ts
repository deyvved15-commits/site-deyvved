import { Resend } from "resend";

export const FROM_EMAIL = "Kadima Academy <academy@kadimaacademy.com.br>";

let _resend: Resend | null = null;

export function getResend(): Resend {
  if (!_resend) {
    const apiKey = process.env.RESEND_API_KEY;
    if (!apiKey) {
      console.warn("⚠️ [Resend] RESEND_API_KEY não encontrada nas variáveis de ambiente.");
    }
    _resend = new Resend(apiKey ?? "");
  }
  return _resend;
}
