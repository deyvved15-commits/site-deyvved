"use client";

import { useState } from "react";

interface Props { src: string; alt: string }

export default function CourseThumbnail({ src, alt }: Props) {
  const [error, setError] = useState(false);

  if (error) return null;

  return (
    <img
      src={src}
      alt={alt}
      className="ka-thumb-img"
      onError={() => setError(true)}
    />
  );
}
