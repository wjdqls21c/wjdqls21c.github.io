(function initSpaceBackground() {
  const canvas = document.getElementById("space-canvas");
  const shootingLayer = document.getElementById("space-shooting");
  if (!canvas || !shootingLayer) return;

  const ctx = canvas.getContext("2d");
  const reducedMotion = window.matchMedia(
    "(prefers-reduced-motion: reduce)"
  ).matches;

  /** 별자리: 로컬 좌표(-1~1), 링크 인덱스, 밝기(크기) */
  const CONSTELLATIONS = [
    {
      id: "orion",
      label: "오리온",
      anchor: { x: 0.52, y: 0.4 },
      scale: 0.13,
      stars: [
        [-0.42, -0.52, 1.0],
        [0.38, -0.5, 0.85],
        [-0.2, 0.06, 0.75],
        [0, 0.1, 0.95],
        [0.22, 0.06, 0.8],
        [-0.34, 0.54, 0.7],
        [0.4, 0.56, 1.0],
      ],
      links: [
        [0, 2],
        [1, 4],
        [2, 3],
        [3, 4],
        [2, 5],
        [4, 6],
        [0, 5],
        [1, 6],
      ],
    },
    {
      id: "ursa-major",
      label: "북두칠성",
      anchor: { x: 0.2, y: 0.26 },
      scale: 0.11,
      stars: [
        [-0.38, 0.12, 0.9],
        [-0.18, 0.18, 0.85],
        [0.02, 0.2, 0.8],
        [0.22, 0.14, 0.85],
        [0.2, -0.02, 0.75],
        [0, -0.22, 0.8],
        [-0.22, -0.28, 0.9],
      ],
      links: [
        [0, 1],
        [1, 2],
        [2, 3],
        [3, 4],
        [4, 5],
        [5, 6],
        [0, 6],
      ],
    },
    {
      id: "cassiopeia",
      label: "카시오페이아",
      anchor: { x: 0.78, y: 0.2 },
      scale: 0.09,
      stars: [
        [-0.42, 0.08, 0.85],
        [-0.14, -0.2, 0.8],
        [0.08, 0.1, 0.9],
        [0.28, -0.14, 0.75],
        [0.46, 0.06, 0.85],
      ],
      links: [
        [0, 1],
        [1, 2],
        [2, 3],
        [3, 4],
      ],
    },
    {
      id: "cygnus",
      label: "백조자리",
      anchor: { x: 0.38, y: 0.58 },
      scale: 0.1,
      stars: [
        [0, -0.52, 0.95],
        [0, 0, 1.0],
        [0, 0.5, 0.85],
        [-0.38, 0.02, 0.8],
        [0.36, 0.02, 0.75],
      ],
      links: [
        [0, 1],
        [1, 2],
        [3, 1],
        [1, 4],
      ],
    },
    {
      id: "scorpius",
      label: "전갈자리",
      anchor: { x: 0.68, y: 0.72 },
      scale: 0.09,
      stars: [
        [-0.35, -0.35, 0.9],
        [-0.1, -0.2, 0.75],
        [0.1, 0, 0.85],
        [0.28, 0.2, 0.8],
        [0.42, 0.38, 1.0],
        [0.3, 0.55, 0.7],
      ],
      links: [
        [0, 1],
        [1, 2],
        [2, 3],
        [3, 4],
        [4, 5],
      ],
    },
  ];

  let bgStars = [];
  let milkyStars = [];
  let width = 0;
  let height = 0;
  let dpr = 1;
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

  /** 은하수 띠 안의 y 거리 (0=중심선) */
  function milkyWayDistance(x, y) {
    const cx = width * 0.48;
    const cy = height * 0.52;
    const angle = -0.42;
    const dx = x - cx;
    const dy = y - cy;
    const along = dx * Math.cos(angle) + dy * Math.sin(angle);
    const across = -dx * Math.sin(angle) + dy * Math.cos(angle);
    return { along, across: Math.abs(across) };
  }

  function buildStars() {
    const area = width * height;
    const bgCount = Math.min(
      220,
      Math.max(60, Math.floor(area / (reducedMotion ? 12000 : 7000)))
    );
    const milkyCount = Math.min(
      380,
      Math.max(100, Math.floor(area / (reducedMotion ? 8000 : 4000)))
    );

    bgStars = Array.from({ length: bgCount }, () => {
      let x;
      let y;
      let tries = 0;
      do {
        x = Math.random() * width;
        y = Math.random() * height;
        tries++;
      } while (
        tries < 8 &&
        milkyWayDistance(x, y).across < height * 0.14
      );

      return {
        x,
        y,
        r: Math.random() * 1.1 + 0.25,
        base: Math.random() * 0.45 + 0.15,
        twinkle: Math.random() * Math.PI * 2,
        speed: Math.random() * 0.012 + 0.003,
        tint: Math.random() > 0.7 ? "cool" : "warm",
      };
    });

    milkyStars = [];
    for (let i = 0; i < milkyCount; i++) {
      const { along, across } = {
        along: (Math.random() - 0.5) * width * 1.35,
        across: (Math.random() - 0.5) * height * 0.22,
      };
      const angle = -0.42;
      const cx = width * 0.48;
      const cy = height * 0.52;
      const x =
        cx + along * Math.cos(angle) - across * Math.sin(angle);
      const y =
        cy + along * Math.sin(angle) + across * Math.cos(angle);

      if (x < -20 || x > width + 20 || y < -20 || y > height + 20) continue;

      const density = 1 - Math.abs(across) / (height * 0.11);
      milkyStars.push({
        x,
        y,
        r: Math.random() * 1.6 + 0.2,
        base: (Math.random() * 0.5 + 0.35) * density,
        twinkle: Math.random() * Math.PI * 2,
        speed: Math.random() * 0.018 + 0.005,
        tint: Math.random() > 0.5 ? "milky" : "cool",
      });
    }
  }

  function drawMilkyWay() {
    const cx = width * 0.48;
    const cy = height * 0.52;
    const angle = -0.42;

    ctx.save();
    ctx.translate(cx, cy);
    ctx.rotate(angle);

    const bandW = width * 1.5;
    const bandH = height * 0.38;

    const core = ctx.createLinearGradient(0, -bandH / 2, 0, bandH / 2);
    core.addColorStop(0, "rgba(8, 12, 28, 0)");
    core.addColorStop(0.25, "rgba(120, 130, 200, 0.06)");
    core.addColorStop(0.42, "rgba(230, 220, 255, 0.14)");
    core.addColorStop(0.5, "rgba(255, 245, 255, 0.2)");
    core.addColorStop(0.58, "rgba(210, 190, 240, 0.12)");
    core.addColorStop(0.75, "rgba(100, 110, 180, 0.05)");
    core.addColorStop(1, "rgba(8, 12, 28, 0)");

    ctx.fillStyle = core;
    ctx.fillRect(-bandW / 2, -bandH / 2, bandW, bandH);

    const dust = ctx.createLinearGradient(-bandW / 2, 0, bandW / 2, 0);
    dust.addColorStop(0, "transparent");
    dust.addColorStop(0.2, "rgba(60, 50, 90, 0.04)");
    dust.addColorStop(0.45, "rgba(180, 160, 210, 0.08)");
    dust.addColorStop(0.55, "rgba(140, 120, 180, 0.06)");
    dust.addColorStop(0.8, "rgba(50, 60, 100, 0.03)");
    dust.addColorStop(1, "transparent");
    ctx.globalAlpha = 0.9;
    ctx.fillStyle = dust;
    ctx.fillRect(-bandW / 2, -bandH * 0.35, bandW, bandH * 0.7);
    ctx.globalAlpha = 1;

    ctx.restore();
  }

  function starColor(tint, alpha) {
    if (tint === "milky") return `rgba(240, 238, 255, ${alpha})`;
    if (tint === "cool") return `rgba(200, 220, 255, ${alpha})`;
    if (tint === "warm") return `rgba(255, 230, 200, ${alpha})`;
    return `rgba(255, 255, 255, ${alpha})`;
  }

  function drawStarField(list, time) {
    for (const star of list) {
      const flicker = reducedMotion
        ? star.base
        : star.base + Math.sin(time * star.speed + star.twinkle) * 0.18;
      const a = Math.min(1, flicker);

      ctx.beginPath();
      ctx.fillStyle = starColor(star.tint, a);
      ctx.arc(star.x, star.y, star.r, 0, Math.PI * 2);
      ctx.fill();

      if (star.r > 1.1 && a > 0.55) {
        ctx.beginPath();
        ctx.fillStyle = starColor(star.tint, a * 0.15);
        ctx.arc(star.x, star.y, star.r * 3, 0, Math.PI * 2);
        ctx.fill();
      }
    }
  }

  function constellationWorld(cons) {
    const s = Math.min(width, height) * cons.scale;
    const ox = width * cons.anchor.x;
    const oy = height * cons.anchor.y;
    return cons.stars.map(([lx, ly, mag]) => ({
      x: ox + lx * s,
      y: oy + ly * s,
      mag,
    }));
  }

  function drawConstellations(time) {
    const labelFont = `${Math.max(10, Math.min(width, height) * 0.012)}px "Noto Sans KR", sans-serif`;

    for (const cons of CONSTELLATIONS) {
      const points = constellationWorld(cons);

      ctx.lineCap = "round";
      ctx.lineJoin = "round";

      for (const [a, b] of cons.links) {
        const p1 = points[a];
        const p2 = points[b];
        const pulse = reducedMotion
          ? 0.28
          : 0.22 + Math.sin(time * 0.8 + a) * 0.06;

        ctx.beginPath();
        ctx.moveTo(p1.x, p1.y);
        ctx.lineTo(p2.x, p2.y);
        ctx.strokeStyle = `rgba(140, 170, 255, ${pulse})`;
        ctx.lineWidth = 1.1;
        ctx.stroke();
      }

      for (const p of points) {
        const r = 1.6 + p.mag * 1.8;
        const flicker = reducedMotion
          ? 1
          : 0.85 + Math.sin(time * 1.2 + p.x) * 0.15;

        ctx.beginPath();
        const grad = ctx.createRadialGradient(p.x, p.y, 0, p.x, p.y, r * 2.5);
        grad.addColorStop(0, `rgba(255, 255, 255, ${0.95 * flicker})`);
        grad.addColorStop(0.4, `rgba(200, 220, 255, ${0.5 * flicker})`);
        grad.addColorStop(1, "rgba(200, 220, 255, 0)");
        ctx.fillStyle = grad;
        ctx.arc(p.x, p.y, r * 2.5, 0, Math.PI * 2);
        ctx.fill();

        ctx.beginPath();
        ctx.fillStyle = `rgba(255, 255, 255, ${flicker})`;
        ctx.arc(p.x, p.y, r * 0.45, 0, Math.PI * 2);
        ctx.fill();
      }

      const labelPt = points[Math.floor(points.length / 2)];
      ctx.font = labelFont;
      ctx.fillStyle = "rgba(180, 200, 255, 0.45)";
      ctx.textAlign = "center";
      ctx.fillText(cons.label, labelPt.x, labelPt.y - 18);
    }
  }

  function drawFrame(time) {
    ctx.clearRect(0, 0, width, height);
    drawMilkyWay();
    drawStarField(milkyStars, time);
    drawStarField(bgStars, time);
    drawConstellations(time);
  }

  function loop(now) {
    drawFrame(now * 0.001);

    if (!reducedMotion && now - lastShoot > 3200 + Math.random() * 5000) {
      spawnShootingStar();
      lastShoot = now;
    }

    requestAnimationFrame(loop);
  }

  function spawnShootingStar() {
    const star = document.createElement("span");
    star.className = "shooting-star";

    const startX = width * 0.15 + Math.random() * width * 0.7;
    const startY = height * 0.1 + Math.random() * height * 0.45;
    const angle = -28 - Math.random() * 22;
    const length = 100 + Math.random() * 120;
    const duration = 0.7 + Math.random() * 0.5;

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
  requestAnimationFrame(loop);

  if (!reducedMotion) {
    setTimeout(() => spawnShootingStar(), 1500);
  }
})();
