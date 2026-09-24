/**
 * Renders catalog entry bodies to HTML. Deliberately small: it supports the
 * markdown the catalog uses (measured 2026-09-24) and throws on anything
 * else, so a new construct fails the build instead of rendering wrong.
 * Underscores are literal: bodies contain identifiers like Rig_Medium.
 */
import { esc } from "./shared.mjs";

export class MarkdownError extends Error {}

const slot = (i) => `\u0000${i}\u0000`;
const SLOT_RE = /\u0000(\d+)\u0000/g;

/** Bold and italic on already-escaped text. */
function marks(escaped) {
  return escaped
    .replace(/\*\*(?=\S)(.+?)(?<=\S)\*\*/g, "<strong>$1</strong>")
    .replace(/(^|[^*\w])\*(?=\S)([^*]+?)(?<=\S)\*(?![*\w])/g, "$1<em>$2</em>");
}

export function renderInline(text, resolveLink) {
  const slots = [];
  const keep = (html) => {
    slots.push(html);
    return slot(slots.length - 1);
  };
  let s = String(text);
  // Code spans first: their contents are literal.
  s = s.replace(/`([^`]+)`/g, (_, code) => keep(`<code>${esc(code)}</code>`));
  // Backslash escapes.
  s = s.replace(/\\([\\`*_[\]()#+\-.!|<>])/g, (_, ch) => keep(esc(ch)));
  // Links. The label keeps bold, italic and code; the href goes through the resolver.
  s = s.replace(/\[([^\]]+)\]\(([^)\s]+)\)/g, (_, label, href) => {
    const { href: out, external } = resolveLink(href);
    const rel = external ? ' rel="noopener noreferrer"' : "";
    return keep(`<a href="${esc(out)}"${rel}>${marks(esc(label))}</a>`);
  });
  // Bare URLs, leaving trailing sentence punctuation outside the link.
  s = s.replace(/https?:\/\/[^\s<>"]+/g, (url) => {
    const [, core, tail] = url.match(/^(.*?)([.,;:!?)\]]*)$/);
    return keep(`<a href="${esc(core)}" rel="noopener noreferrer">${esc(core)}</a>`) + tail;
  });
  s = marks(esc(s));
  // Link labels can hold code slots, so restore until stable.
  let before;
  do {
    before = s;
    s = s.replace(SLOT_RE, (_, i) => slots[Number(i)]);
  } while (s !== before);
  return s;
}

const UNSUPPORTED = [
  [/^\s*\|/, "a table row"],
  [/^\s*```/, "a code fence"],
  [/^\s*>/, "a blockquote"],
  [/^\s*!\[/, "an image"],
  [/^\s*<[A-Za-z!/]/, "raw HTML"],
  [/^#{3,}\s/, "a heading below level 2"],
  [/^\s*\d+[.)]\s/, "an ordered list"],
];

const lines = (md) => String(md).replace(/\r\n?/g, "\n").split("\n");

export function renderBlocks(md, { file, resolveLink, firstLine = 1 }) {
  const html = [];
  const stack = [];
  let para = [];
  let item = null;
  let blank = false;
  const inline = (t) => renderInline(t, resolveLink);
  const flushPara = () => {
    if (para.length) html.push(`<p>${inline(para.join(" "))}</p>`);
    para = [];
  };
  const flushItem = () => {
    if (item !== null) html.push(inline(item));
    item = null;
  };
  const closeLists = () => {
    flushItem();
    while (stack.length) {
      html.push("</li></ul>");
      stack.pop();
    }
  };
  lines(md).forEach((line, i) => {
    for (const [re, what] of UNSUPPORTED) {
      if (re.test(line)) {
        throw new MarkdownError(`${file}:${firstLine + i}: ${what} is not supported by the site renderer`);
      }
    }
    if (!line.trim()) {
      flushPara();
      blank = true;
      return;
    }
    const li = line.match(/^(\s*)[-*]\s+(.*)$/);
    if (li) {
      flushPara();
      const indent = li[1].replace(/\t/g, "    ").length;
      if (!stack.length) {
        html.push("<ul><li>");
        stack.push(indent);
      } else if (indent > stack[stack.length - 1]) {
        flushItem();
        html.push("<ul><li>");
        stack.push(indent);
      } else {
        flushItem();
        while (stack.length > 1 && indent < stack[stack.length - 1]) {
          html.push("</li></ul>");
          stack.pop();
        }
        html.push("</li><li>");
      }
      item = li[2];
      blank = false;
      return;
    }
    if (stack.length && !blank && /^\s/.test(line)) {
      item += ` ${line.trim()}`;
      return;
    }
    closeLists();
    blank = false;
    const h = line.match(/^(#{1,2})\s+(.*)$/);
    if (h) {
      flushPara();
      if (h[1] === "#") return; // the page shows the entry name as its h1
      const id = h[2].toLowerCase().replace(/[^a-z0-9]+/g, "-").replace(/^-|-$/g, "");
      html.push(`<h2 id="${esc(id)}">${inline(h[2])}</h2>`);
      return;
    }
    para.push(line.trim());
  });
  flushPara();
  closeLists();
  // Items and their markup were pushed as separate strings; join tight.
  return html.join("").replace(/<\/p><(h2|p|ul)/g, "</p>\n<$1").replace(/<\/ul><(h2|p)/g, "</ul>\n<$1").replace(/<\/h2><(p|ul)/g, "</h2>\n<$1");
}

/** Lead (before the first `## `) and the rest, with the rest's first line number. */
export function splitEntryBody(body) {
  const ls = lines(body);
  const i = ls.findIndex((l) => /^##\s/.test(l));
  if (i === -1) return { lead: ls.join("\n"), rest: "", restFirstLine: ls.length + 1 };
  return { lead: ls.slice(0, i).join("\n"), rest: ls.slice(i).join("\n"), restFirstLine: i + 1 };
}

/** Raw markdown under `## <heading>`, up to the next `## `, or null. */
export function sectionMarkdown(body, heading) {
  const ls = lines(body);
  const start = ls.findIndex((l) => l.trim() === `## ${heading}`);
  if (start === -1) return null;
  let end = ls.findIndex((l, j) => j > start && /^##\s/.test(l));
  if (end === -1) end = ls.length;
  return ls.slice(start + 1, end).join("\n").trim();
}

/** The text after the `- Deprecated:` marker line, or null. */
export function deprecationReason(body) {
  const m = String(body).match(/^- Deprecated:\s*(.+)$/m);
  return m ? m[1].trim() : null;
}
