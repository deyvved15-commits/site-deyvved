"use client";

import { useState } from "react";
import { getGoogleDriveImageUrl } from "@/lib/utils";

interface Props { src: string; alt: string }

export default function CourseThumbnail({ src, alt }: Props) {
  const [error, setError] = useState(false);

  const imageUrl = src?.includes("drive.google.com")
    ? getGoogleDriveImageUrl(src)
    : src;

  if (error || !imageUrl) return null;

  return (
    <img
      src={imageUrl}
      alt={alt}
      className="ka-thumb-img"
      onError={() => setError(true)}
    />
  );
}
