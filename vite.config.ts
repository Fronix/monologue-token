import { cpSync, readFileSync, writeFileSync } from "node:fs";
import { resolve } from "node:path";
import { defineConfig, type Plugin } from "vite";

function copyAssets(): Plugin {
  const root = resolve(__dirname);
  const dist = resolve(root, "dist");
  const assets = ["module.json", "styles", "assets"];

  // Read version from package.json for local builds
  const pkg = JSON.parse(readFileSync(resolve(root, "package.json"), "utf-8"));
  const version = pkg.version;

  return {
    name: "copy-assets",
    closeBundle() {
      for (const asset of assets) {
        cpSync(resolve(root, asset), resolve(dist, asset), { recursive: true });
      }

      // Replace version placeholder in dist/module.json
      const manifestPath = resolve(dist, "module.json");
      const manifest = readFileSync(manifestPath, "utf-8");
      writeFileSync(manifestPath, manifest.replace(/#{VERSION}#/g, version));

      console.log(`Copied static assets to dist/ (version: ${version})`);
    },
  };
}

export default defineConfig({
  build: {
    outDir: "dist",
    emptyOutDir: true,
    sourcemap: true,
    lib: {
      entry: resolve(__dirname, "src/module.ts"),
      formats: ["es"],
      fileName: () => "module.js",
    },
  },
  plugins: [copyAssets()],
});
