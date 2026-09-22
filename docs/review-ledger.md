# Review ledger

Newest section at the top. One section per review run. This is the record of what a
run measured, what it changed, what it deliberately did not change, and what the next
run should not spend time re-deciding.

## 2026-09-22 (fourth pass, same session)

Sourcing, against the gap the View filter exposed. Batch H.

- Executed: **6 new 2D entries**, all CC0 and all `active`. Entry count 294 -> 300.
  `kenney-micro-roguelike` (8x8, `top_down`), `kenney-tiny-battle` (16x16, `top_down`),
  `kenney-tiny-town`, `kenney-roguelike-rpg-pack`, `kenney-roguelike-characters` and
  `armm1998-zelda-like` (all `isometric_3_4`). `top_down` 1 -> 3, and two of the three
  are now `active` CC0 rather than a lone `needs-review` aggregator.
- Method worth repeating: **perspective was decided by opening each pack's sample
  image**, because no Kenney asset page states a projection in text. That is how the
  split was found. Micro Roguelike and Tiny Battle are genuinely orthographic; Tiny
  Town and the Roguelike/RPG pack draw facades above an overhead ground plane and are
  3/4. Filing all of them as top-down because they are overhead RPG tiles would have
  been wrong, and reading only the descriptions would have produced exactly that error.
- **The character half of the gap is still open.** It was stated as "CC0 4-directional
  top-down character sprites" and nothing added here claims four-direction walk cycles.
  Kenney Roguelike Characters is front-facing 3/4 sprites with variants; the ArMM1998
  submission says "Character with sword animation and character tamplet" without
  enumerating directions. Both entries say so in their notes. Confirming directional
  coverage means downloading and opening the sheets, which no pass has done.
- Deferred, unchanged: `tenacity`'s licence (Codeberg 403s automated requests), the
  eight decision-support clusters without comparison lines, the three deliberately
  untagged tile packs, and the scope question about `camera_perspective` on
  `characters` and `3d`.
- Next highest-value action: **open the character sheets** for
  `kenney-roguelike-characters`, `armm1998-zelda-like` and `ninja-adventure` and record
  what directional coverage each actually ships. That is the one remaining question
  behind the original task-test gap, and it is now the only thing standing between the
  catalog and a confident answer to "where do my top-down characters come from".

## 2026-09-22 (third pass, same session)

Took the "next highest-value action" the first two passes both named. Batch G.

- Executed: **the 2D taxonomy is populated and exposed.** `camera_perspective`
  11 -> 28, `grid_dimensions` 6 -> 11. Site gained a View filter with URL state
  (`?view=side_scroller`), the grid and perspective on every row, both fields in the
  entry dialog, and an active-filter chip. New check **V12** enforces the documented
  vocabulary for all three optional fields, which `TEMPLATE.md` described and nothing
  had ever checked.
- Also fixed, found by reading the deployed payload rather than by any check:
  **`license_spdx` was 0/294 in the built site.** `build.mjs` never copied the field
  onto the entry object, so every SPDX identifier the catalog has recorded existed only
  in frontmatter and had never reached `data.json`, `data.js` or the page. Now 227/294
  live. Worth noting the shape of this bug: `validate.mjs` measures frontmatter,
  `build.mjs` decides what ships, and nothing compares the two. Other fields could be
  dropped the same way and no check would notice.
- Method, and the constraint worth keeping: fields were populated **only where the
  entry's own body already states the fact**, so this restates what the catalog knows
  and no `verified:` date moved. A first attempt used regex over the bodies and was
  discarded: it read "0x72" in an author's name as a grid size and the word
  "platformer" in unrelated prose as a side-scroller. The bodies were read instead.
- Deferred, and now visible rather than hidden:
  - **`top_down` returns exactly one entry** (`dcss-tiles`, which is `needs-review`).
    That is the coverage gap the task test found in the first pass, now legible in the
    UI. It is a sourcing problem, not a tagging one.
  - **Three tile packs are deliberately untagged**: `kenney-1-bit-pack` and
    `kenney-tiny-dungeon` read as top-down roguelike tiles, and `ox72-dungeon-tileset`
    is the sibling of an entry already classified `isometric_3_4`, but none of the
    three states its perspective in its own body. Confirming them means looking at the
    packs, which is a sourcing task for a future run. Do not infer them.
  - The rest of `2d` beyond these, and every other category, still has no
    `camera_perspective`. That is correct for `tools`, `fonts` and `audio`; it is an
    open question for `characters` and parts of `3d`, where the field is arguably not
    applicable at all. Decide the scope before populating further.
- Next highest-value action: ~~**source a CC0 4-directional top-down character set and a
  top-down tileset with a stated perspective**~~ — tilesets done in the fourth pass
  above; the character half remains open.

## 2026-09-22 (second pass, same session)

Picked up the two items the first pass deferred. Batches F and E.

- Executed:
  - **F, GPL version precision.** Read each of the 15 bare-GPL projects' own licensing
    statements at source. 8 had an explicit election and were corrected:
    cloudcompare, lmms and tiled to `GPL-2.0-or-later`; goxel, gimp, espeak-ng and
    sollumz to `GPL-3.0-or-later`; and **inkscape from `GPL-2.0` to `GPL-3.0-or-later`**,
    which is a correction rather than precision, because its own COPYING says the
    complete binaries are GPLv3-or-later while its licensing page still shows the GPLv2
    title. `license_spdx` coverage 219 -> 227 (77.2%). `verified` moved to 2026-09-22 on
    these 8 only, each with a dated Evidence line quoting what was read.
  - Added check **V11**: a category README row may not contradict its entry's
    frontmatter. It found two real drifts (tiled's row said GPL-3.0 against frontmatter
    GPL-2.0; jsfxr's still said public-domain after batch B corrected it to Unlicense).
  - **E, documentation and decision support.** `docs/fonts.md` and `docs/geodata.md`,
    both registered in `site/config.json` and linked from `catalog/README.md`.
    Comparison tables for the icon cluster in `catalog/2d/README.md` and the tool
    near-duplicates in `catalog/tools/README.md`.
- Deferred, still open:
  - **7 entries keep a bare GPL value on purpose** and now say why in their notes.
    krita and meshlab have per-file `GPL-2.0-or-later` headers but ship the GPLv3 text,
    so the distribution is GPLv3 with no single election. audacity says "GPLv3" while
    most files are GPLv2-or-later and VST3 code constrains the combination. blockbench,
    libresprite and materialize ship stock licence text with no election. **tenacity
    could not be read at all**: Codeberg returned 403 to automated requests, so its
    value is unchanged and unconfirmed, and it is the one worth a manual look.
  - Eight of the ten decision-support clusters still have no comparison line: the four
    colourblindness tools are described in prose but the remaining clusters (Godot
    scatter, dungeon tilesets, and the rest) are untouched.
  - Everything in the first-pass list below that is not struck through here.
- Parked, do not re-litigate:
  - **A stock GPL licence file proves nothing about the project's election.** Its own
    "How to Apply These Terms" appendix contains the words "any later version". A pass
    in this session nearly recorded eight wrong answers by pattern-matching that phrase
    in 35KB LICENSE files. Only a project-authored statement counts: a source-file
    header, a README sentence, or a short project-written licence note.
  - **krita and meshlab are not defects.** Their bare `GPL-3.0` is the honest value.
    Checked 2026-09-22 against two sources each.
  - **Annotated cells in category README tables are deliberate.** `CC0*`, `CC-BY?`,
    `varies (SA)` and `varies (CC0/MIT/GPL)` carry footnote warnings the plain value
    cannot. V11 strips a trailing marker or parenthetical before comparing; do not
    "normalise" these away. An earlier attempt in this session stripped 10 of them and
    was reverted.
  - **V11 only inspects rows whose first cell is the entry link.** Category READMEs may
    also hold comparison tables that link entries from prose cells; those are not
    listings. Matching any row produced 22 false positives.
- Next highest-value action: unchanged from the first pass below. Populate
  `camera_perspective` and `grid_dimensions`.

## 2026-09-22

- Measured: 294 entries (263 active, 29 needs-review, 2 deprecated); 262 commercial
  true, 23 unknown, 8 varies, 1 false; 20 distinct `license` values; `license_spdx`
  209/294, `publisher` 128/294. Stale share 0 percent: every `verified` date is under
  90 days old because the repo is 65 days old. Required fields 294/294, zero misses.
  Link sweep of all 294 urls: 282 returned 2xx, 12 returned 403/454 bot blocks, and
  **zero were dead**.
- Integrity check that mattered most: of the 292 entries with a dated `## Evidence`
  section, **zero** had a `verified` date newer than their newest evidence date. No
  date in this catalog has been carried forward without evidence behind it.
- Executed: batches A, B, C, D, one commit each, validator and build green after each.
  - A: `spdx-allowed.json` +7 identifiers; `license_spdx` backfilled on 10 entries
    (209 -> 219); `publisher` rule in CONTRIBUTING clarified.
  - B: 10 new checks in `site/checks.mjs` behind `site/license-vocabulary.json`, with
    `site/checks.test.mjs` (28 assertions) wired into both workflows; 6 entries edited
    so the checks could ship.
  - C: 3 `url` fields repointed after publisher domain moves.
  - D: prerendering, the deprecated-filter fix, verified age in the UI, permalinks,
    URL state, sort, clipboard, legend, dark scheme, sitemap/robots/404.
- Deferred:
  - ~~**Batch E** (docs and decision support)~~ — done in the second pass above.
  - ~~**15 entries carrying `license: GPL-2.0` or `GPL-3.0`**~~ — 8 resolved in the
    second pass above; 7 remain bare on purpose, with reasons recorded in their notes.
  - **12 urls returned 403 or 454** (fab, smithsonian, scan-the-world, sonniss,
    pixabay-audio, zapsplat, musopen, inkscape, tenacity, cloudcompare, vroid-studio,
    godot-shaders). Bot blocks, inconclusive, not defects. No `verified` was moved.
    They need a browser-based check whenever one of them next needs re-verifying.
  - **`og:image`** is omitted rather than faked. It needs a real image file and the
    binary-asset rule keeps one out of the repo; decide where it should live.
  - **`site/dist/data.json`** is deployed but unused by the page. It may be a
    deliberate JSON endpoint. If it is, say so in `site/README.md`; if not, drop it.
- Parked, do not re-litigate:
  - **One entry equals one pack.** Kenney 44, Quaternius 23 and KayKit 13 entries look
    like redundancy and are not; `provenance.md` settles it. Three publishers holding
    27 percent of the catalog is a consequence of that rule, not a defect.
  - **Aggregators with `commercial: varies` appear under the Commercial OK filter**,
    labeled per-file review. CONTRIBUTING states this is deliberate so they are neither
    silently excluded nor silently treated as a blanket grant.
  - **`publisher` on a single-entry publisher is allowed.** This run first read the
    CONTRIBUTING rule as a gate and proposed deleting the field from Tiny Speck,
    Screaming Brain Studios and Sparklin. That was the wrong reading: the rule's real
    prohibition is generic hosts, and deleting accurate rights-holder data to satisfy a
    formatting rule loses information. The wording was clarified instead.
  - **`blender.md` carries no `publisher` while the Blender Studio asset bundles do.**
    Not an inconsistency. The Blender Foundation ships the application; Blender Studio
    holds the asset rights. Check V7 is written to allow exactly this.
  - **OFL font entries set `attribution_required: false`.** Correct. OFL obliges a
    notice carried with the font files, not a credits-screen line. The vocabulary
    records this as attribution class `notice` so V4 does not fire on them.
  - **No virtualization, pagination or search debounce.** Measured at 294 entries and
    below the threshold where they pay for themselves. Measure again before proposing.
- Next highest-value action: ~~**populate `camera_perspective` and `grid_dimensions`**~~
  — done in the third pass above.
  The task-based coverage test failed hardest not on missing sources but on missing
  taxonomy: a developer cannot filter for a top-down 2D source, because
  `camera_perspective` is set on 11 of 294 entries and `grid_dimensions` on 6, and the
  site does not expose either. The schema already solved this problem and nothing
  filled it in. After that, the three concrete source gaps the task test found:
  rigged first-person arms, CC0 4-directional top-down character sprites, and
  rubble/pre-fractured debris geometry.
