import fs from "node:fs";
import os from "node:os";
import path from "node:path";
import { fileURLToPath } from "node:url";

const __dirname = path.dirname(fileURLToPath(import.meta.url));

export const rootDir = path.resolve(__dirname, "..");
export const distDir = path.join(rootDir, "dist");
export const MODULE_NAME = "monologue-token";

export function getFoundryDataPath() {
  const cliArg = process.argv[2];
  if (cliArg) {
    console.log(`Using custom path from argument: ${cliArg}`);
    return cliArg;
  }

  const envPath = process.env.FOUNDRY_DATA;
  if (envPath) {
    console.log(`Using path from FOUNDRY_DATA env: ${envPath}`);
    return envPath;
  }

  const home = os.homedir();
  const platform = os.platform();

  const paths = {
    win32: path.join(home, "AppData", "Local", "FoundryVTT", "Data"),
    darwin: path.join(home, "Library", "Application Support", "FoundryVTT", "Data"),
    linux: path.join(home, ".local", "share", "FoundryVTT", "Data"),
  };

  const detected = paths[platform];
  if (!detected) {
    console.error(`Unsupported platform: ${platform}`);
    process.exit(1);
  }

  console.log(`Auto-detected Foundry data path: ${detected}`);
  return detected;
}

export function getTargetPath() {
  const foundryData = getFoundryDataPath();
  return path.join(foundryData, "modules", MODULE_NAME);
}

export function isSymlink(p) {
  try {
    return fs.lstatSync(p).isSymbolicLink();
  } catch {
    return false;
  }
}
