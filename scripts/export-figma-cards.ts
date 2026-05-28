/**
 * Export hi-fidelity desktop game card PNGs from Figma component nodes.
 *
 * Requires FIGMA_ACCESS_TOKEN in .env
 * File: https://www.figma.com/design/5IVZKNcyYlVmnFUADUXuYa/HideAway57
 */
import "dotenv/config";
import fs from "fs/promises";
import path from "path";

const FILE_KEY = "5IVZKNcyYlVmnFUADUXuYa";
const OUT_DIR = path.resolve("public/games/cards");

const CARDS = [
  { id: "raspberry-boi", nodeId: "412:698" },
  { id: "cookie-bubble", nodeId: "412:701" },
  { id: "donut-duelers", nodeId: "412:705" },
  { id: "froot-shooter", nodeId: "412:706" },
  { id: "enchanting-broccoli", nodeId: "412:707" },
  { id: "western-roller", nodeId: "412:708" },
] as const;

async function fetchImageUrls(token: string, nodeIds: string[]) {
  const params = new URLSearchParams({
    ids: nodeIds.join(","),
    format: "png",
    scale: "4",
  });
  const res = await fetch(
    `https://api.figma.com/v1/images/${FILE_KEY}?${params}`,
    { headers: { "X-Figma-Token": token } }
  );
  if (!res.ok) {
    throw new Error(`Figma images API ${res.status}: ${await res.text()}`);
  }
  const json = (await res.json()) as { images: Record<string, string | null> };
  return json.images;
}

async function download(url: string): Promise<Buffer> {
  const res = await fetch(url);
  if (!res.ok) throw new Error(`Download failed ${res.status}`);
  return Buffer.from(await res.arrayBuffer());
}

async function main() {
  const token = process.env.FIGMA_ACCESS_TOKEN?.trim();
  if (!token) {
    console.error("Missing FIGMA_ACCESS_TOKEN in .env");
    process.exit(1);
  }

  await fs.mkdir(OUT_DIR, { recursive: true });
  const nodeIds = CARDS.map((c) => c.nodeId);
  const urls = await fetchImageUrls(token, nodeIds);

  for (const card of CARDS) {
    const url = urls[card.nodeId];
    if (!url) {
      console.warn(`No image URL for ${card.id} (${card.nodeId})`);
      continue;
    }
    const png = await download(url);
    await fs.writeFile(path.join(OUT_DIR, `${card.id}.png`), png);
    console.log(`Wrote cards/${card.id}.png`);
  }
}

main().catch((e) => {
  console.error(e);
  process.exit(1);
});
