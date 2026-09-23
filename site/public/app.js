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
  const NOW = Date.now();
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

    const words = normalize(state.q).split(" ").filter(Boolean);
    if (!words.length) return true;
    const hay = normalize(
      [
        entry.name,
        entry.license,
        entry.category,
        entry.summary,
        entry.publisher || "",
        PERSPECTIVE_SEARCH[entry.camera_perspective] || "",
        ...(entry.tags || []),
        ...(entry.formats || []),
        ...(entry.subcategories || []),
      ].join(" ")
    );
    // Every word must appear somewhere, in any order, so "top down" and "arms fps" work.
    return words.every((w) => hay.includes(w));
  }

  // Hyphens and underscores read as spaces: "first person" finds the "first-person" tag.
  function normalize(text) {
    return String(text).toLowerCase().replace(/[-_]+/g, " ").replace(/\s+/g, " ").trim();
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
      <h3><a class="entry-link" href="#entry-${escapeHtml(entry.id)}" data-id="${escapeHtml(entry.id)}">${escapeHtml(entry.name)}</a></h3>
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
    const list = data.entries.filter(matches).sort(SORTS[state.sort] || SORTS.name);
    const grid = $("#entry-grid");
    const empty = $("#empty-state");
    $("#result-count").textContent = `${list.length} / ${data.entries.length}`;

    if (!list.length) {
      grid.innerHTML = "";
      empty.hidden = false;
      groupHeadings = [];
      displayOrder = [];
      return;
    }
    empty.hidden = true;

    if (!shouldGroup()) {
      grid.innerHTML = list.map(cardHtml).join("");
      groupHeadings = [];
      displayOrder = list;
      syncSpy();
      return;
    }

    const out = [];
    displayOrder = [];
    for (const cat of Object.keys(categoryLabels)) {
      const group = list.filter((e) => e.category === cat);
      if (!group.length) continue;
      displayOrder.push(...group);
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
  <td><a href="${escapeHtml(entry.url)}" rel="noopener noreferrer">${escapeHtml(entry.name)}</a></td>
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

  /* ------------------------------------------------------------- dialog */

  let lastTrigger = null;
  let currentEntryId = null;
  /** Entries in the order they are on screen, so prev/next matches the list. */
  let displayOrder = [];

  function stepEntry(delta) {
    const i = displayOrder.findIndex((e) => e.id === currentEntryId);
    if (i === -1) return;
    const next = displayOrder[i + delta];
    if (next) openEntry(next.id, null, delta);
  }

  /** `stepping` is the direction (1 or -1) when paging, otherwise false. */
  function openEntry(id, trigger, stepping = false) {
    const entry = byId[id];
    if (!entry) return;
    if (!stepping) lastTrigger = trigger || null;
    currentEntryId = entry.id;
    const pos = displayOrder.findIndex((e) => e.id === entry.id);
    const prev = pos > 0 ? displayOrder[pos - 1] : null;
    const next = pos !== -1 && pos < displayOrder.length - 1 ? displayOrder[pos + 1] : null;
    // An entry opened from a permalink can be filtered out of the current
    // list; there is no honest "next" for it, so the pager is omitted.
    const pager =
      pos === -1
        ? ""
        : `<nav class="dialog-pager" aria-label="Browse entries">
             <button type="button" class="btn-ghost" data-step="-1"${prev ? ` title="${escapeHtml(prev.name)}"` : " disabled"}><span aria-hidden="true">&larr;</span> Previous</button>
             <span class="dialog-position">${pos + 1} of ${displayOrder.length}</span>
             <button type="button" class="btn-ghost" data-step="1"${next ? ` title="${escapeHtml(next.name)}"` : " disabled"}>Next <span aria-hidden="true">&rarr;</span></button>
           </nav>`;
    const cat = categoryLabels[entry.category]?.label || entry.category;
    const age = verifiedAge(entry.verified);
    const attribution = entry.attribution_string
      ? `<div class="attribution">
           <p class="attribution-label">Credit line</p>
           <p class="attribution-string" id="attribution-string">${escapeHtml(entry.attribution_string)}</p>
           <button type="button" class="btn-ghost" id="copy-attribution" data-copy="${escapeHtml(entry.attribution_string)}">Copy credit line</button>
           <span class="copy-status" id="copy-status" role="status" aria-live="polite"></span>
         </div>`
      : entry.attribution_required === true
        ? `<p class="attribution-note">Attribution is required and no canned credit line is recorded. Read the entry for what the source asks for.</p>`
        : "";

    $("#dialog-body").innerHTML = `
      <h2 id="dialog-title">${escapeHtml(entry.name)}</h2>
      <p class="dialog-flags">${escapeHtml(entry.status)} &middot; ${escapeHtml(commercialLabel(entry.commercial))} &middot; ${escapeHtml(entry.license)}</p>
      <p class="lead">${escapeHtml(entry.summary || "")}</p>
      <dl class="dialog-meta">
        <div><dt>Category</dt><dd>${escapeHtml(cat)}</dd></div>
        ${entry.publisher ? `<div><dt>Publisher</dt><dd>${escapeHtml(entry.publisher)}</dd></div>` : ""}
        ${entry.license_spdx ? `<div><dt>SPDX</dt><dd>${escapeHtml(entry.license_spdx)}</dd></div>` : ""}
        <div><dt>Attribution</dt><dd>${escapeHtml(String(entry.attribution_required))}</dd></div>
        ${entry.camera_perspective ? `<div><dt>Perspective</dt><dd>${escapeHtml(PERSPECTIVE_LABELS[entry.camera_perspective] || entry.camera_perspective)}</dd></div>` : ""}
        ${entry.grid_dimensions ? `<div><dt>Grid</dt><dd>${escapeHtml(entry.grid_dimensions)}</dd></div>` : ""}
        <div><dt>Formats</dt><dd>${escapeHtml((entry.formats || []).join(", ") || "—")}</dd></div>
        <div><dt>Tags</dt><dd>${escapeHtml((entry.tags || []).join(", ") || "—")}</dd></div>
        <div><dt>Verified</dt><dd class="verified is-${age.bucket}">${escapeHtml(age.text)}</dd></div>
      </dl>
      ${attribution}
      <div class="dialog-actions">
        <a class="btn" href="${escapeHtml(entry.url)}" rel="noopener noreferrer">Open source</a>
        <a class="btn-ghost" href="${escapeHtml(`${repo}/blob/main/${entry.path}`)}" rel="noopener noreferrer">Entry and evidence</a>
      </div>
      ${pager}`;

    const copy = $("#copy-attribution");
    if (copy) {
      copy.addEventListener("click", async () => {
        const status = $("#copy-status");
        try {
          await navigator.clipboard.writeText(copy.getAttribute("data-copy"));
          status.textContent = "Copied";
        } catch {
          // Clipboard access can be refused; select the text so it can be
          // copied by hand rather than failing silently.
          const range = document.createRange();
          range.selectNodeContents($("#attribution-string"));
          const sel = getSelection();
          sel.removeAllRanges();
          sel.addRange(range);
          status.textContent = "Select and copy";
        }
      });
    }

    history.replaceState(null, "", `${location.pathname}${location.search}#entry-${entry.id}`);
    const dialog = $("#entry-dialog");
    // showModal() throws on a dialog that is already open, which is exactly
    // the state stepping leaves it in.
    if (!dialog.open) dialog.showModal();
    if (stepping) {
      // Keep focus on the pager so repeated Enter keeps paging; at the end of
      // the list the same-direction button is disabled, so fall back to the
      // other one rather than dropping focus to the document.
      const same = $(`#dialog-body [data-step="${stepping}"]`);
      const other = $(`#dialog-body [data-step="${-stepping}"]`);
      const target = same && !same.disabled ? same : other;
      if (target) target.focus();
    }
  }

  function bindDialog() {
    const dialog = $("#entry-dialog");
    dialog.addEventListener("close", () => {
      history.replaceState(null, "", `${location.pathname}${location.search}`);
      // After paging, return to the entry you ended on, not the one you
      // opened; otherwise closing throws you back up the list.
      const endedOn = currentEntryId && document.querySelector(`#entry-${CSS.escape(currentEntryId)} .entry-link`);
      const target = endedOn || (lastTrigger && document.contains(lastTrigger) ? lastTrigger : null);
      if (target) {
        target.closest(".entry-card")?.scrollIntoView({ block: "nearest" });
        target.focus();
      }
      lastTrigger = null;
      currentEntryId = null;
    });
    dialog.addEventListener("click", (e) => {
      // Clicking the backdrop closes, matching the Escape affordance.
      if (e.target === dialog) {
        dialog.close();
        return;
      }
      const step = e.target.closest("[data-step]");
      if (step && !step.disabled) stepEntry(Number(step.getAttribute("data-step")));
    });
    dialog.addEventListener("keydown", (e) => {
      if (e.key === "ArrowRight") {
        e.preventDefault();
        stepEntry(1);
      } else if (e.key === "ArrowLeft") {
        e.preventDefault();
        stepEntry(-1);
      }
    });
  }

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

    $("#entry-grid").addEventListener("click", (e) => {
      const link = e.target.closest(".entry-link");
      if (!link) return;
      e.preventDefault();
      openEntry(link.getAttribute("data-id"), link);
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
    top.addEventListener("click", () => {
      const reduce = matchMedia("(prefers-reduced-motion: reduce)").matches;
      window.scrollTo({ top: 0, behavior: reduce ? "auto" : "smooth" });
      search.focus();
    });

    window.addEventListener("scroll", onScroll, { passive: true });
    window.addEventListener("resize", onScroll, { passive: true });

    // "/" focuses search, Escape leaves it. Suppressed whenever the user is
    // already typing somewhere or the entry dialog has focus.
    document.addEventListener("keydown", (e) => {
      const el = document.activeElement;
      const typing =
        el &&
        (el.tagName === "INPUT" ||
          el.tagName === "TEXTAREA" ||
          el.tagName === "SELECT" ||
          el.isContentEditable);
      if (e.key === "/" && !typing && !$("#entry-dialog").open) {
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
  bindDialog();
  syncControls();
  apply();

  // A shared link may point at one entry. Open it once the grid exists.
  const hash = location.hash.match(/^#entry-(.+)$/);
  if (hash && byId[hash[1]]) {
    const card = document.getElementById(`entry-${hash[1]}`);
    card?.scrollIntoView({ block: "center" });
    openEntry(hash[1], card?.querySelector(".entry-link") || null);
  }
})();
