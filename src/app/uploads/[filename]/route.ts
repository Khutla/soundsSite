import { readFile } from "fs/promises";
import path from "path";
import { NextResponse } from "next/server";
import {
  contentTypeForFilename,
  getUploadDir,
  isSafeUploadFilename,
} from "@/lib/uploads";

type Ctx = { params: Promise<{ filename: string }> };

export async function GET(_req: Request, ctx: Ctx) {
  const { filename } = await ctx.params;
  if (!isSafeUploadFilename(filename)) {
    return new NextResponse("Not found", { status: 404 });
  }

  try {
    const filePath = path.join(getUploadDir(), filename);
    const buf = await readFile(filePath);
    return new NextResponse(buf, {
      headers: {
        "Content-Type": contentTypeForFilename(filename),
        "Cache-Control": "public, max-age=31536000, immutable",
      },
    });
  } catch {
    return new NextResponse("Not found", { status: 404 });
  }
}
