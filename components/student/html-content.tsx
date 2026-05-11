"use client";

import { useEffect, useRef } from "react";

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

  if (isFullHtml) {
    return (
      <div className={className} style={{ ...style, width: "100%", borderRadius: 12, overflow: "hidden", border: "1px solid rgba(255,255,255,0.05)" }}>
        <iframe
          srcDoc={html}
          title="Custom Content"
          style={{ width: "100%", border: "none", minHeight: "500px" }}
          sandbox="allow-scripts allow-popups allow-forms allow-modals"
        />
      </div>
    );
  }

  return <div ref={ref} className={className} style={style} />;
}
