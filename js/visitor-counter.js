(function () {
  const el = document.getElementById("finicount_views");
  if (!el) return;

  const MAX_WAIT_MS = 15000;
  const start = Date.now();

  function markReady() {
    const text = el.textContent.trim();
    if (!text || text === "…" || text === "-") return false;
    el.classList.add("is-ready");
    return true;
  }

  const observer = new MutationObserver(() => {
    if (markReady()) observer.disconnect();
  });
  observer.observe(el, { childList: true, characterData: true, subtree: true });

  const timer = window.setInterval(() => {
    if (markReady()) {
      window.clearInterval(timer);
      return;
    }
    if (Date.now() - start > MAX_WAIT_MS) {
      window.clearInterval(timer);
      if (!el.classList.contains("is-ready")) {
        el.textContent = "0";
        el.classList.add("is-ready");
      }
    }
  }, 300);
})();
