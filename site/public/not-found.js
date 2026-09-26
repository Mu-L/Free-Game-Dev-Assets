/**
 * The 404 page reads the words in the address that missed (a mistyped
 * /entry/kenny-ui/, say), suggests the closest entries and offers a catalog
 * search for the same words. The page works without it.
 */
(() => {
  const data = window.__CATALOG__;
  const host = document.getElementById("suggestions");
  if (!data || !host || !document.currentScript) return;

  // Scripts load from the site root, so this script's own address gives
  // the root however deep the missing path was.
  const root = new URL("./", document.currentScript.src);
  let rest = location.pathname;
  try {
    rest = decodeURIComponent(rest);
  } catch {
    // A malformed escape: match on the raw path.
  }
  const rootPath = root.pathname;
  if (rest.startsWith(rootPath)) rest = rest.slice(rootPath.length);
  const slug = rest
    .replace(/^(entry|stack)\//, "")
    .replace(/(index)?\.html?$/, "")
    .toLowerCase()
    .replace(/[^a-z0-9]+/g, "-")
    .replace(/^-+|-+$/g, "");
  if (!slug) return;

  /** Letter pairs, so a dropped or swapped letter still leaves most in common. */
  function pairs(text) {
    const out = new Map();
    for (let i = 0; i < text.length - 1; i++) {
      const p = text.slice(i, i + 2);
      out.set(p, (out.get(p) || 0) + 1);
    }
    return out;
  }
  /** Dice coefficient over letter pairs: 1 is identical, 0 shares nothing. */
  function similarity(a, b) {
    const pa = pairs(a);
    const pb = pairs(b);
    let shared = 0;
    let total = 0;
    for (const n of pa.values()) total += n;
    for (const [p, n] of pb) {
      total += n;
      shared += Math.min(n, pa.get(p) || 0);
    }
    return total ? (2 * shared) / total : 0;
  }
  const slugOf = (s) => String(s).toLowerCase().replace(/[^a-z0-9]+/g, "-").replace(/^-+|-+$/g, "");

  const MIN_SCORE = 0.4;
  const matches = data.entries
    .map((e) => ({
      entry: e,
      // Deprecated entries still have pages, but a live one is the better guess.
      score:
        Math.max(similarity(slug, e.id), similarity(slug, slugOf(e.name))) -
        (e.status === "deprecated" ? 0.1 : 0),
    }))
    .filter((m) => m.score >= MIN_SCORE)
    .sort((a, b) => b.score - a.score || a.entry.name.localeCompare(b.entry.name))
    .slice(0, 5);

  const words = slug.split("-").join(" ");
  if (matches.length) {
    const heading = document.createElement("h2");
    heading.textContent = "Did you mean";
    const list = document.createElement("ul");
    list.className = "stack-list";
    for (const { entry } of matches) {
      const li = document.createElement("li");
      const a = document.createElement("a");
      a.href = new URL(`entry/${encodeURIComponent(entry.id)}/`, root).href;
      a.textContent = entry.name;
      const note = document.createElement("span");
      note.textContent = `${entry.license} · ${entry.category}${entry.status === "deprecated" ? " · deprecated" : ""}`;
      a.append(note);
      li.append(a);
      list.append(li);
    }
    host.append(heading, list);
  }
  const search = document.createElement("p");
  const link = document.createElement("a");
  link.href = new URL(`?q=${encodeURIComponent(words)}#catalog`, root).href;
  link.textContent = `Search the catalog for "${words}"`;
  search.append(link);
  host.append(search);
})();
