# Audio — SFX, music, foley

## SFX & libraries

| ID | Name | License | Commercial | Status |
| --- | --- | --- | --- | --- |
| [sonniss-gdc](sonniss-gdc.md) | Sonniss #GameAudioGDC | custom | yes | active |
| [kenney-rpg-audio](kenney-rpg-audio.md) | Kenney RPG Audio | CC0 | yes | active |
| [kenney-impact-sounds](kenney-impact-sounds.md) | Kenney Impact Sounds | CC0 | yes | active |
| [kenney-ui-audio](kenney-ui-audio.md) | Kenney UI Audio | CC0 | yes | active |
| [kenney-interface-sounds](kenney-interface-sounds.md) | Kenney Interface Sounds | CC0 | yes | active |
| [kenney-sci-fi-sounds](kenney-sci-fi-sounds.md) | Kenney Sci-fi Sounds | CC0 | yes | active |
| [gboxmikefozzy-footsteps](gboxmikefozzy-footsteps.md) | GboxMikeFozzy Footsteps | CC0 | yes | active |
| [congusbongus-footsteps-surfaces](congusbongus-footsteps-surfaces.md) | Congusbongus Footsteps | CC-BY-3.0 | yes | active |
| [fesliyan-footsteps](fesliyan-footsteps.md) | Fesliyan Footsteps | custom | yes | active |
| [mixkit-sfx](mixkit-sfx.md) | Mixkit Sound Effects | custom | yes | active |
| [bigsoundbank](bigsoundbank.md) | BigSoundBank | CC0 | yes | active |
| [pixabay-audio](pixabay-audio.md) | Pixabay Audio | custom | yes | active |
| [zapsplat](zapsplat.md) | Zapsplat | custom | yes† | active |
| [freesound](freesound.md) | Freesound | varies | filter | needs-review |

† Zapsplat's basic (free) tier requires attribution; Premium does not.

## Impulse responses

| ID | Name | License | Commercial | Status |
| --- | --- | --- | --- | --- |
| [voxengo-impulses](voxengo-impulses.md) | Voxengo Free IRs | custom | yes | active |
| [adventure-kid-irs](adventure-kid-irs.md) | Adventure Kid IRs (AKRT) | CC-BY-4.0 | yes | active |
| [echothief](echothief.md) | EchoThief IRs | unknown | unknown | needs-review |
| [convology-xt](convology-xt.md) | Convology XT Free Factory | custom | unknown | needs-review |

## Music

### Choosing game music

Two questions decide it, and the licence column answers only the first.

**Do you owe a credit?** Four of the six active sources owe nothing.

**Will videos of your game get claimed?** This is the one that bites later, and it bites
your players rather than you. A track registered with YouTube's Content ID gets matched in
any video that contains it. A licence that lets you ship the track does not stop that, and
an in-game credits screen shown on camera is not something YouTube reads. If you want
streamers and let's-players to post your game freely, choose music that is not fingerprinted.
Checked at each source on 2026-09-23:

| You need | Take | Credit owed | Content ID, per the source | Form |
| --- | --- | --- | --- | --- |
| Level-complete, pickup and menu cues | [kenney-music-jingles](kenney-music-jingles.md) | None, CC0 | Not addressed | 85 short stingers |
| Background loops, no strings | [tallbeard-abstraction-music-loop-bundle](tallbeard-abstraction-music-loop-bundle.md) | None, CC0 | Not addressed | 200+ loops |
| Full tracks, no credit | [filmmusic-ende](filmmusic-ende.md) | None; the author waives the CC BY credit | **Forbids anyone registering the tracks**; allows monetised YouTube and Twitch | Tracks |
| A huge library, and credit is fine | [incompetech](incompetech.md) | **Required** | **Claims likely unless each video carries the credit in its description text** | Tracks |
| Loops and atmospheres, and credit is fine | [soundimage](soundimage.md) | **Required, in the game itself** | Not addressed | Loop-oriented; use the Ogg files for looping |
| A big searchable pool, no credit | [pixabay-audio](pixabay-audio.md) | None | **Some tracks are fingerprinted.** Filter for unflagged ones, then verify | Tracks and SFX |

"Not addressed" means the source says nothing either way, not that it is safe. CC0 music
can still be registered by a third party, so check a track in YouTube Studio before you
build a trailer around it.

The three aggregators below (ccMixter, Free Music Archive, Musopen) license per track.
Some of their tracks are non-commercial or no-derivatives, which rules them out for a
game; read each track's licence. FreePD and Purple Planet are deprecated because the
sites are gone.

| ID | Name | License | Commercial | Status |
| --- | --- | --- | --- | --- |
| [incompetech](incompetech.md) | Incompetech | CC-BY-4.0 | yes | active |
| [filmmusic-ende](filmmusic-ende.md) | FilmMusic / Sascha Ende | CC-BY-4.0 | yes | active |
| [soundimage](soundimage.md) | Soundimage.org | custom | yes | active |
| [purple-planet](purple-planet.md) | Purple Planet | custom | unknown | deprecated |
| [kenney-music-jingles](kenney-music-jingles.md) | Kenney Music Jingles | CC0 | yes | active |
| [tallbeard-abstraction-music-loop-bundle](tallbeard-abstraction-music-loop-bundle.md) | Abstraction Music Loop Bundle | CC0 | yes | active |
| [freepd](freepd.md) | FreePD | unknown | unknown | deprecated |
| [free-music-archive](free-music-archive.md) | Free Music Archive | varies | unknown | needs-review |
| [ccmixter](ccmixter.md) | ccMixter | varies | unknown | needs-review |
| [musopen](musopen.md) | Musopen | unknown | unknown | needs-review |

Avoid **ND**-licensed music in games — see [`docs/licenses.md`](../../docs/licenses.md) / [`docs/high-risk.md`](../../docs/high-risk.md).
