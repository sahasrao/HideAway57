import "dotenv/config";
import fs from "fs";
import path from "path";
import JSZip from "jszip";

const INSTALLERS_DIR = path.join(process.cwd(), "installers");

const games = [
  { id: "raspberry-boi", title: "Adventures of Raspberry Boi" },
  { id: "cookie-bubble", title: "Cookie Cutter Bubble Shooter" },
  { id: "donut-duelers", title: "Donut Duelers" },
  { id: "froot-shooter", title: "Froot Shooter" },
  { id: "enchanting-broccoli", title: "The Enchanting Broccoli" },
  { id: "western-roller", title: "Western Roller" },
];

async function buildZip(game: (typeof games)[0]): Promise<Buffer> {
  const zip = new JSZip();
  zip.file(
    "README.txt",
    `${game.title} — HideAway 57\n\nRun install.bat or install.sh to play!`
  );
  zip.file("install.bat", `@echo off\necho Installing ${game.title}...\npause`);
  zip.file("install.sh", `#!/bin/bash\necho "Installing ${game.title}..."`, {
    unixPermissions: 0o755,
  });
  zip.file(
    "manifest.json",
    JSON.stringify({ gameId: game.id, title: game.title, version: "1.0.0" }, null, 2)
  );
  return zip.generateAsync({ type: "nodebuffer", compression: "DEFLATE" });
}

async function main() {
  await fs.promises.mkdir(INSTALLERS_DIR, { recursive: true });
  for (const game of games) {
    const buffer = await buildZip(game);
    await fs.promises.writeFile(
      path.join(INSTALLERS_DIR, `${game.id}.zip`),
      buffer
    );
    console.log(`Built ${game.id}.zip`);
  }
}

main().catch((e) => {
  console.error(e);
  process.exit(1);
});
