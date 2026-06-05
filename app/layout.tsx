import type { Metadata } from "next";
import { Poppins, Cinzel } from "next/font/google";
import Providers from "@/components/providers";
import SwRegister from "@/components/student/sw-register";
import { Analytics } from "@vercel/analytics/next";
import { prisma } from "@/lib/prisma";
import { unstable_cache } from "next/cache";
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

const getSiteConfig = unstable_cache(
  async () => {
    try {
      return await prisma.siteConfig.findUnique({ where: { id: "singleton" } });
    } catch {
      return null;
    }
  },
  ["site-config"],
  { revalidate: 3600, tags: ["site-config"] }
);

export default async function RootLayout({ children }: { children: React.ReactNode }) {
  const config = await getSiteConfig();

  return (
    <html lang="pt-BR" className={`h-full ${poppins.variable} ${cinzel.variable}`}>
      <head>
        {/* Meta / Facebook Pixel */}
        {config?.pixelMeta && (
          <>
            <script dangerouslySetInnerHTML={{ __html: `
              !function(f,b,e,v,n,t,s){if(f.fbq)return;n=f.fbq=function(){n.callMethod?
              n.callMethod.apply(n,arguments):n.queue.push(arguments)};if(!f._fbq)f._fbq=n;
              n.push=n;n.loaded=!0;n.version='2.0';n.queue=[];t=b.createElement(e);t.async=!0;
              t.src=v;s=b.getElementsByTagName(e)[0];s.parentNode.insertBefore(t,s)}
              (window,document,'script','https://connect.facebook.net/en_US/fbevents.js');
              fbq('init','${config.pixelMeta}');fbq('track','PageView');
            `}} />
          </>
        )}

        {/* Google Tag Manager */}
        {config?.pixelGtm && (
          <script dangerouslySetInnerHTML={{ __html: `
            (function(w,d,s,l,i){w[l]=w[l]||[];w[l].push({'gtm.start':
            new Date().getTime(),event:'gtm.js'});var f=d.getElementsByTagName(s)[0],
            j=d.createElement(s),dl=l!='dataLayer'?'&l='+l:'';j.async=true;j.src=
            'https://www.googletagmanager.com/gtm.js?id='+i+dl;
            f.parentNode.insertBefore(j,f);
            })(window,document,'script','dataLayer','${config.pixelGtm}');
          `}} />
        )}

        {/* Google Analytics GA4 */}
        {config?.pixelGa && (
          <>
            {/* eslint-disable-next-line @next/next/no-sync-scripts */}
            <script async src={`https://www.googletagmanager.com/gtag/js?id=${config.pixelGa}`} />
            <script dangerouslySetInnerHTML={{ __html: `
              window.dataLayer = window.dataLayer || [];
              function gtag(){dataLayer.push(arguments);}
              gtag('js', new Date());
              gtag('config', '${config.pixelGa}');
            `}} />
          </>
        )}

        {/* Código personalizado */}
        {config?.pixelCustom && (
          <script dangerouslySetInnerHTML={{ __html: `
            (function(){
              var div = document.createElement('div');
              div.innerHTML = ${JSON.stringify(config.pixelCustom)};
              Array.from(div.querySelectorAll('script')).forEach(function(s){
                var ns = document.createElement('script');
                if(s.src) ns.src = s.src; else ns.textContent = s.textContent;
                ns.async = s.async;
                document.head.appendChild(ns);
              });
            })();
          `}} />
        )}
      </head>
      <body className="h-full" style={{ fontFamily: "var(--font-poppins,'Poppins',sans-serif)" }}>
        <Providers>
          <SwRegister />
          {children}
        </Providers>
        <Analytics />
      </body>
    </html>
  );
}
