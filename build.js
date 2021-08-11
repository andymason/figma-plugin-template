import { build } from "esbuild";
import { join } from "path";
import { constants } from "fs";
import * as fs from "fs/promises";

const DIST_FOLDER = "dist";
const isProduction = !!process.env.PRODUCTION;

/**
 * Create output folder
 * @returns {Promise<void>}
 */
async function distFolderSetup() {
  // Remove existing dist folder if needed
  try {
    await fs.access(DIST_FOLDER, constants.R_OK);
    await fs.rmdir(DIST_FOLDER, { recursive: true });
  } catch {}

  await fs.mkdir(DIST_FOLDER);
}

/**
 * Compile UI code
 * @returns {Promise<void>}
 */
async function compile() {
  const TEMPLATE_CODE_KEY = "/*__INLINE_CODE__*/";
  const TEMPLATE_CSS_KEY = "/*__INLINE_CSS__*/";

  let htmlText = await fs.readFile(join("src", "ui", "ui.html"), {
    encoding: "utf-8",
  });

  const { outputFiles } = await build({
    bundle: true,
    sourcemap: isProduction ? false : "inline",
    minify: isProduction ? true : false,
    entryPoints: [join("src", "main.ts"), join("src", "ui", "ui.tsx")],
    loader: {
      ".css": "css",
      ".svg": "dataurl",
      ".png": "dataurl",
      ".jpg": "dataurl",
    },
    outdir: DIST_FOLDER,
    write: false,
  });

  const codeOutFilename = join(DIST_FOLDER, "main.js");
  await fs.writeFile(codeOutFilename, outputFiles[0]?.text);

  htmlText = htmlText.replace(TEMPLATE_CODE_KEY, outputFiles[1]?.text);
  htmlText = htmlText.replace(TEMPLATE_CSS_KEY, outputFiles[2]?.text);

  const uiOutFilename = join(DIST_FOLDER, "ui.html");
  await fs.writeFile(uiOutFilename, htmlText);
}

/**
 * Main build task
 * @returns {Promise<void>}
 */
async function main() {
  await distFolderSetup();

  const manifestSrc = join("src", "manifest.json");
  const manifestDest = join(DIST_FOLDER, "manifest.json");
  await fs.copyFile(manifestSrc, manifestDest);

  // await compileCode();
  await compile();
}

// Run
console.time("Build");

main()
  .then(() => console.timeEnd("Build"))
  .catch((err) => console.error("Build failed", err));
