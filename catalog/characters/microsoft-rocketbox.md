---
id: microsoft-rocketbox
name: Microsoft Rocketbox
url: https://github.com/microsoft/Microsoft-Rocketbox
publisher: Microsoft
category: characters
subcategories: [humanoid, rigged, library]
license: MIT
license_spdx: MIT
commercial: true
attribution_required: true
attribution_string: "Microsoft Rocketbox Copyright (c) 2020 Microsoft. Keep LICENSE.md with redistributed FBX."
formats: [FBX]
tags: [rigged, vr, research-origin, diverse]
verified: 2026-08-24
status: active
---

# Microsoft Rocketbox

115+ fully rigged humanoid avatars (multi-LOD FBX) released by Microsoft Research. Useful crowd / NPC / VR embodiment starter set when you need variety beyond stylized CC0 kits.

## Notes

- README still mentions the older “research/academic” blog framing; **LICENSE.md is MIT** (updated Dec 2020) — keep the copyright notice.
- Unity import helpers ship in-repo; Unreal batch importer contributed later. Retarget animations carefully (skeleton is library-specific).
- Paper citation requested for *research* use; MIT still requires copyright notice in distributions.
- What the repository ships beyond the meshes, per its README read 2026-09-23: **four poly levels per avatar** (`hipoly`, `midpoly`, `lowpoly`, `ultralowpoly`), **417 animations** (added 4/2022), and **facial blendshapes** (15 visemes, 48 FACS, 30 for the Vive facial tracker, plus ARKit-compatible sets from 6/2022). No other character source in this catalog has facial blendshapes or built-in LODs
- Tooling is Unity-first: the import script fixes 3ds Max materials and reorganises bones for Unity's humanoid rig. In Godot or Unreal, plan on doing that step yourself

## Evidence

- `LICENSE.md` (2026-08-24): MIT License, Copyright (c) 2020 Microsoft — rights include use, modify, sell.
- README changelog: “12/2020: Updated license to MIT.”

## Related

- [microsoft-movebox](../animation/microsoft-movebox.md) — Kinect→Rocketbox mocap tool
- [mixamo](../animation/mixamo.md) — retarget clips onto humanoids
- [quaternius-universal-animation-library](../animation/quaternius-universal-animation-library.md) — CC0 humanoid clips
- [blender-human-base-meshes](blender-human-base-meshes.md) — topology-focused bases
