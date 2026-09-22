# Review ledger

Newest section at the top. One section per review run. This is the record of what a
run measured, what it changed, what it deliberately did not change, and what the next
run should not spend time re-deciding.

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
  - **Batch E** (docs and decision support) was never put to the maintainer, so it was
    not run. It holds two doc gaps this run measured and a set of comparison lines.
  - **15 entries carrying `license: GPL-2.0` or `GPL-3.0`** have no `license_spdx` and
    must not get one by inference. SPDX deprecated the bare identifiers; each project
    is either `-only` or `-or-later` and the recorded value does not say. Resolving
    them means reading 15 projects' own licensing statements. `license-vocabulary.json`
    marks them ambiguous and check V2 rejects any guess.
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
- Next highest-value action: **populate `camera_perspective` and `grid_dimensions`**.
  The task-based coverage test failed hardest not on missing sources but on missing
  taxonomy: a developer cannot filter for a top-down 2D source, because
  `camera_perspective` is set on 11 of 294 entries and `grid_dimensions` on 6, and the
  site does not expose either. The schema already solved this problem and nothing
  filled it in. After that, the three concrete source gaps the task test found:
  rigged first-person arms, CC0 4-directional top-down character sprites, and
  rubble/pre-fractured debris geometry.
