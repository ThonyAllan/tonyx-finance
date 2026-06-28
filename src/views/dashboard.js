export function render(container) {
  container.innerHTML = `
    <div class="wordmark-header">
      <img src="/assets/icons/tonyx-wordmark.svg" alt="Tonyx Finance" />
    </div>
    <div class="view" style="padding-top:0">
      <div class="empty-state">
        <div class="empty-state__icon">📊</div>
        <div class="empty-state__text">Carregando dashboard…</div>
      </div>
    </div>`;
}
