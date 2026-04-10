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
     FORM — local file warning + submit state
     FormSubmit requires a real web server (http/https).
     When opened as a local file, show a friendly notice instead.
     ============================================================ */
  (function initForm() {
    const form = document.getElementById('contact-form');
    if (!form) return;

    // Detect local file browsing
    if (window.location.protocol === 'file:') {
      const notice = document.createElement('div');
      notice.style.cssText = [
        'background:rgba(0,191,255,0.08)',
        'border:1px solid rgba(0,191,255,0.25)',
        'border-radius:8px',
        'padding:0.9rem 1.1rem',
        'margin-bottom:1.25rem',
        'font-size:0.82rem',
        'color:#8888A0',
        'line-height:1.6',
      ].join(';');
      notice.innerHTML = '<strong style="color:#00BFFF">⚠ Local preview mode:</strong> The contact form requires the site to be hosted on a web server (e.g. GitHub Pages) to send emails. It will work correctly once deployed.';
      form.prepend(notice);

      form.addEventListener('submit', e => {
        e.preventDefault();
        notice.innerHTML = '<strong style="color:#00BFFF">✓ Got it!</strong> Deploy to GitHub Pages and this form will send to info@pentesterhub.com automatically.';
      });
      return;
    }

    // Live: show sending state
    form.addEventListener('submit', () => {
      const btn = form.querySelector('.form-submit');
      if (btn) {
        btn.textContent = 'Sending…';
        btn.disabled = true;
      }
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
