import { router } from '../router/router.js';

const TABS = [
  { path: '/dashboard',  icon: '⌂',  label: 'Início' },
  { path: '/income',     icon: '↕',  label: 'Lançamentos' },
  { path: '/expenses',   icon: '💳', label: 'Despesas' },
  { path: '/settings',   icon: '⚙',  label: 'Ajustes' },
];

export function renderTabbar(container) {
  const nav = document.createElement('nav');
  nav.className = 'tabbar';
  nav.setAttribute('role', 'tablist');
  nav.setAttribute('aria-label', 'Navegação principal');

  TABS.forEach(tab => {
    const btn = document.createElement('button');
    btn.className = 'tabbar__item';
    btn.setAttribute('role', 'tab');
    btn.setAttribute('aria-label', tab.label);
    btn.dataset.path = tab.path;
    btn.innerHTML = `
      <span class="tabbar__icon" aria-hidden="true">${tab.icon}</span>
      <span>${tab.label}</span>
    `;
    btn.addEventListener('click', () => router.navigate(tab.path));
    nav.appendChild(btn);
  });

  container.appendChild(nav);

  function syncActive() {
    const path = window.location.hash.replace(/^#/, '') || '/dashboard';
    nav.querySelectorAll('.tabbar__item').forEach(btn => {
      btn.setAttribute('aria-selected', btn.dataset.path === path ? 'true' : 'false');
    });
  }

  window.addEventListener('hashchange', syncActive);
  syncActive();
}
