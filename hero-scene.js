/* ============================================================
   HERO 3D SCENE — interactive network-globe (Three.js)
   A glowing point-cloud sphere with network connections, echoing
   the poster's "holographic globe" motif. Auto-rotates, tilts
   toward the pointer, adapts its palette/blending per theme, and
   pauses off-screen or when the visitor prefers reduced motion.
   ============================================================ */
(function () {
  function start() {
    if (typeof THREE === 'undefined') return;
    const canvas = document.getElementById('heroScene');
    const hero = document.getElementById('hero');
    if (!canvas || !hero) return;

    const prefersReducedMotion = window.matchMedia('(prefers-reduced-motion: reduce)').matches;

    const NODE_COLORS_DARK = [0x63a4ff, 0x9be83c, 0x35d488, 0x3ad6e2];
    const NODE_COLORS_LIGHT = [0x1f5bcf, 0x2f8f4f, 0x0f8f8f, 0x1a6fd0];

    function makeSpriteTexture() {
      const size = 128;
      const c = document.createElement('canvas');
      c.width = c.height = size;
      const ctx = c.getContext('2d');
      const grad = ctx.createRadialGradient(size / 2, size / 2, 0, size / 2, size / 2, size / 2);
      grad.addColorStop(0, 'rgba(255,255,255,1)');
      grad.addColorStop(0.35, 'rgba(255,255,255,0.7)');
      grad.addColorStop(1, 'rgba(255,255,255,0)');
      ctx.fillStyle = grad;
      ctx.fillRect(0, 0, size, size);
      return new THREE.CanvasTexture(c);
    }

    function fibonacciSphere(samples, radius) {
      const pts = [];
      const phi = Math.PI * (3 - Math.sqrt(5));
      for (let i = 0; i < samples; i++) {
        const y = 1 - (i / (samples - 1)) * 2;
        const r = Math.sqrt(Math.max(0, 1 - y * y));
        const theta = phi * i;
        pts.push(new THREE.Vector3(Math.cos(theta) * r * radius, y * radius, Math.sin(theta) * r * radius));
      }
      return pts;
    }

    function buildConnections(points, maxDist, maxPerNode) {
      const edges = [];
      const seen = new Set();
      for (let i = 0; i < points.length; i++) {
        const dists = [];
        for (let j = 0; j < points.length; j++) {
          if (i === j) continue;
          const d = points[i].distanceTo(points[j]);
          if (d <= maxDist) dists.push([d, j]);
        }
        dists.sort((a, b) => a[0] - b[0]);
        for (let k = 0; k < Math.min(maxPerNode, dists.length); k++) {
          const j = dists[k][1];
          const key = i < j ? i + '_' + j : j + '_' + i;
          if (!seen.has(key)) { seen.add(key); edges.push([i, j]); }
        }
      }
      return edges;
    }

    function isLightTheme() {
      return document.documentElement.getAttribute('data-theme') === 'light';
    }

    // ---- scene setup ----
    const scene = new THREE.Scene();
    const camera = new THREE.PerspectiveCamera(42, 1, 0.1, 100);
    camera.position.set(0, 0, 12.5);

    const renderer = new THREE.WebGLRenderer({ canvas, alpha: true, antialias: true, powerPreference: 'high-performance' });
    renderer.setPixelRatio(Math.min(window.devicePixelRatio || 1, 1.75));

    const globeGroup = new THREE.Group();
    scene.add(globeGroup);

    const RADIUS = 4.1;
    const NODE_COUNT = 130;
    const spherePoints = fibonacciSphere(NODE_COUNT, RADIUS);
    const edges = buildConnections(spherePoints, RADIUS * 0.62, 3);

    // node points
    const nodeGeom = new THREE.BufferGeometry().setFromPoints(spherePoints);
    const colorAttr = new THREE.BufferAttribute(new Float32Array(NODE_COUNT * 3), 3);
    nodeGeom.setAttribute('color', colorAttr);

    function paintNodeColors(palette) {
      const tmp = new THREE.Color();
      for (let i = 0; i < NODE_COUNT; i++) {
        tmp.setHex(palette[i % palette.length]);
        colorAttr.setXYZ(i, tmp.r, tmp.g, tmp.b);
      }
      colorAttr.needsUpdate = true;
    }

    const nodeMat = new THREE.PointsMaterial({
      size: 0.145,
      map: makeSpriteTexture(),
      vertexColors: true,
      transparent: true,
      depthWrite: false,
      blending: THREE.AdditiveBlending,
    });
    const nodePoints = new THREE.Points(nodeGeom, nodeMat);
    globeGroup.add(nodePoints);

    // network edges
    const edgePositions = new Float32Array(edges.length * 2 * 3);
    edges.forEach(([a, b], i) => {
      edgePositions.set([spherePoints[a].x, spherePoints[a].y, spherePoints[a].z], i * 6);
      edgePositions.set([spherePoints[b].x, spherePoints[b].y, spherePoints[b].z], i * 6 + 3);
    });
    const edgeGeom = new THREE.BufferGeometry();
    edgeGeom.setAttribute('position', new THREE.BufferAttribute(edgePositions, 3));
    const edgeMat = new THREE.LineBasicMaterial({ color: 0x4a8bf0, transparent: true, opacity: 0.22, blending: THREE.AdditiveBlending });
    const edgeLines = new THREE.LineSegments(edgeGeom, edgeMat);
    globeGroup.add(edgeLines);

    // faint outer wireframe shell for structure
    const shellGeom = new THREE.IcosahedronGeometry(RADIUS * 1.16, 1);
    const shellMat = new THREE.MeshBasicMaterial({ color: 0x3d8bff, wireframe: true, transparent: true, opacity: 0.05 });
    const shell = new THREE.Mesh(shellGeom, shellMat);
    globeGroup.add(shell);

    // ambient background particles (depth parallax layer)
    const BG_COUNT = 260;
    const bgPositions = new Float32Array(BG_COUNT * 3);
    for (let i = 0; i < BG_COUNT; i++) {
      bgPositions[i * 3] = (Math.random() - 0.5) * 34;
      bgPositions[i * 3 + 1] = (Math.random() - 0.5) * 22;
      bgPositions[i * 3 + 2] = (Math.random() - 0.5) * 18 - 6;
    }
    const bgGeom = new THREE.BufferGeometry();
    bgGeom.setAttribute('position', new THREE.BufferAttribute(bgPositions, 3));
    const bgMat = new THREE.PointsMaterial({
      size: 0.05, color: 0xffffff, map: makeSpriteTexture(), transparent: true,
      opacity: 0.5, depthWrite: false, blending: THREE.AdditiveBlending,
    });
    const bgPoints = new THREE.Points(bgGeom, bgMat);
    scene.add(bgPoints);

    // ---- theme-aware palette ----
    let edgeBaseOpacity = 0.2;
    function applyTheme() {
      const light = isLightTheme();
      paintNodeColors(light ? NODE_COLORS_LIGHT : NODE_COLORS_DARK);
      nodeMat.blending = light ? THREE.NormalBlending : THREE.AdditiveBlending;
      nodeMat.opacity = light ? 0.92 : 1;
      nodeMat.needsUpdate = true;

      edgeMat.color.setHex(light ? 0x2f6fe0 : 0x4a8bf0);
      edgeMat.blending = light ? THREE.NormalBlending : THREE.AdditiveBlending;
      edgeBaseOpacity = light ? 0.32 : 0.2;
      edgeMat.needsUpdate = true;

      shellMat.color.setHex(light ? 0x2f6fe0 : 0x3d8bff);
      shellMat.opacity = light ? 0.09 : 0.05;
      shellMat.needsUpdate = true;

      bgMat.color.setHex(light ? 0x2f6fe0 : 0xffffff);
      bgMat.blending = light ? THREE.NormalBlending : THREE.AdditiveBlending;
      bgMat.opacity = light ? 0.28 : 0.5;
      bgMat.needsUpdate = true;
    }
    applyTheme();
    window.addEventListener('themechange', () => {
      applyTheme();
      if (prefersReducedMotion) renderer.render(scene, camera);
    });

    // ---- sizing ----
    function resize() {
      const w = hero.clientWidth || window.innerWidth;
      const h = hero.clientHeight || window.innerHeight;
      camera.aspect = w / h;
      camera.updateProjectionMatrix();
      renderer.setSize(w, h, false);
    }
    resize();
    window.addEventListener('resize', resize);

    // ---- pointer parallax ----
    let targetX = 0, targetY = 0, curX = 0, curY = 0;
    const canParallax = window.matchMedia('(hover: hover) and (pointer: fine)').matches;
    if (canParallax) {
      hero.addEventListener('mousemove', (e) => {
        const r = hero.getBoundingClientRect();
        targetX = ((e.clientX - r.left) / r.width - 0.5) * 2;
        targetY = ((e.clientY - r.top) / r.height - 0.5) * 2;
      });
      hero.addEventListener('mouseleave', () => { targetX = 0; targetY = 0; });
    }

    // ---- visibility gating (pause off-screen) ----
    let visible = true;
    const io = new IntersectionObserver((entries) => {
      entries.forEach((entry) => { visible = entry.isIntersecting; });
    }, { threshold: 0 });
    io.observe(hero);

    // ---- render loop ----
    let raf = null;
    let t = 0;
    function tick() {
      raf = requestAnimationFrame(tick);
      if (!visible) return;

      t += 0.0032;
      curX += (targetX - curX) * 0.045;
      curY += (targetY - curY) * 0.045;

      globeGroup.rotation.y += 0.0016;
      globeGroup.rotation.x = curY * 0.28;
      globeGroup.rotation.z = -curX * 0.12;
      globeGroup.position.x = curX * 0.35;

      bgPoints.rotation.y -= 0.0004;

      edgeMat.opacity = edgeBaseOpacity + Math.sin(t * 1.4) * 0.06;

      renderer.render(scene, camera);
    }

    if (prefersReducedMotion) {
      // Render one settled frame; no continuous motion.
      globeGroup.rotation.set(0.15, 0.4, 0);
      renderer.render(scene, camera);
    } else {
      tick();
    }
  }

  if (document.readyState === 'loading') {
    document.addEventListener('DOMContentLoaded', start);
  } else {
    start();
  }
})();
