/**
 * PentesterHub — main.js
 * Vanilla JS: particles canvas, navbar scroll, hamburger menu,
 * scroll-reveal (IntersectionObserver), service card glow, scroll-to-top
 */

(function () {
  'use strict';

  /* ============================================================
     HERO PARTICLE / GRID CANVAS
     ============================================================ */
  (function initCanvas() {
    const canvas = document.getElementById('hero-canvas');
    if (!canvas) return;
    const ctx = canvas.getContext('2d');

    let W, H, particles, lines, animId;
    const PARTICLE_COUNT = 72;
    const ACCENT = '0, 191, 255';

    function resize() {
      W = canvas.width  = canvas.offsetWidth;
      H = canvas.height = canvas.offsetHeight;
    }

    function randomBetween(a, b) { return a + Math.random() * (b - a); }

    function initParticles() {
      particles = Array.from({ length: PARTICLE_COUNT }, () => ({
        x: randomBetween(0, W),
        y: randomBetween(0, H),
        vx: randomBetween(-0.25, 0.25),
        vy: randomBetween(-0.25, 0.25),
        r: randomBetween(1, 2.5),
        alpha: randomBetween(0.15, 0.55),
      }));
    }

    function drawGrid() {
      const spacing = 60;
      ctx.strokeStyle = `rgba(${ACCENT}, 0.04)`;
      ctx.lineWidth = 1;
      for (let x = 0; x < W; x += spacing) {
        ctx.beginPath();
        ctx.moveTo(x, 0);
        ctx.lineTo(x, H);
        ctx.stroke();
      }
      for (let y = 0; y < H; y += spacing) {
        ctx.beginPath();
        ctx.moveTo(0, y);
        ctx.lineTo(W, y);
        ctx.stroke();
      }
    }

    function drawLines() {
      const MAX_DIST = 140;
      for (let i = 0; i < particles.length; i++) {
        for (let j = i + 1; j < particles.length; j++) {
          const dx = particles[i].x - particles[j].x;
          const dy = particles[i].y - particles[j].y;
          const dist = Math.sqrt(dx * dx + dy * dy);
          if (dist < MAX_DIST) {
            const alpha = (1 - dist / MAX_DIST) * 0.12;
            ctx.strokeStyle = `rgba(${ACCENT}, ${alpha})`;
            ctx.lineWidth = 0.8;
            ctx.beginPath();
            ctx.moveTo(particles[i].x, particles[i].y);
            ctx.lineTo(particles[j].x, particles[j].y);
            ctx.stroke();
          }
        }
      }
    }

    function tick() {
      ctx.clearRect(0, 0, W, H);
      drawGrid();

      particles.forEach(p => {
        p.x += p.vx;
        p.y += p.vy;
        if (p.x < 0) p.x = W;
        if (p.x > W) p.x = 0;
        if (p.y < 0) p.y = H;
        if (p.y > H) p.y = 0;

        ctx.beginPath();
        ctx.arc(p.x, p.y, p.r, 0, Math.PI * 2);
        ctx.fillStyle = `rgba(${ACCENT}, ${p.alpha})`;
        ctx.fill();
      });

      drawLines();

      // Central glow orb
      const grd = ctx.createRadialGradient(W * 0.5, H * 0.55, 0, W * 0.5, H * 0.55, W * 0.45);
      grd.addColorStop(0, `rgba(${ACCENT}, 0.04)`);
      grd.addColorStop(1, 'transparent');
      ctx.fillStyle = grd;
      ctx.fillRect(0, 0, W, H);

      animId = requestAnimationFrame(tick);
    }

    resize();
    initParticles();
    tick();

    const ro = new ResizeObserver(() => {
      resize();
      initParticles();
    });
    ro.observe(canvas.parentElement);

    // Pause when off-screen
    const ioHero = new IntersectionObserver(entries => {
      entries.forEach(e => {
        if (e.isIntersecting) { if (!animId) tick(); }
        else { cancelAnimationFrame(animId); animId = null; }
      });
    });
    ioHero.observe(canvas.parentElement);
  })();


  /* ============================================================
     NAVBAR — transparent → solid on scroll + active link
     ============================================================ */
  (function initNavbar() {
    const navbar = document.getElementById('navbar');
    if (!navbar) return;

    function update() {
      if (window.scrollY > 40) {
        navbar.classList.add('scrolled');
      } else {
        navbar.classList.remove('scrolled');
      }

      // Active nav link based on scroll position
      const sections = document.querySelectorAll('section[id]');
      const scrollPos = window.scrollY + 100;
      sections.forEach(sec => {
        const top = sec.offsetTop;
        const bottom = top + sec.offsetHeight;
        const link = navbar.querySelector(`a[href="#${sec.id}"]`);
        if (link) {
          link.classList.toggle('active', scrollPos >= top && scrollPos < bottom);
        }
      });
    }

    window.addEventListener('scroll', update, { passive: true });
    update();
  })();


  /* ============================================================
     HAMBURGER MOBILE MENU
     ============================================================ */
  (function initHamburger() {
    const btn    = document.getElementById('hamburger-btn');
    const drawer = document.getElementById('nav-drawer');
    if (!btn || !drawer) return;

    function toggle(force) {
      const open = force !== undefined ? force : !btn.classList.contains('open');
      btn.classList.toggle('open', open);
      drawer.classList.toggle('open', open);
      document.body.style.overflow = open ? 'hidden' : '';
      btn.setAttribute('aria-expanded', String(open));
    }

    btn.addEventListener('click', () => toggle());

    drawer.querySelectorAll('a').forEach(a => {
      a.addEventListener('click', () => toggle(false));
    });

    // Close on Escape
    document.addEventListener('keydown', e => {
      if (e.key === 'Escape') toggle(false);
    });
  })();


  /* ============================================================
     SCROLL REVEAL — IntersectionObserver
     ============================================================ */
  (function initReveal() {
    const els = document.querySelectorAll('.reveal');
    if (!els.length) return;

    const io = new IntersectionObserver((entries) => {
      entries.forEach(entry => {
        if (entry.isIntersecting) {
          entry.target.classList.add('visible');
          io.unobserve(entry.target);
        }
      });
    }, { threshold: 0.12 });

    els.forEach(el => io.observe(el));
  })();


  /* ============================================================
     SERVICE CARD — radial glow follows cursor
     ============================================================ */
  (function initCardGlow() {
    document.querySelectorAll('.service-card').forEach(card => {
      card.addEventListener('mousemove', e => {
        const rect = card.getBoundingClientRect();
        const x = ((e.clientX - rect.left) / rect.width  * 100).toFixed(1) + '%';
        const y = ((e.clientY - rect.top)  / rect.height * 100).toFixed(1) + '%';
        card.style.setProperty('--mx', x);
        card.style.setProperty('--my', y);
      });
    });
  })();


  /* ============================================================
     SMOOTH ANCHOR SCROLL (for nav links)
     ============================================================ */
  document.querySelectorAll('a[href^="#"]').forEach(link => {
    link.addEventListener('click', e => {
      const id = link.getAttribute('href').slice(1);
      const target = document.getElementById(id);
      if (!target) return;
      e.preventDefault();
      const offset = 72; // nav height
      const top = target.getBoundingClientRect().top + window.scrollY - offset;
      window.scrollTo({ top, behavior: 'smooth' });
    });
  });


  /* ============================================================
     FORM — validation + rate limiting + local file warning
     ============================================================ */
  (function initForm() {
    const form = document.getElementById('contact-form');
    if (!form) return;

    // ── Local file warning ────────────────────────────────────
    if (window.location.protocol === 'file:') {
      const notice = document.createElement('div');
      notice.style.cssText = 'background:rgba(0,191,255,0.08);border:1px solid rgba(0,191,255,0.25);border-radius:8px;padding:0.9rem 1.1rem;margin-bottom:1.25rem;font-size:0.82rem;color:#8888A0;line-height:1.6;';
      notice.innerHTML = '<strong style="color:#00BFFF">⚠ Local preview:</strong> The form requires a live web server to send emails. It will work once deployed to GitHub Pages.';
      form.prepend(notice);
      form.addEventListener('submit', e => { e.preventDefault(); });
      return;
    }

    // ── Field validation helpers ──────────────────────────────
    const rules = {
      fname:    v => v.trim().length >= 2,
      fcompany: v => v.trim().length >= 2,
      femail:   v => /^[^\s@]+@[^\s@]+\.[^\s@]+$/.test(v.trim()),
      fservice: v => v !== '',
      fmessage: v => v.trim().length >= 10,
    };

    function validateField(el) {
      const valid = rules[el.id] ? rules[el.id](el.value) : true;
      const err = document.getElementById(el.id + '-error');
      el.classList.toggle('invalid', !valid);
      el.classList.toggle('valid', valid);
      if (err) err.classList.toggle('visible', !valid);
      return valid;
    }

    // Validate on blur (when user leaves a field)
    Object.keys(rules).forEach(id => {
      const el = document.getElementById(id);
      if (!el) return;
      el.addEventListener('blur', () => validateField(el));
      el.addEventListener('input', () => {
        if (el.classList.contains('invalid')) validateField(el);
      });
    });

    // ── Rate limiting (max 3 submissions per hour) ────────────
    const RATE_KEY   = 'ph_form_attempts';
    const RATE_LIMIT = 3;
    const RATE_WINDOW = 60 * 60 * 1000; // 1 hour in ms

    function getRateData() {
      try { return JSON.parse(localStorage.getItem(RATE_KEY)) || []; }
      catch { return []; }
    }

    function isRateLimited() {
      const now = Date.now();
      const attempts = getRateData().filter(t => now - t < RATE_WINDOW);
      localStorage.setItem(RATE_KEY, JSON.stringify(attempts));
      return attempts.length >= RATE_LIMIT;
    }

    function recordAttempt() {
      const attempts = getRateData();
      attempts.push(Date.now());
      localStorage.setItem(RATE_KEY, JSON.stringify(attempts));
    }

    // ── Submit handler ────────────────────────────────────────
    form.addEventListener('submit', e => {
      // 1. Validate all required fields
      let allValid = true;
      Object.keys(rules).forEach(id => {
        const el = document.getElementById(id);
        if (el && !validateField(el)) allValid = false;
      });

      if (!allValid) {
        e.preventDefault();
        // Scroll to first invalid field
        const first = form.querySelector('.invalid');
        if (first) first.scrollIntoView({ behavior: 'smooth', block: 'center' });
        return;
      }

      // 2. Rate limit check
      const rateNotice = document.getElementById('rate-notice');
      if (isRateLimited()) {
        e.preventDefault();
        if (rateNotice) rateNotice.classList.add('visible');
        return;
      }

      // 3. All good — record attempt and show sending state
      recordAttempt();
      if (rateNotice) rateNotice.classList.remove('visible');
      const btn = form.querySelector('.form-submit');
      if (btn) { btn.textContent = 'Sending…'; btn.disabled = true; }
    });
  })();


  /* ============================================================
     HERO WORD CROSSFADE — smooth opacity transition, no flicker
     ============================================================ */
  (function initWordFade() {
    const el = document.getElementById('hero-typed');
    if (!el) return;

    const words = ['Enterprise Grade.', 'Defence Ready.', 'Battle Tested.'];
    let wi = 0;

    // Set initial word immediately (no delay flash)
    el.textContent = words[0];

    function crossfade() {
      // Fade out
      el.style.opacity = '0';
      el.style.transform = 'translateY(8px)';

      setTimeout(() => {
        // Swap word while invisible
        wi = (wi + 1) % words.length;
        el.textContent = words[wi];

        // Fade in
        el.style.opacity = '1';
        el.style.transform = 'translateY(0)';
      }, 450); // matches CSS transition duration
    }

    setInterval(crossfade, 3000);
  })();

})();
