/** Rewrites links in an entry body for the entry's own page. */
import path from "node:path";

export class LinkError extends Error {}

export function makeLinkResolver({ entryPath, idByPath, repo, kindOf, entryBase = "../" }) {
  const dir = path.posix.dirname(entryPath);
  return (raw) => {
    if (/^(https?:|mailto:)/i.test(raw)) return { href: raw, external: true };
    if (raw.startsWith("#")) return { href: raw, external: false };
    const at = raw.indexOf("#");
    const target = at === -1 ? raw : raw.slice(0, at);
    const hash = at === -1 ? "" : raw.slice(at);
    const repoPath = path.posix.normalize(path.posix.join(dir, decodeURI(target))).replace(/\/$/, "");
    const id = idByPath.get(repoPath);
    if (id) return { href: `${entryBase}${id}/${hash}`, external: false };
    const kind = repoPath.startsWith("..") ? null : kindOf(repoPath);
    if (!kind) throw new LinkError(`${entryPath}: link target "${raw}" does not exist`);
    const mode = kind === "dir" ? "tree" : "blob";
    return { href: `${repo}/${mode}/main/${encodeURI(repoPath)}${hash}`, external: true };
  };
}
