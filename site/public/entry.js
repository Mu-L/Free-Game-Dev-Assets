/** Copy button for an entry page's credit line. The page works without it. */
(() => {
  const btn = document.getElementById("copy-attribution");
  if (!btn) return;
  btn.hidden = false;
  btn.addEventListener("click", async () => {
    const status = document.getElementById("copy-status");
    try {
      await navigator.clipboard.writeText(btn.getAttribute("data-copy"));
      status.textContent = "Copied";
    } catch {
      // Clipboard access can be refused; select the text so it can be
      // copied by hand rather than failing silently.
      const range = document.createRange();
      range.selectNodeContents(document.getElementById("attribution-string"));
      const sel = getSelection();
      sel.removeAllRanges();
      sel.addRange(range);
      status.textContent = "Select and copy";
    }
  });
})();
