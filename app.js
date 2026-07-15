/* ============================================================
   RIC ICT SEMINAR 2026 — app.js
   ============================================================ */

// ============================================================
// CONFIGURABLE WEBINAR LINKS
// ============================================================
const LINKS = {
  registration: 'https://forms.gle/QxfHNHkUkzP2Eec1A',
  googleMeet:   'https://meet.google.com/oij-ueed-xcs',
  evaluation:   'https://forms.gle/bVEUWzwk1G74oByp8',
  facebook:     'https://www.facebook.com/ICTRangsitU',
  youtube:      'https://www.youtube.com/@RangsitUniversity',
  email:        'ki.r67@rsu.ac.th',
  linkedin:     'https://www.linkedin.com/in/yolanda-lim/'
};

// ——————————————————————————————————————————
// INITIALIZE LINKS FROM CONFIG
// ——————————————————————————————————————————
function setupLinks() {
  document.querySelectorAll('.link-registration').forEach(el => el.href = LINKS.registration);
  document.querySelectorAll('.link-meet').forEach(el => el.href = LINKS.googleMeet);
  document.querySelectorAll('.link-evaluation').forEach(el => el.href = LINKS.evaluation);
  document.querySelectorAll('.link-facebook').forEach(el => el.href = LINKS.facebook);
  document.querySelectorAll('.link-youtube').forEach(el => el.href = LINKS.youtube);
  document.querySelectorAll('.link-linkedin').forEach(el => el.href = LINKS.linkedin);
  document.querySelectorAll('.link-email').forEach(el => {
    el.href = `mailto:${LINKS.email}`;
    el.textContent = LINKS.email;
  });
}

// ——————————————————————————————————————————
// DARK MODE
// ——————————————————————————————————————————
function toggleDark() {
  const html = document.documentElement;
  const isDark = html.dataset.theme === 'dark';
  html.dataset.theme = isDark ? 'light' : 'dark';
  document.getElementById('moonIcon').style.display = isDark ? 'block' : 'none';
  document.getElementById('sunIcon').style.display = isDark ? 'none' : 'block';
}

// ——————————————————————————————————————————
// MOBILE MENU
// ——————————————————————————————————————————
function toggleMenu() {
  const m = document.getElementById('mobileMenu');
  const btn = document.querySelector('.hamburger');
  const isOpen = m.classList.toggle('open');
  btn.setAttribute('aria-expanded', isOpen);
}
function closeMenu() {
  document.getElementById('mobileMenu').classList.remove('open');
  document.querySelector('.hamburger').setAttribute('aria-expanded', 'false');
}

// ——————————————————————————————————————————
// GOOGLE MEET LINK LOCK LOGIC
// ——————————————————————————————————————————
function checkMeetLinksLock() {
  const startTime = new Date('2026-07-30T15:00:00+07:00');
  const now = new Date();
  const meetBtns = document.querySelectorAll('.meet-link');

  meetBtns.forEach(btn => {
    if (now < startTime) {
      btn.classList.add('btn-disabled');
      if (!btn.dataset.originalHtml) {
        btn.dataset.originalHtml = btn.innerHTML;
      }
      btn.innerHTML = `Join Google Meet on July 30 2026`;
      btn.style.pointerEvents = 'none';
      btn.href = 'javascript:void(0)';
      btn.onclick = function (e) { e.preventDefault(); return false; };
    } else {
      btn.classList.remove('btn-disabled');
      if (btn.dataset.originalHtml) {
        btn.innerHTML = btn.dataset.originalHtml;
      }
      btn.style.pointerEvents = 'auto';
      btn.href = LINKS.googleMeet;
      btn.onclick = null;
    }
  });
}

// ——————————————————————————————————————————
// COUNTDOWN TIMER — Target: Thursday, July 30, 2026 3:00 PM GMT+7
// ——————————————————————————————————————————
function updateCountdown() {
  const target = new Date('2026-07-30T15:00:00+07:00');
  const now = new Date();
  const diff = target - now;

  checkMeetLinksLock();

  if (diff <= 0) {
    const wrap = document.querySelector('.ep-countdown');
    if (wrap) {
      wrap.innerHTML = `<div style="text-align:center; font-family:var(--font-m); font-size:.74rem; color:var(--c-accent); font-weight:600; padding:10px 0;">✓ SEMINAR COMPLETED</div>`;
    }
    return;
  }
  const d = Math.floor(diff / 86400000);
  const h = Math.floor((diff % 86400000) / 3600000);
  const m = Math.floor((diff % 3600000) / 60000);
  const s = Math.floor((diff % 60000) / 1000);

  const dEl = document.getElementById('cd-days');
  const hEl = document.getElementById('cd-hours');
  const mEl = document.getElementById('cd-mins');
  const sEl = document.getElementById('cd-secs');

  if (dEl) dEl.textContent = String(d).padStart(2, '0');
  if (hEl) hEl.textContent = String(h).padStart(2, '0');
  if (mEl) mEl.textContent = String(m).padStart(2, '0');
  if (sEl) sEl.textContent = String(s).padStart(2, '0');
}

if (document.readyState === "loading") {
  document.addEventListener("DOMContentLoaded", function () {
    setupLinks();
    updateCountdown();
    setInterval(updateCountdown, 1000);
  });
} else {
  setupLinks();
  updateCountdown();
  setInterval(updateCountdown, 1000);
}

// ——————————————————————————————————————————
// PARTICLE CANVAS BACKGROUND
// ——————————————————————————————————————————
(function initParticles() {
  const canvas = document.getElementById('particleCanvas');
  if (!canvas) return;
  const ctx = canvas.getContext('2d');
  let W, H, particles = [];
  const COUNT = 25; // elegant low density

  function resize() {
    W = canvas.width = canvas.offsetWidth;
    H = canvas.height = canvas.offsetHeight;
  }
  window.addEventListener('resize', resize);
  resize();

  for (let i = 0; i < COUNT; i++) {
    particles.push({
      x: Math.random() * W,
      y: Math.random() * H,
      vx: (Math.random() - .5) * .16,
      vy: (Math.random() - .5) * .15,
      r: 1.2 + Math.random() * 1.5,
    });
  }

  function draw() {
    ctx.clearRect(0, 0, W, H);
    const dark = document.documentElement.dataset.theme === 'dark';
    const pc = dark ? 'rgba(94,234,212,' : 'rgba(13,148,136,';

    particles.forEach(p => {
      p.x = (p.x + p.vx + W) % W;
      p.y = (p.y + p.vy + H) % H;
      ctx.beginPath();
      ctx.arc(p.x, p.y, p.r, 0, 2 * Math.PI);
      ctx.fillStyle = pc + '.1)';
      ctx.fill();
    });

    for (let i = 0; i < particles.length; i++) {
      for (let j = i + 1; j < particles.length; j++) {
        const dx = particles[i].x - particles[j].x;
        const dy = particles[i].y - particles[j].y;
        const d = Math.sqrt(dx * dx + dy * dy);
        if (d < 100) {
          ctx.beginPath();
          ctx.moveTo(particles[i].x, particles[i].y);
          ctx.lineTo(particles[j].x, particles[j].y);
          ctx.strokeStyle = pc + (0.05 * (1 - d / 100)) + ')';
          ctx.lineWidth = .5;
          ctx.stroke();
        }
      }
    }
    requestAnimationFrame(draw);
  }
  draw();
})();

// ——————————————————————————————————————————
// SCROLL ANIMATIONS (IntersectionObserver)
// ——————————————————————————————————————————
const observer = new IntersectionObserver((entries) => {
  entries.forEach(e => {
    if (e.isIntersecting) {
      e.target.classList.add('visible');
    }
  });
}, { threshold: 0.05 });
document.querySelectorAll('.fade-in').forEach(el => observer.observe(el));

// ——————————————————————————————————————————
// EVALUATION LOCK CONTROLLER — Target: 30 July 2026 4:15 PM GMT+7
// ——————————————————————————————————————————
function checkEvalLock() {
  const unlockTime = new Date('2026-07-30T16:15:00+07:00');
  const now = new Date();

  const img = document.getElementById('evalQrImg');
  const overlay = document.getElementById('evalLockOverlay');
  const status = document.getElementById('evalStatus');
  const desc = document.getElementById('evalDesc');
  const btn = document.getElementById('evalFormBtn');

  if (!img) return;

  if (now >= unlockTime) {
    img.classList.remove('qr-blurred');
    if (overlay) overlay.style.display = 'none';
    if (status) status.textContent = 'Now available — scan to evaluate!';
    if (desc) desc.textContent = 'Thank you for attending! Please scan the QR code to submit your evaluation. Your feedback helps us improve future events.';
    if (btn) btn.style.display = 'flex';
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

document.addEventListener('DOMContentLoaded', checkEvalLock);
setInterval(checkEvalLock, 60000);


