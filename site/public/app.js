(() => {
  const data = window.__CATALOG__;
  if (!data) {
    // The page is prerendered, so leave what the build produced in place and
    // only say that filtering is unavailable.
    const note = document.createElement("p");
    note.className = "empty";
    note.textContent =
      "Catalog data failed to load, so search and filters are off. The list below is the full catalog as built.";
    document.querySelector("#catalog .section-head")?.append(note);
    return;
  }

  const $ = (sel, root = document) => root.querySelector(sel);
  const $$ = (sel, root = document) => [...root.querySelectorAll(sel)];

  const DEFAULTS = {
    category: "all",
    q: "",
    active: true,
    review: true,
    deprecated: false,
    commercialOnly: false,
    noAttr: false,
    perspective: "any",
    sort: "name",
  };
  const state = { ...DEFAULTS };

  const categoryLabels = data.categories || {};
  const repo = data.site?.repo || "https://github.com/TMHSDigital/Free-Game-Dev-Assets";
  const byId = Object.fromEntries(data.entries.map((e) => [e.id, e]));

  // Old permalinks (#entry-<id>) now have real pages.
  const legacy = location.hash.match(/^#entry-(.+)$/);
  let legacyId = null;
  try {
    legacyId = legacy ? decodeURIComponent(legacy[1]) : null;
  } catch {
    // A malformed escape is not an entry; the page loads as usual.
  }
  if (legacyId && byId[legacyId]) {
    location.replace(`entry/${encodeURIComponent(legacyId)}/`);
    return;
  }
  const PERSPECTIVE_LABELS = {
    top_down: "top-down",
    isometric_3_4: "3/4 view",
    side_scroller: "side-scroller",
    "2d_flat": "flat UI",
  };
  // Searchable words per perspective. A 3/4 pack is what most people mean by a top-down
  // RPG, so it answers "top down" too.
  const PERSPECTIVE_SEARCH = {
    top_down: "top-down",
    isometric_3_4: "3/4 view top-down",
    side_scroller: "side-scroller",
    "2d_flat": "flat ui",
  };
  // Ages are measured at build time, like the prerendered cards and the
  // freshness line, so the page never disagrees with itself. A weekly
  // scheduled build keeps the build time recent.
  const built = Date.parse(data.generatedAt);
  const NOW = Number.isNaN(built) ? Date.now() : built;
  const FRESH_DAYS = 180;
  const AGING_DAYS = 365;

  /* ------------------------------------------------------------ helpers */

  function escapeHtml(str) {
    return String(str)
      .replaceAll("&", "&amp;")
      .replaceAll("<", "&lt;")
      .replaceAll(">", "&gt;")
      .replaceAll('"', "&quot;")
      .replaceAll("'", "&#39;");
  }

  function edgeColor(entry) {
    if (entry.commercial === true) return "var(--ok)";
    if (entry.commercial === false) return "var(--danger)";
    if (entry.commercial === "varies") return "var(--warn)";
    return "var(--unknown)";
  }

  function commercialLabel(v) {
    if (v === true) return "commercial OK";
    if (v === false) return "non-commercial";
    if (v === "varies") return "per-file review";
    return "commercial ?";
  }

  /** Age of the license check, which is this catalog's main credibility signal. */
  function verifiedAge(verified) {
    if (!verified) return { days: null, bucket: "unknown", text: "verified date unknown" };
    const t = Date.parse(`${verified}T00:00:00Z`);
    if (Number.isNaN(t)) return { days: null, bucket: "unknown", text: "verified date unknown" };
    const days = Math.max(0, Math.floor((NOW - t) / 86400000));
    const bucket = days <= FRESH_DAYS ? "fresh" : days <= AGING_DAYS ? "aging" : "stale";
    return { days, bucket, text: `verified ${verified} (${days}d ago)` };
  }

  /* -------------------------------------------------------- url <-> state */

  function readUrl() {
    const p = new URLSearchParams(location.search);
    if (p.has("cat")) state.category = p.get("cat");
    if (p.has("q")) state.q = p.get("q");
    if (p.has("sort")) state.sort = p.get("sort");
    if (p.has("view")) state.perspective = p.get("view");
    const bool = (key, field) => {
      if (p.has(key)) state[field] = p.get(key) === "1";
    };
    bool("active", "active");
    bool("review", "review");
    bool("deprecated", "deprecated");
    bool("commercial", "commercialOnly");
    bool("noattr", "noAttr");
  }

  function writeUrl() {
    const p = new URLSearchParams();
    if (state.category !== DEFAULTS.category) p.set("cat", state.category);
    if (state.q.trim()) p.set("q", state.q.trim());
    if (state.sort !== DEFAULTS.sort) p.set("sort", state.sort);
    if (state.perspective !== DEFAULTS.perspective) p.set("view", state.perspective);
    const bool = (key, field) => {
      if (state[field] !== DEFAULTS[field]) p.set(key, state[field] ? "1" : "0");
    };
    bool("active", "active");
    bool("review", "review");
    bool("deprecated", "deprecated");
    bool("commercial", "commercialOnly");
    bool("noattr", "noAttr");
    const qs = p.toString();
    const next = `${location.pathname}${qs ? `?${qs}` : ""}${location.hash}`;
    history.replaceState(null, "", next);
  }

  /* ---------------------------------------------------------- filtering */

  function matches(entry) {
    if (state.category !== "all" && entry.category !== state.category) return false;
    if (entry.status === "active" && !state.active) return false;
    if (entry.status === "needs-review" && !state.review) return false;
    if (entry.status === "deprecated" && !state.deprecated) return false;
    if (state.commercialOnly && entry.commercial !== true && entry.commercial !== "varies")
      return false;
    if (state.noAttr && entry.attribution_required !== false) return false;
    if (state.perspective !== "any" && entry.camera_perspective !== state.perspective)
      return false;
    return searchScore(entry) > 0;
  }

  // Hyphens and underscores read as spaces: "first person" finds the "first-person" tag.
  function normalize(text) {
    return String(text).toLowerCase().replace(/[-_]+/g, " ").replace(/\s+/g, " ").trim();
  }

  /* ------------------------------------------------------------- search */

  // Each entry's searchable text, normalised once at load, in three fields.
  // Name and tags are what a reader means by a word, so a hit there ranks
  // above one in the other metadata, which ranks above a summary-only hit.
  const FIELD_WEIGHTS = [3, 2, 1];
  const searchIndex = new Map(
    data.entries.map((e) => [
      e.id,
      [
        normalize([e.name, ...(e.tags || [])].join(" ")),
        normalize(
          [
            e.license,
            e.category,
            e.publisher || "",
            PERSPECTIVE_SEARCH[e.camera_perspective] || "",
            ...(e.formats || []),
            ...(e.subcategories || []),
          ].join(" ")
        ),
        normalize(e.summary || ""),
      ],
    ])
  );

  /**
   * One test per query word. A word matches at the start of a word in the
   * text, never inside one: "ui" finds "UI kit" but not "build", "art" finds
   * "artwork" but not "earth". A plural query word also matches its singular,
   * since tags are stored one way: "buttons" finds the "button" tag.
   */
  function wordTest(word) {
    const forms = [word];
    if (word.length > 3 && word.endsWith("s")) forms.push(word.slice(0, -1));
    const alt = forms.map((f) => f.replace(/[.*+?^${}()|[\]\\]/g, "\\$&")).join("|");
    return new RegExp(`(?:^|[^\\p{L}\\p{N}])(?:${alt})`, "u");
  }

  let compiled = { q: null, tests: [] };
  function queryTests() {
    if (compiled.q !== state.q) {
      const words = normalize(state.q).split(" ").filter(Boolean);
      compiled = { q: state.q, tests: words.map(wordTest) };
    }
    return compiled.tests;
  }

  /**
   * 0 when the entry misses any query word. Every word must match somewhere,
   * in any order, so "top down" and "arms fps" work. Each word scores by the
   * best field it matched in, so name and tag hits rank first.
   */
  function searchScore(entry) {
    const tests = queryTests();
    if (!tests.length) return 1;
    const fields = searchIndex.get(entry.id) || [];
    let score = 0;
    for (const re of tests) {
      const i = fields.findIndex((f) => re.test(f));
      if (i === -1) return 0;
      score += FIELD_WEIGHTS[i];
    }
    return score;
  }

  const SORTS = {
    name: (a, b) => a.name.localeCompare(b.name),
    license: (a, b) =>
      (a.licenseRank ?? 3) - (b.licenseRank ?? 3) ||
      a.license.localeCompare(b.license) ||
      a.name.localeCompare(b.name),
    verified: (a, b) =>
      String(b.verified || "").localeCompare(String(a.verified || "")) ||
      a.name.localeCompare(b.name),
  };

  /* ---------------------------------------------------------- rendering */

  function cardHtml(entry) {
    const age = verifiedAge(entry.verified);
    const flags = [entry.status, commercialLabel(entry.commercial), entry.license]
      .map(escapeHtml)
      .join(" &middot; ");
    const formats = (entry.formats || [])
      .slice(0, 3)
      .map((f) => `<span>${escapeHtml(f)}</span>`)
      .join("");
    const taxonomy = [
      entry.grid_dimensions
        ? `<span class="tax">${escapeHtml(entry.grid_dimensions)}</span>`
        : "",
      entry.camera_perspective
        ? `<span class="tax">${escapeHtml(PERSPECTIVE_LABELS[entry.camera_perspective] || entry.camera_perspective)}</span>`
        : "",
    ].join("");
    return `<article class="entry-card" id="entry-${escapeHtml(entry.id)}" data-id="${escapeHtml(entry.id)}" data-status="${escapeHtml(entry.status)}" style="--edge:${edgeColor(entry)}">
  <span class="entry-edge" aria-hidden="true"></span>
  <div class="entry-body">
    <div class="entry-top">
      <h3><a class="entry-link" href="entry/${escapeHtml(entry.id)}/" data-id="${escapeHtml(entry.id)}">${escapeHtml(entry.name)}</a></h3>
      <span class="entry-flags">${flags}</span>
    </div>
    <p>${escapeHtml(entry.summary || "")}</p>
    <div class="meta-line">
      <span>${escapeHtml(entry.category)}</span>${formats}${taxonomy}
      <span class="verified is-${age.bucket}" title="License last checked at the source">${escapeHtml(age.text)}</span>
    </div>
    <div class="entry-links">
      <a href="${escapeHtml(entry.url)}" rel="noopener noreferrer">Open source</a>
      <a href="${escapeHtml(`${repo}/blob/main/${entry.path}`)}" rel="noopener noreferrer">Entry and evidence</a>
    </div>
  </div>
</article>`;
  }

  /**
   * Grouping is only meaningful under the default sort with no category
   * filter. Sorting by verified date or license inside category buckets would
   * hide the very ordering the reader asked for, so those fall back to a flat
   * list. The prerendered page is always the grouped default.
   */
  function shouldGroup() {
    return state.sort === "name" && state.category === "all";
  }

  /**
   * How many entries each category would yield under the *other* active
   * filters. Counting with the category filter applied would make every chip
   * read 0 except the selected one, which tells the reader nothing.
   */
  function facetCounts() {
    const saved = state.category;
    state.category = "all";
    const pool = data.entries.filter(matches);
    state.category = saved;
    const counts = new Map();
    for (const e of pool) counts.set(e.category, (counts.get(e.category) || 0) + 1);
    return { counts, total: pool.length };
  }

  function renderCategoryFilters() {
    const host = $("#category-filters");
    const buttons = [
      { id: "all", label: "All" },
      ...Object.keys(categoryLabels).map((id) => ({
        id,
        label: categoryLabels[id]?.label || id,
      })),
    ];
    host.innerHTML = buttons
      .map(
        (b) =>
          `<button type="button" class="chip" data-cat="${escapeHtml(b.id)}" aria-pressed="false">${escapeHtml(b.label)} <span class="chip-count" data-count-for="${escapeHtml(b.id)}"></span></button>`
      )
      .join("");
    host.addEventListener("click", (e) => {
      const btn = e.target.closest("[data-cat]");
      if (!btn) return;
      state.category = btn.getAttribute("data-cat");
      apply();
    });
  }

  function syncCategoryChips() {
    const { counts, total } = facetCounts();
    $$("#category-filters .chip").forEach((chip) => {
      const cat = chip.getAttribute("data-cat");
      const on = cat === state.category;
      chip.classList.toggle("is-active", on);
      chip.setAttribute("aria-pressed", on ? "true" : "false");
      const slot = chip.querySelector(".chip-count");
      if (slot) slot.textContent = cat === "all" ? String(total) : String(counts.get(cat) || 0);
      chip.classList.toggle("is-empty", cat !== "all" && !(counts.get(cat) || 0));
    });
  }

  /** Chips describing what is currently filtering the list, each removable. */
  function renderActiveFilters() {
    const host = $("#active-filters");
    const chips = [];
    if (state.category !== DEFAULTS.category) {
      chips.push({
        key: "category",
        label: `category: ${categoryLabels[state.category]?.label || state.category}`,
      });
    }
    if (state.q.trim()) chips.push({ key: "q", label: `search: ${state.q.trim()}` });
    if (state.sort !== DEFAULTS.sort) chips.push({ key: "sort", label: `sort: ${state.sort}` });
    if (state.perspective !== DEFAULTS.perspective)
      chips.push({
        key: "perspective",
        label: `view: ${PERSPECTIVE_LABELS[state.perspective] || state.perspective}`,
      });
    if (!state.active) chips.push({ key: "active", label: "hiding active" });
    if (!state.review) chips.push({ key: "review", label: "hiding needs-review" });
    if (state.deprecated) chips.push({ key: "deprecated", label: "showing deprecated" });
    if (state.commercialOnly) chips.push({ key: "commercialOnly", label: "commercial OK only" });
    if (state.noAttr) chips.push({ key: "noAttr", label: "no attribution only" });

    if (!chips.length) {
      host.hidden = true;
      host.innerHTML = "";
      return;
    }
    host.hidden = false;
    host.innerHTML = `
      <span class="active-filters-label">Filtering by</span>
      ${chips
        .map(
          (c) =>
            `<button type="button" class="chip chip-remove" data-clear="${escapeHtml(c.key)}">${escapeHtml(c.label)}<span aria-hidden="true"> x</span><span class="sr-only"> (remove)</span></button>`
        )
        .join("")}
      <button type="button" class="chip chip-clear" data-clear="all">Clear all</button>`;
  }

  function renderGrid() {
    const list = data.entries.filter(matches);
    if (state.sort === "name" && queryTests().length) {
      // Searching under the default sort: best match first, then by name.
      const score = new Map(list.map((e) => [e.id, searchScore(e)]));
      list.sort((a, b) => score.get(b.id) - score.get(a.id) || SORTS.name(a, b));
    } else {
      list.sort(SORTS[state.sort] || SORTS.name);
    }
    const grid = $("#entry-grid");
    const empty = $("#empty-state");
    $("#result-count").textContent = `${list.length} / ${data.entries.length}`;

    if (!list.length) {
      grid.innerHTML = "";
      empty.hidden = false;
      groupHeadings = [];
      return;
    }
    empty.hidden = true;

    if (!shouldGroup()) {
      grid.innerHTML = list.map(cardHtml).join("");
      groupHeadings = [];
      syncSpy();
      return;
    }

    const out = [];
    for (const cat of Object.keys(categoryLabels)) {
      const group = list.filter((e) => e.category === cat);
      if (!group.length) continue;
      const label = categoryLabels[cat]?.label || cat;
      out.push(
        `<h3 class="group-heading" id="group-${escapeHtml(cat)}" data-cat="${escapeHtml(cat)}">` +
          `<span class="group-name">${escapeHtml(label)}</span>` +
          `<span class="group-count">${group.length}</span>` +
          `</h3>`
      );
      out.push(...group.map(cardHtml));
    }
    grid.innerHTML = out.join("");
    groupHeadings = $$("#entry-grid .group-heading");
    syncSpy();
  }

  /* ------------------------------------------------- scroll position */

  let groupHeadings = [];
  let currentGroup = null;
  let ticking = false;

  /**
   * Marks which category you are currently scrolled into. The chips stay pure
   * filters; this is a separate, quieter signal, because one control carrying
   * two meanings is how a filter row stops being readable.
   */
  function syncSpy() {
    const controls = $(".controls");
    // Anchored jumps (chip links, #entry- permalinks) would otherwise land
    // underneath the sticky filter bar. Its height varies with wrapping, so
    // publish the measured value and let CSS scroll-margin use it. On small
    // screens the bar is not sticky, and nothing needs clearing.
    const stuck = !!controls && getComputedStyle(controls).position === "sticky";
    document.documentElement.style.setProperty(
      "--sticky-h",
      stuck ? `${Math.round(controls.getBoundingClientRect().height)}px` : "0px"
    );
    const cutoff = (stuck ? controls.getBoundingClientRect().bottom : 0) + 8;
    let found = null;
    for (const h of groupHeadings) {
      if (h.getBoundingClientRect().top <= cutoff) found = h.getAttribute("data-cat");
      else break;
    }
    if (found === currentGroup) return;
    currentGroup = found;
    $$("#category-filters .chip").forEach((chip) => {
      const on = found !== null && chip.getAttribute("data-cat") === found;
      chip.classList.toggle("is-current", on);
      if (on) chip.setAttribute("aria-current", "true");
      else chip.removeAttribute("aria-current");
    });
  }

  function onScroll() {
    if (ticking) return;
    ticking = true;
    requestAnimationFrame(() => {
      ticking = false;
      syncSpy();
      const btn = $("#to-top");
      if (btn) btn.hidden = window.scrollY < 600;
    });
  }

  function apply() {
    syncCategoryChips();
    renderActiveFilters();
    renderGrid();
    writeUrl();
  }

  function renderStarters() {
    const tbody = $("#starter-table tbody");
    const featured = Array.isArray(data.featured) ? data.featured : [];
    tbody.innerHTML = featured
      .map((entry) => {
        if (!entry || !byId[entry.id]) return "";
        return `<tr>
  <td class="need">${escapeHtml(entry.need || "")}</td>
  <td><a href="entry/${escapeHtml(entry.id)}/">${escapeHtml(entry.name)}</a></td>
  <td class="license">${escapeHtml(entry.license)} &middot; ${escapeHtml(commercialLabel(entry.commercial))}</td>
</tr>`;
      })
      .join("");
  }

  function renderGuides() {
    $("#guide-list").innerHTML = (data.guides || [])
      .map(
        (g) =>
          `<li><a href="${escapeHtml(`${repo}/blob/main/${g.path}`)}" rel="noopener noreferrer">${escapeHtml(g.title)}<span>${escapeHtml(g.path)}</span></a></li>`
      )
      .join("");
  }

  /* ------------------------------------------------------ scroll memory */

  // Back from an entry page should land where you were, even when the
  // browser reloads this page instead of restoring it from its cache.
  const scrollKey = () => `fgda:scroll:${location.pathname}${location.search}`;

  function rememberScroll() {
    try {
      sessionStorage.setItem(scrollKey(), String(Math.round(window.scrollY)));
    } catch {
      // Storage can be unavailable; scrolling back is a convenience.
    }
  }

  function restoreScroll() {
    let y = null;
    try {
      y = sessionStorage.getItem(scrollKey());
      sessionStorage.removeItem(scrollKey());
    } catch {
      return;
    }
    // Only Back and Forward return to a position. A link to the homepage
    // (the brand, the breadcrumb) is a new visit and starts where it asks.
    const nav = performance.getEntriesByType("navigation")[0];
    if (y !== null && nav && nav.type === "back_forward") {
      requestAnimationFrame(() => window.scrollTo(0, Number(y)));
    }
  }

  // Restored from the back/forward cache: the page kept its own position,
  // so drop the saved one before a later visit can reuse it.
  window.addEventListener("pageshow", (e) => {
    if (!e.persisted) return;
    try {
      sessionStorage.removeItem(scrollKey());
    } catch {
      // Nothing to clear.
    }
  });

  /* ----------------------------------------------------------- controls */

  function bindControls() {
    const search = $("#search");
    search.value = state.q;
    search.addEventListener("input", (e) => {
      state.q = e.target.value;
      apply();
    });

    const toggles = [
      ["#filter-active", "active"],
      ["#filter-review", "review"],
      ["#filter-deprecated", "deprecated"],
      ["#filter-commercial", "commercialOnly"],
      ["#filter-no-attr", "noAttr"],
    ];
    for (const [sel, field] of toggles) {
      const el = $(sel);
      el.checked = state[field];
      el.addEventListener("change", (e) => {
        state[field] = e.target.checked;
        apply();
      });
    }

    const view = $("#perspective");
    view.value = state.perspective;
    view.addEventListener("change", (e) => {
      state.perspective = e.target.value;
      apply();
    });

    const sort = $("#sort");
    sort.value = state.sort;
    sort.addEventListener("change", (e) => {
      state.sort = e.target.value;
      apply();
    });

    // The whole card is the title link (a stretched ::after), so every click
    // that leaves for an entry page lands here.
    $("#entry-grid").addEventListener("click", (e) => {
      // A modified click opens a new tab and this page stays where it is.
      if (e.metaKey || e.ctrlKey || e.shiftKey || e.altKey) return;
      if (e.target.closest("a.entry-link")) rememberScroll();
    });
    // Starter rows link to entry pages too.
    $("#starter-table").addEventListener("click", (e) => {
      if (e.metaKey || e.ctrlKey || e.shiftKey || e.altKey) return;
      if (e.target.closest("a")) rememberScroll();
    });

    $("#active-filters").addEventListener("click", (e) => {
      const btn = e.target.closest("[data-clear]");
      if (!btn) return;
      const key = btn.getAttribute("data-clear");
      if (key === "all") Object.assign(state, DEFAULTS);
      else state[key] = DEFAULTS[key];
      syncControls();
      apply();
    });

    $("#empty-reset").addEventListener("click", () => {
      Object.assign(state, DEFAULTS);
      syncControls();
      apply();
    });

    const top = $("#to-top");
    // Returns to the catalog's search and filters, which on small screens have
    // scrolled away. It used to scroll to the page top and then focus search
    // further down, leaving keyboard users typing into a field off screen.
    top.addEventListener("click", () => {
      const reduce = matchMedia("(prefers-reduced-motion: reduce)").matches;
      $("#catalog").scrollIntoView({ block: "start", behavior: reduce ? "auto" : "smooth" });
      search.focus({ preventScroll: true });
    });

    window.addEventListener("scroll", onScroll, { passive: true });
    window.addEventListener("resize", onScroll, { passive: true });

    // "/" focuses search, Escape leaves it. Suppressed whenever the user is
    // already typing somewhere.
    document.addEventListener("keydown", (e) => {
      const el = document.activeElement;
      const typing =
        el &&
        (el.tagName === "INPUT" ||
          el.tagName === "TEXTAREA" ||
          el.tagName === "SELECT" ||
          el.isContentEditable);
      if (e.key === "/" && !typing) {
        e.preventDefault();
        search.focus();
        search.select();
        return;
      }
      if (e.key === "Escape" && el === search && search.value) {
        search.value = "";
        state.q = "";
        apply();
      }
    });

    $("#repo-link").href = repo;
    $("#footer-repo").href = repo;
  }

  function syncControls() {
    $("#search").value = state.q;
    $("#filter-active").checked = state.active;
    $("#filter-review").checked = state.review;
    $("#filter-deprecated").checked = state.deprecated;
    $("#filter-commercial").checked = state.commercialOnly;
    $("#filter-no-attr").checked = state.noAttr;
    $("#sort").value = state.sort;
    $("#perspective").value = state.perspective;
  }

  /* --------------------------------------------------------------- init */

  readUrl();
  renderCategoryFilters();
  renderStarters();
  renderGuides();
  bindControls();
  syncControls();
  apply();
  restoreScroll();

})();
