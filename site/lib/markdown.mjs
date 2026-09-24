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
