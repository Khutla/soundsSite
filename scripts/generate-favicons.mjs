import { writeFile } from "fs/promises";
import path from "path";
import { fileURLToPath } from "url";
import sharp from "sharp";
import toIco from "to-ico";

const __dirname = path.dirname(fileURLToPath(import.meta.url));
const root = path.join(__dirname, "..");
const logoPath = path.join(root, "public", "MkH.png");
const amber = { r: 245, g: 158, b: 11, alpha: 1 };

async function renderIcon(size) {
  const logo = await sharp(logoPath)
    .resize(Math.round(size * 0.82), Math.round(size * 0.82), {
      fit: "contain",
      background: { r: 0, g: 0, b: 0, alpha: 0 },
    })
    .toBuffer();

  return sharp({
    create: {
      width: size,
      height: size,
      channels: 4,
      background: amber,
    },
  })
    .composite([{ input: logo, gravity: "center" }])
    .png()
    .toBuffer();
}

const icon32 = await renderIcon(32);
const icon16 = await renderIcon(16);
const icon180 = await renderIcon(180);
const faviconIco = await toIco([icon16, icon32]);

await writeFile(path.join(root, "public", "favicon.ico"), faviconIco);
await writeFile(path.join(root, "src", "app", "icon.png"), icon32);
await writeFile(path.join(root, "src", "app", "apple-icon.png"), icon180);

console.log("Generated favicon.ico, icon.png, and apple-icon.png");
