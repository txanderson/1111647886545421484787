/* Menu hambúrguer (tablet e celular, até 1024 px) */
(() => {
  'use strict';
  const burger = document.querySelector('.burger');
  const nav = document.getElementById('menu');
  if (!burger || !nav) return;

  const desktop = window.matchMedia('(min-width: 1025px)');

  const setOpen = (open, returnFocus = false) => {
    nav.classList.toggle('is-open', open);
    burger.setAttribute('aria-expanded', String(open));
    burger.setAttribute('aria-label', open ? 'Fechar menu' : 'Abrir menu');
    if (!open && returnFocus) burger.focus();
  };

  burger.addEventListener('click', () => setOpen(!nav.classList.contains('is-open')));

  // Fecha ao escolher um item
  nav.addEventListener('click', e => { if (e.target.closest('a')) setOpen(false); });

  // Fecha com Esc
  document.addEventListener('keydown', e => {
    if (e.key === 'Escape' && nav.classList.contains('is-open')) setOpen(false, true);
  });

  // Fecha ao tocar fora do cabeçalho
  document.addEventListener('click', e => {
    if (nav.classList.contains('is-open') && !e.target.closest('.site-header')) setOpen(false);
  });

  // Ao voltar para desktop, restaura o estado
  desktop.addEventListener('change', e => { if (e.matches) setOpen(false); });
})();
