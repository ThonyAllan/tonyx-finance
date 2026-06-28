import { store } from '../core/store.js';
import { computeDashboard } from '../services/analytics.js';
import { formatBRL } from '../core/money.js';
import { toDisplay, monthLabel, currentMonth } from '../core/dates.js';
import { getById } from '../models/categories.js';

let _container = null;

export function render(container) {
  _container = container;
  _paint();
  // Re-paint when incomes or expenses change
  store.subscribe('incomes', () => _paint());
  store.subscribe('expenses', () => _paint());
  store.subscribe('settings', () => _paint());
}

function _paint() {
  const d = computeDashboard();

  const balanceSign = d.balance >= 0 ? '' : '−';
  const balanceAbs = Math.abs(d.balance);
  const balanceColor = d.balance >= 0 ? 'var(--ink)' : 'var(--expense)';

  const month = currentMonth();
  const expDiff = d.totalExpenseMonth - d.totalExpensePrev;
  const deltaSign = expDiff > 0 ? '+' : expDiff < 0 ? '−' : '';
  const deltaColor = expDiff > 0 ? 'var(--expense)' : 'var(--income)';

  _container.innerHTML = `
    <div class="wordmark-header">
      <img src="./assets/icons/tonyx-wordmark.svg" alt="Tonyx Finance" />
    </div>

    <div style="padding: 0 var(--space-4)">
      <!-- Balance hero -->
      <div style="text-align:center; padding: var(--space-6) 0 var(--space-4)">
        <div class="text-muted" style="margin-bottom: var(--space-2); font-size: var(--font-caption); text-transform: uppercase; letter-spacing:.05em">Saldo disponível</div>
        <div id="balance-hero" class="hero-amount numeric" style="color:${balanceColor}" aria-live="polite">
          ${balanceSign}${formatBRL(balanceAbs)}
        </div>
        ${expDiff !== 0 ? `
          <div style="margin-top: var(--space-2); font-size: var(--font-caption); color: ${deltaColor}; font-weight:600">
            ${deltaSign}${formatBRL(Math.abs(expDiff))} em gastos vs. mês anterior
          </div>` : ''}
      </div>

      <!-- Summary grid -->
      <div class="summary-grid">
        ${_chip('Gasto no mês', formatBRL(d.totalExpenseMonth), 'expense')}
        ${_chip('Recebido no mês', formatBRL(d.totalIncomeMonth), 'income')}
        ${_chip('Total em dívidas', formatBRL(d.totalDebt), d.totalDebt > 0 ? 'expense' : '')}
        ${_chip('Patrimônio líquido', formatBRL(d.netWorth), d.netWorth >= 0 ? 'income' : 'expense')}
        ${_chip('Contas pendentes', d.pendingCount, d.pendingCount > 0 ? 'warning' : '')}
        ${_chip('Vencendo hoje', d.todayDue, d.todayDue > 0 ? 'warning' : '')}
        ${d.topCategory ? _chip('Maior gasto', d.topCategory.icon + ' ' + d.topCategory.name, '') : _chip('Maior gasto', '—', '')}
        ${_chip('Próx. vencimento', d.nextDue ? toDisplay(d.nextDue) : '—', '')}
      </div>

      <!-- Recent transactions -->
      <div class="section-header">
        <span class="section-title">Lançamentos recentes</span>
      </div>

      ${d.recent.length === 0
        ? `<div class="empty-state" style="padding: var(--space-8) var(--space-4)">
             <div class="empty-state__icon">📋</div>
             <div class="empty-state__text">Nenhum lançamento ainda.<br>Toque em Receitas ou Despesas para começar.</div>
           </div>`
        : `<div style="border-radius: var(--radius-md); overflow: hidden; box-shadow: var(--shadow-1)">
             ${d.recent.map(_renderTransaction).join('')}
           </div>`
      }
    </div>
  `;

  // Count-up animation for balance
  _animateBalance(d.balance);
}

function _chip(label, value, colorClass) {
  const valClass = colorClass ? ` ${colorClass}` : '';
  return `
    <div class="summary-chip">
      <div class="summary-chip__label">${label}</div>
      <div class="summary-chip__value${valClass}">${value}</div>
    </div>`;
}

function _renderTransaction(tx) {
  const cat = tx.categoryId ? getById(tx.categoryId) : null;
  const icon = cat?.icon ?? (tx._type === 'income' ? '💰' : '🧾');
  const name = tx._type === 'income'
    ? (tx.source || cat?.name || 'Receita')
    : (tx.store || cat?.name || 'Despesa');
  const sign = tx._type === 'income' ? '+' : '−';
  const cls  = tx._type === 'income' ? 'income' : 'expense';
  return `
    <div class="list-item">
      <div class="list-item__icon">${icon}</div>
      <div class="list-item__body">
        <div class="list-item__title">${name}</div>
        <div class="list-item__sub">${toDisplay(tx.date)}</div>
      </div>
      <div class="list-item__amount ${cls}">${sign}${formatBRL(tx.amount)}</div>
    </div>`;
}

function _animateBalance(targetCents) {
  const el = _container.querySelector('#balance-hero');
  if (!el) return;

  // Respect reduced motion preference
  if (window.matchMedia('(prefers-reduced-motion: reduce)').matches) return;

  const duration = 600;
  const start = performance.now();
  const sign = targetCents < 0 ? '−' : '';
  const abs = Math.abs(targetCents);

  function tick(now) {
    const elapsed = now - start;
    const progress = Math.min(elapsed / duration, 1);
    // ease-out cubic
    const eased = 1 - Math.pow(1 - progress, 3);
    const current = Math.round(abs * eased);
    el.textContent = sign + formatBRL(current);
    if (progress < 1) requestAnimationFrame(tick);
    else el.textContent = sign + formatBRL(abs);
  }

  requestAnimationFrame(tick);
}
