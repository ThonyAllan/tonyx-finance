import { store } from '../core/store.js';
import { parseBRL, formatBRL, centsToInput } from '../core/money.js';
import { exportJSON, importJSON } from '../services/backup.js';

let _container = null;

export function render(container) {
  _container = container;
  _paint();
  store.subscribe('settings', () => _paint());
}

function _applyTheme(theme) {
  const html = document.documentElement;
  if (theme === 'system') {
    delete html.dataset.theme;
  } else {
    html.dataset.theme = theme;
  }
  store.setSetting('theme', theme);
}

function _paint() {
  const settings = store.getState().settings;
  const theme = settings.theme ?? 'system';
  const openingBalance = settings.openingBalance ?? 0;

  _container.innerHTML = `
    <div class="wordmark-header">
      <img src="./assets/icons/tonyx-wordmark.svg" alt="Tonyx Finance" />
    </div>

    <div style="padding: 0 var(--space-4)">
      <h1 style="margin-bottom: var(--space-4)">Ajustes</h1>

      <!-- Appearance -->
      <p class="text-muted" style="margin-bottom: var(--space-2); text-transform:uppercase; letter-spacing:.05em">Aparência</p>
      <div class="settings-section">
        <div class="settings-row">
          <div>
            <div class="settings-row__label">Tema</div>
          </div>
          <div style="display:flex; gap: var(--space-2)">
            ${_themeBtn('system', 'Auto', theme)}
            ${_themeBtn('light', '☀️', theme)}
            ${_themeBtn('dark', '🌙', theme)}
          </div>
        </div>
      </div>

      <!-- Finance -->
      <p class="text-muted" style="margin-bottom: var(--space-2); text-transform:uppercase; letter-spacing:.05em">Finanças</p>
      <div class="settings-section">
        <div class="settings-row" style="flex-direction:column; align-items:flex-start; gap: var(--space-2)">
          <div class="settings-row__label">Saldo inicial</div>
          <div class="settings-row__sub">Patrimônio que você já tinha antes de começar a usar o app.</div>
          <div style="display:flex; gap: var(--space-2); width:100%; align-items:center">
            <input id="opening-balance" type="text" inputmode="decimal"
                   value="${centsToInput(openingBalance)}"
                   style="flex:1; min-height:44px"
                   placeholder="0,00" />
            <button class="btn btn-primary btn-sm" id="save-balance">Salvar</button>
          </div>
        </div>
      </div>

      <!-- Backup -->
      <p class="text-muted" style="margin-bottom: var(--space-2); text-transform:uppercase; letter-spacing:.05em">Backup</p>
      <div class="settings-section">
        <div class="settings-row">
          <div>
            <div class="settings-row__label">Exportar dados</div>
            <div class="settings-row__sub">Baixar arquivo .json com todos os lançamentos.</div>
          </div>
          <button class="btn btn-ghost btn-sm" id="export-btn">Exportar</button>
        </div>
        <div class="settings-row">
          <div>
            <div class="settings-row__label">Importar dados</div>
            <div class="settings-row__sub">Restaurar a partir de um arquivo de backup.</div>
          </div>
          <button class="btn btn-ghost btn-sm" id="import-btn">Importar</button>
          <input type="file" id="import-file" accept=".json" style="display:none" />
        </div>
      </div>

      <!-- App info -->
      <p class="text-muted" style="margin-bottom: var(--space-2); text-transform:uppercase; letter-spacing:.05em">Sobre</p>
      <div class="settings-section">
        <div class="settings-row">
          <div class="settings-row__label">Tonyx Finance</div>
          <div class="text-muted">v0.1 MVP</div>
        </div>
      </div>
    </div>
  `;

  // Theme buttons
  _container.querySelectorAll('[data-theme-btn]').forEach(btn => {
    btn.addEventListener('click', () => _applyTheme(btn.dataset.themeBtn));
  });

  // Opening balance
  _container.querySelector('#save-balance').addEventListener('click', () => {
    const raw = _container.querySelector('#opening-balance').value;
    const cents = parseBRL(raw);
    if (isNaN(cents)) { alert('Informe um valor válido.'); return; }
    store.setSetting('openingBalance', cents);
  });

  // Export
  _container.querySelector('#export-btn').addEventListener('click', () => exportJSON());

  // Import
  const importBtn = _container.querySelector('#import-btn');
  const importFile = _container.querySelector('#import-file');
  importBtn.addEventListener('click', () => importFile.click());
  importFile.addEventListener('change', async e => {
    const file = e.target.files[0];
    if (!file) return;
    try {
      const ok = await importJSON(file);
      if (ok) alert('Backup importado com sucesso!');
    } catch (err) {
      alert('Erro ao importar: ' + err.message);
    }
    importFile.value = '';
  });
}

function _themeBtn(value, label, current) {
  const active = current === value
    ? 'background: var(--brand); color: #fff;'
    : 'background: var(--brand-soft); color: var(--brand);';
  return `<button class="btn btn-sm" style="${active}" data-theme-btn="${value}">${label}</button>`;
}
