/**
 * Fallback: crop game covers from a Figma mockup screenshot.
 * Prefer `npm run covers:figma` when FIGMA_ACCESS_TOKEN is set.
 *
 * Figma file: https://www.figma.com/design/5IVZKNcyYlVmnFUADUXuYa/HideAway57
 */
import sharp from "sharp";
import path from "path";

const home = path.resolve(
  "/Users/sahasra/.cursor/projects/Users-sahasra-Desktop-HideAway57/assets/Screenshot_2026-05-21_at_23.13.50-665c00d3-32e7-4d47-834a-2c90387b7076.png"
);
const outDir = path.resolve("/Users/sahasra/Desktop/HideAway57/public/games");

async function crop(
  src: string,
  name: string,
  left: number,
  top: number,
  width: number,
  height: number
) {
  const dest = path.join(outDir, `${name}.png`);
  await sharp(src)
    .extract({ left, top, width, height })
    .resize(512, 512, { fit: "cover", position: "centre" })
    .png()
    .toFile(dest);
  console.log(`Wrote ${name}.png (${width}x${height} @ ${left},${top})`);
}

async function main() {
  const leftCol = { x: 192, w: 204 };
  const rightCol = { x: 416, w: 205 };
  const rows = [
    { y: 372, h: 124 },
    { y: 549, h: 127 },
    { y: 721, h: 127 },
  ];

  const grid = [
    { id: "raspberry-boi", col: leftCol, row: 0 },
    { id: "cookie-bubble", col: rightCol, row: 0 },
    { id: "donut-duelers", col: leftCol, row: 1 },
    { id: "froot-shooter", col: rightCol, row: 1 },
    { id: "enchanting-broccoli", col: leftCol, row: 2 },
    { id: "western-roller", col: rightCol, row: 2 },
  ];

  for (const g of grid) {
    const { y, h } = rows[g.row];
    await crop(home, g.id, g.col.x, y, g.col.w, h);
  }
}

main().catch((e) => {
  console.error(e);
  process.exit(1);
});
