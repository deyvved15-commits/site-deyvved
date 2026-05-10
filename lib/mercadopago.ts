import { MercadoPagoConfig, Preference, Payment } from "mercadopago";

export const mp = new MercadoPagoConfig({
  accessToken: process.env.MP_ACCESS_TOKEN!,
});

export const mpPreference = new Preference(mp);
export const mpPayment = new Payment(mp);
