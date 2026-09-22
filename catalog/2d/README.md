# 2D — sprites, GUI, icons, palettes

Do not mix tile grids or camera projections without scaling/reprojection. Typical buckets: **micro** 8–12px (Urizen 12×12, Bit Bonanza 10×10), **standard** 16×16, **dense** 32×32+. `isometric_3_4` (Ninja Adventure, Dungeon Tileset II) is not ortho top-down or side-scroller. Baked 2D character cycles (LuizMelo and similar) live here, not under `animation/`.

Optional frontmatter: `grid_dimensions`, `camera_perspective`, `hardware_tags`.

## Choosing an icon set

Eight icon sources are listed and seven of them are permissive UI sets that look
interchangeable. They are not. Pick by what you need, not by licence.

| Need | Take | Why |
| --- | --- | --- |
| A general UI set, no decisions | [lucide-icons](lucide-icons.md) | ISC, actively maintained Feather successor, brand-free, consistent stroke |
| The widest coverage | [tabler-icons](tabler-icons.md) | MIT, the largest outline set here, uniform 24px grid |
| Several weights of one family | [phosphor-icons](phosphor-icons.md) | MIT, six weights including duotone, so emphasis stays on-family |
| Google design language | [material-symbols](material-symbols.md) | Apache-2.0, variable axes for weight, fill and optical size |
| Small and opinionated | [heroicons](heroicons.md) | MIT, fewest icons, chosen not configured |
| App chrome plus some logos | [bootstrap-icons](bootstrap-icons.md) | MIT, broad UI coverage, includes a few brand marks |
| **Brand logos** | [simple-icons](simple-icons.md) | CC0 covers the SVG only. **Trademarks still apply**: identify, do not imply endorsement |
| **Game iconography** | [game-icons-net](game-icons-net.md) | The only set here that is not UI chrome: swords, potions, abilities. **CC-BY-3.0, credit the individual author** |

The last two are the ones to read carefully. Everything above them is a style choice; those
two carry obligations the rest do not.

| ID | Name | License | Commercial | Status |
| --- | --- | --- | --- | --- |
| [glitch-archive](glitch-archive.md) | Glitch archive | CC0 | yes | active |
| [kenney-ui-pack](kenney-ui-pack.md) | Kenney UI Pack | CC0 | yes | active |
| [playpug-simple-vector-ui](playpug-simple-vector-ui.md) | PlayPug Simple Vector UI | CC0 | yes | active |
| [kenney-cursor-pack](kenney-cursor-pack.md) | Kenney Cursor Pack | CC0 | yes | active |
| [kenney-pixel-platformer](kenney-pixel-platformer.md) | Kenney Pixel Platformer | CC0 | yes | active |
| [kenney-1-bit-pack](kenney-1-bit-pack.md) | Kenney 1-Bit Pack | CC0 | yes | active |
| [kenney-tiny-dungeon](kenney-tiny-dungeon.md) | Kenney Tiny Dungeon | CC0 | yes | active |
| [kenney-pixel-vehicle-pack](kenney-pixel-vehicle-pack.md) | Kenney Pixel Vehicle Pack | CC0 | yes | active |
| [kenney-input-prompts](kenney-input-prompts.md) | Kenney Input Prompts | CC0 | yes | active |
| [ox72-dungeon-tileset](ox72-dungeon-tileset.md) | 0x72 Dungeon Tileset | CC0 | yes | active |
| [ox72-dungeontileset-ii](ox72-dungeontileset-ii.md) | 0x72 Dungeon Tileset II | CC0 | yes | active |
| [ninja-adventure](ninja-adventure.md) | Ninja Adventure | CC0 | yes | active |
| [sparklin-superpowers](sparklin-superpowers.md) | Sparklin Superpowers packs | CC0 | yes | active |
| [screaming-brain-studios](screaming-brain-studios.md) | Screaming Brain Studios iso tiles | CC0 | yes | active |
| [gameart2d-freebies](gameart2d-freebies.md) | GameArt2D freebies | CC0 | yes | active |
| [bit-bonanza](bit-bonanza.md) | Bit Bonanza | CC0 | yes | active |
| [urizen-onebit](urizen-onebit.md) | Urizen 1Bit | CC0 | yes | active |
| [openpeeps](openpeeps.md) | Open Peeps | CC0 | yes | active |
| [paleto-vol01](paleto-vol01.md) | Paleto Vol.01 | CC0 | yes | active |
| [pixel-frog](pixel-frog.md) | Pixel Frog | varies | varies | active |
| [ansimuz-sunnyland](ansimuz-sunnyland.md) | SunnyLand (ansimuz) | CC0 | yes | active |
| [luizmelo-martial-hero](luizmelo-martial-hero.md) | LuizMelo Martial Hero | CC0 | yes | active |
| [luizmelo-evil-wizard](luizmelo-evil-wizard.md) | LuizMelo Evil Wizard | CC0 | yes | active |
| [luizmelo-monsters-creatures-fantasy](luizmelo-monsters-creatures-fantasy.md) | LuizMelo Monsters Fantasy | CC0 | yes | active |
| [penzilla](penzilla.md) | Penzilla | custom | yes | needs-review |
| [material-symbols](material-symbols.md) | Material Symbols | Apache-2.0 | yes | active |
| [craftpix](craftpix.md) | CraftPix freebies | custom | yes | active |
| [game-icons-net](game-icons-net.md) | Game-Icons.net | CC-BY-3.0 | yes | active |
| [lucide-icons](lucide-icons.md) | Lucide Icons | ISC | yes | active |
| [phosphor-icons](phosphor-icons.md) | Phosphor Icons | MIT | yes | active |
| [tabler-icons](tabler-icons.md) | Tabler Icons | MIT | yes | active |
| [heroicons](heroicons.md) | Heroicons | MIT | yes | active |
| [bootstrap-icons](bootstrap-icons.md) | Bootstrap Icons | MIT | yes | active |
| [simple-icons](simple-icons.md) | Simple Icons | CC0 | yes†† | active |
| [xelu-input-prompts](xelu-input-prompts.md) | Xelu input prompts | CC0 | yes | active |
| [universal-lpc-generator](universal-lpc-generator.md) | Universal LPC Generator | varies (SA) | varies† | active |
| [lpc-revised-basics](lpc-revised-basics.md) | LPC Revised Basics | varies (SA) | varies† | active |
| [openclipart](openclipart.md) | Openclipart | CC0 | yes | active |
| [opengameart](opengameart.md) | OpenGameArt | varies | unknown | needs-review |
| [lospec](lospec.md) | Lospec | varies | unknown | needs-review |
| [dcss-tiles](dcss-tiles.md) | Dungeon Crawl Stone Soup Tiles | varies | unknown | needs-review |

† Commercial OK with attribution + share-alike / GPL obligations on asset derivatives — see [`docs/high-risk.md`](../../docs/high-risk.md).  
†† CC0 on SVG copyright; brand trademarks still apply — identify brands only.
