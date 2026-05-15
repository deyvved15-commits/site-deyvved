import * as Sentry from "@sentry/nextjs";

Sentry.init({
  dsn: process.env.SENTRY_DSN ?? process.env.NEXT_PUBLIC_SENTRY_DSN,
  environment: process.env.NODE_ENV,

  tracesSampleRate: process.env.NODE_ENV === "production" ? 0.1 : 1.0,

  // Avoid logging expected 4xx errors
  beforeSend(event) {
    const status = event.contexts?.response?.status_code as number | undefined;
    if (status && status >= 400 && status < 500) return null;
    return event;
  },
});
