# Tools — asset creation & pipeline

These are editors/utilities and free engine add-ons, not asset packs. Tool license ≠ license of art you create with them.

## Choosing between near-duplicates

Several pairs and clusters below do the same job. What separates them:

| If you want | Take | Over | Because |
| --- | --- | --- | --- |
| A retro SFX in ten seconds | [jsfxr](jsfxr.md) | sfxr, bfxr | Browser, nothing to install, and the permalink encodes the full parameter set so a sound is reproducible from a URL in a design doc |
| Control over the synthesis | [chiptone](chiptone.md) | jsfxr | Deepest editor of the four, still browser-based and CC0 |
| The original desktop tool | [sfxr](sfxr.md) | bfxr | Reference implementation; [bfxr](bfxr.md) adds mixing and more waveforms if you need them |
| A pixel editor under active development | [pixelorama](pixelorama.md) | libresprite | Godot-based, still shipping releases |
| Aseprite muscle memory | [libresprite](libresprite.md) | pixelorama | Fork of Aseprite from before it went proprietary, so the UX matches; development is slower |
| A mature tilemap editor | [tiled](tiled.md) | ldtk | Ortho, isometric and hex; the widest engine loader support. Note the editor is GPL, `libtiled` is BSD-2-Clause |
| Modern level-design UX | [ldtk](ldtk.md) | tiled | MIT throughout, auto-layers and entity definitions, no GPL question at all |
| An audio editor without telemetry history | [tenacity](tenacity.md) | audacity | Community fork made over exactly that objection |
| The mainstream audio editor | [audacity](audacity.md) | tenacity | Larger plugin and tutorial ecosystem |
| Photogrammetry with a GUI | [meshroom](meshroom.md) | colmap | Node graph you can watch; needs CUDA for the dense stage |
| Photogrammetry you can script | [colmap](colmap.md) | meshroom | The SfM reference, CLI-first, more control at every step |
| Interactive retopology | [instant-meshes](instant-meshes.md) | quadriflow | You paint the orientation field and watch the quads follow |
| Batch retopology | [quadriflow](quadriflow.md) | instant-meshes | Runs unattended, which is what you want in a pipeline step |

Not interchangeable despite the names: [proton-scatter](proton-scatter.md) is 3D scattering
along curves and surfaces, [scatter2d](scatter2d.md) is 2D. The four colourblindness tools
each cover a different stage: [color-oracle](color-oracle.md) simulates full-screen on
desktop, [sim-daltonism](sim-daltonism.md) is a live lens on macOS and iOS,
[daltonlens](daltonlens.md) implements the more accurate models for analysis, and
[ubisoft-chroma](ubisoft-chroma.md) is built to run over captured game footage.

## Editors & creation

| ID | Name | License | Status |
| --- | --- | --- | --- |
| [blender](blender.md) | Blender | GPL-2.0-or-later | active |
| [blockbench](blockbench.md) | Blockbench | GPL-3.0 | active |
| [ldtk](ldtk.md) | LDtk | MIT | active |
| [tiled](tiled.md) | Tiled Map Editor | GPL-2.0-or-later | active |
| [pixelorama](pixelorama.md) | Pixelorama | MIT | active |
| [material-maker](material-maker.md) | Material Maker | MIT | active |
| [gaea](gaea.md) | Gaea Community Edition | custom | needs-review |
| [accurig](accurig.md) | AccuRig (Reallusion) | custom | needs-review |
| [krita](krita.md) | Krita | GPL-3.0 | active |
| [inkscape](inkscape.md) | Inkscape | GPL-3.0-or-later | active |
| [tenacity](tenacity.md) | Tenacity | GPL-2.0 | active |
| [jsfxr](jsfxr.md) | jsfxr | Unlicense | active |
| [chiptone](chiptone.md) | ChipTone | CC0 | active |
| [gimp](gimp.md) | GIMP | GPL-3.0-or-later | active |
| [libresprite](libresprite.md) | LibreSprite | GPL-2.0 | active |
| [goxel](goxel.md) | Goxel | GPL-3.0-or-later | active |
| [materialize](materialize.md) | Materialize | GPL-3.0 | active |
| [lmms](lmms.md) | LMMS | GPL-2.0-or-later | active |
| [bfxr](bfxr.md) | Bfxr | MIT | active |
| [sfxr](sfxr.md) | sfxr | MIT | active |
| [audacity](audacity.md) | Audacity | GPL-3.0 | active |

## Pipeline & compression

| ID | Name | License | Status |
| --- | --- | --- | --- |
| [gltf-transform](gltf-transform.md) | glTF Transform | MIT | active |
| [basis-universal](basis-universal.md) | Basis Universal | Apache-2.0 | active |
| [ktx-software](ktx-software.md) | KTX-Software | Apache-2.0 | active |
| [meshoptimizer](meshoptimizer.md) | meshoptimizer | MIT | active |
| [google-draco](google-draco.md) | Google Draco | Apache-2.0 | active |
| [assimp](assimp.md) | assimp | BSD-3-Clause | active |
| [free-tex-packer](free-tex-packer.md) | Free Tex Packer | MIT | active |
| [osm2world](osm2world.md) | OSM2World | MIT | active |
| [instant-meshes](instant-meshes.md) | Instant Meshes | BSD-3-Clause | active |
| [quadriflow](quadriflow.md) | QuadriFlow | BSD-3-Clause | active |
| [meshroom](meshroom.md) | Meshroom | MPL-2.0 | active |
| [colmap](colmap.md) | COLMAP | BSD-3-Clause | active |
| [meshlab](meshlab.md) | MeshLab | GPL-3.0 | active |
| [cloudcompare](cloudcompare.md) | CloudCompare | GPL-2.0-or-later | active |
| [xnormal](xnormal.md) | xNormal | custom | needs-review |

## Audio middleware

| ID | Name | License | Status |
| --- | --- | --- | --- |
| [fmod-studio](fmod-studio.md) | FMOD Studio | custom | needs-review |
| [wwise](wwise.md) | Wwise Indie | custom | needs-review |

## Accessibility & localization

| ID | Name | License | Status |
| --- | --- | --- | --- |
| [ubisoft-chroma](ubisoft-chroma.md) | Ubisoft Chroma | Apache-2.0 | active |
| [sim-daltonism](sim-daltonism.md) | Sim Daltonism | Apache-2.0 | active |
| [daltonlens](daltonlens.md) | DaltonLens | BSD-2-Clause | active |
| [color-oracle](color-oracle.md) | Color Oracle | MIT | active |
| [polyglot-gamedev](polyglot-gamedev.md) | Polyglot Gamedev | CC0 | active |

## Speech / TTS (local)

| ID | Name | License | Status |
| --- | --- | --- | --- |
| [kokoro-82m](kokoro-82m.md) | Kokoro-82M | Apache-2.0 | active |
| [sherpa-onnx](sherpa-onnx.md) | sherpa-onnx | Apache-2.0 | active |
| [melotts](melotts.md) | MeloTTS | MIT | active |
| [piper-plus](piper-plus.md) | Piper Plus | MIT | active |
| [espeak-ng](espeak-ng.md) | eSpeak NG | GPL-3.0-or-later | active |

## Godot 4 add-ons

| ID | Name | License | Status |
| --- | --- | --- | --- |
| [proton-scatter](proton-scatter.md) | ProtonScatter | MIT | active |
| [scatter2d](scatter2d.md) | Scatter2D | MIT | active |
| [smartshape2d](smartshape2d.md) | SmartShape2D | MIT | active |
| [phantom-camera](phantom-camera.md) | Phantom Camera | MIT | active |
| [godot-guide](godot-guide.md) | G.U.I.D.E. | MIT | active |
| [godot-input-helper](godot-input-helper.md) | Input Helper | MIT | active |
| [dialogic](dialogic.md) | Dialogic | MIT | active |
| [creature-2d-runtimes](creature-2d-runtimes.md) | Creature 2D Runtimes | Apache-2.0 | active |
| [godot-mod-loader](godot-mod-loader.md) | Godot Mod Loader | MIT | active |
| [beehave](beehave.md) | Beehave | MIT | active |
| [limboai](limboai.md) | LimboAI | MIT | active |
| [terrain3d](terrain3d.md) | Terrain3D | MIT | active |
| [godotsteam](godotsteam.md) | GodotSteam | custom | needs-review |

## GTA-format tooling

Software only. Not a GTA V asset grant. See [`docs/fivem.md`](../../docs/fivem.md).

| ID | Name | License | Status |
| --- | --- | --- | --- |
| [sollumz](sollumz.md) | Sollumz | GPL-3.0-or-later | active |

See: [`docs/godot-budget-stack.md`](../../docs/godot-budget-stack.md) · [`docs/ai-assets.md`](../../docs/ai-assets.md) · [`docs/fivem.md`](../../docs/fivem.md) · [`docs/research-index.md`](../../docs/research-index.md).
