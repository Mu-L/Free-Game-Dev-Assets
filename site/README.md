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
  file in this repo), `summary` (the first paragraph of its body), and two derived sort
  fields, `attributionClass` and `licenseRank`.
- It is regenerated from `catalog/` on every push to `main`. Field names are stable;
  new optional fields may appear. The licence facts are only as current as each entry's
  `verified` date: re-check the source before you ship on one.

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
