/**
 * Licence freshness: how recently each licence was read at its source.
 * Buckets come from verifiedAge, the function the homepage cards use, so the
 * summary and the cards cannot disagree. Pure: `now` is passed in.
 */
import { esc, verifiedAge } from "./shared.mjs";

const RECENT_DAYS = 30;
const byName = (a, b) => a.entry.name.localeCompare(b.entry.name);
const dayWord = (n) => `${n} ${n === 1 ? "day" : "days"}`;

export function freshnessStats(entries, now) {
  const rows = entries
    .filter((e) => e.status !== "deprecated")
    .map((entry) => ({ entry, ...verifiedAge(entry.verified, now) }));
  const count = (bucket) => rows.filter((r) => r.bucket === bucket).length;
  const dated = rows.filter((r) => r.days !== null).sort((a, b) => b.days - a.days || byName(a, b));
  const undated = rows.filter((r) => r.days === null).sort(byName);
  const recent = dated
    .filter((r) => r.days <= RECENT_DAYS)
    .sort((a, b) => a.days - b.days || byName(a, b))
    .map((r) => ({ entry: r.entry, days: r.days }));
  return {
    total: rows.length,
    fresh: count("fresh"),
    aging: count("aging"),
    stale: count("stale"),
    unknown: count("unknown"),
    oldest: dated.length ? { entry: dated[0].entry, days: dated[0].days } : null,
    recent,
    rows: [...dated, ...undated],
  };
}

/** The one-line summary, for the homepage and the top of /freshness/. */
export function freshnessLineHtml(stats, stamp, href) {
  const parts = [
    "Every licence here was read at its source.",
    `<strong>Checked within 180 days: ${stats.fresh} of ${stats.total}.</strong>`,
  ];
  if (stats.aging) parts.push(`Aging (181 to 365 days): ${stats.aging}.`);
  parts.push(`Older than a year: ${stats.stale}.`);
  if (stats.unknown) parts.push(`No check date: ${stats.unknown}.`);
  if (stats.oldest) parts.push(`Oldest check: ${esc(stats.oldest.entry.verified)} (${dayWord(stats.oldest.days)}).`);
  parts.push(`As of ${esc(stamp)}.`);
  parts.push(`<a href="${esc(href)}">See every check, oldest first</a>.`);
  return parts.join(" ");
}
