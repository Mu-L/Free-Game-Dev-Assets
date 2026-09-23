# Review ledger

Newest section at the top. One section per review run. This is the record of what a
run measured, what it changed, what it deliberately did not change, and what the next
run should not spend time re-deciding.

## 2026-09-23 (ninth pass, same session)

Both of the eighth pass's next actions. Two commits.

- **`poly-pizza` updated.** The licence-label finding was re-checked before being written
  down: the first reading took the first licence string anywhere on each page, which can
  come from a related-model card. Read properly from each model's structured `Licence`
  field, with the creator confirmed as Quaternius on all eight, it holds: one model is
  `CC-BY 3.0`, seven are `CC0 1.0`, and the author's own site says CC0. The entry now
  says the licence is per file, not per author, and warns about the same page-reading
  trap. `verified` moved to 2026-09-23 because the entry's claim (licences vary per model)
  was read live today, with two dated Evidence lines, so V8 holds. Still `needs-review`.
- **Batch O: `catalog/characters/README.md` gained "Choosing a rigged character
  source"**, sorted by licence first and then by engine-readiness.
- **The finding: three sources, three skeletons.** KayKit uses 41 joints with its own
  short names, weapon hand-slots and no finger bones; the Quaternius model uses a 53-joint
  Rigify rig with fingers; GDQuest's mannequin uses 45 joints with Unreal-mannequin-style
  names. Animations need retargeting between publishers, and finger animation retargeted
  onto KayKit is lost.
- `microsoft-rocketbox` gained notes from its README: four LODs, 417 animations, facial
  blendshapes (the only ones in the catalog), Unity-first tooling. Notes only.
- **Caught before commit:** a draft said every Blender Studio rig needs a login and
  Blender 5.0. The entries record that only for the Singularity rigs; Rain is a direct
  download. The Quaternius skeleton figures are also scoped to the model actually
  measured, not to the Universal Base Characters pack, which was not opened.
- Deferred, unchanged: `tenacity`'s licence, the two `camera_perspective` schema and
  scope questions.
- Remaining measured clusters: `audio/sfx` (14), `tools/godot` (12), `audio/music` (11).
- Next highest-value action: **`tools/godot`**, the Godot 4 add-ons. It matches the
  owner's current work (`docs/godot-budget-stack.md`), twelve add-ons currently sit in
  one undifferentiated list, and the useful facts (Godot version support, last release,
  licence) are readable from each repository.

## 2026-09-23 (eighth pass, same session)

Took the seventh pass's next action. Batch N. The 3D kit question, which earlier passes
held back as a matter of art style, turned out to be mostly measurable.

- Executed: parsed the glTF/GLB of every model in Kenney's Modular Dungeon and Nature
  kits (368), every model in KayKit's Dungeon Remastered and Adventurers packs (235), and
  eight Quaternius models, then wrote **Choosing between Kenney, KayKit and Quaternius**
  into `catalog/3d/README.md`. Triangles, texturing, rigs, animation counts, height, file
  size and delivery, each from the files rather than the store pages.
- **The finding that matters most is scale.** Kenney Nature Kit trees are 1.33 m and rocks
  0.32 m; Kenney's own Modular Dungeon walls are 4.2 m; Quaternius trees are 7 to 10 m.
  The Nature Kit is authored at a miniature scale and needs about 5x before it sits beside
  anything else. KayKit and Kenney dungeon walls agree within 5% (4.0 m, 4.2 m).
- **Correction:** `kenney-nature-kit` advised pairing it with the Quaternius Stylized
  Nature MegaKit "for denser stylized forests". Measured, that puts 1.3 m trees beside
  7-10 m trees at a twentyfold density gap. Rewritten. Notes only; `verified` unchanged.
- **New finding, logged rather than acted on, per the rule on scope:** Poly Pizza labels
  the same author's work inconsistently. Of eight Quaternius models checked, seven showed
  "Public Domain" and one (Animated Base Character) showed "Creative Commons
  Attribution", while Quaternius itself releases the packs as CC0. That is direct evidence
  for the `poly-pizza` entry's `needs-review` status and belongs in its notes next run: an
  aggregator's per-file licence label cannot be trusted over the author's own statement.
- **Method limits, stated in the README as well.** Quaternius packs are served through
  itch, whose free-download flow would not issue a file outside a browser session (the
  signed key was rejected every time without browser cookies). The Quaternius figures come
  from eight models on Poly Pizza, so they are indicative, not pack-wide. KayKit ships
  official GitHub repos (`KayKit-Game-Assets/*`), which is why its sample is complete.
- Deferred, unchanged: `tenacity`'s licence, the `camera_perspective` scope question for
  `characters` and `3d`, the single-valued `camera_perspective` schema question.
- Remaining measured clusters: `characters/rigged` (14), `audio/sfx` (14), `tools/godot`
  (12), `audio/music` (11). The KayKit and Quaternius rig numbers from this pass already
  cover most of `characters/rigged`.
- Next highest-value action: ~~**add the Poly Pizza finding**, then
  **`characters/rigged`**~~ — both done in the ninth pass above.

## 2026-09-23 (site navigation, same session)

Maintainer-requested navigation and usability work, not a review pass. Batches L and M.
Recorded here because it changes what the site promises and fixes a defect.

- **Defect fixed:** below 640px, `.topnav a:nth-child(-n + 3) { display: none }` hid
  Catalog, Starters and Guides, so the mobile primary nav contained only "GitHub". It
  predates this session. All four links now fit at 375px.
- **L:** the catalog is grouped under category headings with counts (default sort and
  no category filter only; other sorts render flat because grouping would hide the order
  asked for). Category chips show faceted counts under the other active filters. The
  chip for the section in view gets a separate "you are here" marker with `aria-current`;
  chips stay pure filters. Back-to-top, `/` to focus search, `Esc` to clear. Without JS
  the chips are prerendered as jump links to the group headings. Anchored targets clear
  the sticky filter bar via a measured `--sticky-h` and `scroll-margin-top`.
- **M:** previous/next inside the entry dialog, in on-screen order across group
  boundaries and within filters, with arrow keys, a "4 of 23" position, and focus
  returning to the entry you ended on. An entry opened from a permalink that the current
  filters exclude gets no pager, because there is no honest "next" for it.
- Both batches verified in a browser at 1200px and 375px in both colour schemes: every
  control at least 44px, WCAG AA on all new text, no overflow, no console errors.
- **Parked, do not re-litigate:** chips filter, they do not jump. Making one control
  both filter and navigate was considered and rejected in design. Grouping is
  deliberately conditional on the default sort.
- Next highest-value action for the catalog is unchanged from the seventh pass below:
  the 3D kit question (Kenney vs Quaternius vs KayKit).

## 2026-09-22 (seventh pass, same session)

Took the sixth pass's next action. Batch K. **Re-measured before starting, and the
ledger's own figure was wrong.**

- The "eight uncovered clusters" carried forward since the second pass was stale: the
  tools comparison table from batch E already covers seven of the original ten. Counting
  clusters properly, by entries sharing a subcategory inside a category, found much
  larger ones nobody had looked at. Lesson for future passes: **re-measure the deferred
  item before working it**, because a count written three passes ago describes a
  catalog that no longer exists.
- Executed: three comparison tables, chosen by cluster size and by how little the
  licence column helps.
  - `catalog/2d/README.md` — **Choosing a pixel tileset** (10 sources). Sorted by grid
    size and projection, the two things that actually decide it.
  - `catalog/3d/README.md` — **Choosing a PBR texture source** (8 sources). Sorted by
    licence first: six are genuine CC0, `sharetextures` and `freepbr` are custom grants
    that permit shipping a game but restrict passing the textures on.
  - `catalog/fonts/README.md` — **Choosing a pixel font** (9 sources). Sorted by kind of
    retro, and by CJK coverage, which three have and the licence column cannot show.
- **The 2D tileset table is one this session owed.** Batch H added six pixel tile packs
  to a category that already had four, leaving ten CC0 sources that look
  interchangeable. Adding sources without adding a way to choose between them is a debt,
  and it is worth noticing that the same pass that closes a coverage gap can open a
  decision-support one.
- **V11 reworked.** The 3D table leads with the entry link, which made it structurally
  identical to a catalog listing row, and V11 produced seven false positives. It now
  finds the listing by its `| ID |` header rather than by row shape. To stop that from
  becoming a check that measures nothing if the header ever changes, a category README
  with entries and no such table is now itself an error. Both behaviours are fixtured
  and were re-proved by mutating the real catalog.
- Deferred, unchanged: `tenacity`'s licence (Codeberg 403s automated requests), the
  `camera_perspective` scope question for `characters` and `3d`, and the single-valued
  `camera_perspective` schema question from the sixth pass.
- Remaining clusters, now measured rather than guessed, largest first: `3d/environment`
  (32), `3d/props` (26), `3d/modular` (17), `characters/rigged` (14), `audio/sfx` (14),
  `tools/godot` (12), `audio/music` (11), `characters/animated` (10). The 3D ones are
  really one question — **Kenney vs Quaternius vs KayKit**, three publishers holding 80
  entries — and answering it well needs a view on art style and topology, not metadata.
- Next highest-value action: **that 3D kit question**. It is the largest cluster in the
  catalog, `catalog/3d/README.md` had no guidance at all until this pass, and a
  developer starting a 3D project hits it immediately.

## 2026-09-22 (sixth pass, same session)

Took the fifth pass's next action. Batch J. The 2D taxonomy is now as complete as it
can honestly be.

- Executed: opened all three packs.
  - `kenney-tiny-dungeon` -> **`isometric_3_4`**. Walls carry a lit front face below
    the top surface and figures face the viewer.
  - `ox72-dungeon-tileset` -> **`isometric_3_4`**. Vertical brick wall face behind a
    floor plane, front-facing creatures. Matches its already-classified sibling.
  - `kenney-1-bit-pack` -> **stays absent, and now says why.**
  `camera_perspective` 28 -> 36 of 300.
- **A real limit of the field, found by opening the archive.** The 1-bit pack ships
  four official Kenney sample scenes: fantasy overworld, interior, urban and
  *platformer*. The fantasy sample is 3/4 with building facades; the platformer sample
  is a side-scroller built from the same tiles. The pack genuinely serves both, so no
  single value is correct. This is not missing data, it is a single-valued field meeting
  a multi-perspective tileset.
- **Open schema question, deliberately not answered here.** Should
  `camera_perspective` accept a list, or a `multi` value? Widening it changes what the
  View filter means for all 300 entries (does a `side_scroller` filter return a pack
  that merely *can* be used that way?), so it is the maintainer's call, not a detail to
  settle inside a tagging pass. For now the field stays absent on such packs, the reason
  is in the entry, and a `multi-perspective` tag makes it findable by search.
- Every 2D entry that can carry a single honest value now does. What remains absent is
  absent for a stated reason, which was not true before this pass.
- Deferred, unchanged: `tenacity`'s licence (Codeberg 403s automated requests), the
  eight decision-support clusters without comparison lines, and the `camera_perspective`
  scope question for `characters` and `3d`.
- Next highest-value action: ~~**the eight decision-support clusters**~~ — worked in
  the seventh pass above, where the count turned out to be stale. Three much larger
  clusters were covered instead.

## 2026-09-22 (fifth pass, same session)

Took the fourth pass's next action. Batch I. **The original task-test gap is now
closed**, four passes after it was first measured.

- Executed: downloaded and opened the three character sheets, and recorded what each
  actually ships rather than what its description implies.
  - `ninja-adventure` — **4-directional**. 64x112 per character on a 16px grid: four
    columns for down, up and both sides, seven rows of frames.
  - `armm1998-zelda-like` — **4-directional**. 272x256 sheet of 16x32 frames, four
    facings, four-frame walk plus a sword set in each direction.
  - `kenney-roguelike-characters` — **front-facing only**. 918x203 on a 16px tile with
    1px spacing: bodies, hair, clothing, armour, shields and weapons, every frame the
    front view. No side or back facings, no animation frames anywhere in the pack.
  Tagged `4-directional` and `front-facing` so site search reaches them.
- **Correction to the fourth pass.** The `kenney-roguelike-characters` note claimed
  variants were "separate sprites rather than a layered paper doll". The sheet shows
  the opposite: it is a layered parts kit meant to be composited. What it lacks is
  turning, not layering. Fixed. The lesson is the same one the fourth pass recorded
  about perspective: the sheet answers questions the store page does not.
- `verified:` deliberately unchanged on all three. Frame layout is not licence text,
  and the findings sit in Notes rather than Evidence because an Evidence line in this
  repo means proof of licence and commercial stance.
- Sources opened: `kenney_roguelike-characters.zip` from the Kenney asset page,
  `gfx_3.zip` attached to the OpenGameArt submission, and `content/character/*/sprite.png`
  in [pixel-boy/NinjaAdventure](https://github.com/pixel-boy/NinjaAdventure), the
  author's own game repo built from the itch pack. **The itch download itself is behind
  a form**, so the Ninja Adventure layout is verified from that repo rather than from
  the pack archive; a future run with a browser could confirm against the itch zip.
- Deferred, unchanged: `tenacity`'s licence (Codeberg 403s automated requests), the
  eight decision-support clusters without comparison lines, the three deliberately
  untagged tile packs, and the `camera_perspective` scope question for `characters`
  and `3d`.
- Next highest-value action: ~~**the three untagged tile packs**~~ — done in the sixth
  pass above. Two resolved to `isometric_3_4`; the 1-bit pack is genuinely
  multi-perspective and stays absent with a stated reason.

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
- Next highest-value action: ~~**open the character sheets**~~ — done in the fifth
  pass above. Two of the three turn; the Kenney set does not.

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
