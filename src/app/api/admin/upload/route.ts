import { writeFile, mkdir } from "fs/promises";
import path from "path";
import crypto from "crypto";
import { NextResponse } from "next/server";
import { requireAdminApi } from "@/lib/admin-api";
import { getUploadDir, uploadPublicUrl } from "@/lib/uploads";

const MAX_BYTES = 5 * 1024 * 1024;
const ALLOWED = new Set(["image/jpeg", "image/png", "image/webp", "image/gif"]);

export async function POST(req: Request) {
  const auth = await requireAdminApi();
  if (auth instanceof Response) return auth;

  try {
    const ct = req.headers.get("content-type") ?? "";
    if (!ct.includes("multipart/form-data")) {
      return NextResponse.json({ error: "Expected multipart form." }, { status: 400 });
    }

    const form = await req.formData();
    const file = form.get("file");
    if (!(file instanceof File)) {
      return NextResponse.json({ error: "Missing file." }, { status: 400 });
    }

    if (!ALLOWED.has(file.type)) {
      return NextResponse.json(
        { error: "Only JPG, PNG, WebP, or GIF are allowed." },
        { status: 400 }
      );
    }

    const buf = Buffer.from(await file.arrayBuffer());
    if (buf.byteLength > MAX_BYTES) {
      return NextResponse.json({ error: "File too large (max 5MB)." }, { status: 400 });
    }

    const ext =
      file.type === "image/jpeg"
        ? "jpg"
        : file.type === "image/png"
          ? "png"
          : file.type === "image/webp"
            ? "webp"
            : "gif";

    const name = `${crypto.randomBytes(16).toString("hex")}.${ext}`;
    const uploadDir = getUploadDir();
    await mkdir(uploadDir, { recursive: true });
    const diskPath = path.join(uploadDir, name);
    await writeFile(diskPath, buf);

    const url = uploadPublicUrl(name);
    return NextResponse.json({ url });
  } catch (e) {
    console.error(e);
    return NextResponse.json({ error: "Upload failed." }, { status: 500 });
  }
}
