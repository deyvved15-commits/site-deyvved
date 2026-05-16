"use client";

import { useEffect, useRef, useState } from "react";

export default function HtmlContent({
  html,
  className,
  style,
}: {
  html: string;
  className?: string;
  style?: React.CSSProperties;
}) {
  const ref = useRef<HTMLDivElement>(null);

  const isFullHtml = html.trim().toLowerCase().startsWith("<!doctype") || html.trim().toLowerCase().startsWith("<html");

  const [iframeHeight, setIframeHeight] = useState(500);

  useEffect(() => {
    if (!ref.current || isFullHtml) return;

    ref.current.innerHTML = html;

    ref.current.querySelectorAll("script").forEach(oldScript => {
      const newScript = document.createElement("script");
      Array.from(oldScript.attributes).forEach(attr =>
        newScript.setAttribute(attr.name, attr.value)
      );
      newScript.textContent = oldScript.textContent;
      oldScript.parentNode?.replaceChild(newScript, oldScript);
    });
  }, [html, isFullHtml]);

  useEffect(() => {
    if (!isFullHtml) return;
    
    const handleMessage = (e: MessageEvent) => {
      if (e.data.type === "resize-iframe" && e.data.height) {
        setIframeHeight(e.data.height);
      }
    };

    window.addEventListener("message", handleMessage);
    return () => window.removeEventListener("message", handleMessage);
  }, [isFullHtml]);

  if (isFullHtml) {
    // Injeta script de redimensionamento automático no HTML do usuário
    const resizeScript = `
      <script>
        function sendHeight() {
          const height = document.documentElement.scrollHeight;
          window.parent.postMessage({ type: "resize-iframe", height: height }, "*");
        }
        window.addEventListener("load", sendHeight);
        window.addEventListener("resize", sendHeight);
        // Observa mudanças no DOM
        const observer = new MutationObserver(sendHeight);
        observer.observe(document.body, { childList: true, subtree: true, attributes: true });
        // Envia inicialmente e após curto delay
        sendHeight();
        setTimeout(sendHeight, 1000);
      </script>
    `;
    
    const finalHtml = html.replace("</body>", `${resizeScript}</body>`);

    return (
      <div className={className} style={{ ...style, width: "100%", borderRadius: 16, overflow: "hidden", background: "#0a0f1e", border: "1px solid rgba(201,169,122,0.15)" }}>
        <iframe
          srcDoc={finalHtml}
          title="Custom Content"
          style={{ width: "100%", border: "none", height: iframeHeight, display: "block" }}
          sandbox="allow-scripts allow-popups allow-forms allow-modals"
        />
      </div>
    );
  }

  return <div ref={ref} className={className} style={style} />;
}
