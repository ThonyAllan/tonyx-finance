import { store } from '../core/store.js';
import { generateId } from '../core/id.js';

const DEFAULT_CATEGORIES = [
  // Receitas
  { name: 'Salário',        kind: 'income',  icon: '💼', color: '#1FB87A' },
  { name: 'Freelancer',     kind: 'income',  icon: '💻', color: '#1FB87A' },
  { name: 'Investimentos',  kind: 'income',  icon: '📈', color: '#1FB87A' },
  { name: 'PIX / Transfer.', kind: 'income', icon: '💸', color: '#1FB87A' },
  { name: 'Outros (receita)', kind: 'income', icon: '➕', color: '#1FB87A' },
  // Despesas
  { name: 'Alimentação',    kind: 'expense', icon: '🍔', color: '#F0445A' },
  { name: 'Transporte',     kind: 'expense', icon: '🚗', color: '#F0445A' },
  { name: 'Saúde',          kind: 'expense', icon: '🏥', color: '#F0445A' },
  { name: 'Moradia',        kind: 'expense', icon: '🏠', color: '#F0445A' },
  { name: 'Lazer',          kind: 'expense', icon: '🎉', color: '#F0445A' },
  { name: 'Educação',       kind: 'expense', icon: '📚', color: '#F0445A' },
  { name: 'Vestuário',      kind: 'expense', icon: '👕', color: '#F0445A' },
  { name: 'Contas/Assin.',  kind: 'expense', icon: '📱', color: '#F0445A' },
  { name: 'Outros (despesa)', kind: 'expense', icon: '🔖', color: '#F0445A' },
];

/** Seed default categories if none exist yet. */
export function seedDefaults() {
  const state = store.getState();
  if (state.categories.length > 0) return;
  const seeded = DEFAULT_CATEGORIES.map(c => ({
    ...c,
    id: generateId(),
    isDefault: true,
    parentId: null,
    createdAt: new Date().toISOString(),
  }));
  store.set('categories', seeded);
}

export function getAll() {
  return store.getState().categories;
}

export function getByKind(kind) {
  return getAll().filter(c => c.kind === kind || c.kind === 'both');
}

export function getById(id) {
  return getAll().find(c => c.id === id) ?? null;
}
