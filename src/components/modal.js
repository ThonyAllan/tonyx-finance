/**
 * Bottom-sheet modal component.
 * Usage: openModal({ title, buildContent(formEl) }) → returns { close }
 */
export function openModal({ title, buildContent }) {
  // Backdrop
  const backdrop = document.createElement('div');
  backdrop.className = 'backdrop';

  // Sheet
  const sheet = document.createElement('div');
  sheet.className = 'bottom-sheet';
  sheet.setAttribute('role', 'dialog');
  sheet.setAttribute('aria-modal', 'true');
  sheet.setAttribute('aria-label', title);
  sheet.innerHTML = `
    <div class="bottom-sheet__handle"></div>
    <h2 class="bottom-sheet__title">${title}</h2>
  `;

  const formEl = document.createElement('form');
  formEl.addEventListener('submit', e => e.preventDefault());
  buildContent(formEl);
  sheet.appendChild(formEl);

  document.body.append(backdrop, sheet);

  // Animate in on next frame
  requestAnimationFrame(() => {
    backdrop.classList.add('visible');
    sheet.classList.add('visible');
  });

  function close() {
    backdrop.classList.remove('visible');
    sheet.classList.remove('visible');
    const onEnd = () => {
      backdrop.remove();
      sheet.remove();
    };
    sheet.addEventListener('transitionend', onEnd, { once: true });
  }

  backdrop.addEventListener('click', close);

  // Close on Escape
  function onKey(e) {
    if (e.key === 'Escape') { close(); document.removeEventListener('keydown', onKey); }
  }
  document.addEventListener('keydown', onKey);

  return { close };
}
