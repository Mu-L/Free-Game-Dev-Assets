#!/usr/bin/env node
/**
 * Build GitHub Pages site from catalog markdown frontmatter.
 * Add/edit one catalog/<category>/<id>.md → rebuild regenerates everything.
 */
import fs from "node:fs";
import path from "node:path";
import { fileURLToPath } from "node:url";
import { commercialLabel, esc, PERSPECTIVE_LABELS, verifiedAge } from "./lib/shared.mjs";
import { entryPageHtml } from "./lib/entry-page.mjs";
import { LinkError, makeLinkResolver } from "./lib/links.mjs";
import { deprecationReason, MarkdownError, renderBlocks, renderInline, splitEntryBody } from "./lib/markdown.mjs";
import { checkPage } from "./lib/page-checks.mjs";

const __dirname = path.dirname(fileURLToPath(import.meta.url));
const ROOT = path.resolve(__dirname, "..");
const CATALOG = path.join(ROOT, "catalog");
const PUBLIC = path.join(__dirname, "public");
const DIST = path.join(__dirname, "dist");
const CONFIG_PATH = path.join(__dirname, "config.json");
const VOCAB_PATH = path.join(__dirname, "license-vocabulary.json");
// Social preview image: a first-party screenshot of this site, kept with the
// other first-party stills (the validator allows binaries there) and copied
// into dist at build time.
const OG_CARD_NAME = "og-card.png";
const OG_CARD_SRC = path.join(ROOT, "docs", "images", "readme", OG_CARD_NAME);

/** Sort rank for "license permissiveness": least owed first. */
const ATTRIBUTION_RANK = { none: 0, notice: 1, required: 2, any: 3 };

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
  const bodies = new Map();

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
    bodies.set(String(meta.id), body);

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
      page: `entry/${String(meta.id)}/`,
      summary: summaryFromBody(body),
      ...(meta.grid_dimensions ? { grid_dimensions: String(meta.grid_dimensions) } : {}),
      ...(meta.camera_perspective ? { camera_perspective: String(meta.camera_perspective) } : {}),
      ...(Array.isArray(meta.hardware_tags) ? { hardware_tags: meta.hardware_tags } : {}),
      ...(meta.attribution_string ? { attribution_string: String(meta.attribution_string) } : {}),
      ...(meta.publisher ? { publisher: String(meta.publisher) } : {}),
      ...(meta.license_spdx ? { license_spdx: String(meta.license_spdx) } : {}),
      attributionClass: vocab.licenses[String(meta.license)]?.attribution || "any",
      licenseRank:
        ATTRIBUTION_RANK[
          vocab.licenses[String(meta.license)]?.attribution || "any"
        ],
    });
  }

  entries.sort((a, b) => a.name.localeCompare(b.name));
  return { entries, errors, bodies };
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
  const taxonomy = [
    entry.grid_dimensions ? `<span class="tax">${esc(entry.grid_dimensions)}</span>` : "",
    entry.camera_perspective
      ? `<span class="tax">${esc(PERSPECTIVE_LABELS[entry.camera_perspective] || entry.camera_perspective)}</span>`
      : "",
  ].join("");
  return `<article class="entry-card" id="entry-${esc(entry.id)}" data-id="${esc(entry.id)}" data-status="${esc(entry.status)}" style="--edge:${edgeVar(entry)}">
  <span class="entry-edge" aria-hidden="true"></span>
  <div class="entry-body">
    <div class="entry-top">
      <h3><a class="entry-link" href="#entry-${esc(entry.id)}" data-id="${esc(entry.id)}">${esc(entry.name)}</a></h3>
      <span class="entry-flags">${flags}</span>
    </div>
    <p>${esc(entry.summary || "")}</p>
    <div class="meta-line">
      <span>${esc(entry.category)}</span>${formats}${taxonomy}
      <span class="verified is-${age.bucket}" data-verified="${esc(entry.verified || "")}" title="License last checked at the source">${esc(ageText)}</span>
    </div>
    <div class="entry-links">
      <a href="${esc(entry.url)}" rel="noopener noreferrer">Open source</a>
      <a href="${esc(`${repo}/blob/main/${entry.path}`)}" rel="noopener noreferrer">Entry and evidence</a>
    </div>
  </div>
</article>`;
}

/**
 * The catalog grouped under category headings. 300 rows in one flat list is
 * not navigable; headings give the page structure a reader can scan and an
 * anchor they can link to. app.js reproduces this exact shape on hydrate.
 *
 * Grouping is only correct under the default sort. Sorting by verified date
 * or license across category buckets would be meaningless, so app.js falls
 * back to a flat list in those cases; the prerender is always the default.
 */
function groupedRowsHtml(entries, categories, repo, now) {
  const order = Object.keys(categories);
  const seen = new Set(entries.map((e) => e.category));
  const out = [];
  for (const cat of order) {
    if (!seen.has(cat)) continue;
    const group = entries.filter((e) => e.category === cat);
    if (!group.length) continue;
    const label = categories[cat]?.label || cat;
    out.push(
      `<h3 class="group-heading" id="group-${esc(cat)}" data-cat="${esc(cat)}">` +
        `<span class="group-name">${esc(label)}</span>` +
        `<span class="group-count">${group.length}</span>` +
        `</h3>`
    );
    out.push(...group.map((e) => entryRowHtml(e, repo, now)));
  }
  return out.join("\n");
}

/**
 * Without JavaScript the chips cannot filter, so the prerender emits them as
 * jump links to the group headings instead. app.js replaces them with real
 * filter buttons on hydrate.
 */
function categoryChipsHtml(entries, categories) {
  const counts = new Map();
  for (const e of entries) counts.set(e.category, (counts.get(e.category) || 0) + 1);
  const chips = [
    `<a class="chip" href="#catalog">All <span class="chip-count">${entries.length}</span></a>`,
  ];
  for (const [cat, meta] of Object.entries(categories)) {
    const n = counts.get(cat) || 0;
    if (!n) continue;
    chips.push(
      `<a class="chip" href="#group-${esc(cat)}">${esc(meta.label || cat)} <span class="chip-count">${n}</span></a>`
    );
  }
  return chips.join("");
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

function headMetaHtml(site, stats, generatedAt, hasCard) {
  const url = site.siteUrl;
  const title = site.title;
  const desc = site.tagline;
  const card = `${url.replace(/\/+$/, "")}/${OG_CARD_NAME}`;
  const cardMeta = hasCard
    ? [
        `<meta property="og:image" content="${esc(card)}" />`,
        `<meta property="og:image:width" content="1200" />`,
        `<meta property="og:image:height" content="630" />`,
        `<meta property="og:image:alt" content="${esc(`${title}: ${desc}`)}" />`,
        `<meta name="twitter:card" content="summary_large_image" />`,
        `<meta name="twitter:image" content="${esc(card)}" />`,
      ]
    : [`<meta name="twitter:card" content="summary" />`];
  return [
    `<link rel="canonical" href="${esc(url)}" />`,
    `<meta name="theme-color" content="#1a4d3e" media="(prefers-color-scheme: light)" />`,
    `<meta name="theme-color" content="#0f1216" media="(prefers-color-scheme: dark)" />`,
    `<meta property="og:type" content="website" />`,
    `<meta property="og:site_name" content="${esc(title)}" />`,
    `<meta property="og:title" content="${esc(title)}" />`,
    `<meta property="og:description" content="${esc(desc)}" />`,
    `<meta property="og:url" content="${esc(url)}" />`,
    ...cardMeta,
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
      (e) =>
        `  <url><loc>${esc(base)}/entry/${esc(e.id)}/</loc>${e.verified ? `<lastmod>${esc(e.verified)}</lastmod>` : ""}</url>`
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
      <p>Looking for an entry? <a href="${esc(base)}/#catalog">Search the catalog</a>.</p>
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

/** Writes dist/entry/<id>/index.html for every entry. */
function writeEntryPages({ entries, bodies, config, stats, stamp, hasCard, now }) {
  const errors = [];
  const written = [];
  const idByPath = new Map(entries.map((e) => [e.path, e.id]));
  const kindOf = (repoPath) => {
    const full = path.join(ROOT, repoPath);
    if (!fs.existsSync(full)) return null;
    return fs.statSync(full).isDirectory() ? "dir" : "file";
  };
  // Prev/next follow the homepage's default order: category, then name.
  const visible = entries.filter((e) => e.status !== "deprecated");
  const neighbours = new Map();
  for (const cat of Object.keys(config.categories)) {
    const group = visible.filter((e) => e.category === cat);
    group.forEach((e, i) => neighbours.set(e.id, { prev: group[i - 1] || null, next: group[i + 1] || null }));
  }
  for (const entry of entries) {
    const body = bodies.get(entry.id) || "";
    const file = `${entry.path} (body)`;
    try {
      const resolveLink = makeLinkResolver({ entryPath: entry.path, idByPath, repo: config.site.repo, kindOf });
      const { lead, rest, restFirstLine } = splitEntryBody(body);
      const leadHtml = renderBlocks(lead, { file, resolveLink });
      const restHtml = renderBlocks(rest, { file, resolveLink, firstLine: restFirstLine });
      const reason = entry.status === "deprecated" ? deprecationReason(body) : null;
      const { prev = null, next = null } = neighbours.get(entry.id) || {};
      const html = entryPageHtml({
        entry,
        leadHtml,
        restHtml,
        deprecatedReasonHtml: reason ? renderInline(reason, resolveLink) : null,
        prev,
        next,
        site: config.site,
        categoryLabel: config.categories[entry.category]?.label || entry.category,
        stamp,
        total: stats.total,
        hasCard,
        now,
      });
      const dir = path.join(DIST, "entry", entry.id);
      fs.mkdirSync(dir, { recursive: true });
      fs.writeFileSync(path.join(dir, "index.html"), html);
      written.push(`entry/${entry.id}/index.html`);
    } catch (err) {
      if (err instanceof MarkdownError || err instanceof LinkError) errors.push(err.message);
      else throw err;
    }
  }
  return { errors, written };
}

/** Runs the page checks over dist-relative files. */
function checkPages(files) {
  const kindOf = (rel) => {
    const full = path.join(DIST, rel);
    if (!fs.existsSync(full)) return null;
    if (fs.statSync(full).isDirectory()) return fs.existsSync(path.join(full, "index.html")) ? "dir" : null;
    return "file";
  };
  return files.flatMap((f) => checkPage(fs.readFileSync(path.join(DIST, f), "utf8"), { file: f, kindOf }));
}

function main() {
  const config = JSON.parse(fs.readFileSync(CONFIG_PATH, "utf8"));
  const vocab = JSON.parse(fs.readFileSync(VOCAB_PATH, "utf8"));
  const { entries, errors, bodies } = loadEntries(vocab);

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
  const hasCard = fs.existsSync(OG_CARD_SRC);
  if (hasCard) fs.copyFileSync(OG_CARD_SRC, path.join(DIST, OG_CARD_NAME));
  // data.json is the public machine-readable catalog (see site/README.md);
  // the page itself loads data.js.
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
    HEAD_META: headMetaHtml(config.site, stats, payload.generatedAt, hasCard),
    STARTER_ROWS: starterRowsHtml(featured),
    ENTRY_ROWS: groupedRowsHtml(visible, config.categories, repoUrl, now),
    CATEGORY_CHIPS: categoryChipsHtml(visible, config.categories),
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

  const pages = writeEntryPages({ entries, bodies, config, stats, stamp, hasCard, now });
  const pageErrors = [...pages.errors, ...checkPages(["index.html", ...pages.written])];
  if (pageErrors.length) {
    console.error(`Page build failed (${pageErrors.length}):`);
    for (const e of pageErrors.slice(0, 50)) console.error(`  - ${e}`);
    process.exit(1);
  }

  console.log(
    `Built ${entries.length} entries → site/dist (${stats.active} active, ${stats.commercialOk} commercial-ok, ${stats.commercialVaries} per-file)`
  );
  console.log(
    `Prerendered ${visible.length} entry rows into index.html; wrote ${pages.written.length} entry pages, sitemap.xml, robots.txt, 404.html`
  );
  if (errors.length) process.exitCode = 0; // soft-fail missing fields as warnings
}

main();
