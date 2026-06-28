export const CURRENT_SCHEMA_VERSION = 1;

export const STORAGE_KEY = 'afp:data';

/** Returns a brand-new empty root state */
export function emptyState() {
  return {
    schemaVersion: CURRENT_SCHEMA_VERSION,
    settings: {
      theme: 'system',
      currency: 'BRL',
      locale: 'pt-BR',
      openingBalance: 0,
    },
    categories: [],
    incomes: [],
    expenses: [],
    debts: [],
    installmentPlans: [],
    recurringBills: [],
    meta: {
      createdAt: new Date().toISOString(),
      updatedAt: new Date().toISOString(),
    },
  };
}

/**
 * Apply schema migrations if needed.
 * Always returns a state at CURRENT_SCHEMA_VERSION.
 */
export function migrate(data) {
  let state = data;
  // Future migrations go here as `if (state.schemaVersion < N) { ... state.schemaVersion = N; }`
  state.schemaVersion = CURRENT_SCHEMA_VERSION;
  return state;
}
