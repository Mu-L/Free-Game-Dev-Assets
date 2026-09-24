/** Plain-text indexes of the catalog for AI assistants (llmstxt.org format). */
import { sectionMarkdown } from "./markdown.mjs";
import { commercialLabel, entryPageUrl } from "./shared.mjs";

const creditWord = (e) =>
  e.attribution_required === true ? "credit required" : e.attribution_required === false ? "no credit required" : "credit unclear";

const facts = (e) => `${e.license}; ${commercialLabel(e.commercial)}; ${creditWord(e)}; ${e.status}`;

function header(site) {
  return `# ${site.title}

> ${site.tagline}

A curated catalog of free game assets, libraries and tools. It holds links and licence metadata only; nothing is rehosted. Each licence was read at its source on the entry's verified date, and the entry page quotes it with dates. "needs-review" means a real question is open: read the entry's Notes before shipping. Deprecated entries are not listed.
`;
}

function groups(entries, categories) {
  return Object.entries(categories)
    .map(([cat, meta]) => ({ label: meta.label || cat, items: entries.filter((e) => e.category === cat && e.status !== "deprecated") }))
    .filter((g) => g.items.length);
}

export function llmsTxt({ entries, site, categories }) {
  const out = [header(site)];
  for (const g of groups(entries, categories)) {
    out.push(`\n## ${g.label}\n`);
    for (const e of g.items) out.push(`- [${e.name}](${entryPageUrl(site, e.id)}): ${facts(e)}`);
  }
  return `${out.join("\n")}\n`;
}

export function llmsFullTxt({ entries, site, categories, bodies }) {
  const out = [header(site)];
  for (const g of groups(entries, categories)) {
    out.push(`\n## ${g.label}\n`);
    for (const e of g.items) {
      const notes = sectionMarkdown(bodies.get(e.id) || "", "Notes");
      out.push(
        `### ${e.name}\n\nPage: ${entryPageUrl(site, e.id)}\nSource: ${e.url}\nLicence: ${facts(e)}; verified ${e.verified}\n\n${e.summary || ""}${notes ? `\n\n${notes}` : ""}\n`
      );
    }
  }
  return `${out.join("\n")}\n`;
}
