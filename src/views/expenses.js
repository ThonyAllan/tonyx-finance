import { store } from '../core/store.js';
import { openModal } from '../components/modal.js';
import * as expensesModel from '../models/expenses.js';
import { getByKind, getById } from '../models/categories.js';
import { formatBRL, parseBRL, centsToInput } from '../core/money.js';
import { today, toDisplay, currentMonth, shiftMonth, monthLabel } from '../core/dates.js';

const PAYMENT_LABELS = {
  pix: 'PIX', debit: 'Débito', credit: 'Crédito', cash: 'Dinheiro', boleto: 'Boleto',
};

let _container = null;
let _month = currentMonth();

export function render(container) {
  _container = container;
  _paint();
  store.subscribe('expenses', () => _paint());
}

function _paint() {
  const expenses = expensesModel.getByMonth(_month);
  const total = expenses.reduce((s, e) => s + e.amount, 0);

  _container.innerHTML = `
    <div class="wordmark-header">
      <img src="./assets/icons/tonyx-wordmark.svg" alt="Tonyx Finance" />
    </div>
    <div style="padding: 0 var(--space-4)">
      <div class="month-nav">
        <button class="month-nav__btn" id="prev-month" aria-label="Mês anterior">‹</button>
        <span class="month-nav__label">${monthLabel(_month)}</span>
        <button class="month-nav__btn" id="next-month" aria-label="Próximo mês">›</button>
      </div>

      <div class="card" style="margin-bottom: var(--space-4); text-align:center">
        <div class="text-muted" style="margin-bottom: var(--space-1)">Total gasto</div>
        <div class="hero-amount" style="font-size:32px; color: var(--expense)">${formatBRL(total)}</div>
      </div>

      <div class="section-header">
        <span class="section-title">Despesas</span>
        <span class="text-muted">${expenses.length} lançamento${expenses.length !== 1 ? 's' : ''}</span>
      </div>

      ${expenses.length === 0
        ? `<div class="empty-state">
             <div class="empty-state__icon">🧾</div>
             <div class="empty-state__text">Nenhuma despesa em ${monthLabel(_month)}.<br>Toque + para adicionar.</div>
           </div>`
        : `<div style="border-radius: var(--radius-md); overflow: hidden; box-shadow: var(--shadow-1)">
             ${expenses.slice().sort((a, b) => b.date.localeCompare(a.date)).map(e => _renderItem(e)).join('')}
           </div>`
      }
    </div>

    <button class="fab" id="add-expense" aria-label="Adicionar despesa">+</button>
  `;

  _container.querySelector('#add-expense').addEventListener('click', () => openExpenseModal());
  _container.querySelector('#prev-month').addEventListener('click', () => { _month = shiftMonth(_month, -1); _paint(); });
  _container.querySelector('#next-month').addEventListener('click', () => { _month = shiftMonth(_month, 1); _paint(); });

  _container.querySelectorAll('[data-edit]').forEach(btn =>
    btn.addEventListener('click', e => openExpenseModal(e.currentTarget.dataset.edit))
  );
  _container.querySelectorAll('[data-delete]').forEach(btn =>
    btn.addEventListener('click', e => _confirmDelete(e.currentTarget.dataset.delete))
  );
}

function _renderItem(expense) {
  const cat = expense.categoryId ? getById(expense.categoryId) : null;
  const icon = cat?.icon ?? '🧾';
  const pmLabel = PAYMENT_LABELS[expense.paymentMethod] ?? expense.paymentMethod;
  return `
    <div class="list-item">
      <div class="list-item__icon">${icon}</div>
      <div class="list-item__body">
        <div class="list-item__title">${expense.store || cat?.name || 'Despesa'}</div>
        <div class="list-item__sub">${toDisplay(expense.date)} · ${pmLabel}${expense.note ? ' · ' + expense.note : ''}</div>
      </div>
      <div style="display:flex; align-items:center; gap: var(--space-2)">
        <div class="list-item__amount expense">−${formatBRL(expense.amount)}</div>
        <button class="btn-icon-danger" data-delete="${expense.id}" aria-label="Excluir">✕</button>
        <button class="btn btn-ghost btn-sm" data-edit="${expense.id}" aria-label="Editar">Editar</button>
      </div>
    </div>`;
}

function _confirmDelete(id) {
  if (confirm('Excluir esta despesa?')) expensesModel.remove(id);
}

function openExpenseModal(editId = null) {
  const existing = editId ? expensesModel.getAll().find(e => e.id === editId) : null;
  const cats = getByKind('expense');

  const { close } = openModal({
    title: existing ? 'Editar despesa' : 'Nova despesa',
    buildContent(form) {
      form.innerHTML = `
        <div class="form-field">
          <label for="m-amount">Valor (R$)</label>
          <input class="input-amount" id="m-amount" type="text" inputmode="decimal"
                 placeholder="0,00" value="${existing ? centsToInput(existing.amount) : ''}" required />
        </div>
        <div class="form-field">
          <label for="m-cat">Categoria</label>
          <select id="m-cat">
            ${cats.map(c => `<option value="${c.id}" ${existing?.categoryId === c.id ? 'selected' : ''}>${c.icon} ${c.name}</option>`).join('')}
          </select>
        </div>
        <div class="form-field">
          <label for="m-store">Estabelecimento</label>
          <input id="m-store" type="text" placeholder="Ex: Supermercado, iFood…"
                 value="${existing?.store ?? ''}" />
        </div>
        <div class="form-field">
          <label for="m-date">Data</label>
          <input id="m-date" type="date" value="${existing?.date ?? today()}" required />
        </div>
        <div class="form-field">
          <label for="m-pm">Forma de pagamento</label>
          <select id="m-pm">
            ${Object.entries(PAYMENT_LABELS).map(([v, l]) =>
              `<option value="${v}" ${existing?.paymentMethod === v ? 'selected' : ''}>${l}</option>`
            ).join('')}
          </select>
        </div>
        <div class="form-field">
          <label for="m-note">Observação</label>
          <input id="m-note" type="text" placeholder="Opcional" value="${existing?.note ?? ''}" />
        </div>
        <button type="submit" class="btn btn-primary" style="width:100%">
          ${existing ? 'Salvar alterações' : 'Adicionar despesa'}
        </button>
      `;

      form.addEventListener('submit', () => {
        const amountCents = parseBRL(form.querySelector('#m-amount').value);
        if (isNaN(amountCents) || amountCents <= 0) {
          alert('Informe um valor válido.');
          return;
        }
        const data = {
          amount: amountCents,
          categoryId: form.querySelector('#m-cat').value || null,
          store: form.querySelector('#m-store').value.trim(),
          date: form.querySelector('#m-date').value,
          paymentMethod: form.querySelector('#m-pm').value,
          note: form.querySelector('#m-note').value.trim(),
        };
        if (existing) {
          expensesModel.update(editId, data);
        } else {
          _month = data.date.slice(0, 7);
          expensesModel.add(data);
        }
        close();
      });
    },
  });
}
