import { readFileSync } from "node:fs";
import { fileURLToPath } from "node:url";
import { dirname, resolve } from "node:path";
import { defineConfig, type IndexHtmlTransformContext } from "vite";

const __dirname = dirname(fileURLToPath(new URL(import.meta.url)));
const rootDir = resolve(__dirname, "src");
const partialPath = resolve(rootDir, "partials/head.html");

const headMarkerRegex = /<!--\s*#head\s*(\{[\s\S]*?\})\s*-->/g;

type HeadOptions = {
  title?: string;
  animationsCss?: boolean;
};

function renderHeadTemplate(options: HeadOptions = {}, baseUrl: string) {
  const template = readFileSync(partialPath, "utf-8");
  const title = options.title ?? "Animations Physique-Chimie";
  const animationsCssLink = options.animationsCss
    ? `<link rel="stylesheet" href="${baseUrl}/css/animations.css">`
    : "";

  return template.replace(/\{\{\s*(\w+)\s*\}\}/g, (_, key: string) => {
    switch (key) {
      case "title":
        return title;
      case "animationsCssLink":
        return animationsCssLink;
      case "baseUrl":
        return baseUrl;
      default:
        return "";
    }
  });
}

function sharedHeadPlugin() {
  return {
    name: "shared-head-partial",
    enforce: "pre" as const,
    transformIndexHtml(html: string, ctx: IndexHtmlTransformContext) {
      const pathSegments = ctx.path.split('/').filter(Boolean);
      const depth = pathSegments.length - 1;
      const baseUrl = depth > 0 ? '../'.repeat(depth).slice(0, -1) : '.';

      return html.replace(headMarkerRegex, (_match, jsonConfig) => {
        try {
          const data = JSON.parse(jsonConfig) as HeadOptions;
          return renderHeadTemplate(data, baseUrl);
        } catch (error) {
          ctx.server?.ws.send({
            type: "error",
            err: {
              message: `Invalid head config: ${error}`,
              stack: String(error),
            },
          });
          return renderHeadTemplate({}, baseUrl);
        }
      });
    },
  };
}

const htmlInputs = {
  index: resolve(rootDir, "index.html"),
  cartesiennes: resolve(rootDir, "animations/coordonnées-cartésiennes.html"),
  cylindriques: resolve(rootDir, "animations/coordonnées-cylindriques.html"),
  spheriques: resolve(rootDir, "animations/coordonnées-sphériques.html"),
};

export default defineConfig({
  root: rootDir,
  base: './',
  publicDir: resolve(__dirname, "public"),
  build: {
    outDir: resolve(__dirname, "dist"),
    emptyOutDir: true,
    rollupOptions: {
      input: htmlInputs,
    },
  },
  server: {
    port: 8000,
  },
  plugins: [sharedHeadPlugin()],
});
