"use client";

import { useState, useEffect } from "react";

type PushState = "idle" | "unsupported" | "denied" | "granted" | "loading";

function urlBase64ToUint8Array(base64String: string): ArrayBuffer {
  const padding = "=".repeat((4 - (base64String.length % 4)) % 4);
  const base64 = (base64String + padding).replace(/-/g, "+").replace(/_/g, "/");
  const rawData = atob(base64);
  const buf = new ArrayBuffer(rawData.length);
  const view = new Uint8Array(buf);
  for (let i = 0; i < rawData.length; i++) view[i] = rawData.charCodeAt(i);
  return buf;
}

export default function PushPermission() {
  const [state, setState] = useState<PushState>("idle");
  const vapidKey = process.env.NEXT_PUBLIC_VAPID_PUBLIC_KEY;

  useEffect(() => {
    if (!("serviceWorker" in navigator) || !("PushManager" in window) || !vapidKey) {
      setState("unsupported");
      return;
    }
    const perm = Notification.permission;
    if (perm === "granted") setState("granted");
    else if (perm === "denied") setState("denied");
  }, [vapidKey]);

  async function subscribe() {
    if (!vapidKey) return;
    setState("loading");
    try {
      const reg = await navigator.serviceWorker.ready;
      const sub = await reg.pushManager.subscribe({
        userVisibleOnly: true,
        applicationServerKey: urlBase64ToUint8Array(vapidKey),
      });
      const json = sub.toJSON() as { endpoint: string; keys: { p256dh: string; auth: string } };
      await fetch("/api/push/subscribe", {
        method: "POST",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify(json),
      });
      setState("granted");
    } catch {
      setState(Notification.permission === "denied" ? "denied" : "idle");
    }
  }

  async function unsubscribe() {
    setState("loading");
    try {
      const reg = await navigator.serviceWorker.ready;
      const sub = await reg.pushManager.getSubscription();
      if (sub) {
        await fetch("/api/push/subscribe", {
          method: "DELETE",
          headers: { "Content-Type": "application/json" },
          body: JSON.stringify({ endpoint: sub.endpoint }),
        });
        await sub.unsubscribe();
      }
      setState("idle");
    } catch {
      setState("granted");
    }
  }

  if (state === "unsupported") return null;

  if (state === "granted") {
    return (
      <button
        onClick={unsubscribe}
        title="Desativar notificações push"
        style={{
          background: "rgba(110,231,183,0.10)", border: "1px solid rgba(110,231,183,0.25)",
          borderRadius: 8, padding: "6px 10px", cursor: "pointer",
          display: "flex", alignItems: "center", gap: 5, color: "#6ee7b7",
          fontSize: 10, fontFamily: "'Cinzel',serif", letterSpacing: 1.5, textTransform: "uppercase",
          transition: "all 0.2s",
        }}
      >
        <svg width="12" height="12" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round">
          <path d="M18 8A6 6 0 0 0 6 8c0 7-3 9-3 9h18s-3-2-3-9"/><path d="M13.73 21a2 2 0 0 1-3.46 0"/>
          <line x1="1" y1="1" x2="23" y2="23"/>
        </svg>
        Push ativo
      </button>
    );
  }

  if (state === "denied") {
    return (
      <div title="Notificações bloqueadas no navegador" style={{ fontSize: 10, color: "rgba(255,255,255,0.20)", fontFamily: "'Cinzel',serif", letterSpacing: 1 }}>
        Push bloqueado
      </div>
    );
  }

  return (
    <button
      onClick={subscribe}
      disabled={state === "loading"}
      title="Ativar notificações push"
      style={{
        background: "rgba(201,169,122,0.08)", border: "1px solid rgba(201,169,122,0.20)",
        borderRadius: 8, padding: "6px 10px", cursor: state === "loading" ? "default" : "pointer",
        display: "flex", alignItems: "center", gap: 5, color: "rgba(201,169,122,0.70)",
        fontSize: 10, fontFamily: "'Cinzel',serif", letterSpacing: 1.5, textTransform: "uppercase",
        transition: "all 0.2s", opacity: state === "loading" ? 0.6 : 1,
      }}
    >
      {state === "loading" ? (
        <svg width="12" height="12" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2.5" strokeLinecap="round" style={{ animation: "spin 1s linear infinite" }}>
          <path d="M21 12a9 9 0 1 1-6.219-8.56"/>
        </svg>
      ) : (
        <svg width="12" height="12" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round">
          <path d="M18 8A6 6 0 0 0 6 8c0 7-3 9-3 9h18s-3-2-3-9"/><path d="M13.73 21a2 2 0 0 1-3.46 0"/>
        </svg>
      )}
      Ativar push
    </button>
  );
}
