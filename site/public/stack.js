/** Copy buttons on a stack page. The page works without them. */
(() => {
  for (const btn of document.querySelectorAll("button[data-copy]")) {
    btn.hidden = false;
    btn.addEventListener("click", async () => {
      const status = btn.parentElement.querySelector(".copy-status");
      try {
        await navigator.clipboard.writeText(btn.getAttribute("data-copy"));
        status.textContent = "Copied";
      } catch {
        // Clipboard access can be refused; select the text so it can be
        // copied by hand rather than failing silently.
        const target = document.getElementById(btn.getAttribute("data-target"));
        const range = document.createRange();
        range.selectNodeContents(target);
        const sel = getSelection();
        sel.removeAllRanges();
        sel.addRange(range);
        status.textContent = "Select and copy";
      }
    });
  }
})();
