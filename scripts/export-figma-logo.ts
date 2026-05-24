/**
 * Export the HideAway 57 sidebar logo from the Figma file via the REST API.
 *
 * Requires a personal access token: https://www.figma.com/developers/api#access-tokens
 * Add to .env: FIGMA_ACCESS_TOKEN=figd_...
 *
 * Component: HIDEAWAY 57 — symbol node 347:1340 (294×52)
 * File: https://www.figma.com/design/5IVZKNcyYlVmnFUADUXuYa/HideAway57
 */
import "dotenv/config";
import fs from "fs/promises";
import path from "path";

const FILE_KEY = "5IVZKNcyYlVmnFUADUXuYa";
const LOGO_NODE_ID = "347:1340";
const OUT_DIR = path.resolve("public");
const LOGO_ICON_OUT = path.join(OUT_DIR, "logo.png");
const LOGO_WORDMARK_OUT = path.join(OUT_DIR, "logo-wordmark.png");

async function fetchImageUrl(
  token: string,
  nodeId: string,
  format: "png" | "svg",
  scale: number
): Promise<string | null> {
  const params = new URLSearchParams({
    ids: nodeId,
    format,
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
  return json.images[nodeId] ?? null;
}

async function download(url: string): Promise<Buffer> {
  const res = await fetch(url);
  if (!res.ok) throw new Error(`Download failed ${res.status}: ${url}`);
  return Buffer.from(await res.arrayBuffer());
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

  const pngUrl = await fetchImageUrl(token, LOGO_NODE_ID, "png", 3);
  if (!pngUrl) {
    console.error(`No export URL for logo node ${LOGO_NODE_ID}`);
    process.exit(1);
  }

  const png = await download(pngUrl);
  await fs.writeFile(LOGO_WORDMARK_OUT, png);
  console.log(`Wrote ${LOGO_WORDMARK_OUT} (full wordmark from Figma)`);

  const svgUrl = await fetchImageUrl(token, LOGO_NODE_ID, "svg", 1);
  if (svgUrl) {
    const svg = await download(svgUrl);
    const svgPath = path.join(OUT_DIR, "logo.svg");
    await fs.writeFile(svgPath, svg);
    console.log(`Wrote ${svgPath}`);
  }

  console.log(
    "\nTip: crop the icon mark from logo-wordmark.png for sidebar use, or update Logo.tsx to use logo-wordmark.png directly."
  );
  console.log(`Icon path target: ${LOGO_ICON_OUT}`);
}

main().catch((err) => {
  console.error(err);
  process.exit(1);
});
