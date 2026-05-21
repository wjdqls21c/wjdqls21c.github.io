(function initSpaceBackground() {
  const shootingLayer = document.getElementById("space-shooting");
  if (!shootingLayer) return;

  const reducedMotion = window.matchMedia(
    "(prefers-reduced-motion: reduce)"
  ).matches;

  let width = window.innerWidth;
  let height = window.innerHeight;
  let lastShoot = 0;

  function onResize() {
    width = window.innerWidth;
    height = window.innerHeight;
  }

  function spawnShootingStar() {
    const meteor = document.createElement("span");
    meteor.className = "meteor";

    const startX = width * (0.1 + Math.random() * 0.75);
    const startY = height * (0.05 + Math.random() * 0.35);
    const angle = -32 - Math.random() * 18;
    const length = 140 + Math.random() * 160;
    const duration = 0.85 + Math.random() * 0.55;

    meteor.style.left = `${startX}px`;
    meteor.style.top = `${startY}px`;
    meteor.style.setProperty("--meteor-angle", `${angle}deg`);
    meteor.style.setProperty("--meteor-length", `${length}px`);
    meteor.style.animationDuration = `${duration}s`;

    shootingLayer.appendChild(meteor);
    meteor.addEventListener("animationend", () => meteor.remove(), { once: true });
  }

  function loop(now) {
    if (!reducedMotion && now - lastShoot > 4000 + Math.random() * 6000) {
      spawnShootingStar();
      lastShoot = now;
    }
    requestAnimationFrame(loop);
  }

  window.addEventListener("resize", onResize);
  lastShoot = performance.now();
  requestAnimationFrame(loop);

  if (!reducedMotion) {
    setTimeout(spawnShootingStar, 2200);
  }
})();
