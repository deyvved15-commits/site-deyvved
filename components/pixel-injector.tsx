import { prisma } from "@/lib/prisma";
import Script from "next/script";
import CustomPixelInjector from "./custom-pixel-injector";

export default async function PixelInjector() {
  let config;
  try {
    config = await prisma.siteConfig.findUnique({ where: { id: "singleton" } });
  } catch {
    return null;
  }

  if (!config) return null;

  return (
    <>
      {/* Meta / Facebook Pixel */}
      {config.pixelMeta && (
        <Script id="meta-pixel" strategy="afterInteractive">{`
          !function(f,b,e,v,n,t,s)
          {if(f.fbq)return;n=f.fbq=function(){n.callMethod?
          n.callMethod.apply(n,arguments):n.queue.push(arguments)};
          if(!f._fbq)f._fbq=n;n.push=n;n.loaded=!0;n.version='2.0';
          n.queue=[];t=b.createElement(e);t.async=!0;
          t.src=v;s=b.getElementsByTagName(e)[0];
          s.parentNode.insertBefore(t,s)}(window, document,'script',
          'https://connect.facebook.net/en_US/fbevents.js');
          fbq('init', '${config.pixelMeta}');
          fbq('track', 'PageView');
        `}</Script>
      )}

      {/* Google Tag Manager */}
      {config.pixelGtm && (
        <Script id="gtm" strategy="afterInteractive">{`
          (function(w,d,s,l,i){w[l]=w[l]||[];w[l].push({'gtm.start':
          new Date().getTime(),event:'gtm.js'});var f=d.getElementsByTagName(s)[0],
          j=d.createElement(s),dl=l!='dataLayer'?'&l='+l:'';j.async=true;j.src=
          'https://www.googletagmanager.com/gtm.js?id='+i+dl;f.parentNode.insertBefore(j,f);
          })(window,document,'script','dataLayer','${config.pixelGtm}');
        `}</Script>
      )}

      {/* Google Analytics GA4 */}
      {config.pixelGa && (
        <>
          <Script
            id="ga4-src"
            strategy="afterInteractive"
            src={`https://www.googletagmanager.com/gtag/js?id=${config.pixelGa}`}
          />
          <Script id="ga4-init" strategy="afterInteractive">{`
            window.dataLayer = window.dataLayer || [];
            function gtag(){dataLayer.push(arguments);}
            gtag('js', new Date());
            gtag('config', '${config.pixelGa}');
          `}</Script>
        </>
      )}

      {/* Código personalizado */}
      {config.pixelCustom && (
        <CustomPixelInjector html={config.pixelCustom} />
      )}
    </>
  );
}
