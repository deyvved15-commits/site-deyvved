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

  useEffect(() => {
    if (!ref.current) return;

    // Reset DOM — força o browser a reprocessar o HTML do zero
    ref.current.innerHTML = html;

    // Re-executa <script> tags (navegação client-side não executa automaticamente)
    ref.current.querySelectorAll("script").forEach(oldScript => {
      const newScript = document.createElement("script");
      Array.from(oldScript.attributes).forEach(attr =>
        newScript.setAttribute(attr.name, attr.value)
      );
      newScript.textContent = oldScript.textContent;
      oldScript.parentNode?.replaceChild(newScript, oldScript);
    });
  }, [html]);

  return <div ref={ref} className={className} style={style} />;
}
