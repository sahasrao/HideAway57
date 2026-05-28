/**
 * Build 16:9 carousel banners from Figma card art (crop title bar, content-aware framing).
 * Output: public/games/carousel/{gameId}.png at 3840×2160, 300 DPI.
 */
import fs from "fs/promises";
import path from "path";
import sharp from "sharp";
import { FEATURED_GAME_IDS } from "../src/lib/game-assets";

const OUT_DIR = path.resolve("public/games/carousel");
const CAROUSEL_DPI = 300;
const CAROUSEL_WIDTH = 3840;
const CAROUSEL_HEIGHT = 2160;
const TARGET_ASPECT = CAROUSEL_WIDTH / CAROUSEL_HEIGHT;
/** Title bar on 415×294 Figma card components. */
const CARD_TITLE_RATIO = 54 / 294;
/** Padding around detected content before 16:9 framing. */
const CONTENT_PAD_RATIO = 0.04;

/** Optional focal-point overrides (0–1) when auto-detect needs a nudge. */
const FOCUS_OVERRIDES: Partial<
  Record<(typeof FEATURED_GAME_IDS)[number], { x?: number; y?: number }>
> = {
  "froot-shooter": { y: 0.52 },
  "raspberry-boi": { x: 0.48, y: 0.54 },
  "cookie-bubble": { y: 0.5 },
  "donut-duelers": { y: 0.52 },
  "enchanting-broccoli": { x: 0.45, y: 0.5 },
  "western-roller": { x: 0.52, y: 0.55 },
};

type Bounds = { left: number; top: number; width: number; height: number };

function clamp(value: number, min: number, max: number) {
  return Math.max(min, Math.min(max, value));
}

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

function contentBounds(
  data: Buffer,
  width: number,
  height: number,
  channels: number
): Bounds {
  const idx = (x: number, y: number) => (y * width + x) * channels;
  let minX = width;
  let maxX = 0;
  let minY = height;
  let maxY = 0;

  for (let y = 0; y < height; y++) {
    for (let x = 0; x < width; x++) {
      const i = idx(x, y);
      const r = data[i]!;
      const g = data[i + 1]!;
      const b = data[i + 2]!;
      const lum = 0.299 * r + 0.587 * g + 0.114 * b;
      if (lum > 42 || r + g + b > 100) {
        minX = Math.min(minX, x);
        maxX = Math.max(maxX, x);
        minY = Math.min(minY, y);
        maxY = Math.max(maxY, y);
      }
    }
  }

  if (maxX <= minX || maxY <= minY) {
    return { left: 0, top: 0, width, height };
  }

  const padX = Math.round((maxX - minX + 1) * CONTENT_PAD_RATIO);
  const padY = Math.round((maxY - minY + 1) * CONTENT_PAD_RATIO);

  return {
    left: clamp(minX - padX, 0, width - 1),
    top: clamp(minY - padY, 0, height - 1),
    width: clamp(maxX - minX + 1 + padX * 2, 1, width),
    height: clamp(maxY - minY + 1 + padY * 2, 1, height),
  };
}

function cropToAspect(
  width: number,
  height: number,
  focusX: number,
  focusY: number,
  aspect: number
): Bounds {
  const srcAspect = width / height;

  if (srcAspect >= aspect) {
    const cropW = Math.round(height * aspect);
    const left = clamp(Math.round((width - cropW) * focusX), 0, width - cropW);
    return { left, top: 0, width: cropW, height };
  }

  const cropH = Math.round(width / aspect);
  const top = clamp(Math.round((height - cropH) * focusY), 0, height - cropH);
  return { left: 0, top, width, height: cropH };
}

async function toCarousel(gameId: (typeof FEATURED_GAME_IDS)[number]) {
  const cardPath = path.resolve(`public/games/cards/${gameId}.png`);
  const dest = path.join(OUT_DIR, `${gameId}.png`);
  const override = FOCUS_OVERRIDES[gameId];

  const { data, info } = await cardArtBuffer(cardPath);
  const { data: raw, info: rawInfo } = await sharp(data)
    .raw()
    .toBuffer({ resolveWithObject: true });

  const content = contentBounds(
    raw,
    rawInfo.width,
    rawInfo.height,
    rawInfo.channels
  );

  const focusX = override?.x ?? 0.5;
  const focusY = override?.y ?? 0.5;

  const tight = await sharp(data)
    .extract({
      left: content.left,
      top: content.top,
      width: Math.min(content.width, rawInfo.width - content.left),
      height: Math.min(content.height, rawInfo.height - content.top),
    })
    .toBuffer({ resolveWithObject: true });

  const framed = cropToAspect(
    tight.info.width,
    tight.info.height,
    focusX,
    focusY,
    TARGET_ASPECT
  );

  await sharp(tight.data)
    .extract(framed)
    .resize(CAROUSEL_WIDTH, CAROUSEL_HEIGHT, {
      fit: "fill",
      kernel: sharp.kernel.lanczos3,
    })
    .sharpen({ sigma: 0.45, m1: 0.4, m2: 0.12 })
    .withMetadata({ density: CAROUSEL_DPI })
    .png({ compressionLevel: 3, adaptiveFiltering: true, effort: 10 })
    .toFile(dest);

  console.log(
    `Wrote carousel/${gameId}.png (${CAROUSEL_WIDTH}×${CAROUSEL_HEIGHT}, ${CAROUSEL_DPI} DPI, focus=${focusX.toFixed(2)},${focusY.toFixed(2)})`
  );
}

async function main() {
  await fs.mkdir(OUT_DIR, { recursive: true });
  for (const id of FEATURED_GAME_IDS) {
    await toCarousel(id);
  }
}

main().catch((err) => {
  console.error(err);
  process.exit(1);
});
