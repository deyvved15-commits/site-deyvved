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
    const handleMessage = (e: MessageEvent) => {
      if (e.data?.type === "resize-iframe" && e.data.height) {
        setIframeHeight(e.data.height);
      }
    };
    window.addEventListener("message", handleMessage);
    return () => window.removeEventListener("message", handleMessage);
  }, []);

  // Detecta se é um único <iframe src="..."> apontando para URL interna
  const singleIframeMatch = html.trim().match(/^<iframe\s[^>]*src=["']([^"']+)["'][^>]*><\/iframe>$/i)
    || html.trim().match(/^<iframe\s[^>]*src=["']([^"']+)["'][^>]*\/>$/i);
  const iframeSrc = singleIframeMatch ? singleIframeMatch[1] : null;

  if (iframeSrc) {
    return (
      <div className={className} style={{ ...style, width: "100%", borderRadius: 16, overflow: "hidden", background: "#0a0f1e", border: "1px solid rgba(201,169,122,0.15)" }}>
        <iframe
          src={iframeSrc}
          title="Material da Aula"
          style={{ width: "100%", border: "none", height: iframeHeight, display: "block", minHeight: 600 }}
          allow="scripts popups forms"
        />
      </div>
    );
  }

  if (isFullHtml) {
    const resizeScript = `
      <script>
        function sendHeight() {
          const height = document.documentElement.scrollHeight;
          window.parent.postMessage({ type: "resize-iframe", height: height }, "*");
        }
        window.addEventListener("load", sendHeight);
        window.addEventListener("resize", sendHeight);
        new MutationObserver(sendHeight).observe(document.body, { childList: true, subtree: true, attributes: true });
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
