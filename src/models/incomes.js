import { store } from '../core/store.js';
import { generateId } from '../core/id.js';
import { today } from '../core/dates.js';

export function getAll() {
  return store.getState().incomes;
}

export function getByMonth(month) {
  return getAll().filter(i => i.date.startsWith(month));
}

export function add({ amount, date, categoryId, source, note }) {
  const now = new Date().toISOString();
  const income = {
    id: generateId(),
    amount,
    date: date || today(),
    source: source || '',
    categoryId: categoryId || null,
    note: note || '',
    createdAt: now,
    updatedAt: now,
  };
  store.set('incomes', [...store.getState().incomes, income]);
  return income;
}

export function update(id, fields) {
  const updated = store.getState().incomes.map(i =>
    i.id === id ? { ...i, ...fields, updatedAt: new Date().toISOString() } : i
  );
  store.set('incomes', updated);
}

export function remove(id) {
  store.set('incomes', store.getState().incomes.filter(i => i.id !== id));
}
