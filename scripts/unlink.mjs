import fs from "node:fs";
import { getTargetPath, isSymlink } from "./foundry-path.mjs";

function main() {
  const targetPath = getTargetPath();

  if (!isSymlink(targetPath)) {
    console.log(`No symlink found at: ${targetPath}`);
    return;
  }

  fs.unlinkSync(targetPath);
  console.log(`Unlinked: ${targetPath}`);
}

main();
