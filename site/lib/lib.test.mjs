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

/* report (keep last) ------------------------------------------------------ */
if (failures.length) {
  console.error(`lib.test failed (${failures.length}):`);
  for (const f of failures) console.error(`  - ${f}`);
  process.exit(1);
}
console.log(`lib.test ok: ${passed} assertions`);
