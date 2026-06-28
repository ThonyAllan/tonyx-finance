import { store } from '../core/store.js';
import { load, save } from '../core/db.js';
import { migrate, CURRENT_SCHEMA_VERSION } from '../core/schema.js';
import { seedDefaults } from '../models/categories.js';

export function exportJSON() {
  const state = store.getState();
  const blob = new Blob([JSON.stringify(state, null, 2)], { type: 'application/json' });
  const url = URL.createObjectURL(blob);
  const a = document.createElement('a');
  const date = new Date().toISOString().slice(0, 10);
  a.href = url;
  a.download = `tonyx-finance-backup-${date}.json`;
  a.click();
  URL.revokeObjectURL(url);
}

export function importJSON(file) {
  return new Promise((resolve, reject) => {
    const reader = new FileReader();
    reader.onload = e => {
      try {
        let data = JSON.parse(e.target.result);
        if (!data.schemaVersion) throw new Error('Arquivo inválido: schemaVersion ausente.');
        data = migrate(data);
        if (!confirm('Importar este backup vai substituir todos os dados atuais. Continuar?')) {
          resolve(false);
          return;
        }
        save(data);
        store.init(data);
        // Re-emit all keys so subscribed views refresh
        ['settings', 'categories', 'incomes', 'expenses', 'debts'].forEach(k => {
          store.set(k, data[k]);
        });
        seedDefaults();
        resolve(true);
      } catch (err) {
        reject(err);
      }
    };
    reader.onerror = reject;
    reader.readAsText(file);
  });
}
