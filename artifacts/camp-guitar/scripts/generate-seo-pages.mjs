import { mkdir, rm, writeFile } from "node:fs/promises";
import path from "node:path";
import { fileURLToPath } from "node:url";
import { songs } from "../src/data/songs.ts";

const projectRoot = path.resolve(path.dirname(fileURLToPath(import.meta.url)), "..");
const publicDir = path.join(projectRoot, "public");
const songsDir = path.join(publicDir, "songs");
const basePath = normalizeBasePath(process.env.BASE_PATH);
const siteUrl = normalizeSiteUrl(process.env.VITE_SITE_URL);

await rm(songsDir, { recursive: true, force: true });
await mkdir(songsDir, { recursive: true });

await writeFile(path.join(songsDir, "index.html"), renderHubPage(), "utf8");

for (const song of songs) {
  const songDir = path.join(songsDir, song.id);
  await mkdir(songDir, { recursive: true });
  await writeFile(path.join(songDir, "index.html"), renderSongPage(song), "utf8");
}

const robotsLines = ["User-agent: *", "Allow: /"];
if (siteUrl) {
  robotsLines.push(`Sitemap: ${sitePageUrl("sitemap.xml")}`);
  const sitemapPages = ["", "songs/", ...songs.map((song) => `songs/${song.id}/`)];
  const sitemapUrls = sitemapPages
    .map((page) => `  <url><loc>${escapeHtml(sitePageUrl(page))}</loc></url>`)
    .join("\n");
  const sitemap = [
    '<?xml version="1.0" encoding="UTF-8"?>',
    '<urlset xmlns="http://www.sitemaps.org/schemas/sitemap/0.9">',
    sitemapUrls,
    "</urlset>",
    "",
  ].join("\n");
  await writeFile(path.join(publicDir, "sitemap.xml"), sitemap, "utf8");
} else {
  await rm(path.join(publicDir, "sitemap.xml"), { force: true });
}
await writeFile(path.join(publicDir, "robots.txt"), `${robotsLines.join("\n")}\n`, "utf8");

console.log(
  `Generated ${songs.length + 1} static song guide pages${siteUrl ? " and sitemap" : "; sitemap will be generated when VITE_SITE_URL is set"}.`,
);

function normalizeBasePath(rawBasePath) {
  const value = rawBasePath?.trim() || "/";
  if (value === "./") return "/";
  const parts = value.split("/").filter(Boolean);
  return parts.length ? `/${parts.join("/")}/` : "/";
}

function normalizeSiteUrl(rawSiteUrl) {
  if (!rawSiteUrl) return "";
  const url = new URL(rawSiteUrl);
  if (
    url.protocol !== "https:" ||
    url.search ||
    url.hash ||
    url.username ||
    url.password
  ) {
    throw new Error("VITE_SITE_URL must be an HTTPS site URL without credentials, query, or hash.");
  }
  return url.href.replace(/\/+$/, "");
}

function sitePageUrl(relativePath) {
  return new URL(relativePath.replace(/^\/+/, ""), `${siteUrl}/`).href;
}

function escapeHtml(value) {
  return String(value)
    .replaceAll("&", "&amp;")
    .replaceAll("<", "&lt;")
    .replaceAll(">", "&gt;")
    .replaceAll('"', "&quot;")
    .replaceAll("'", "&#39;");
}

function escapeJsonForHtml(value) {
  return JSON.stringify(value).replace(/</g, "\\u003c");
}

function titleFor(song) {
  const suffix = " Guitar Chords | CampGuitar";
  const title = `${song.title}${suffix}`;
  if (title.length <= 60) return title;
  const available = 60 - suffix.length - 1;
  return `${song.title.slice(0, available).trimEnd()}…${suffix}`;
}

function descriptionFor(song, chords) {
  const description = `Learn ${song.title} on guitar with ${chords.join(", ")} chords, a ${song.bpm} BPM starting tempo, and guided strumming practice in CampGuitar.`;
  if (description.length <= 160) return description;
  return `${description.slice(0, 157).trimEnd()}...`;
}

function chordsFor(song) {
  return [...new Set(song.lines.map((line) => line.chord))];
}

function progressionFor(song) {
  return song.lines.reduce((chords, line) => {
    if (chords.at(-1) !== line.chord) chords.push(line.chord);
    return chords;
  }, []);
}

function canonicalTags(url, title, description) {
  if (!siteUrl) return "";
  const imageUrl = sitePageUrl("opengraph.jpg");
  return [
    `<link rel="canonical" href="${escapeHtml(url)}" />`,
    `<meta property="og:url" content="${escapeHtml(url)}" />`,
    `<meta property="og:image" content="${escapeHtml(imageUrl)}" />`,
    `<meta name="twitter:image" content="${escapeHtml(imageUrl)}" />`,
    `<meta property="og:title" content="${escapeHtml(title)}" />`,
    `<meta property="og:description" content="${escapeHtml(description)}" />`,
    `<meta name="twitter:title" content="${escapeHtml(title)}" />`,
    `<meta name="twitter:description" content="${escapeHtml(description)}" />`,
  ].join("\n    ");
}

function schemaTags(schemas) {
  return schemas
    .map(
      (schema) =>
        `<script type="application/ld+json">${escapeJsonForHtml(schema)}</script>`,
    )
    .join("\n    ");
}

function renderHubPage() {
  const title = "Beginner Guitar Song Chords | CampGuitar";
  const description =
    "Browse beginner guitar song guides in Hindi and English, with chord progressions, starting tempos, strumming patterns, and an interactive play-along.";
  const canonicalUrl = siteUrl ? sitePageUrl("songs/") : "";
  const listItems = songs
    .map((song) => {
      const chords = chordsFor(song);
      return `<li><a href="${basePath}songs/${escapeHtml(song.id)}/">${escapeHtml(song.title)}</a><span>${escapeHtml(song.language)} · ${escapeHtml(chords.join(" – "))} · ${song.bpm} BPM</span></li>`;
    })
    .join("\n        ");
  const schemas = siteUrl
    ? [
        {
          "@context": "https://schema.org",
          "@type": "CollectionPage",
          name: title,
          description,
          url: canonicalUrl,
          mainEntity: {
            "@type": "ItemList",
            itemListElement: songs.map((song, index) => ({
              "@type": "ListItem",
              position: index + 1,
              name: song.title,
              url: sitePageUrl(`songs/${song.id}/`),
            })),
          },
        },
        breadcrumbSchema([
          { name: "Home", url: sitePageUrl("") },
          { name: "Song guides", url: canonicalUrl },
        ]),
      ]
    : [];

  return htmlDocument({
    title,
    description,
    canonicalUrl,
    schemas,
    body: `<header class="site-header"><a class="brand" href="${basePath}">🎸 CampGuitar</a><nav aria-label="Breadcrumb"><a href="${basePath}">Home</a> / Song guides</nav></header>
    <main class="page">
      <p class="eyebrow">Hindi and English song library</p>
      <h1>Beginner Guitar Song Guides</h1>
      <p class="intro">Practice popular Hindi and English songs with four beginner chord shapes, clear chord changes, a starting tempo, and a strumming pattern. Choose a guide to see the practice details, then open the interactive player.</p>
      <p><a class="button" href="${basePath}">Open the CampGuitar player</a></p>
      <section aria-labelledby="all-guides">
        <h2 id="all-guides">All song chord guides</h2>
        <ul class="song-list">${listItems}</ul>
      </section>
    </main>
    <footer class="site-footer"><a href="${basePath}">CampGuitar home</a></footer>`,
  });
}

function renderSongPage(song) {
  const chords = chordsFor(song);
  const title = titleFor(song);
  const description = descriptionFor(song, chords);
  const canonicalUrl = siteUrl ? sitePageUrl(`songs/${song.id}/`) : "";
  const progression = progressionFor(song).join(" → ");
  const pattern = song.strummingPattern
    .map((beat) => (beat === "D" ? "Down" : beat === "U" ? "Up" : "Rest"))
    .join(" · ");
  const youtubeUrl = new URL("https://www.youtube.com/results");
  youtubeUrl.searchParams.set("search_query", `${song.title} song`);
  const relatedSongs = songs
    .filter((item) => item.id !== song.id && item.language === song.language)
    .slice(0, 3);
  const schemas = siteUrl
    ? [
        {
          "@context": "https://schema.org",
          "@type": "WebPage",
          name: `How to Play ${song.title} on Guitar`,
          description,
          url: canonicalUrl,
          isPartOf: {
            "@type": "WebSite",
            name: "CampGuitar",
            url: sitePageUrl(""),
          },
        },
        breadcrumbSchema([
          { name: "Home", url: sitePageUrl("") },
          { name: "Song guides", url: sitePageUrl("songs/") },
          { name: song.title, url: canonicalUrl },
        ]),
      ]
    : [];

  return htmlDocument({
    title,
    description,
    canonicalUrl,
    schemas,
    body: `<header class="site-header">
      <a class="brand" href="${basePath}">🎸 CampGuitar</a>
      <nav aria-label="Breadcrumb"><a href="${basePath}">Home</a> / <a href="${basePath}songs/">Song guides</a> / <span>${escapeHtml(song.title)}</span></nav>
    </header>
    <main class="page">
      <p class="eyebrow">${escapeHtml(song.language)} guitar practice</p>
      <h1>How to Play ${escapeHtml(song.title)} on Guitar</h1>
      <p class="intro">Practice this ${escapeHtml(song.language)} song with chord changes, a steady starting tempo, and a guided strumming pattern. CampGuitar keeps the chords and beat together while you play.</p>
      <section aria-labelledby="practice-details">
        <h2 id="practice-details">Chord and strumming guide</h2>
        <dl class="details">
          <div><dt>Chord changes</dt><dd>${escapeHtml(progression)}</dd></div>
          <div><dt>Chords used</dt><dd>${escapeHtml(chords.join(", "))}</dd></div>
          <div><dt>Starting tempo</dt><dd>${song.bpm} BPM</dd></div>
          <div><dt>Time signature</dt><dd>${song.timeSignature}/4</dd></div>
          <div><dt>Strumming pattern</dt><dd>${escapeHtml(song.strummingPattern.join(" "))}</dd></div>
          <div><dt>Pattern guide</dt><dd>${escapeHtml(pattern)} (D = down, U = up, – = rest)</dd></div>
        </dl>
      </section>
      <section aria-labelledby="practice-faq">
        <h2 id="practice-faq">Practice questions</h2>
        <details><summary>Which chords are used for ${escapeHtml(song.title)}?</summary><p>This CampGuitar arrangement uses ${escapeHtml(chords.join(", "))}. Follow the chord changes above as you practice.</p></details>
        <details><summary>What tempo should I start with?</summary><p>Start at ${song.bpm} BPM, then adjust the tempo in the player to a pace that feels comfortable.</p></details>
        <details><summary>Can I listen to the song while I practice?</summary><p>Yes. <a href="${escapeHtml(youtubeUrl.href)}" target="_blank" rel="noopener noreferrer">Open YouTube search results for ${escapeHtml(song.title)}</a> in another tab, then return to the player.</p></details>
      </section>
      <p class="actions"><a class="button" href="${basePath}?song=${encodeURIComponent(song.id)}">Open the interactive player</a><a class="text-link" href="${escapeHtml(youtubeUrl.href)}" target="_blank" rel="noopener noreferrer">Listen on YouTube</a></p>
      <section aria-labelledby="related-guides">
        <h2 id="related-guides">More ${escapeHtml(song.language)} song guides</h2>
        <ul class="related-list">${relatedSongs
          .map(
            (item) =>
              `<li><a href="${basePath}songs/${escapeHtml(item.id)}/">${escapeHtml(item.title)} guitar chords</a></li>`,
          )
          .join("")}</ul>
      </section>
    </main>
    <footer class="site-footer"><a href="${basePath}songs/">Browse all song guides</a> · <a href="${basePath}">CampGuitar home</a></footer>`,
  });
}

function breadcrumbSchema(items) {
  return {
    "@context": "https://schema.org",
    "@type": "BreadcrumbList",
    itemListElement: items.map((item, index) => ({
      "@type": "ListItem",
      position: index + 1,
      name: item.name,
      item: item.url,
    })),
  };
}

function htmlDocument({ title, description, canonicalUrl, schemas, body }) {
  const tags = canonicalTags(canonicalUrl, title, description);
  return `<!doctype html>
<html lang="en">
  <head>
    <meta charset="UTF-8" />
    <meta name="viewport" content="width=device-width, initial-scale=1.0" />
    <meta name="description" content="${escapeHtml(description)}" />
    <meta name="theme-color" content="#020617" />
    <meta property="og:title" content="${escapeHtml(title)}" />
    <meta property="og:description" content="${escapeHtml(description)}" />
    <meta property="og:type" content="article" />
    <meta property="og:site_name" content="CampGuitar" />
    <meta property="og:locale" content="en_IN" />
    <meta name="twitter:card" content="summary_large_image" />
    ${tags}
    ${schemaTags(schemas)}
    <title>${escapeHtml(title)}</title>
    <link rel="icon" type="image/svg+xml" href="${basePath}favicon.svg" />
    <style>
      :root{color-scheme:dark}*{box-sizing:border-box}body{margin:0;background:#020617;color:#f8fafc;font-family:Inter,ui-sans-serif,system-ui,-apple-system,BlinkMacSystemFont,"Segoe UI",sans-serif;line-height:1.65}a{color:#fbbf24;text-underline-offset:3px}a:hover{color:#fde68a}.site-header,.page,.site-footer{width:min(100% - 32px,760px);margin-inline:auto}.site-header{padding:24px 0 20px;border-bottom:1px solid #1e293b}.brand{display:inline-block;color:#fff;font-weight:800;font-size:18px;text-decoration:none}.site-header nav{margin-top:12px;color:#94a3b8;font-size:13px}.site-header nav a{color:#cbd5e1}.page{padding:38px 0 48px}.eyebrow{margin:0 0 8px;color:#fbbf24;font-size:12px;font-weight:700;letter-spacing:.12em;text-transform:uppercase}h1{max-width:720px;margin:0 0 16px;font-size:clamp(30px,6vw,46px);line-height:1.12;letter-spacing:-.035em}h2{margin:32px 0 12px;font-size:22px;line-height:1.25}.intro{max-width:680px;color:#cbd5e1;font-size:17px}.button{display:inline-flex;align-items:center;justify-content:center;margin:10px 12px 10px 0;padding:11px 17px;border-radius:999px;background:#f59e0b;color:#111827;font-weight:800;text-decoration:none}.button:hover{background:#fbbf24;color:#111827}.text-link{font-weight:700}.details{display:grid;grid-template-columns:repeat(auto-fit,minmax(220px,1fr));gap:10px;margin:0}.details div{padding:14px;border:1px solid #1e293b;border-radius:14px;background:#0f172a}.details dt{color:#94a3b8;font-size:12px;font-weight:700;text-transform:uppercase;letter-spacing:.08em}.details dd{margin:4px 0 0;font-weight:700;overflow-wrap:anywhere}.song-list,.related-list{padding:0;list-style:none}.song-list li{display:flex;flex-wrap:wrap;justify-content:space-between;gap:4px 16px;padding:12px 0;border-bottom:1px solid #1e293b}.song-list a,.related-list a{font-weight:700}.song-list span{color:#94a3b8;font-size:13px}.related-list li{padding:5px 0}details{margin:8px 0;padding:12px 14px;border:1px solid #1e293b;border-radius:12px;background:#0f172a}summary{cursor:pointer;font-weight:700}details p{margin-bottom:0;color:#cbd5e1}.site-footer{padding:18px 0 28px;border-top:1px solid #1e293b;color:#94a3b8;font-size:13px}.actions{margin:22px 0}.actions .button{margin-right:14px}@media(max-width:480px){.page{padding-top:28px}.intro{font-size:16px}.details{grid-template-columns:1fr}.site-header nav{line-height:1.8}}
    </style>
  </head>
  <body>
    ${body}
  </body>
</html>`;
}
