"use client";

import { useEffect } from "react";

export default function CustomPixelInjector({ html }: { html: string }) {
  useEffect(() => {
    const range = document.createRange();
    range.selectNode(document.head);
    const fragment = range.createContextualFragment(html);
    document.head.appendChild(fragment);
  }, [html]);

  return null;
}
