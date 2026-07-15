/* ============================================================
   AMBIENT SCENE — a sparse, drifting node-field that continues the
   hero's 3D-network atmosphere through the rest of the page. Kept
   deliberately subtler than the hero's WebGL globe (plain 2D canvas,
   ~45 nodes, low opacity) so it reads as continuity, not repetition.
   Only shown once the hero has scrolled out of view, and paused
   whenever the tab is hidden or the hero is back on screen.
   ============================================================ */
(function () {
  function start() {
    const canvas = document.getElementById('ambientScene');
    const hero = document.getElementById('hero');
    if (!canvas) return;

    const ctx = canvas.getContext('2d');
    const prefersReducedMotion = window.matchMedia('(prefers-reduced-motion: reduce)').matches;

    let W, H, dpr;
    function resize() {
      dpr = Math.min(window.devicePixelRatio || 1, 1.75);
      W = window.innerWidth;
      H = window.innerHeight;
      canvas.width = W * dpr;
      canvas.height = H * dpr;
      canvas.style.width = W + 'px';
      canvas.style.height = H + 'px';
      ctx.setTransform(dpr, 0, 0, dpr, 0, 0);
    }
    resize();
    window.addEventListener('resize', resize);

    const COUNT = 64;
    const LINK_DIST = 175;
    const nodes = [];
    for (let i = 0; i < COUNT; i++) {
      nodes.push({
        x: Math.random() * W,
        y: Math.random() * H,
        vx: (Math.random() - 0.5) * 0.13,
        vy: (Math.random() - 0.5) * 0.13,
        r: 1.2 + Math.random() * 1.9,
        hue: Math.random() < 0.5 ? 'blue' : 'lime',
        phase: Math.random() * Math.PI * 2,
      });
    }

    function colors() {
      const light = document.documentElement.getAttribute('data-theme') === 'light';
      return light
        ? { blue: '61,110,224', lime: '47,143,34', line: '61,110,224' }
        : { blue: '99,164,255', lime: '155,232,60', line: '74,139,240' };
    }

    function renderStaticFrame() {
      const c = colors();
      ctx.clearRect(0, 0, W, H);
      nodes.forEach(n => {
        ctx.beginPath();
        ctx.arc(n.x, n.y, n.r, 0, Math.PI * 2);
        ctx.fillStyle = `rgba(${c[n.hue]}, 0.4)`;
        ctx.fill();
      });
    }

    let visible = false; // becomes true once the hero has scrolled out of view
    let tabHidden = document.hidden;
    let t = 0;
    let raf = null;

    function draw() {
      raf = requestAnimationFrame(draw);
      if (!visible || tabHidden) return;

      t += 0.016;
      const c = colors();
      ctx.clearRect(0, 0, W, H);

      nodes.forEach(n => {
        n.x += n.vx; n.y += n.vy;
        if (n.x < -20) n.x = W + 20; if (n.x > W + 20) n.x = -20;
        if (n.y < -20) n.y = H + 20; if (n.y > H + 20) n.y = -20;
      });

      for (let i = 0; i < nodes.length; i++) {
        for (let j = i + 1; j < nodes.length; j++) {
          const a = nodes[i], b = nodes[j];
          const dx = a.x - b.x, dy = a.y - b.y;
          const dist = Math.sqrt(dx * dx + dy * dy);
          if (dist < LINK_DIST) {
            const alpha = (1 - dist / LINK_DIST) * 0.16;
            ctx.strokeStyle = `rgba(${c.line}, ${alpha.toFixed(3)})`;
            ctx.lineWidth = 1;
            ctx.beginPath();
            ctx.moveTo(a.x, a.y);
            ctx.lineTo(b.x, b.y);
            ctx.stroke();
          }
        }
      }

      nodes.forEach(n => {
        const twinkle = 0.55 + 0.45 * Math.sin(t * 0.6 + n.phase);
        ctx.beginPath();
        ctx.arc(n.x, n.y, n.r, 0, Math.PI * 2);
        ctx.fillStyle = `rgba(${c[n.hue]}, ${(0.62 * twinkle).toFixed(3)})`;
        ctx.fill();
      });
    }

    function setVisible(next) {
      if (visible === next) return;
      visible = next;
      canvas.classList.toggle('ambient-visible', visible);
      if (!visible) return;
      if (prefersReducedMotion) { renderStaticFrame(); return; }
      if (!raf) draw();
    }

    if (hero) {
      const io = new IntersectionObserver((entries) => {
        entries.forEach(entry => setVisible(!entry.isIntersecting));
      }, { threshold: 0 });
      io.observe(hero);
    } else {
      setVisible(true);
    }

    document.addEventListener('visibilitychange', () => { tabHidden = document.hidden; });
    window.addEventListener('themechange', () => { if (visible && prefersReducedMotion) renderStaticFrame(); });
  }

  if (document.readyState === 'loading') {
    document.addEventListener('DOMContentLoaded', start);
  } else {
    start();
  }
})();
