/**
 * Build full-width game detail banners from Figma card art.
 * Output: public/games/banners/{gameId}.png at 3840×2220, 300 DPI (415:240 art).
 */
import fs from "fs/promises";
import path from "path";
import sharp from "sharp";
import { FEATURED_GAME_IDS } from "../src/lib/game-assets";

const OUT_DIR = path.resolve("public/games/banners");
const BANNER_DPI = 300;
const BANNER_WIDTH = 3840;
/** Figma card art area after title bar crop (~415×240). */
const BANNER_HEIGHT = Math.round(BANNER_WIDTH * (240 / 415));
const CARD_TITLE_RATIO = 54 / 294;

async function cardArtBuffer(cardPath: string) {
  const meta = await sharp(cardPath).metadata();
  const width = meta.width ?? 420;
  const height = meta.height ?? 294;
  const titleHeight = Math.round(height * CARD_TITLE_RATIO);

  return sharp(cardPath)
    .extract({
      left: 0,
      top: 0,
      width,
      height: Math.max(1, height - titleHeight),
    })
    .toBuffer({ resolveWithObject: true });
}

async function toBanner(gameId: (typeof FEATURED_GAME_IDS)[number]) {
  const cardPath = path.resolve(`public/games/cards/${gameId}.png`);
  const dest = path.join(OUT_DIR, `${gameId}.png`);

  const { data, info } = await cardArtBuffer(cardPath);
  const midWidth = Math.max(info.width * 2, Math.round(BANNER_WIDTH / 2));
  const midHeight = Math.round(midWidth * (info.height / info.width));

  await sharp(data)
    .resize(midWidth, midHeight, {
      fit: "fill",
      kernel: sharp.kernel.lanczos3,
    })
    .resize(BANNER_WIDTH, BANNER_HEIGHT, {
      fit: "fill",
      kernel: sharp.kernel.lanczos3,
    })
    .sharpen({ sigma: 0.45, m1: 0.4, m2: 0.12 })
    .withMetadata({ density: BANNER_DPI })
    .png({ compressionLevel: 3, adaptiveFiltering: true, effort: 10 })
    .toFile(dest);

  console.log(
    `Wrote banners/${gameId}.png (${BANNER_WIDTH}×${BANNER_HEIGHT}, ${BANNER_DPI} DPI)`
  );
}

async function main() {
  await fs.mkdir(OUT_DIR, { recursive: true });
  for (const id of FEATURED_GAME_IDS) {
    await toBanner(id);
  }
}

main().catch((err) => {
  console.error(err);
  process.exit(1);
});
