import { NextRequest, NextResponse } from "next/server";
import { auth } from "@/lib/auth";

const SUPABASE_URL = process.env.SUPABASE_URL ?? "https://hukcxhrrywtjghcocnji.supabase.co";
const SUPABASE_SERVICE_ROLE_KEY = process.env.SUPABASE_SERVICE_ROLE_KEY ?? "";
const BUCKET = "avatars";

const ALLOWED: Record<string, string> = {
  "image/jpeg": "jpg",
  "image/jpg": "jpg",
  "image/png": "png",
  "image/webp": "webp",
  "image/heic": "heic",
  "image/heif": "heif",
  "image/gif": "gif",
};

export async function POST(req: NextRequest) {
  const session = await auth();
  if (!session) return NextResponse.json({ error: "Unauthorized" }, { status: 401 });

  const formData = await req.formData();
  const file = formData.get("file") as File | null;

  if (!file) return NextResponse.json({ error: "Nenhum arquivo enviado." }, { status: 400 });

  const ext = ALLOWED[file.type];
  if (!ext) {
    console.error("[upload/avatar] tipo não suportado:", file.type);
    return NextResponse.json({ error: `Formato não suportado (${file.type}). Use JPG, PNG ou WebP.` }, { status: 400 });
  }

  if (file.size > 5 * 1024 * 1024) {
    return NextResponse.json({ error: "Imagem muito grande. Máximo 5MB." }, { status: 400 });
  }

  const path = `${session.user.id}.${ext}`;
  const bytes = await file.arrayBuffer();

  const uploadUrl = `${SUPABASE_URL}/storage/v1/object/${BUCKET}/${path}`;

  const uploadRes = await fetch(uploadUrl, {
    method: "POST",
    headers: {
      Authorization: `Bearer ${SUPABASE_SERVICE_ROLE_KEY}`,
      "Content-Type": file.type,
      "x-upsert": "true",
    },
    body: bytes,
  });

  if (!uploadRes.ok) {
    const err = await uploadRes.text();
    console.error("[upload/avatar] Supabase error:", uploadRes.status, err);
    return NextResponse.json({ error: "Erro ao fazer upload. Verifique o bucket no Supabase." }, { status: 500 });
  }

  const publicUrl = `${SUPABASE_URL}/storage/v1/object/public/${BUCKET}/${path}`;
  return NextResponse.json({ url: publicUrl });
}
