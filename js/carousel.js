/* Carrossel: rolagem nativa com snap (funciona com toque, mouse e teclado).
   Atributos: data-per (itens visíveis), data-autoplay="5000" (ms), data-loop */
(() => {
  'use strict';
  const reduceMotion = window.matchMedia('(prefers-reduced-motion: reduce)');

  class Carousel {
    constructor(el) {
      this.el = el;
      this.viewport = el.querySelector('.carousel__viewport');
      this.track = el.querySelector('.carousel__track');
      this.slides = [...el.querySelectorAll('.carousel__slide')];
      this.prev = el.querySelector('[data-prev]');
      this.next = el.querySelector('[data-next]');
      this.dotsEl = el.querySelector('.carousel__dots');
      this.loop = el.hasAttribute('data-loop');
      this.delay = parseInt(el.dataset.autoplay, 10) || 0;
      this.index = 0;
      this.hovering = false;
      this.stopped = false;
      this.visible = true;

      this.measure();
      this.bind();
      this.update();
      if (this.delay && !reduceMotion.matches) this.startAutoplay();
    }

    measure() {
      const cs = getComputedStyle(this.el);
      this.per = Math.max(1, parseInt(cs.getPropertyValue('--per'), 10) || 1);
      this.gap = parseFloat(getComputedStyle(this.track).columnGap) || 0;
      this.step = this.slides[0].offsetWidth + this.gap;
      this.max = Math.max(0, this.slides.length - this.per);
      const pages = this.max + 1;
      this.el.toggleAttribute('data-static', pages <= 1);
      if (this.dotsEl && this.dotsEl.children.length !== pages) this.buildDots(pages);
    }

    buildDots(pages) {
      this.dotsEl.textContent = '';
      for (let i = 0; i < pages; i++) {
        const b = document.createElement('button');
        b.type = 'button';
        b.className = 'carousel__dot';
        b.setAttribute('aria-label', `Ir para o slide ${i + 1}`);
        b.addEventListener('click', () => { this.interact(); this.goTo(i); });
        this.dotsEl.appendChild(b);
      }
    }

    goTo(i) {
      this.index = Math.min(this.max, Math.max(0, i));
      this.viewport.scrollTo({ left: this.index * this.step, behavior: reduceMotion.matches ? 'auto' : 'smooth' });
      this.update();
    }

    move(dir) {
      const n = this.index + dir;
      if (this.loop) this.goTo(n > this.max ? 0 : n < 0 ? this.max : n);
      else this.goTo(n);
    }

    update() {
      this.dotsEl?.querySelectorAll('.carousel__dot').forEach((d, k) => {
        d.setAttribute('aria-current', String(k === this.index));
      });
      if (this.prev) this.prev.disabled = !this.loop && this.index <= 0;
      if (this.next) this.next.disabled = !this.loop && this.index >= this.max;
    }

    interact() { this.stopped = true; this.stopAutoplay(); }

    bind() {
      this.prev?.addEventListener('click', () => { this.interact(); this.move(-1); });
      this.next?.addEventListener('click', () => { this.interact(); this.move(1); });

      // Sincroniza o índice quando o usuário arrasta ou rola
      let raf = 0;
      this.viewport.addEventListener('scroll', () => {
        cancelAnimationFrame(raf);
        raf = requestAnimationFrame(() => {
          const i = Math.min(this.max, Math.max(0, Math.round(this.viewport.scrollLeft / this.step)));
          if (i !== this.index) { this.index = i; this.update(); }
        });
      }, { passive: true });

      // Setas do teclado no carrossel focado
      this.viewport.addEventListener('keydown', e => {
        if (e.key === 'ArrowRight') { e.preventDefault(); this.interact(); this.move(1); }
        if (e.key === 'ArrowLeft')  { e.preventDefault(); this.interact(); this.move(-1); }
      });

      // Reage a mudanças de largura (girar tela, redimensionar)
      let last = this.viewport.clientWidth;
      new ResizeObserver(() => {
        if (this.viewport.clientWidth === last) return;
        last = this.viewport.clientWidth;
        this.measure();
        this.viewport.scrollTo({ left: Math.min(this.index, this.max) * this.step, behavior: 'auto' });
        this.update();
      }).observe(this.viewport);

      if (this.delay) {
        // Pausa ao passar o mouse / focar; interrupção definitiva ao tocar ou arrastar
        this.el.addEventListener('pointerenter', e => { if (e.pointerType === 'mouse') this.hovering = true; });
        this.el.addEventListener('pointerleave', () => { this.hovering = false; });
        this.el.addEventListener('focusin', () => { this.hovering = true; });
        this.el.addEventListener('focusout', () => { this.hovering = false; });
        this.viewport.addEventListener('touchstart', () => this.interact(), { passive: true });
        this.viewport.addEventListener('wheel', () => this.interact(), { passive: true });

        document.addEventListener('visibilitychange', () => { this.visible = !document.hidden; });
        new IntersectionObserver(([en]) => { this.visible = en.isIntersecting; }, { threshold: .4 }).observe(this.el);
      }
    }

    startAutoplay() {
      this.timer = setInterval(() => {
        if (this.stopped || this.hovering || !this.visible) return;
        this.move(1);
      }, this.delay);
    }
    stopAutoplay() { clearInterval(this.timer); }
  }

  document.querySelectorAll('[data-carousel]').forEach(el => new Carousel(el));
})();
