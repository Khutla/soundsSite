import path from "path";

const UPLOAD_SEGMENT = "uploads";

export function getUploadDir(): string {
  const fromEnv = process.env.UPLOAD_DIR?.trim();
  if (fromEnv) return fromEnv;

  return path.join(
    /* turbopackIgnore: true */ process.cwd(),
    "public",
    UPLOAD_SEGMENT
  );
}

export function isSafeUploadFilename(filename: string): boolean {
  return /^[a-f0-9]{32}\.(jpg|jpeg|png|webp|gif)$/i.test(filename);
}

export function contentTypeForFilename(filename: string): string {
  const ext = filename.split(".").pop()?.toLowerCase();
  switch (ext) {
    case "png":
      return "image/png";
    case "webp":
      return "image/webp";
    case "gif":
      return "image/gif";
    default:
      return "image/jpeg";
  }
}

export function uploadPublicUrl(filename: string): string {
  return `/${UPLOAD_SEGMENT}/${filename}`;
}
