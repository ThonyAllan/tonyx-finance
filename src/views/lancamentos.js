import { render as renderIncomes } from './incomes.js';
import { render as renderExpenses } from './expenses.js';

let _container = null;
let _active = 'expense'; // default to expenses (most frequent action)

export function render(container) {
  _container = container;
  _paint();
}

function _paint() {
  _container.innerHTML = `
    <div style="position:sticky; top:0; background: var(--bg); z-index:10;
                padding: calc(env(safe-area-inset-top) + var(--space-2)) var(--space-4) var(--space-2)">
      <div style="display:flex; background: var(--surface); border-radius: var(--radius-full);
                  padding: 3px; box-shadow: var(--shadow-1)">
        <button class="segment-btn ${_active === 'income' ? 'active' : ''}"
                data-seg="income" style="flex:1">💰 Receitas</button>
        <button class="segment-btn ${_active === 'expense' ? 'active' : ''}"
                data-seg="expense" style="flex:1">💳 Despesas</button>
      </div>
    </div>
    <div id="segment-content"></div>
  `;

  // Inline styles for segment buttons (uses tokens via CSS vars)
  _container.querySelectorAll('.segment-btn').forEach(btn => {
    Object.assign(btn.style, {
      padding: 'var(--space-2) var(--space-4)',
      borderRadius: 'var(--radius-full)',
      fontWeight: '600',
      fontSize: 'var(--font-caption)',
      minHeight: '36px',
      transition: 'background var(--duration-fast), color var(--duration-fast)',
      background: btn.classList.contains('active') ? 'var(--brand)' : 'transparent',
      color: btn.classList.contains('active') ? '#fff' : 'var(--muted)',
    });
    btn.addEventListener('click', () => {
      _active = btn.dataset.seg;
      _paint();
    });
  });

  const contentEl = _container.querySelector('#segment-content');
  if (_active === 'income') {
    renderIncomes(contentEl);
  } else {
    renderExpenses(contentEl);
  }
}
