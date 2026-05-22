/**
 * Export game cover PNGs from the HideAway57 Figma file via the REST API.
 *
 * Requires a personal access token: https://www.figma.com/developers/api#access-tokens
 * Add to .env: FIGMA_ACCESS_TOKEN=figd_...
 *
 * File: https://www.figma.com/design/5IVZKNcyYlVmnFUADUXuYa/HideAway57
 */
import "dotenv/config";
import fs from "fs/promises";
import path from "path";
import sharp from "sharp";

const FILE_KEY = "5IVZKNcyYlVmnFUADUXuYa";
const OUT_DIR = path.resolve("public/games");

/** Card component symbols (415×294). Bottom ~54px is the title bar — crop for cover art only. */
const CARD_TITLE_HEIGHT = 54;

const GAMES = [
  { id: "raspberry-boi", nodeId: "412:698" },
  { id: "cookie-bubble", nodeId: "412:701" },
  { id: "donut-duelers", nodeId: "412:705" },
  { id: "froot-shooter", nodeId: "412:706" },
  { id: "enchanting-broccoli", nodeId: "412:707" },
  { id: "western-roller", nodeId: "412:708" },
] as const;

async function fetchImageUrls(
  token: string,
  nodeIds: string[],
  scale: number
): Promise<Record<string, string | null>> {
  const params = new URLSearchParams({
    ids: nodeIds.join(","),
    format: "png",
    scale: String(scale),
  });
  const res = await fetch(
    `https://api.figma.com/v1/images/${FILE_KEY}?${params}`,
    { headers: { "X-Figma-Token": token } }
  );
  if (!res.ok) {
    const body = await res.text();
    throw new Error(`Figma images API ${res.status}: ${body}`);
  }
  const json = (await res.json()) as { images: Record<string, string | null> };
  return json.images;
}

async function download(url: string): Promise<Buffer> {
  const res = await fetch(url);
  if (!res.ok) throw new Error(`Download failed ${res.status}: ${url}`);
  return Buffer.from(await res.arrayBuffer());
}

async function saveCardCover(id: string, png: Buffer) {
  const meta = await sharp(png).metadata();
  const width = meta.width ?? 415;
  const height = meta.height ?? 294;
  const coverHeight = Math.max(1, height - CARD_TITLE_HEIGHT);

  const dest = path.join(OUT_DIR, `${id}.png`);
  await sharp(png)
    .extract({ left: 0, top: 0, width, height: coverHeight })
    .resize(512, 512, { fit: "cover", position: "centre" })
    .png()
    .toFile(dest);
  console.log(`Wrote ${id}.png (${width}×${coverHeight} cropped from card)`);
}

async function main() {
  const token = process.env.FIGMA_ACCESS_TOKEN?.trim();
  if (!token) {
    console.error(
      "Missing FIGMA_ACCESS_TOKEN in .env\n" +
        "Create one at https://www.figma.com/developers/api#access-tokens"
    );
    process.exit(1);
  }

  await fs.mkdir(OUT_DIR, { recursive: true });

  const nodeIds = GAMES.map((g) => g.nodeId);
  const images = await fetchImageUrls(token, nodeIds, 2);

  for (const game of GAMES) {
    const url = images[game.nodeId];
    if (!url) {
      console.error(`No export URL for ${game.id} (${game.nodeId})`);
      continue;
    }
    const png = await download(url);
    await saveCardCover(game.id, png);
  }

  console.log("\nDone. Re-seed with: npx tsx prisma/seed.ts");
}

main().catch((err) => {
  console.error(err);
  process.exit(1);
});
