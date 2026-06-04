import type { Metadata } from "next";
import { Poppins, Cinzel } from "next/font/google";
import Providers from "@/components/providers";
import SwRegister from "@/components/student/sw-register";
import PixelInjector from "@/components/pixel-injector";
import { Analytics } from "@vercel/analytics/next";
import "./globals.css";

const poppins = Poppins({
  subsets: ["latin"],
  weight: ["300", "400", "500", "600", "700"],
  variable: "--font-poppins",
  display: "swap",
});

const cinzel = Cinzel({
  subsets: ["latin"],
  weight: ["400", "500", "600", "700"],
  variable: "--font-cinzel",
  display: "swap",
});

export const metadata: Metadata = {
  title: "Kadima Academy — Escola Teológica Online",
  description: "Plataforma de ensino teológico da Kadima Academy",
  manifest: "/manifest.json",
  themeColor: "#060D1F",
  icons: {
    icon: "/icon-192.png",
    apple: "/apple-icon.png",
  },
  appleWebApp: {
    capable: true,
    statusBarStyle: "black-translucent",
    title: "Kadima Academy",
  },
};

export const viewport = {
  width: "device-width",
  initialScale: 1,
  maximumScale: 5,
  userScalable: true,
};


export default function RootLayout({ children }: { children: React.ReactNode }) {
  return (
    <html lang="pt-BR" className={`h-full ${poppins.variable} ${cinzel.variable}`}>
      <body className="h-full" style={{ fontFamily: "var(--font-poppins,'Poppins',sans-serif)" }}>
        <Providers>
          <SwRegister />
          <PixelInjector />
          {children}
        </Providers>
        <Analytics />
      </body>
    </html>
  );
}
