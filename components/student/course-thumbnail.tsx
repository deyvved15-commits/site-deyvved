"use client";

interface Props { src: string; alt: string }

export default function CourseThumbnail({ src, alt }: Props) {
  return (
    <img
      src={src}
      alt={alt}
      className="ka-thumb-img"
      onError={e => { (e.currentTarget as HTMLImageElement).style.display = "none"; }}
    />
  );
}
