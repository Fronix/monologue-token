import fs from "node:fs";
import path from "node:path";
import { distDir, getTargetPath, isSymlink } from "./foundry-path.mjs";

function main() {
  if (!fs.existsSync(distDir)) {
    console.error(`dist/ not found. Run "pnpm build" first.`);
    process.exit(1);
  }

  const targetPath = getTargetPath();
  const modulesDir = path.dirname(targetPath);

  if (!fs.existsSync(modulesDir)) {
    fs.mkdirSync(modulesDir, { recursive: true });
  }

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

  fs.symlinkSync(distDir, targetPath, "junction");
  console.log(`Linked: ${targetPath} -> ${distDir}`);
}

main();
