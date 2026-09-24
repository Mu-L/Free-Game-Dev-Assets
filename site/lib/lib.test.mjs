#!/usr/bin/env node
/**
 * Tests for the site's build modules. Run: node site/lib/lib.test.mjs
 * Each task appends a section; the report block stays last.
 */
import {
  commercialLabel,
  entryPageUrl,
  esc,
  STATUS_NOTES,
  verifiedAge,
} from "./shared.mjs";

let passed = 0;
const failures = [];

function eq(label, actual, expected) {
  if (actual === expected) passed += 1;
  else failures.push(`${label}: expected ${JSON.stringify(expected)}, got ${JSON.stringify(actual)}`);
}
function has(label, text, needle) {
  if (String(text).includes(needle)) passed += 1;
  else failures.push(`${label}: expected to contain ${JSON.stringify(needle)}`);
}
function lacks(label, text, needle) {
  if (!String(text).includes(needle)) passed += 1;
  else failures.push(`${label}: expected not to contain ${JSON.stringify(needle)}`);
}
function throws(label, fn, needle) {
  try {
    fn();
    failures.push(`${label}: expected an error`);
  } catch (err) {
    if (!needle || String(err.message).includes(needle)) passed += 1;
    else failures.push(`${label}: error did not mention ${JSON.stringify(needle)}; got ${err.message}`);
  }
}

/* shared ----------------------------------------------------------------- */
eq("esc escapes all five characters", esc(`<a href="x">'&'</a>`), "&lt;a href=&quot;x&quot;&gt;&#39;&amp;&#39;&lt;/a&gt;");
eq("commercialLabel true", commercialLabel(true), "commercial OK");
eq("commercialLabel varies", commercialLabel("varies"), "per-file review");
eq("commercialLabel unknown", commercialLabel("unknown"), "commercial ?");
eq("verifiedAge fresh", verifiedAge("2026-09-01", Date.parse("2026-09-24T00:00:00Z")).bucket, "fresh");
eq("verifiedAge missing", verifiedAge(null, Date.now()).bucket, "unknown");
eq("entryPageUrl trims the site slash", entryPageUrl({ siteUrl: "https://x.test/site/" }, "a-b"), "https://x.test/site/entry/a-b/");
has("STATUS_NOTES covers needs-review", STATUS_NOTES["needs-review"], "open");

/* markdown: inline --------------------------------------------------------- */
import { renderInline } from "./markdown.mjs";
const passLink = (href) => ({ href, external: /^https?:/.test(href) });
eq("plain text is escaped", renderInline(`a < b & "c"`, passLink), "a &lt; b &amp; &quot;c&quot;");
eq("bold", renderInline("a **b** c", passLink), "a <strong>b</strong> c");
eq("italic", renderInline("a *b* c", passLink), "a <em>b</em> c");
eq("underscores stay literal", renderInline("Rig_Medium and qCC_db", passLink), "Rig_Medium and qCC_db");
eq("code is literal", renderInline("use `**x** <y>`", passLink), "use <code>**x** &lt;y&gt;</code>");
eq("external link", renderInline("[Site](https://a.test/x)", passLink), '<a href="https://a.test/x" rel="noopener noreferrer">Site</a>');
eq("relative link uses the resolver", renderInline("[k](k.md)", () => ({ href: "../k/", external: false })), '<a href="../k/">k</a>');
eq("code inside link text", renderInline("[`docs/provenance.md`](../../docs/provenance.md)", () => ({ href: "https://gh.test/p", external: true })), '<a href="https://gh.test/p" rel="noopener noreferrer"><code>docs/provenance.md</code></a>');
eq("bold inside link text", renderInline("[**x**](https://a.test)", passLink), '<a href="https://a.test" rel="noopener noreferrer"><strong>x</strong></a>');
eq("bare url keeps trailing period outside", renderInline("see https://a.test/x.", passLink), 'see <a href="https://a.test/x" rel="noopener noreferrer">https://a.test/x</a>.');
eq("bare url in parentheses", renderInline("(https://a.test/x)", passLink), '(<a href="https://a.test/x" rel="noopener noreferrer">https://a.test/x</a>)');
eq("backslash escape", renderInline("\\*not italic\\*", passLink), "*not italic*");
eq("html in text is escaped", renderInline("<script>alert(1)</script>", passLink), "&lt;script&gt;alert(1)&lt;/script&gt;");
eq("non-ASCII survives", renderInline("Johannes Sjölund", passLink), "Johannes Sjölund");

/* markdown: blocks --------------------------------------------------------- */
import { deprecationReason, renderBlocks, sectionMarkdown, splitEntryBody } from "./markdown.mjs";
const rb = (md) => renderBlocks(md, { file: "t.md", resolveLink: passLink });
eq("paragraph joins lines", rb("a\nb"), "<p>a b</p>");
eq("h1 is dropped", rb("# Title\n\nText"), "<p>Text</p>");
eq("h2 gets an id", rb("## Notes"), '<h2 id="notes">Notes</h2>');
eq("flat list", rb("- a\n- b"), "<ul><li>a</li><li>b</li></ul>");
eq("nested list", rb("- a\n  - b\n- c"), "<ul><li>a<ul><li>b</li></ul></li><li>c</li></ul>");
eq("list item continuation", rb("- a\n  more"), "<ul><li>a more</li></ul>");
eq("list then paragraph", rb("- a\n\nText"), "<ul><li>a</li></ul>\n<p>Text</p>");
eq("italic at line start is not a list", rb("*Measured:* 5"), "<p><em>Measured:</em> 5</p>");
throws("table rejected", () => rb("| a | b |"), "t.md:1: a table row");
throws("fence rejected", () => rb("x\n```"), "t.md:2: a code fence");
throws("blockquote rejected", () => rb("> q"), "a blockquote");
throws("image rejected", () => rb("![i](x.png)"), "an image");
throws("raw html rejected", () => rb("<div>x</div>"), "raw HTML");
throws("h3 rejected", () => rb("### Sub"), "a heading below level 2");
throws("ordered list rejected", () => rb("1. one"), "an ordered list");
throws("firstLine offsets line numbers", () => renderBlocks("ok\n> q", { file: "t.md", resolveLink: passLink, firstLine: 10 }), "t.md:11:");
const body = "# T\n\nLead one.\n\nLead two.\n\n## Notes\n\n- n1\n- Deprecated: gone\n\n## Evidence\n\n- e1";
eq("split lead", splitEntryBody(body).lead, "# T\n\nLead one.\n\nLead two.\n");
eq("split rest starts at first h2", splitEntryBody(body).rest.split("\n")[0], "## Notes");
eq("split restFirstLine", splitEntryBody(body).restFirstLine, 7);
eq("sectionMarkdown Notes", sectionMarkdown(body, "Notes"), "- n1\n- Deprecated: gone");
eq("sectionMarkdown missing", sectionMarkdown(body, "Nope"), null);
eq("deprecationReason", deprecationReason(body), "gone");

/* links -------------------------------------------------------------------- */
import { makeLinkResolver } from "./links.mjs";
const idByPath = new Map([["catalog/2d/kenney-ui-pack.md", "kenney-ui-pack"], ["catalog/audio/kenney-ui-audio.md", "kenney-ui-audio"]]);
const files = new Map([["docs/provenance.md", "file"], ["catalog/2d/README.md", "file"], ["catalog/video", "dir"]]);
const resolve = makeLinkResolver({ entryPath: "catalog/2d/kenney-ui-pack.md", idByPath, repo: "https://github.com/o/r", kindOf: (p) => files.get(p) || null });
eq("sibling entry", resolve("kenney-ui-pack.md").href, "../kenney-ui-pack/");
eq("entry in another category", resolve("../audio/kenney-ui-audio.md").href, "../kenney-ui-audio/");
eq("entry link is internal", resolve("../audio/kenney-ui-audio.md").external, false);
eq("docs go to GitHub blob", resolve("../../docs/provenance.md").href, "https://github.com/o/r/blob/main/docs/provenance.md");
eq("category README goes to GitHub", resolve("README.md").href, "https://github.com/o/r/blob/main/catalog/2d/README.md");
eq("directory goes to GitHub tree", resolve("../video/").href, "https://github.com/o/r/tree/main/catalog/video");
eq("hash is kept", resolve("../../docs/provenance.md#fonts").href, "https://github.com/o/r/blob/main/docs/provenance.md#fonts");
eq("external untouched", resolve("https://a.test/x").href, "https://a.test/x");
eq("external flagged", resolve("https://a.test/x").external, true);
throws("missing target fails", () => resolve("nope.md"), 'link target "nope.md" does not exist');
throws("escaping the repo fails", () => resolve("../../../outside.md"), "does not exist");

/* entry page --------------------------------------------------------------- */
import { entryPageHtml, jsonLd, scriptJson } from "./entry-page.mjs";
const site = { siteUrl: "https://x.test/s/", title: "Free Game Dev Assets", tagline: "T", repo: "https://github.com/o/r" };
const base = { id: "e1", name: 'A "quoted" <Name>', url: "https://src.test/", category: "2d", license: "CC-BY-4.0", license_spdx: "CC-BY-4.0", commercial: true, attribution_required: true, attribution_string: 'Art by "X" </script>', formats: ["PNG"], verified: "2026-09-01", status: "active", path: "catalog/2d/e1.md", summary: "Sum </script> <b>" };
const page = (over = {}) => entryPageHtml({ entry: { ...base, ...over }, leadHtml: "<p>Lead</p>", restHtml: '<h2 id="notes">Notes</h2>', deprecatedReasonHtml: null, prev: null, next: { id: "e2", name: "Next one" }, site, categoryLabel: "2D", stamp: "2026-09-24", total: 319, hasCard: true, now: Date.parse("2026-09-24T00:00:00Z") });
const p = page();
has("title is escaped", p, "<title>A &quot;quoted&quot; &lt;Name&gt; (CC-BY-4.0) | Free Game Dev Assets</title>");
has("canonical", p, '<link rel="canonical" href="https://x.test/s/entry/e1/" />');
eq("one h1", (p.match(/<h1[\s>]/g) || []).length, 1);
has("credit line escaped", p, "Art by &quot;X&quot; &lt;/script&gt;");
has("copy script with a credit line", p, '<script src="../../entry.js" defer></script>');
lacks("no copy script without one", page({ attribution_string: undefined }), "entry.js");
has("note when credit is required but not canned", page({ attribution_string: undefined }), "no canned credit line");
has("breadcrumb category link", p, "../../?cat=2d#catalog");
has("next link", p, 'href="../e2/" rel="next"');
has("report link prefills the entry", p, "template=correction.yml");
lacks("active is indexable", p, 'content="noindex"');
has("deprecated is noindex", page({ status: "deprecated" }), '<meta name="robots" content="noindex" />');
has("deprecated banner", page({ status: "deprecated" }), 'class="deprecated-banner"');
const ldBlock = p.match(/<script type="application\/ld\+json">([\s\S]*?)<\/script>/)[1];
lacks("json-ld cannot close its script", ldBlock, "</script");
eq("json-ld parses with a licence URL", JSON.parse(ldBlock).mainEntity.license, "https://spdx.org/licenses/CC-BY-4.0.html");
eq("json-ld omits licence without spdx", jsonLd({ ...base, license: "custom", license_spdx: undefined }, site).mainEntity.license, undefined);
eq("scriptJson escapes <", scriptJson({ a: "</script>" }), '{"a":"\\u003c/script>"}');

/* report (keep last) ------------------------------------------------------ */
if (failures.length) {
  console.error(`lib.test failed (${failures.length}):`);
  for (const f of failures) console.error(`  - ${f}`);
  process.exit(1);
}
console.log(`lib.test ok: ${passed} assertions`);
