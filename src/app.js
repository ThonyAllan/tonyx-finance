import { router } from './router/router.js';
import { renderTabbar } from './components/tabbar.js';

const appEl = document.getElementById('app');
const contentEl = document.getElementById('view');

// Views are loaded lazily to keep bootstrap fast
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
