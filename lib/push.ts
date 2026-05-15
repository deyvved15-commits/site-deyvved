import webpush from "web-push";
import { prisma } from "./prisma";

let initialized = false;

function init() {
  if (initialized) return;
  const pub = process.env.NEXT_PUBLIC_VAPID_PUBLIC_KEY;
  const priv = process.env.VAPID_PRIVATE_KEY;
  const email = process.env.VAPID_EMAIL ?? "mailto:admin@kadimaacademy.com.br";
  if (!pub || !priv) {
    console.warn("[Push] VAPID keys not set — push notifications disabled.");
    return;
  }
  webpush.setVapidDetails(email, pub, priv);
  initialized = true;
}

export interface PushPayload {
  title: string;
  message: string;
  url?: string;
  icon?: string;
}

export async function sendPushToUser(userId: string, payload: PushPayload) {
  init();
  if (!initialized) return;

  const subs = await prisma.pushSubscription.findMany({ where: { userId } });
  if (!subs.length) return;

  const body = JSON.stringify({
    title: payload.title,
    body: payload.message,
    icon: payload.icon ?? "/icon-192.png",
    badge: "/icon-192.png",
    data: { url: payload.url ?? "/dashboard" },
  });

  await Promise.allSettled(
    subs.map(async (sub) => {
      try {
        await webpush.sendNotification(
          { endpoint: sub.endpoint, keys: { p256dh: sub.p256dh, auth: sub.auth } },
          body,
        );
      } catch (err: any) {
        // 410 Gone = subscription expired, clean it up
        if (err?.statusCode === 410 || err?.statusCode === 404) {
          await prisma.pushSubscription.deleteMany({ where: { endpoint: sub.endpoint } });
        }
      }
    }),
  );
}
