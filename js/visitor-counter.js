(function () {
  const MAX_WAIT_MS = 12000;
  const POLL_MS = 200;

  function isLoaded(el) {
    if (!el) return false;
    const text = el.textContent.trim();
    return text.length > 0 && text !== "…" && !/\.{2,}/.test(text);
  }

  function markReady() {
    document.querySelectorAll(".stat-number").forEach((el) => {
      el.classList.add("is-ready");
    });
  }

  const start = Date.now();
  const timer = window.setInterval(() => {
    const uv = document.getElementById("busuanzi_value_site_uv");
    const pv = document.getElementById("busuanzi_value_page_pv");

    if (isLoaded(uv) && isLoaded(pv)) {
      window.clearInterval(timer);
      markReady();
      return;
    }

    if (Date.now() - start > MAX_WAIT_MS) {
      window.clearInterval(timer);
      if (!isLoaded(uv)) uv.textContent = "-";
      if (!isLoaded(pv)) pv.textContent = "-";
    }
  }, POLL_MS);
})();
