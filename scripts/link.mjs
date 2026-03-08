import fs from "node:fs";
import os from "node:os";
import path from "node:path";
import { fileURLToPath } from "node:url";

const __dirname = path.dirname(fileURLToPath(import.meta.url));
const rootDir = path.resolve(__dirname, "..");
const distDir = path.join(rootDir, "dist");

const MODULE_NAME = "monologue-token";

function getFoundryDataPath() {
  // Priority: CLI arg > FOUNDRY_DATA env > auto-detect
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

function isSymlink(p) {
  try {
    return fs.lstatSync(p).isSymbolicLink();
  } catch {
    return false;
  }
}

function main() {
  // Verify dist exists
  if (!fs.existsSync(distDir)) {
    console.error(`dist/ not found. Run "pnpm build" first.`);
    process.exit(1);
  }

  const foundryData = getFoundryDataPath();

  if (!fs.existsSync(foundryData)) {
    console.error(`Foundry data directory not found: ${foundryData}`);
    console.error("Make sure FoundryVTT has been run at least once, or provide a custom path:");
    console.error(`  pnpm link-foundry /path/to/FoundryVTT/Data`);
    process.exit(1);
  }

  const modulesDir = path.join(foundryData, "modules");
  if (!fs.existsSync(modulesDir)) {
    fs.mkdirSync(modulesDir, { recursive: true });
  }

  const targetPath = path.join(modulesDir, MODULE_NAME);

  // Handle existing target
  if (fs.existsSync(targetPath) || isSymlink(targetPath)) {
    if (isSymlink(targetPath)) {
      const currentTarget = fs.readlinkSync(targetPath);
      if (path.resolve(currentTarget) === path.resolve(distDir)) {
        console.log(`Already linked: ${targetPath} -> ${distDir}`);
        return;
      }
      console.log(`Replacing existing symlink (was pointing to ${currentTarget})`);
      fs.unlinkSync(targetPath);
    } else {
      console.error(`A real file/directory already exists at: ${targetPath}`);
      console.error("Remove it manually and try again.");
      process.exit(1);
    }
  }

  // Create junction (works on Windows without admin)
  fs.symlinkSync(distDir, targetPath, "junction");
  console.log(`Linked: ${targetPath} -> ${distDir}`);
}

main();
