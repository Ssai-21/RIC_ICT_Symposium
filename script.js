/* ============================================================
   RIC ICT SEMINAR 2026 — script.js
   ============================================================ */

const LINKS = {
  registration: 'https://forms.gle/QxfHNHkUkzP2Eec1A',
  googleMeet:   'https://meet.google.com/oij-ueed-xcs',
  evaluation:   'https://forms.gle/bVEUWzwk1G74oByp8',
};

const prefersReducedMotion = window.matchMedia('(prefers-reduced-motion: reduce)').matches;

// ——————————————————————————————————————————
// LIGHTBOX — click the poster or a QR code to view it larger
// ——————————————————————————————————————————
function initLightbox() {
  const lightbox = document.getElementById('lightbox');
  const lightboxImg = document.getElementById('lightboxImg');
  const closeBtn = document.getElementById('lightboxClose');
  if (!lightbox || !lightboxImg) return;

  let lastFocused = null;

  function open(src, alt, triggerEl) {
    lastFocused = triggerEl || document.activeElement;
    lightboxImg.src = src;
    lightboxImg.alt = alt || '';
    lightbox.classList.add('open');
    document.body.style.overflow = 'hidden';
    closeBtn.focus();
  }
  function close() {
    lightbox.classList.remove('open');
    document.body.style.overflow = '';
    lightboxImg.src = '';
    if (lastFocused) lastFocused.focus();
  }

  document.querySelectorAll('.lightbox-trigger').forEach(trigger => {
    trigger.addEventListener('click', () => {
      if (trigger.disabled) return;
      const img = trigger.querySelector('img');
      if (!img) return;
      open(img.currentSrc || img.src, img.alt, trigger);
    });
  });

  closeBtn.addEventListener('click', close);
  lightbox.addEventListener('click', (e) => { if (e.target === lightbox) close(); });
  document.addEventListener('keydown', (e) => {
    if (!lightbox.classList.contains('open')) return;
    if (e.key === 'Escape') close();
    // The close button is the only focusable element inside — trap Tab on it
    // so keyboard users can't tab into the page behind the modal.
    if (e.key === 'Tab') {
      e.preventDefault();
      closeBtn.focus();
    }
  });
}

// ——————————————————————————————————————————
// LIGHT / DARK THEME TOGGLE
// ——————————————————————————————————————————
function initThemeToggle() {
  const btn = document.getElementById('themeToggle');
  const moon = document.getElementById('iconMoon');
  const sun = document.getElementById('iconSun');
  if (!btn) return;

  const applyIcons = (theme) => {
    const isDark = theme === 'dark';
    if (moon) moon.style.display = isDark ? 'block' : 'none';
    if (sun) sun.style.display = isDark ? 'none' : 'block';
  };

  applyIcons(document.documentElement.getAttribute('data-theme') || 'dark');

  btn.addEventListener('click', () => {
    const current = document.documentElement.getAttribute('data-theme') === 'dark' ? 'dark' : 'light';
    const next = current === 'dark' ? 'light' : 'dark';
    document.documentElement.setAttribute('data-theme', next);
    localStorage.setItem('theme', next);
    applyIcons(next);
    window.dispatchEvent(new CustomEvent('themechange', { detail: { theme: next } }));
  });
}

// ——————————————————————————————————————————
// COUNTDOWN — odometer-style digit reels
// ——————————————————————————————————————————
const countdownReels = {};

function buildReel() {
  const reel = document.createElement('div');
  reel.className = 'reel';
  const track = document.createElement('div');
  track.className = 'reel-track';
  for (let i = 0; i <= 9; i++) {
    const span = document.createElement('span');
    span.textContent = i;
    track.appendChild(span);
  }
  reel.appendChild(track);
  return { reel, track };
}

function buildReelGroup(containerId, digitCount) {
  const container = document.getElementById(containerId);
  if (!container) return null;
  const tracks = [];
  for (let i = 0; i < digitCount; i++) {
    const { reel, track } = buildReel();
    container.appendChild(reel);
    tracks.push(track);
  }
  return tracks;
}

function setReelGroup(tracks, value) {
  if (!tracks) return;
  const digits = tracks.length;
  const str = String(Math.max(0, Math.floor(value))).padStart(digits, '0').slice(-digits);
  tracks.forEach((track, i) => {
    track.style.transform = `translateY(-${Number(str[i]) * 10}%)`;
  });
}

function initCountdownReels() {
  countdownReels.days = buildReelGroup('cd-days', 3);
  countdownReels.hours = buildReelGroup('cd-hours', 2);
  countdownReels.mins = buildReelGroup('cd-mins', 2);
  countdownReels.secs = buildReelGroup('cd-secs', 2);
}

// ——————————————————————————————————————————
// GOOGLE MEET LOCK — unlocks at seminar start
// ——————————————————————————————————————————
function checkMeetLinksLock() {
  const startTime = new Date('2026-07-30T15:00:00+07:00');
  const now = new Date();
  const meetBtns = document.querySelectorAll('.meet-link');

  meetBtns.forEach(btn => {
    if (now < startTime) {
      btn.classList.add('btn-disabled');
      if (!btn.dataset.originalHtml) btn.dataset.originalHtml = btn.innerHTML;
      btn.innerHTML = `Join Google Meet on July 30th`;
      btn.style.pointerEvents = 'none';
      btn.href = 'javascript:void(0)';
      btn.onclick = e => { e.preventDefault(); return false; };
    } else {
      btn.classList.remove('btn-disabled');
      if (btn.dataset.originalHtml) btn.innerHTML = btn.dataset.originalHtml;
      btn.style.pointerEvents = 'auto';
      btn.href = LINKS.googleMeet;
      btn.onclick = null;
    }
  });
}

// ——————————————————————————————————————————
// COUNTDOWN TIMER — target: Thu 30 Jul 2026, 15:00 GMT+7
// ——————————————————————————————————————————
function updateCountdown() {
  const target = new Date('2026-07-30T15:00:00+07:00');
  const now = new Date();
  const diff = target - now;

  checkMeetLinksLock();

  if (diff <= 0) {
    const wrap = document.querySelector('.countdown-panel');
    if (wrap) {
      wrap.innerHTML = `<div style="font-family:var(--font-m); font-size:.85rem; color:var(--lime); font-weight:700;">&#10003;&nbsp; SEMINAR IN SESSION / COMPLETED</div>`;
    }
    return;
  }
  const d = Math.floor(diff / 86400000);
  const h = Math.floor((diff % 86400000) / 3600000);
  const m = Math.floor((diff % 3600000) / 60000);
  const s = Math.floor((diff % 60000) / 1000);

  setReelGroup(countdownReels.days, d);
  setReelGroup(countdownReels.hours, h);
  setReelGroup(countdownReels.mins, m);
  setReelGroup(countdownReels.secs, s);

  const sr = document.getElementById('cd-sr');
  if (sr) sr.textContent = `${d} days, ${h} hours, ${m} minutes, ${s} seconds remaining`;
}

function initCountdown() {
  initCountdownReels();
  updateCountdown();
  setInterval(updateCountdown, 1000);
}

// ——————————————————————————————————————————
// EVALUATION LOCK — unlocks at seminar end
// ——————————————————————————————————————————
function checkEvalLock() {
  const unlockTime = new Date('2026-07-30T16:15:00+07:00');
  const now = new Date();

  const img = document.getElementById('evalQrImg');
  const overlay = document.getElementById('evalLockOverlay');
  const status = document.getElementById('evalStatus');
  const desc = document.getElementById('evalDesc');
  const btn = document.getElementById('evalFormBtn');
  const trigger = document.getElementById('evalQrTrigger');
  if (!img) return;

  if (now >= unlockTime) {
    img.classList.remove('qr-blurred');
    if (overlay) overlay.style.display = 'none';
    if (status) status.textContent = 'Now available — scan to evaluate!';
    if (desc) desc.textContent = 'Thank you for attending! Please scan the QR code to submit your evaluation. Your feedback helps us improve future events.';
    if (btn) btn.style.display = 'flex';
    if (trigger) trigger.disabled = false;
  } else {
    const diff = unlockTime - now;
    const d = Math.floor(diff / 86400000);
    const h = Math.floor((diff % 86400000) / 3600000);
    const m = Math.floor((diff % 3600000) / 60000);
    if (status) {
      if (d > 0) status.textContent = `Unlocks in ${d} day${d > 1 ? 's' : ''} and ${h} hour${h !== 1 ? 's' : ''}`;
      else if (h > 0) status.textContent = `Unlocks in ${h} hour${h !== 1 ? 's' : ''} and ${m} min`;
      else status.textContent = `Unlocks in ${m} minute${m !== 1 ? 's' : ''}`;
    }
  }
}

// ——————————————————————————————————————————
// MOBILE MENU
// ——————————————————————————————————————————
function initMobileMenu() {
  const hamburger = document.getElementById('hamburger');
  const menu = document.getElementById('mobileMenu');
  if (!hamburger || !menu) return;

  const focusable = () => Array.from(menu.querySelectorAll('a'));

  function openMenu() {
    menu.classList.add('open');
    hamburger.setAttribute('aria-expanded', 'true');
    const items = focusable();
    if (items.length) items[0].focus();
  }
  function closeMenu() {
    menu.classList.remove('open');
    hamburger.setAttribute('aria-expanded', 'false');
    hamburger.focus();
  }

  hamburger.addEventListener('click', () => {
    if (menu.classList.contains('open')) closeMenu(); else openMenu();
  });
  focusable().forEach(a => a.addEventListener('click', closeMenu));

  document.addEventListener('keydown', (e) => {
    if (!menu.classList.contains('open')) return;
    if (e.key === 'Escape') { closeMenu(); return; }
    if (e.key !== 'Tab') return;
    const items = focusable();
    if (!items.length) return;
    const first = items[0];
    const last = items[items.length - 1];
    if (e.shiftKey && document.activeElement === first) {
      e.preventDefault(); last.focus();
    } else if (!e.shiftKey && document.activeElement === last) {
      e.preventDefault(); first.focus();
    }
  });
}

// ——————————————————————————————————————————
// TEAM ACCORDION — each team is its own independent drop bar
// ——————————————————————————————————————————
function initTeamAccordion() {
  document.querySelectorAll('.team-group-head').forEach(btn => {
    btn.addEventListener('click', () => {
      const group = btn.closest('.team-group');
      const isOpen = group.classList.toggle('open');
      btn.setAttribute('aria-expanded', String(isOpen));
    });
  });
}

// ——————————————————————————————————————————
// SCROLL REVEAL (IntersectionObserver, staggered by group)
// ——————————————————————————————————————————
function initScrollReveal() {
  const observer = new IntersectionObserver((entries) => {
    entries.forEach(e => {
      if (e.isIntersecting) {
        e.target.classList.add('visible');
        observer.unobserve(e.target);
      }
    });
  }, { threshold: 0.08, rootMargin: '0px 0px -60px 0px' });

  document.querySelectorAll('.reveal').forEach(el => observer.observe(el));

  // Card grids get a richer 3D tilt-in entrance from GSAP (see initScrollCinematics)
  // when it's available; this plain 2D fade is the fallback for when the CDN didn't load.
  const gsapAvailable = typeof gsap !== 'undefined' && typeof ScrollTrigger !== 'undefined';
  const tiltCandidates = [
    '.member-grid > .member-card',
    '.topics-grid > .topic-card',
    '.forms-grid > .form-card',
    '.timeline > .timeline-item',
    '.stat-row > .stat-card',
  ];
  const staggerGroups = gsapAvailable ? [] : tiltCandidates;
  if (staggerGroups.length === 0) return;

  document.querySelectorAll(staggerGroups.join(', ')).forEach((el, i) => {
    el.classList.add('reveal');
    el.style.setProperty('--reveal-delay', `${(i % 4) * 80}ms`);
    observer.observe(el);
  });
}

// ——————————————————————————————————————————
// NAVBAR SCROLL STATE + ACTIVE LINK + PROGRESS BAR
// ——————————————————————————————————————————
function initNavbarScroll() {
  const navbar = document.getElementById('navbar');
  const progress = document.getElementById('scrollProgress');
  if (!navbar) return;

  const onScroll = () => {
    navbar.classList.toggle('scrolled', window.scrollY > 12);
    if (progress) {
      const h = document.documentElement;
      const scrollPct = (h.scrollTop) / (h.scrollHeight - h.clientHeight) * 100;
      progress.style.width = `${Math.min(100, Math.max(0, scrollPct))}%`;
    }
  };
  onScroll();
  window.addEventListener('scroll', onScroll, { passive: true });

  const navLinks = Array.from(document.querySelectorAll('.nav-link'));
  const sections = navLinks.map(l => document.querySelector(l.getAttribute('href'))).filter(Boolean);
  if (!sections.length) return;

  const sectionObserver = new IntersectionObserver((entries) => {
    entries.forEach(entry => {
      const link = navLinks.find(l => l.getAttribute('href') === `#${entry.target.id}`);
      if (!link) return;
      if (entry.isIntersecting) {
        navLinks.forEach(l => l.classList.remove('active'));
        link.classList.add('active');
      }
    });
  }, { threshold: 0.3, rootMargin: '-90px 0px -55% 0px' });
  sections.forEach(sec => sectionObserver.observe(sec));
}

// ——————————————————————————————————————————
// BACK TO TOP
// ——————————————————————————————————————————
function initBackToTop() {
  const btn = document.getElementById('backToTop');
  if (!btn) return;
  const onScroll = () => btn.classList.toggle('show', window.scrollY > 480);
  onScroll();
  window.addEventListener('scroll', onScroll, { passive: true });
  btn.addEventListener('click', () => {
    window.scrollTo({ top: 0, behavior: prefersReducedMotion ? 'auto' : 'smooth' });
  });
}

// ——————————————————————————————————————————
// CURSOR GLOW (desktop only, subtle spotlight following pointer)
// ——————————————————————————————————————————
function initCursorGlow() {
  const glow = document.getElementById('cursorGlow');
  if (!glow || !window.matchMedia('(hover: hover) and (pointer: fine)').matches) return;
  let raf = null;
  window.addEventListener('mousemove', (e) => {
    glow.classList.add('active');
    if (raf) return;
    raf = requestAnimationFrame(() => {
      glow.style.left = `${e.clientX}px`;
      glow.style.top = `${e.clientY}px`;
      raf = null;
    });
  });
  window.addEventListener('mouseleave', () => glow.classList.remove('active'));
}

// ——————————————————————————————————————————
// CARD TILT + CURSOR SHEEN — 3D tilt on feature cards, a soft
// cursor-follow highlight on every .sheen-card (incl. non-tilted).
// ——————————————————————————————————————————
function initTilt() {
  if (!window.matchMedia('(hover: hover) and (pointer: fine)').matches || prefersReducedMotion) return;

  const tiltEls = new Set(document.querySelectorAll('.topic-card, .speaker-card, .speaker-reasons, .form-card'));
  const lightTiltEls = new Set(document.querySelectorAll('.member-card, .stat-card'));
  document.querySelectorAll('.sheen-card').forEach(el => {
    const doTilt = tiltEls.has(el);
    const doLightTilt = lightTiltEls.has(el);
    const maxDeg = doLightTilt ? 3.5 : 7;
    if (doTilt || doLightTilt) el.style.transformStyle = 'preserve-3d';

    el.addEventListener('mousemove', (e) => {
      const r = el.getBoundingClientRect();
      const px = ((e.clientX - r.left) / r.width) * 100;
      const py = ((e.clientY - r.top) / r.height) * 100;
      el.style.setProperty('--mx', `${px}%`);
      el.style.setProperty('--my', `${py}%`);

      if (doTilt || doLightTilt) {
        // The scroll-reveal tween (see initScrollCinematics) animates this same
        // transform for ~1s right after the card enters view; if the cursor
        // reaches it before that finishes, stop the tween so it can't fight
        // the hover tilt for control of the property.
        if (typeof gsap !== 'undefined') gsap.killTweensOf(el);
        const x = px / 100 - 0.5;
        const y = py / 100 - 0.5;
        const lift = doLightTilt ? -1 : -2;
        el.style.transform = `perspective(900px) rotateX(${(-y * maxDeg).toFixed(2)}deg) rotateY(${(x * maxDeg).toFixed(2)}deg) translateY(${lift}px)`;
      }
    });
    el.addEventListener('mouseleave', () => { if (doTilt || doLightTilt) el.style.transform = ''; });
  });
}

// ——————————————————————————————————————————
// MAGNETIC BUTTONS — CTAs pull toward the cursor, then spring back
// ——————————————————————————————————————————
function initMagnetic() {
  if (!window.matchMedia('(hover: hover) and (pointer: fine)').matches || prefersReducedMotion) return;
  const STRENGTH = 0.32;
  const MAX_OFFSET = 14;

  document.querySelectorAll('.btn-magnetic').forEach(el => {
    let pressed = false;
    let lastX = 0, lastY = 0;

    const apply = (x, y, scale) => {
      el.style.transform = `translate(${x.toFixed(1)}px, ${y.toFixed(1)}px)${scale ? ' scale(0.96)' : ''}`;
    };

    el.addEventListener('mousemove', (e) => {
      const r = el.getBoundingClientRect();
      const x = Math.max(-MAX_OFFSET, Math.min(MAX_OFFSET, (e.clientX - r.left - r.width / 2) * STRENGTH));
      const y = Math.max(-MAX_OFFSET, Math.min(MAX_OFFSET, (e.clientY - r.top - r.height / 2) * STRENGTH));
      lastX = x; lastY = y;
      el.style.transition = 'transform 90ms linear';
      apply(x, y, pressed);
    });
    el.addEventListener('mousedown', () => { pressed = true; apply(lastX, lastY, true); });
    el.addEventListener('mouseup', () => { pressed = false; apply(lastX, lastY, false); });
    el.addEventListener('mouseleave', () => {
      pressed = false;
      el.style.transition = 'transform 550ms cubic-bezier(0.34, 1.56, 0.64, 1)';
      el.style.transform = 'translate(0px, 0px)';
    });
  });
}

// ——————————————————————————————————————————
// SCROLL CINEMATICS (GSAP + ScrollTrigger) — hero parallax exit,
// scroll-scrubbed timeline draw. Progressive enhancement: if the
// CDN failed to load, the site still works fine without this.
// ——————————————————————————————————————————
function initScrollCinematics() {
  if (typeof gsap === 'undefined' || typeof ScrollTrigger === 'undefined') return;
  gsap.registerPlugin(ScrollTrigger);

  if (prefersReducedMotion) {
    // Still draw the timeline progress line fully so nothing looks unfinished,
    // but skip the parallax/scrub motion entirely.
    const line = document.getElementById('timelineProgress');
    if (line) line.style.transform = 'scaleY(1)';
    return;
  }

  const hero = document.getElementById('hero');
  if (hero) {
    gsap.to('.hero-content', {
      yPercent: 12, opacity: 0.25, filter: 'blur(5px)', ease: 'none',
      scrollTrigger: { trigger: hero, start: 'bottom bottom', end: 'bottom top', scrub: 0.4 },
    });
    gsap.to('.hero-skyline', {
      yPercent: -18, ease: 'none',
      scrollTrigger: { trigger: hero, start: 'top top', end: 'bottom top', scrub: 0.4 },
    });
    gsap.to('.aurora-1', {
      yPercent: 26, xPercent: -8, ease: 'none',
      scrollTrigger: { trigger: hero, start: 'top top', end: 'bottom top', scrub: 0.4 },
    });
    gsap.to('.aurora-2', {
      yPercent: -22, xPercent: 8, ease: 'none',
      scrollTrigger: { trigger: hero, start: 'top top', end: 'bottom top', scrub: 0.4 },
    });
  }

  const track = document.querySelector('.timeline-wrap');
  const line = document.getElementById('timelineProgress');
  if (track && line) {
    gsap.to(line, {
      scaleY: 1, ease: 'none',
      scrollTrigger: { trigger: track, start: 'top 75%', end: 'bottom 60%', scrub: 0.5 },
    });
  }

  // 3D tilt-in entrance for card grids — a subtle rotateX resolving to flat as
  // each card enters, so the rest of the page keeps the hero's dimensional feel
  // instead of dropping to plain 2D fades. Falls back to the CSS fade above
  // when GSAP isn't loaded (see initScrollReveal).
  const tiltGroups = [
    '.member-grid > .member-card',
    '.topics-grid > .topic-card',
    '.forms-grid > .form-card',
    '.timeline > .timeline-item',
    '.stat-row > .stat-card',
  ];
  document.querySelectorAll(tiltGroups.join(', ')).forEach((el, i) => {
    gsap.set(el, { transformPerspective: 900, transformOrigin: '50% 100%' });
    gsap.from(el, {
      opacity: 0, y: 36, rotateX: -14,
      duration: 0.9, ease: 'power3.out', delay: (i % 4) * 0.07,
      scrollTrigger: { trigger: el, start: 'top 90%' },
    });
  });

  // Speaker photo ring gets a slow, scroll-linked 3D turn as it passes through
  // the viewport — a small, self-contained touch (no conflicting hover rule).
  const ring = document.querySelector('.speaker-avatar-ring');
  if (ring) {
    gsap.set(ring, { transformPerspective: 800 });
    gsap.to(ring, {
      rotateY: 22, ease: 'none',
      scrollTrigger: { trigger: ring, start: 'top bottom', end: 'bottom top', scrub: 0.6 },
    });
  }

}

// ——————————————————————————————————————————
// INIT
// ——————————————————————————————————————————
function init() {
  initThemeToggle();
  initLightbox();
  initCountdown();
  initMobileMenu();
  initTeamAccordion();
  initScrollReveal();
  initNavbarScroll();
  initBackToTop();
  initCursorGlow();
  initTilt();
  initMagnetic();
  initScrollCinematics();
  checkEvalLock();
  setInterval(checkEvalLock, 60000);
}

if (document.readyState === 'loading') {
  document.addEventListener('DOMContentLoaded', init);
} else {
  init();
}
