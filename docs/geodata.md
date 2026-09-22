# Geodata and elevation: attribution across a mixed licence set

The `environment/` category is the most licence-diverse in this catalog. Fifteen entries
span CC0, public domain, CC-BY-4.0, ODbL, CDLA-Permissive-2.0 and three different national
agency terms. They all look like "free government data" and they do not carry the same
obligations. This page is the shared guidance the per-entry notes assume.

## Public domain does not mean no acknowledgement

This is the distinction that makes the category confusing. Four catalog sources are public
domain and ask for nothing; three are public domain and **ask to be acknowledged**.

A request is not a licence condition. You are not in breach if you skip it. But the
agencies are the reason the data exists, the ask is cheap to honour, and in the case of
NASA the request comes attached to a rule you must follow anyway (no implied endorsement).

**Catalog policy:** when the publisher asks in writing, the entry records
`attribution_required: true` and supplies an `attribution_string`, even where the legal
status is public domain. The field records the obligation as the publisher states it, not
a court's view of it. When the publisher asks for nothing, the field is `false`.

| Source | Licence | Credit | Why |
| --- | --- | --- | --- |
| `etopo-2022` | CC0 | No | Waived outright |
| `nasadem` | CC0 | No | Citation urged, not asked as a condition |
| `poly-haven`, `open-hdri` | CC0 | No | Waived outright |
| `natural-earth` | public domain | No | Explicitly asks for no credit |
| `usgs-earth-explorer` | public domain | No | No standing request |
| `gebco` | public domain | **Yes** | Compilation group asks users to acknowledge the source |
| `nasa-3d-resources` | public domain | **Yes** | NASA asks to be credited and forbids implied endorsement |
| `esa-worldcover` | CC-BY-4.0 | **Yes** | Licence condition |
| `ms-building-footprints` | CDLA-Permissive-2.0 | **Yes** | Notice must travel with the data |
| `copernicus-dem-glo30` | custom | **Yes** | Specific wording required by the terms |
| `jaxa-alos-aw3d30` | custom | **Yes** | Agency terms require the credit line |
| `openstreetmap` | ODbL | **Yes** | Licence condition, see below |
| `opentopography` | varies | **Yes** | Per dataset; cite the landing page too |

Each entry carries the exact string to use. Copy it from the entry rather than inventing
wording, because two of these (Copernicus and JAXA) specify the form.

## ODbL and OpenStreetMap: the share-alike does not reach your game

ODbL is the only copyleft licence in this category and the one people most often
over-read. It distinguishes the **database**, a **derived database**, and a **produced
work**.

- Rendering OSM data into a level mesh, a texture, a navmesh, or a baked terrain makes a
  **produced work**. Your game is a produced work. The share-alike does not force you to
  open your game, your source, or your assets.
- Reshaping the data and shipping *the data* makes a **derived database**. That is what
  triggers the share-alike. Exporting a trimmed `.osm` extract into your build and letting
  players read it is the case to watch.
- Either way you must credit: `© OpenStreetMap contributors`, visible somewhere a player
  can reach.

The practical rule: bake it and you are fine, ship it and you have obligations.

## Heightmaps are derived works of the elevation data

A terrain heightmap exported from a DEM carries the DEM's terms. It stops looking like
geodata the moment it is a greyscale PNG, and the obligation does not stop with it. If
the source needed a credit line, the credit follows the heightmap into your build.

This matters most for `copernicus-dem-glo30` and `jaxa-alos-aw3d30`, whose custom terms
require specific wording, and least for `etopo-2022` and `nasadem`, which are CC0.

## Where the credit goes

One reachable place is enough. In order of what works:

1. A credits screen or an in-game "Attributions" panel.
2. A `CREDITS.txt` or `third-party-licences.txt` shipped with the build.
3. The store page, only as a supplement. Not sufficient on its own for ODbL, because a
   player who has the game should be able to find the notice.

Group them. One "Map and elevation data" block listing every source is easier to maintain
than a line per asset, and satisfies all of the above.

## Do not scrape

Google Maps, Bing Maps, Apple Maps and their elevation endpoints are not free geodata
sources, whatever a tutorial says. Their terms prohibit deriving and redistributing
content, and a scraped heightmap is the clearest possible case of that. Use the sources in
this catalog. See [`high-risk.md`](high-risk.md).

## Related

- [`licenses.md`](licenses.md) for the cross-category cheat sheet
- [`provenance.md`](provenance.md) for judging a supplier
- Catalog: [`catalog/environment/`](../catalog/environment/)
