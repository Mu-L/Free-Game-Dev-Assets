/** Rewrites links in an entry body for the entry's own page. */
import path from "node:path";

export class LinkError extends Error {}

export function makeLinkResolver({ entryPath, idByPath, repo, kindOf, entryBase = "../" }) {
  const dir = path.posix.dirname(entryPath);
  return (raw) => {
    if (/^(https?:|mailto:)/i.test(raw)) return { href: raw, external: true };
    if (raw.startsWith("#")) return { href: raw, external: false };
    // Split off ?query and #hash; both are kept on the rewritten link.
    const m = raw.match(/^([^?#]*)(\?[^#]*)?(#.*)?$/);
    const target = m[1];
    const hash = `${m[2] || ""}${m[3] || ""}`;
    let decoded;
    try {
      decoded = decodeURI(target);
    } catch {
      throw new LinkError(`${entryPath}: link target "${raw}" is malformed`);
    }
    const repoPath = path.posix.normalize(path.posix.join(dir, decoded)).replace(/\/$/, "");
    const id = idByPath.get(repoPath);
    if (id) return { href: `${entryBase}${id}/${hash}`, external: false };
    const kind = repoPath.startsWith("..") ? null : kindOf(repoPath);
    if (!kind) throw new LinkError(`${entryPath}: link target "${raw}" does not exist`);
    const mode = kind === "dir" ? "tree" : "blob";
    return { href: `${repo}/${mode}/main/${encodeURI(repoPath)}${hash}`, external: true };
  };
}
