(function initSpaceBackground() {
  const canvas = document.getElementById("space-canvas");
  const shootingLayer = document.getElementById("space-shooting");
  if (!canvas || !shootingLayer) return;

  const ctx = canvas.getContext("2d");
  const reducedMotion = window.matchMedia(
    "(prefers-reduced-motion: reduce)"
  ).matches;

  let stars = [];
  let width = 0;
  let height = 0;
  let dpr = 1;
  let animationId = 0;
  let lastShoot = 0;

  function resize() {
    dpr = Math.min(window.devicePixelRatio || 1, 2);
    width = window.innerWidth;
    height = window.innerHeight;
    canvas.width = Math.floor(width * dpr);
    canvas.height = Math.floor(height * dpr);
    canvas.style.width = `${width}px`;
    canvas.style.height = `${height}px`;
    ctx.setTransform(dpr, 0, 0, dpr, 0, 0);
    buildStars();
  }

  function buildStars() {
    const area = width * height;
    const count = Math.min(
      320,
      Math.max(80, Math.floor(area / (reducedMotion ? 9000 : 5500)))
    );
    stars = Array.from({ length: count }, () => ({
      x: Math.random() * width,
      y: Math.random() * height,
      r: Math.random() * 1.4 + 0.3,
      base: Math.random() * 0.55 + 0.25,
      twinkle: Math.random() * Math.PI * 2,
      speed: Math.random() * 0.015 + 0.004,
    }));
  }

  function drawStars(time) {
    ctx.clearRect(0, 0, width, height);

    for (const star of stars) {
      const flicker = reducedMotion
        ? star.base
        : star.base +
          Math.sin(time * star.speed + star.twinkle) * 0.22;
      ctx.beginPath();
      ctx.fillStyle = `rgba(255, 255, 255, ${flicker})`;
      ctx.arc(star.x, star.y, star.r, 0, Math.PI * 2);
      ctx.fill();
    }
  }

  function loop(time) {
    drawStars(time * 0.001);

    if (!reducedMotion && time - lastShoot > 2800 + Math.random() * 4500) {
      spawnShootingStar();
      lastShoot = time;
    }

    animationId = requestAnimationFrame(loop);
  }

  function spawnShootingStar() {
    const star = document.createElement("span");
    star.className = "shooting-star";

    const startX = Math.random() * width * 0.85;
    const startY = Math.random() * height * 0.45;
    const angle = -25 - Math.random() * 25;
    const length = 90 + Math.random() * 110;
    const duration = 0.65 + Math.random() * 0.45;

    star.style.left = `${startX}px`;
    star.style.top = `${startY}px`;
    star.style.setProperty("--shoot-angle", `${angle}deg`);
    star.style.setProperty("--shoot-length", `${length}px`);
    star.style.animationDuration = `${duration}s`;

    shootingLayer.appendChild(star);
    star.addEventListener("animationend", () => star.remove(), { once: true });
  }

  resize();
  window.addEventListener("resize", resize);
  lastShoot = performance.now();
  animationId = requestAnimationFrame(loop);

  if (!reducedMotion) {
    setTimeout(() => spawnShootingStar(), 1200);
  }
})();
