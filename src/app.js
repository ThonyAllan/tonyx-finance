import { router } from './router/router.js';
import { renderTabbar } from './components/tabbar.js';
import { store } from './core/store.js';
import { load, save } from './core/db.js';
import { events } from './core/events.js';

// ── Bootstrap ────────────────────────────────────────────────────────────────

const state = load();
store.init(state);

// Persist every change automatically
store.subscribeAll(() => {
  save(store.getState());
});

// ── Views (lazy) ─────────────────────────────────────────────────────────────

const appEl = document.getElementById('app');
const contentEl = document.getElementById('view');

async function mountView(importFn) {
  const mod = await importFn();
  contentEl.innerHTML = '';
  mod.render(contentEl);
}

router
  .register('/dashboard', () => mountView(() => import('./views/dashboard.js')))
  .register('/income',    () => mountView(() => import('./views/incomes.js')))
  .register('/expenses',  () => mountView(() => import('./views/expenses.js')))
  .register('/settings',  () => mountView(() => import('./views/settings.js')))
  .start();

renderTabbar(appEl);
