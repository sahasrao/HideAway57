import fs from "fs";
import path from "path";

const INSTALLERS_DIR = path.join(process.cwd(), "installers");

export function getInstallerPath(filename: string): string | null {
  if (!filename || filename.includes("..") || filename.includes("/")) {
    return null;
  }
  const fullPath = path.join(INSTALLERS_DIR, filename);
  if (!fs.existsSync(fullPath)) return null;
  return fullPath;
}

export function getInstallersDir(): string {
  return INSTALLERS_DIR;
}
