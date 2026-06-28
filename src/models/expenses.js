import { store } from '../core/store.js';
import { generateId } from '../core/id.js';
import { today } from '../core/dates.js';

export function getAll() {
  return store.getState().expenses;
}

export function getByMonth(month) {
  return getAll().filter(e => e.date.startsWith(month));
}

export function add({ amount, date, categoryId, store: storeName, paymentMethod, note }) {
  const now = new Date().toISOString();
  const expense = {
    id: generateId(),
    amount,
    date: date || today(),
    categoryId: categoryId || null,
    store: storeName || '',
    paymentMethod: paymentMethod || 'pix',
    note: note || '',
    receiptImageId: null,
    installmentPlanId: null,
    createdAt: now,
    updatedAt: now,
  };
  store.set('expenses', [...store.getState().expenses, expense]);
  return expense;
}

export function update(id, fields) {
  const updated = store.getState().expenses.map(e =>
    e.id === id ? { ...e, ...fields, updatedAt: new Date().toISOString() } : e
  );
  store.set('expenses', updated);
}

export function remove(id) {
  store.set('expenses', store.getState().expenses.filter(e => e.id !== id));
}
