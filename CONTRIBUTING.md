# Contributing

This repo catalogs **links and metadata** for free (preferably commercially usable) game assets and related tools. It does not host binary asset dumps.

Please follow the [Code of Conduct](CODE_OF_CONDUCT.md).

## What belongs here

- Asset libraries, packs, and aggregators with a clear free tier
- Tools useful for creating or processing game assets
- Free engine add-ons / plugins that materially help asset or production pipelines (e.g. Godot Asset Library tools)
- Engines only when they ship substantial free asset libraries

## What does not

- Paid-only marketplaces with no free content worth listing
- Broken, abandoned, or license-unclear sources (use `status: needs-review` or open an issue)
- Redistributed ZIP/GLB/WAV files of third-party work
- Assets that are free only for non-commercial / personal use (unless clearly tagged `commercial: false`)
- GTA V / RDR2 extracts, FiveM MLO leaks, Tebex reuploads, and anonymous `fivem-props` dumps (see [`docs/fivem.md`](docs/fivem.md) and [`docs/high-risk.md`](docs/high-risk.md))

## Adding an entry

One new markdown file is enough — the website rebuilds from frontmatter on deploy.

1. Copy [`catalog/TEMPLATE.md`](catalog/TEMPLATE.md).
2. Save it as `catalog/<category>/<id>.md` using a short kebab-case `id`.
3. Fill every frontmatter field. Prefer primary URLs over mirror/aggregator pages.
4. `id` must be unique across the **whole** catalog. A mixed kit already listed in another category is a duplicate, not a second entry.
5. Verify the license on the live source page the day you submit.
6. For `status: active`, include an `## Evidence` line with a short quote from that page.
7. Bump `expectedEntryCount` in [`site/config.json`](site/config.json) by the number of files you added (or lowered if you removed some).
8. Run `node site/validate.mjs` — it must exit 0.
9. Optional 2D/UI fields: `grid_dimensions`, `camera_perspective`, `hardware_tags`, `attribution_string` (see [`TEMPLATE.md`](catalog/TEMPLATE.md)).
10. Add a row to the matching category `README.md`. This is required: the validator fails an entry that is not listed there, and the row's licence cell must match your frontmatter.
11. Optional: add the `id` to `site/config.json` → `featured` to pin it under Safe starting points.

### Frontmatter rules

- `license`: the source's licence, written as one of the values in [`site/license-vocabulary.json`](site/license-vocabulary.json) (e.g. `CC0`, `CC-BY-3.0`, `SIL OFL`, `GPL-3.0-or-later`, `custom`, `varies`). If the source uses a licence the vocabulary lacks, add it there first, with its SPDX mapping and attribution class. For GPL, record `-only` or `-or-later` only when the project itself says which; otherwise use the bare `GPL-2.0` or `GPL-3.0`.
- `license_spdx`: the SPDX identifier the vocabulary maps your `license` to. The validator rejects a missing one when a mapping exists, and an invented one when it does not.
- `commercial`: `true` / `false` / `unknown` / `varies`. Use `varies` for aggregators where some files are commercial-ok and others are not. The site still shows these under Commercial OK, labeled **per-file review**, so they are not silently excluded and not silently treated as a blanket grant.
- `attribution_required`: `true` / `false` / `unknown`. If the licence normally requires credit (CC-BY) but the publisher waives it, set `false` and add a `- Attribution waived:` line in Notes saying so.
- `attribution_string`: optional copy-paste credit.
- `publisher`: optional. Name the **rights-holding publisher**, never the host. Set it whenever that publisher has more than one catalog entry, so the entries group; setting it on a publisher that currently has only one entry is also fine and saves a backfill later. Do not set it to a generic host (GitHub, Hugging Face, itch.io) or to a distributor that does not hold the rights. Distinguish sibling organisations that are genuinely different rights holders: `blender.md` (the application, Blender Foundation) carries no `publisher`, while the asset bundles under `studio.blender.org` carry `Blender Studio`. Kenney, Quaternius, KayKit, Google Fonts, OpenGameArt, LuizMelo, 0x72, Blender Studio, Material Maker, Alif Type, GGBotNet and 3dmodelscc0 are the largest groups in use today; treat that as illustrative, not as the permitted set.
- `subcategories`: lower-case kebab-case (`base-meshes`, `field-recordings`). Reuse a value already in the catalog before inventing one, and do not add a variant of an existing value that differs only in plural or spelling. Where both forms were in use, the more common one was kept (`characters`, `environment`, `interior`, `tileset`, `vectors`).
- `formats`: what you actually get, in one of four kinds. **File formats**, as commonly written: usually upper case (`PNG`, `FBX`, `JSON`, `VOX`), tool-specific ones as the tool writes them (`gdshader`, `tmx`, `ktx2`). **Engine or language targets**, as the product writes them (`glTF`, `Godot`, `Unity`, `Python`, `React`). **Delivery types** for software with no file format of its own, lower-case kebab-case (`godot-addon`, `blender-extension`, `npm`, `cli`, `library`, `desktop-app`, `mobile-app`, `middleware`, `model`). And `various` for an aggregator whose files come in too many formats to list. Platforms (`windows`, `macos`, `ios`) and descriptions (`heightfield`, `examples`) are `tags`, not formats. Reuse the spelling already in the catalog.
- `grid_dimensions` / `camera_perspective` / `hardware_tags`: optional metadata for 2D and UI entries. `3d` and `characters` entries leave `camera_perspective` out: it describes a 2D camera, and those entries have none.
- `verified`: ISO date (`YYYY-MM-DD`) of your last license check.
- `status`: `active` | `needs-review` | `deprecated`. `active` means the licence, the commercial stance and the credit requirement are all settled: an `unknown` in `license`, `commercial` or `attribution_required` keeps an entry at `needs-review`. The validator enforces this (V14), and rejects `formats` or `subcategories` values that differ only by case, punctuation or a trailing "s" from one already in use (V13).

## License verification checklist

- [ ] License text or badge visible on the source
- [ ] Commercial use explicitly allowed (or marked false) — **free download ≠ commercial**
- [ ] Interactive/game use confirmed, not just "commercial use" in the abstract (see [`docs/game-vs-video-licensing.md`](docs/game-vs-video-licensing.md))
- [ ] Attribution / share-alike / NC / ND flags recorded
- [ ] Marketplace EULA checked if Unity/Fab/Unreal/itch
- [ ] Supplier looks reputable (not an anonymous laundering risk — see [`docs/provenance.md`](docs/provenance.md))
- [ ] Not on the [`docs/high-risk.md`](docs/high-risk.md) blocklist (MB-Lab, default Shadertoy, ND music, Unity Companion, GTA/FiveM rips, etc.)
- [ ] Entry does not claim rights we don’t have
- [ ] Tool entries distinguish **software license** from **exported asset** ownership

## Research notes

Local Gemini / deep-research drafts live under `RESEARCH/` as `R0N-<topic>.md` (mostly gitignored; see [`docs/research-index.md`](docs/research-index.md)). Promote durable findings into catalog entries and `docs/` — don’t rely on drafts as the public source of truth.
