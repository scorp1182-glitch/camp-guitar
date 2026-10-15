import { defineConfig } from "vite";
import react from "@vitejs/plugin-react";
import tailwindcss from "@tailwindcss/vite";
import { readFile } from "node:fs/promises";
import path from "path";
import runtimeErrorOverlay from "@replit/vite-plugin-runtime-error-modal";

const rawPort = process.env.PORT;

if (!rawPort) {
  throw new Error(
    "PORT environment variable is required but was not provided.",
  );
}

const port = Number(rawPort);

if (Number.isNaN(port) || port <= 0) {
  throw new Error(`Invalid PORT value: "${rawPort}"`);
}

const basePath = process.env.BASE_PATH;

if (!basePath) {
  throw new Error(
    "BASE_PATH environment variable is required but was not provided.",
  );
}

const homeTitle = "Easy Hindi & English Guitar Songs | CampGuitar";
const homeDescription =
  "Practice beginner guitar songs in Hindi and English with four chords, chord diagrams, timed lyrics, strumming patterns, and an adjustable metronome.";
const rawSiteUrl = process.env.VITE_SITE_URL?.trim();
let siteUrl = "";

if (rawSiteUrl) {
  const parsedSiteUrl = new URL(rawSiteUrl);
  if (
    parsedSiteUrl.protocol !== "https:" ||
    parsedSiteUrl.search ||
    parsedSiteUrl.hash
  ) {
    throw new Error(
      "VITE_SITE_URL must be the HTTPS production site URL without query or hash.",
    );
  }
  siteUrl = parsedSiteUrl.href.replace(/\/+$/, "");
}

const seoHeadPlugin = {
  name: "camp-guitar-seo-head",
  configureServer(server: import("vite").ViteDevServer) {
    server.middlewares.use(async (req, res, next) => {
      const requestUrl = req.url;
      if (!requestUrl || (req.method !== "GET" && req.method !== "HEAD")) {
        return next();
      }

      const pathname = new URL(requestUrl, "http://camp-guitar.local").pathname;
      const basePrefix = basePath.replace(/\/+$/, "");
      const localPath =
        basePrefix &&
        (pathname === basePrefix || pathname.startsWith(`${basePrefix}/`))
          ? pathname.slice(basePrefix.length)
          : pathname;
      const route = localPath.replace(/^\/+|\/+$/g, "");
      const match = route.match(/^songs(?:\/([a-z0-9-]+))?$/);
      if (!match) return next();

      const pagePath = match[1]
        ? path.resolve(process.cwd(), "public", "songs", match[1], "index.html")
        : path.resolve(process.cwd(), "public", "songs", "index.html");

      try {
        const html = await readFile(pagePath, "utf8");
        const transformed = await server.transformIndexHtml(requestUrl, html);
        res.statusCode = 200;
        res.setHeader("Content-Type", "text/html; charset=utf-8");
        res.end(req.method === "HEAD" ? undefined : transformed);
      } catch (error) {
        if (
          error &&
          typeof error === "object" &&
          "code" in error &&
          error.code === "ENOENT"
        ) {
          return next();
        }
        return next(error instanceof Error ? error : new Error(String(error)));
      }
    });
  },
  transformIndexHtml(html: string) {
    const pageUrl = siteUrl ? `${siteUrl}/` : undefined;
    const imageUrl = siteUrl ? `${siteUrl}/opengraph.jpg` : undefined;
    const urlMeta = pageUrl
      ? [
          `<link rel="canonical" href="${pageUrl}" />`,
          `<meta property="og:url" content="${pageUrl}" />`,
          `<meta property="og:image" content="${imageUrl}" />`,
          `<meta name="twitter:image" content="${imageUrl}" />`,
        ].join("\n    ")
      : "";
    const schema = {
      "@context": "https://schema.org",
      "@graph": [
        {
          "@type": "WebSite",
          name: "CampGuitar",
          description: homeDescription,
          ...(pageUrl ? { url: pageUrl } : {}),
        },
        {
          "@type": "WebApplication",
          name: "CampGuitar",
          description: homeDescription,
          applicationCategory: "EducationalApplication",
          operatingSystem: "Web",
          ...(pageUrl ? { url: pageUrl } : {}),
        },
      ],
    };
    const schemaTag = `<script type="application/ld+json">${JSON.stringify(schema).replace(/</g, "\\u003c")}</script>`;

    return html
      .replace("<!-- CAMP_GUITAR_SEO_URL_META -->", urlMeta)
      .replace("<!-- CAMP_GUITAR_SEO_SCHEMA -->", schemaTag)
      .replace("<title>Easy Hindi &amp; English Guitar Songs | CampGuitar</title>", `<title>${homeTitle.replace(/&/g, "&amp;")}</title>`);
  },
};

export default defineConfig({
  base: basePath,
  plugins: [
    react(),
    tailwindcss(),
    seoHeadPlugin,
    runtimeErrorOverlay(),
    ...(process.env.NODE_ENV !== "production" &&
    process.env.REPL_ID !== undefined
      ? [
          await import("@replit/vite-plugin-cartographer").then((m) =>
            m.cartographer({
              root: path.resolve(import.meta.dirname, ".."),
            }),
          ),
          await import("@replit/vite-plugin-dev-banner").then((m) =>
            m.devBanner(),
          ),
        ]
      : []),
  ],
  resolve: {
    alias: {
      "@": path.resolve(import.meta.dirname, "src"),
      "@assets": path.resolve(import.meta.dirname, "..", "..", "attached_assets"),
    },
    dedupe: ["react", "react-dom"],
  },
  root: path.resolve(import.meta.dirname),
  build: {
    outDir: path.resolve(import.meta.dirname, "dist/public"),
    emptyOutDir: true,
  },
  server: {
    port,
    host: "0.0.0.0",
    allowedHosts: true,
    fs: {
      strict: true,
      deny: ["**/.*"],
    },
  },
  preview: {
    port,
    host: "0.0.0.0",
    allowedHosts: true,
  },
});
