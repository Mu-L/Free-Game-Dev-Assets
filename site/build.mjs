#!/usr/bin/env node
/**
 * Build GitHub Pages site from catalog markdown frontmatter.
 * Add/edit one catalog/<category>/<id>.md → rebuild regenerates everything.
 */
import fs from "node:fs";
import path from "node:path";
import { fileURLToPath } from "node:url";

const __dirname = path.dirname(fileURLToPath(import.meta.url));
const ROOT = path.resolve(__dirname, "..");
const CATALOG = path.join(ROOT, "catalog");
const PUBLIC = path.join(__dirname, "public");
const DIST = path.join(__dirname, "dist");
const CONFIG_PATH = path.join(__dirname, "config.json");
const VOCAB_PATH = path.join(__dirname, "license-vocabulary.json");

/** Sort rank for "license permissiveness": least owed first. */
const ATTRIBUTION_RANK = { none: 0, notice: 1, required: 2, any: 3 };

/** Age buckets for the verified-date cue. Days. */
const VERIFIED_FRESH_DAYS = 180;
const VERIFIED_AGING_DAYS = 365;

function verifiedAge(verified, now) {
  if (!verified) return { days: null, bucket: "unknown" };
  const t = Date.parse(`${verified}T00:00:00Z`);
  if (Number.isNaN(t)) return { days: null, bucket: "unknown" };
  const days = Math.max(0, Math.floor((now - t) / 86400000));
  const bucket =
    days <= VERIFIED_FRESH_DAYS
      ? "fresh"
      : days <= VERIFIED_AGING_DAYS
        ? "aging"
        : "stale";
  return { days, bucket };
}

function parseScalar(raw) {
  const v = raw.trim();
  if (v === "true") return true;
  if (v === "false") return false;
  if (v === "null" || v === "~" || v === "") return null;
  if (
    (v.startsWith('"') && v.endsWith('"')) ||
    (v.startsWith("'") && v.endsWith("'"))
  ) {
    return v.slice(1, -1);
  }
  if (v.startsWith("[") && v.endsWith("]")) {
    const inner = v.slice(1, -1).trim();
    if (!inner) return [];
    return inner.split(",").map((part) => {
      const s = part.trim();
      if (
        (s.startsWith('"') && s.endsWith('"')) ||
        (s.startsWith("'") && s.endsWith("'"))
      ) {
        return s.slice(1, -1);
      }
      return s;
    });
  }
  return v;
}

function parseFrontmatter(text) {
  const match = text.match(/^---\r?\n([\s\S]*?)\r?\n---\r?\n([\s\S]*)$/);
  if (!match) return null;
  const meta = {};
  for (const line of match[1].split(/\r?\n/)) {
    if (!line.trim() || line.trim().startsWith("#")) continue;
    const idx = line.indexOf(":");
    if (idx === -1) continue;
    const key = line.slice(0, idx).trim();
    meta[key] = parseScalar(line.slice(idx + 1));
  }
  return { meta, body: match[2].trim() };
}

function stripMd(text) {
  return text
    .replace(/\[([^\]]+)\]\([^)]+\)/g, "$1")
    .replace(/[*_`#]/g, "")
    .replace(/\s+/g, " ")
    .trim();
}

function summaryFromBody(body) {
  const chunks = body
    .split(/\n\s*\n/)
    .map((p) => p.trim())
    .filter((p) => p && !p.startsWith("#"));
  const first = chunks[0] || "";
  const clean = stripMd(first);
  return clean.length > 220 ? `${clean.slice(0, 217)}…` : clean;
}

function walkMarkdown(dir, out = []) {
  if (!fs.existsSync(dir)) return out;
  for (const name of fs.readdirSync(dir)) {
    const full = path.join(dir, name);
    const stat = fs.statSync(full);
    if (stat.isDirectory()) {
      walkMarkdown(full, out);
      continue;
    }
    if (!name.endsWith(".md")) continue;
    if (name === "README.md" || name === "TEMPLATE.md") continue;
    out.push(full);
  }
  return out;
}

function loadEntries(vocab) {
  const files = walkMarkdown(CATALOG);
  const entries = [];
  const errors = [];

  for (const file of files) {
    const text = fs.readFileSync(file, "utf8");
    const parsed = parseFrontmatter(text);
    if (!parsed) {
      errors.push(`No frontmatter: ${path.relative(ROOT, file)}`);
      continue;
    }
    const { meta, body } = parsed;
    const rel = path.relative(ROOT, file).split(path.sep).join("/");
    const required = ["id", "name", "url", "category", "license", "status"];
    const missing = required.filter((k) => meta[k] === undefined || meta[k] === null || meta[k] === "");
    if (missing.length) {
      errors.push(`${rel} missing: ${missing.join(", ")}`);
      continue;
    }

    entries.push({
      id: String(meta.id),
      name: String(meta.name),
      url: String(meta.url),
      category: String(meta.category),
      subcategories: Array.isArray(meta.subcategories) ? meta.subcategories : [],
      license: String(meta.license),
      commercial:
        meta.commercial === true
          ? true
          : meta.commercial === false
            ? false
            : meta.commercial === "varies"
              ? "varies"
              : "unknown",
      attribution_required:
        meta.attribution_required === true
          ? true
          : meta.attribution_required === false
            ? false
            : "unknown",
      formats: Array.isArray(meta.formats) ? meta.formats : [],
      tags: Array.isArray(meta.tags) ? meta.tags : [],
      verified: meta.verified ? String(meta.verified) : null,
      status: String(meta.status),
      path: rel,
      summary: summaryFromBody(body),
      ...(meta.grid_dimensions ? { grid_dimensions: String(meta.grid_dimensions) } : {}),
      ...(meta.camera_perspective ? { camera_perspective: String(meta.camera_perspective) } : {}),
      ...(Array.isArray(meta.hardware_tags) ? { hardware_tags: meta.hardware_tags } : {}),
      ...(meta.attribution_string ? { attribution_string: String(meta.attribution_string) } : {}),
      ...(meta.publisher ? { publisher: String(meta.publisher) } : {}),
      attributionClass: vocab.licenses[String(meta.license)]?.attribution || "any",
      licenseRank:
        ATTRIBUTION_RANK[
          vocab.licenses[String(meta.license)]?.attribution || "any"
        ],
    });
  }

  entries.sort((a, b) => a.name.localeCompare(b.name));
  return { entries, errors };
}

function esc(str) {
  return String(str)
    .replaceAll("&", "&amp;")
    .replaceAll("<", "&lt;")
    .replaceAll(">", "&gt;")
    .replaceAll('"', "&quot;")
    .replaceAll("'", "&#39;");
}

function commercialLabel(v) {
  if (v === true) return "commercial OK";
  if (v === false) return "non-commercial";
  if (v === "varies") return "per-file review";
  return "commercial ?";
}

function edgeVar(entry) {
  if (entry.commercial === true) return "var(--ok)";
  if (entry.commercial === false) return "var(--danger)";
  if (entry.commercial === "varies") return "var(--warn)";
  return "var(--unknown)";
}

/**
 * Prerendered entry row. The same markup app.js produces on hydrate, so the
 * page is complete and indexable before any script runs. The card is an
 * <article> with a real heading link, not a <button> wrapping a heading:
 * that gives every entry a permalink and keeps heading navigation working.
 */
function entryRowHtml(entry, repo, now) {
  const age = verifiedAge(entry.verified, now);
  const ageText =
    age.days === null
      ? "verified date unknown"
      : `verified ${entry.verified} (${age.days}d ago)`;
  const flags = [entry.status, commercialLabel(entry.commercial), entry.license]
    .map(esc)
    .join(" &middot; ");
  const formats = (entry.formats || [])
    .slice(0, 3)
    .map((f) => `<span>${esc(f)}</span>`)
    .join("");
  return `<article class="entry-card" id="entry-${esc(entry.id)}" data-id="${esc(entry.id)}" data-status="${esc(entry.status)}" style="--edge:${edgeVar(entry)}">
  <span class="entry-edge" aria-hidden="true"></span>
  <div class="entry-body">
    <div class="entry-top">
      <h3><a class="entry-link" href="#entry-${esc(entry.id)}" data-id="${esc(entry.id)}">${esc(entry.name)}</a></h3>
      <span class="entry-flags">${flags}</span>
    </div>
    <p>${esc(entry.summary || "")}</p>
    <div class="meta-line">
      <span>${esc(entry.category)}</span>${formats}
      <span class="verified is-${age.bucket}" data-verified="${esc(entry.verified || "")}" title="License last checked at the source">${esc(ageText)}</span>
    </div>
    <div class="entry-links">
      <a href="${esc(entry.url)}" rel="noopener noreferrer">Open source</a>
      <a href="${esc(`${repo}/blob/main/${entry.path}`)}" rel="noopener noreferrer">Entry and evidence</a>
    </div>
  </div>
</article>`;
}

function starterRowsHtml(featured) {
  return featured
    .map(
      (e) => `<tr>
  <td class="need">${esc(e.need || "")}</td>
  <td><a href="${esc(e.url)}" rel="noopener noreferrer">${esc(e.name)}</a></td>
  <td class="license">${esc(e.license)} &middot; ${esc(commercialLabel(e.commercial))}</td>
</tr>`
    )
    .join("\n");
}

function guideRowsHtml(guides, repo) {
  return (guides || [])
    .map(
      (g) =>
        `<li><a href="${esc(`${repo}/blob/main/${g.path}`)}" rel="noopener noreferrer">${esc(g.title)}<span>${esc(g.path)}</span></a></li>`
    )
    .join("\n");
}

function headMetaHtml(site, stats, generatedAt) {
  const url = site.siteUrl;
  const title = site.title;
  const desc = site.tagline;
  return [
    `<link rel="canonical" href="${esc(url)}" />`,
    `<meta name="theme-color" content="#1a4d3e" media="(prefers-color-scheme: light)" />`,
    `<meta name="theme-color" content="#0f1216" media="(prefers-color-scheme: dark)" />`,
    `<meta property="og:type" content="website" />`,
    `<meta property="og:site_name" content="${esc(title)}" />`,
    `<meta property="og:title" content="${esc(title)}" />`,
    `<meta property="og:description" content="${esc(desc)}" />`,
    `<meta property="og:url" content="${esc(url)}" />`,
    `<meta name="twitter:card" content="summary" />`,
    `<meta name="twitter:title" content="${esc(title)}" />`,
    `<meta name="twitter:description" content="${esc(desc)}" />`,
    `<meta name="generator" content="site/build.mjs ${esc(generatedAt)}" />`,
    `<meta name="catalog:entries" content="${stats.total}" />`,
  ].join("\n    ");
}

function sitemapXml(site, entries) {
  const base = site.siteUrl.replace(/\/+$/, "");
  const urls = [
    `  <url><loc>${esc(base)}/</loc></url>`,
    ...entries.map(
      (e) => `  <url><loc>${esc(base)}/#entry-${esc(e.id)}</loc></url>`
    ),
  ];
  return `<?xml version="1.0" encoding="UTF-8"?>\n<urlset xmlns="http://www.sitemaps.org/schemas/sitemap/0.9">\n${urls.join("\n")}\n</urlset>\n`;
}

function robotsTxt(site) {
  const base = site.siteUrl.replace(/\/+$/, "");
  return `User-agent: *\nAllow: /\n\nSitemap: ${base}/sitemap.xml\n`;
}

function notFoundHtml(site) {
  const base = site.siteUrl.replace(/\/+$/, "");
  return `<!DOCTYPE html>
<html lang="en">
  <head>
    <meta charset="utf-8" />
    <meta name="viewport" content="width=device-width, initial-scale=1" />
    <title>Not found - ${esc(site.title)}</title>
    <meta name="robots" content="noindex" />
    <link rel="icon" href="${esc(base)}/favicon.svg" type="image/svg+xml" />
    <link rel="stylesheet" href="${esc(base)}/styles.css" />
  </head>
  <body>
    <main class="section">
      <h1>Not found</h1>
      <p>That page is not part of this catalog.</p>
      <p class="hero-actions">
        <a class="btn" href="${esc(base)}/">Back to the catalog</a>
      </p>
    </main>
  </body>
</html>
`;
}

function copyDir(src, dest) {
  fs.mkdirSync(dest, { recursive: true });
  for (const name of fs.readdirSync(src)) {
    const from = path.join(src, name);
    const to = path.join(dest, name);
    if (fs.statSync(from).isDirectory()) copyDir(from, to);
    else fs.copyFileSync(from, to);
  }
}

function main() {
  const config = JSON.parse(fs.readFileSync(CONFIG_PATH, "utf8"));
  const vocab = JSON.parse(fs.readFileSync(VOCAB_PATH, "utf8"));
  const { entries, errors } = loadEntries(vocab);

  if (errors.length) {
    console.error("Build warnings:");
    for (const e of errors) console.error(`  - ${e}`);
  }

  const repoUrl = config.site.repo;
  const featuredRaw = config.featured || [];
  const featured = featuredRaw
    .map((item) => {
      const id = typeof item === "string" ? item : item?.id;
      const need = typeof item === "string" ? null : item?.need || null;
      const entry = entries.find((e) => e.id === id);
      if (!entry) return null;
      return { ...entry, need };
    })
    .filter(Boolean);

  const stats = {
    total: entries.length,
    active: entries.filter((e) => e.status === "active").length,
    needsReview: entries.filter((e) => e.status === "needs-review").length,
    deprecated: entries.filter((e) => e.status === "deprecated").length,
    commercialOk: entries.filter((e) => e.commercial === true).length,
    commercialVaries: entries.filter((e) => e.commercial === "varies").length,
    categories: Object.keys(config.categories).length,
  };

  const payload = {
    generatedAt: new Date().toISOString(),
    site: config.site,
    categories: config.categories,
    guides: config.guides,
    featured,
    stats,
    entries,
  };

  if (fs.existsSync(DIST)) fs.rmSync(DIST, { recursive: true, force: true });
  copyDir(PUBLIC, DIST);
  fs.writeFileSync(path.join(DIST, "data.json"), JSON.stringify(payload, null, 2));
  fs.writeFileSync(
    path.join(DIST, "data.js"),
    `window.__CATALOG__ = ${JSON.stringify(payload)};\n`
  );

  // Prerender. The served HTML must be complete without JavaScript: this is a
  // catalog whose whole value is that its entries can be found.
  const now = Date.now();
  const indexPath = path.join(DIST, "index.html");
  const stamp = payload.generatedAt.slice(0, 10);
  const visible = entries.filter((e) => e.status !== "deprecated");
  const substitutions = {
    HEAD_META: headMetaHtml(config.site, stats, payload.generatedAt),
    STARTER_ROWS: starterRowsHtml(featured),
    ENTRY_ROWS: visible
      .map((e) => entryRowHtml(e, repoUrl, now))
      .join("\n"),
    GUIDE_ROWS: guideRowsHtml(config.guides, repoUrl),
    CATALOG_BLURB: `${stats.total} sources &middot; ${stats.active} active &middot; ${stats.commercialOk} commercial-ok &middot; ${stats.commercialVaries} per-file &middot; ${stats.deprecated} deprecated`,
    RESULT_COUNT: `${visible.length} / ${stats.total}`,
    FOOTER_STAMP: `Built ${esc(stamp)} from ${stats.total} catalog entries.`,
  };
  let html = fs.readFileSync(indexPath, "utf8");
  for (const [key, value] of Object.entries(substitutions)) {
    const marker = `<!--${key}-->`;
    if (!html.includes(marker)) {
      console.error(`  - index.html is missing the ${marker} marker`);
      continue;
    }
    html = html.replace(marker, value);
  }
  fs.writeFileSync(indexPath, html);

  fs.writeFileSync(path.join(DIST, "sitemap.xml"), sitemapXml(config.site, visible));
  fs.writeFileSync(path.join(DIST, "robots.txt"), robotsTxt(config.site));
  fs.writeFileSync(path.join(DIST, "404.html"), notFoundHtml(config.site));

  console.log(
    `Built ${entries.length} entries → site/dist (${stats.active} active, ${stats.commercialOk} commercial-ok, ${stats.commercialVaries} per-file)`
  );
  console.log(
    `Prerendered ${visible.length} entry rows into index.html; wrote sitemap.xml, robots.txt, 404.html`
  );
  if (errors.length) process.exitCode = 0; // soft-fail missing fields as warnings
}

main();
