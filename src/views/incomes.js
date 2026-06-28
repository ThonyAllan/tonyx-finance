import { store } from '../core/store.js';
import { openModal } from '../components/modal.js';
import * as incomesModel from '../models/incomes.js';
import { getByKind, getById } from '../models/categories.js';
import { formatBRL, parseBRL, centsToInput } from '../core/money.js';
import { today, toDisplay, currentMonth, shiftMonth, monthLabel } from '../core/dates.js';

let _container = null;
let _month = currentMonth();

export function render(container) {
  _container = container;
  _paint();
  store.subscribe('incomes', () => _paint());
}

function _paint() {
  const incomes = incomesModel.getByMonth(_month);
  const total = incomes.reduce((s, i) => s + i.amount, 0);

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
        <div class="text-muted" style="margin-bottom: var(--space-1)">Total recebido</div>
        <div class="hero-amount" style="font-size:32px; color: var(--income)">${formatBRL(total)}</div>
      </div>

      <div class="section-header">
        <span class="section-title">Receitas</span>
        <span class="text-muted">${incomes.length} lançamento${incomes.length !== 1 ? 's' : ''}</span>
      </div>

      ${incomes.length === 0
        ? `<div class="empty-state">
             <div class="empty-state__icon">💰</div>
             <div class="empty-state__text">Nenhuma receita em ${monthLabel(_month)}.<br>Toque + para adicionar.</div>
           </div>`
        : `<div style="border-radius: var(--radius-md); overflow: hidden; box-shadow: var(--shadow-1)">
             ${incomes.slice().sort((a, b) => b.date.localeCompare(a.date)).map(i => _renderItem(i)).join('')}
           </div>`
      }
    </div>

    <button class="fab" id="add-income" aria-label="Adicionar receita">+</button>
  `;

  _container.querySelector('#add-income').addEventListener('click', () => openIncomeModal());
  _container.querySelector('#prev-month').addEventListener('click', () => { _month = shiftMonth(_month, -1); _paint(); });
  _container.querySelector('#next-month').addEventListener('click', () => { _month = shiftMonth(_month, 1); _paint(); });

  _container.querySelectorAll('[data-edit]').forEach(btn =>
    btn.addEventListener('click', e => openIncomeModal(e.currentTarget.dataset.edit))
  );
  _container.querySelectorAll('[data-delete]').forEach(btn =>
    btn.addEventListener('click', e => _confirmDelete(e.currentTarget.dataset.delete))
  );
}

function _renderItem(income) {
  const cat = income.categoryId ? getById(income.categoryId) : null;
  const icon = cat?.icon ?? '💰';
  return `
    <div class="list-item">
      <div class="list-item__icon">${icon}</div>
      <div class="list-item__body">
        <div class="list-item__title">${income.source || cat?.name || 'Receita'}</div>
        <div class="list-item__sub">${toDisplay(income.date)}${income.note ? ' · ' + income.note : ''}</div>
      </div>
      <div style="display:flex; align-items:center; gap: var(--space-2)">
        <div class="list-item__amount income">${formatBRL(income.amount)}</div>
        <button class="btn-icon-danger" data-delete="${income.id}" aria-label="Excluir">✕</button>
        <button class="btn btn-ghost btn-sm" data-edit="${income.id}" aria-label="Editar">Editar</button>
      </div>
    </div>`;
}

function _confirmDelete(id) {
  if (confirm('Excluir esta receita?')) incomesModel.remove(id);
}

function openIncomeModal(editId = null) {
  const existing = editId ? incomesModel.getAll().find(i => i.id === editId) : null;
  const cats = getByKind('income');

  const { close } = openModal({
    title: existing ? 'Editar receita' : 'Nova receita',
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
          <label for="m-source">Origem</label>
          <input id="m-source" type="text" placeholder="Ex: Empresa XYZ, Cliente ABC"
                 value="${existing?.source ?? ''}" />
        </div>
        <div class="form-field">
          <label for="m-date">Data</label>
          <input id="m-date" type="date" value="${existing?.date ?? today()}" required />
        </div>
        <div class="form-field">
          <label for="m-note">Observação</label>
          <input id="m-note" type="text" placeholder="Opcional" value="${existing?.note ?? ''}" />
        </div>
        <button type="submit" class="btn btn-primary" style="width:100%">
          ${existing ? 'Salvar alterações' : 'Adicionar receita'}
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
          source: form.querySelector('#m-source').value.trim(),
          date: form.querySelector('#m-date').value,
          note: form.querySelector('#m-note').value.trim(),
        };
        if (existing) {
          incomesModel.update(editId, data);
        } else {
          // Switch to the month of the new entry so user sees it
          _month = data.date.slice(0, 7);
          incomesModel.add(data);
        }
        close();
      });
    },
  });
}
