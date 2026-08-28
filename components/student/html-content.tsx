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
          var h = document.documentElement.scrollHeight;
          try { window.parent.postMessage({ type: "resize-iframe", height: h }, "*"); } catch(e) {}
        }
        window.addEventListener("load", sendHeight);
        window.addEventListener("resize", sendHeight);
        new MutationObserver(sendHeight).observe(document.body, { childList: true, subtree: true, attributes: true });
        sendHeight();
        setTimeout(sendHeight, 1000);
      </script>
    `;

    // Use lastIndexOf to always inject before the real closing </body>, even if
    // the HTML contains </body> inside a JS string or template literal.
    const closeBodyIdx = html.lastIndexOf("</body>");
    const finalHtml = closeBodyIdx !== -1
      ? html.slice(0, closeBodyIdx) + resizeScript + html.slice(closeBodyIdx)
      : html + resizeScript;

    return (
      <div className={className} style={{ ...style, width: "100%", borderRadius: 16, overflow: "hidden", background: "#0a0f1e", border: "1px solid rgba(201,169,122,0.15)" }}>
        <iframe
          srcDoc={finalHtml}
          title="Custom Content"
          style={{ width: "100%", border: "none", height: iframeHeight, display: "block" }}
          sandbox="allow-scripts allow-same-origin allow-popups allow-forms allow-modals"
        />
      </div>
    );
  }

  return <div ref={ref} className={className} style={style} />;
}
