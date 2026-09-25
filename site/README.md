# Site

Static GitHub Pages UI for this catalog.

## Single source of truth

`site/build.mjs` scans every `catalog/**/*.md` (except `README.md` / `TEMPLATE.md`), reads YAML frontmatter, and writes `site/dist/data.js` + static assets.

| You edit | What updates |
| --- | --- |
| `catalog/<category>/<id>.md` | Catalog list, search, filters, counts |
| `site/config.json` → `featured` | Safe starting points table (`id` + `need`) |
| `site/config.json` → `categories` / `guides` | Labels and guide links |
| `site/public/*` | Page chrome / design |
| An entry's body (Notes, Evidence) | Its page at `entry/<id>/` |
| `stacks/<id>.md` | Its page at `stack/<id>/`, the homepage Starter stacks list, and "Used in" on each picked entry |

## Public JSON

Every deploy publishes the whole catalog as
[`data.json`](https://tmhsdigital.github.io/Free-Game-Dev-Assets/data.json), for scripts
and tools that want the metadata without scraping the page. The page itself loads
`data.js`, the same payload assigned to `window.__CATALOG__`.

- Top-level keys: `generatedAt`, `site`, `categories`, `guides`, `featured`, `stats`,
  `entries`.
- Each entry carries its frontmatter fields (`id`, `name`, `url`, `category`,
  `subcategories`, `license`, `license_spdx` where set, `commercial`,
  `attribution_required`, `attribution_string` where set, `formats`, `tags`, `verified`,
  `status`, `publisher` where set, and the optional 2D fields), plus `path` (the entry's
  file in this repo), `page` (the entry's page, relative to the site root), `summary` (the first paragraph of its body), and two derived sort
  fields, `attributionClass` and `licenseRank`.
- It is regenerated from `catalog/` on every push to `main`. Field names are stable;
  new optional fields may appear. The licence facts are only as current as each entry's
  `verified` date: re-check the source before you ship on one.

## Entry pages

`build.mjs` writes `entry/<id>/index.html` for every entry from its frontmatter and
body, using `site/lib/markdown.mjs`. The renderer supports exactly what entries use:
`#` and `##` headings, paragraphs, bullet lists (nesting allowed), bold, `*italic*`,
inline code, links and bare URLs. Underscores are literal. Anything else (tables,
code fences, blockquotes, images, raw HTML, `###`, numbered lists) fails the build
with the file and line, as does a relative link to a file that does not exist.

The build also writes `llms.txt` (one line per entry) and `llms-full.txt` (with each
entry's Notes) for AI assistants, and checks every generated page before it succeeds.
Tests: `node site/lib/lib.test.mjs`.

## Starter stacks

`build.mjs` writes `stack/<id>/index.html` for each file in `stacks/` (the format is in
`stacks/README.md`). The page's "What this stack owes" panel is computed from the picked
entries: credit lines to ship, picks that need no credit, aggregators to check file by
file, and open questions. A stack never states a licence itself. V15 in `checks.mjs`
fails a stack whose pick is missing, deprecated or malformed, or whose why sentence
names a licence; `validate.mjs` and `build.mjs` both run it.

## Social preview

`docs/images/readme/og-card.png` is a 1200x630 screenshot of this site's first screen.
`build.mjs` copies it into `dist` and emits the `og:image` and `twitter:image` tags.
Retake it when the hero changes.

## Commands

```bash
node site/build.mjs
npx --yes serve site/dist
```

Deploy: `.github/workflows/pages.yml` (source = GitHub Actions).
