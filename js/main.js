/* ==========================================================================
   Old South Lawn Care — main.js (modern redesign)
   Vanilla JavaScript only — no frameworks.
   Handles: mobile nav, sticky header, active links, smooth scroll,
   homepage quick-quote validation, full booking form validation + success,
   FAQ accordion, back-to-top, scroll reveal (IntersectionObserver).
   ========================================================================== */

(function () {
  'use strict';

  const $ = (s, c = document) => c.querySelector(s);
  const $$ = (s, c = document) => Array.from(c.querySelectorAll(s));

  /* ---------------------------------------------------------------- */
  /* 1. Mobile navigation                                             */
  /* ---------------------------------------------------------------- */
  function initMobileNav() {
    const toggle = $('.nav__toggle');
    const menu = $('.nav__menu');
    if (!toggle || !menu) return;

    toggle.addEventListener('click', function () {
      const open = menu.classList.toggle('open');
      toggle.classList.toggle('open', open);
      toggle.setAttribute('aria-expanded', String(open));
      document.body.style.overflow = open ? 'hidden' : '';
    });

    $$('.nav__menu a').forEach(function (link) {
      link.addEventListener('click', function () {
        menu.classList.remove('open');
        toggle.classList.remove('open');
        toggle.setAttribute('aria-expanded', 'false');
        document.body.style.overflow = '';
      });
    });

    window.addEventListener('resize', function () {
      if (window.innerWidth > 860 && menu.classList.contains('open')) {
        menu.classList.remove('open');
        toggle.classList.remove('open');
        document.body.style.overflow = '';
      }
    });
  }

  /* ---------------------------------------------------------------- */
  /* 2. Sticky header shadow                                          */
  /* ---------------------------------------------------------------- */
  function initStickyHeader() {
    const header = $('.site-header');
    if (!header) return;
    const onScroll = () => header.classList.toggle('scrolled', window.scrollY > 20);
    onScroll();
    window.addEventListener('scroll', onScroll, { passive: true });
  }

  /* ---------------------------------------------------------------- */
  /* 3. Active navigation link                                        */
  /* ---------------------------------------------------------------- */
  function initActiveNav() {
    let current = window.location.pathname.split('/').pop();
    if (!current) current = 'index.html';
    $$('.nav__link').forEach(function (link) {
      if (link.getAttribute('href') === current) {
        link.classList.add('active');
        link.setAttribute('aria-current', 'page');
      }
    });
  }

  /* ---------------------------------------------------------------- */
  /* 4. Smooth scroll for in-page anchors                             */
  /* ---------------------------------------------------------------- */
  function initSmoothScroll() {
    $$('a[href^="#"]').forEach(function (anchor) {
      anchor.addEventListener('click', function (e) {
        const id = anchor.getAttribute('href');
        if (id === '#' || id.length < 2) return;
        const target = document.getElementById(id.slice(1));
        if (!target) return;
        e.preventDefault();
        target.scrollIntoView({ behavior: 'smooth', block: 'start' });
      });
    });
  }

  /* ---------------------------------------------------------------- */
  /* 5. Back to top                                                   */
  /* ---------------------------------------------------------------- */
  function initBackToTop() {
    const btn = $('.back-to-top');
    if (!btn) return;
    const onScroll = () => btn.classList.toggle('show', window.scrollY > 480);
    onScroll();
    window.addEventListener('scroll', onScroll, { passive: true });
    btn.addEventListener('click', () => window.scrollTo({ top: 0, behavior: 'smooth' }));
  }

  /* ---------------------------------------------------------------- */
  /* 6. FAQ accordion                                                 */
  /* ---------------------------------------------------------------- */
  function initFaq() {
    const items = $$('.faq-item');
    if (!items.length) return;
    items.forEach(function (item) {
      const q = $('.faq-question', item);
      const a = $('.faq-answer', item);
      if (!q || !a) return;
      q.addEventListener('click', function () {
        const open = item.classList.contains('open');
        items.forEach(function (other) {
          if (other !== item) {
            other.classList.remove('open');
            const oa = $('.faq-answer', other);
            const oq = $('.faq-question', other);
            if (oa) oa.style.maxHeight = null;
            if (oq) oq.setAttribute('aria-expanded', 'false');
          }
        });
        item.classList.toggle('open', !open);
        q.setAttribute('aria-expanded', String(!open));
        a.style.maxHeight = !open ? a.scrollHeight + 'px' : null;
      });
    });
  }

  /* ---------------------------------------------------------------- */
  /* Shared validation helpers                                        */
  /* ---------------------------------------------------------------- */
  function isEmail(v) { return /^[^\s@]+@[^\s@]+\.[^\s@]+$/.test(v.trim()); }
  function isPhone(v) { return v.replace(/\D/g, '').length >= 7; }

  function validateField(field) {
    const group = field.closest('.field-group') || field.closest('.checkbox-row') || field.closest('.field');
    let valid = true;

    if (field.type === 'checkbox') {
      valid = field.checked;
    } else if (field.hasAttribute('required')) {
      valid = field.value.trim() !== '';
    }
    if (valid && field.type === 'email' && field.value.trim() !== '') valid = isEmail(field.value);
    if (valid && field.dataset.type === 'phone' && field.value.trim() !== '') valid = isPhone(field.value);

    if (group) group.classList.toggle('has-error', !valid);
    field.classList.toggle('invalid', !valid);
    return valid;
  }

  /* ---------------------------------------------------------------- */
  /* 7. Homepage quick-quote mini form                                */
  /* ---------------------------------------------------------------- */
  function initQuickQuote() {
    const form = $('#quickQuote');
    if (!form) return;
    const msg = $('#quickQuoteMsg');

    $$('[required], [data-type="phone"]', form).forEach(function (field) {
      field.addEventListener('blur', () => validateField(field));
      field.addEventListener('input', function () {
        const g = field.closest('.field');
        if (g && g.classList.contains('has-error')) validateField(field);
      });
    });

    form.addEventListener('submit', function (e) {
      e.preventDefault();
      const fields = $$('[required], [data-type="phone"]', form);
      let ok = true, first = null;
      fields.forEach(function (f) {
        const v = validateField(f);
        if (!v && !first) first = f;
        if (!v) ok = false;
      });
      if (!ok) { if (first) first.focus(); return; }

      // Demo only — no data is sent.
      if (msg) {
        msg.textContent = 'Thanks! We got your request and will call you shortly about your free estimate.';
        msg.classList.add('show');
      }
      form.reset();
    });
  }

  /* ---------------------------------------------------------------- */
  /* 8. Full booking / contact form                                   */
  /* ---------------------------------------------------------------- */
  function initBookingForm() {
    const form = $('#quoteForm');
    if (!form) return;
    const successBox = $('#formSuccess');

    $$('[required], [data-type="phone"]', form).forEach(function (field) {
      field.addEventListener('blur', () => validateField(field));
      field.addEventListener('input', function () {
        const g = field.closest('.field-group') || field.closest('.checkbox-row');
        if (g && g.classList.contains('has-error')) validateField(field);
      });
    });

    form.addEventListener('submit', function (e) {
      e.preventDefault();
      const fields = $$('[required], [data-type="phone"]', form);
      let ok = true, first = null;
      fields.forEach(function (f) {
        const v = validateField(f);
        if (!v && !first) first = f;
        if (!v) ok = false;
      });
      if (!ok) { if (first) first.focus(); return; }

      // Demo only — no data is actually sent.
      if (successBox) {
        form.style.display = 'none';
        successBox.classList.add('show');
        successBox.scrollIntoView({ behavior: 'smooth', block: 'center' });
      }
      form.reset();
    });

    const again = $('#sendAnother');
    if (again && successBox) {
      again.addEventListener('click', function () {
        successBox.classList.remove('show');
        form.style.display = '';
        form.scrollIntoView({ behavior: 'smooth', block: 'center' });
      });
    }
  }

  /* ---------------------------------------------------------------- */
  /* 9. Scroll reveal animations                                      */
  /* ---------------------------------------------------------------- */
  function initReveal() {
    const reveals = $$('.reveal');
    if (!reveals.length) return;
    if (!('IntersectionObserver' in window)) {
      reveals.forEach((el) => el.classList.add('visible'));
      return;
    }
    const io = new IntersectionObserver(function (entries, obs) {
      entries.forEach(function (entry) {
        if (entry.isIntersecting) {
          const delay = entry.target.dataset.delay || 0;
          setTimeout(() => entry.target.classList.add('visible'), Number(delay));
          obs.unobserve(entry.target);
        }
      });
    }, { threshold: 0.12, rootMargin: '0px 0px -40px 0px' });
    reveals.forEach((el) => io.observe(el));
  }

  /* ---------------------------------------------------------------- */
  /* 10. Footer year                                                  */
  /* ---------------------------------------------------------------- */
  function initYear() {
    const el = $('#currentYear');
    if (el) el.textContent = new Date().getFullYear();
  }

  /* ---------------------------------------------------------------- */
  document.addEventListener('DOMContentLoaded', function () {
    initMobileNav();
    initStickyHeader();
    initActiveNav();
    initSmoothScroll();
    initBackToTop();
    initFaq();
    initQuickQuote();
    initBookingForm();
    initReveal();
    initYear();
  });
})();
