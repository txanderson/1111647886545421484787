/* Interface geral: cabeçalho, botão "voltar ao topo" e link ativo do menu */
(() => {
  'use strict';
  const header = document.querySelector('.site-header');
  const toTop = document.querySelector('.fab--up');
  const reduceMotion = window.matchMedia('(prefers-reduced-motion: reduce)');

  // Ano atual no rodapé
  document.querySelectorAll('[data-year]').forEach(el => { el.textContent = new Date().getFullYear(); });

  // Sombra do cabeçalho e botão de topo
  let ticking = false;
  const onScroll = () => {
    if (ticking) return;
    ticking = true;
    requestAnimationFrame(() => {
      const y = window.scrollY;
      header?.classList.toggle('is-scrolled', y > 8);
      if (toTop) toTop.hidden = y < 700;
      ticking = false;
    });
  };
  window.addEventListener('scroll', onScroll, { passive: true });
  onScroll();

  toTop?.addEventListener('click', () => {
    window.scrollTo({ top: 0, behavior: reduceMotion.matches ? 'auto' : 'smooth' });
  });

  // Logo (cabeçalho e rodapé) e item "Início": sempre voltam ao topo da página.
  // O link nativo #inicio não funciona direito porque o alvo é o próprio cabeçalho fixo.
  document.querySelectorAll('a[href="#inicio"]').forEach(a => {
    a.addEventListener('click', e => {
      e.preventDefault();
      window.scrollTo({ top: 0, behavior: reduceMotion.matches ? 'auto' : 'smooth' });
      history.replaceState(null, '', location.pathname + location.search);
    });
  });

  // Marca no menu a seção que está na tela
  const links = [...document.querySelectorAll('[data-nav]')];
  const sections = links
    .map(a => ({ a, el: document.getElementById(a.getAttribute('href').slice(1)) }))
    .filter(s => s.el);
  const setActive = () => {
    const mark = window.scrollY + window.innerHeight * 0.35;
    let current = sections[0];
    sections.forEach(s => {
      // "Início" aponta para o topo; as demais usam a posição da seção
      const top = s.el.classList.contains('site-header') ? 0 : s.el.getBoundingClientRect().top + window.scrollY;
      if (top <= mark) current = s;
    });
    links.forEach(l => l.removeAttribute('aria-current'));
    current?.a.setAttribute('aria-current', 'true');
  };
  window.addEventListener('scroll', () => requestAnimationFrame(setActive), { passive: true });
  window.addEventListener('resize', setActive);
  setActive();
})();
