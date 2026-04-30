// js/ui.js

// ── Theme ──────────────────────────────────────────────────
export function initTheme() {
  const saved = localStorage.getItem('pt-theme') || 'light';
  applyTheme(saved);
}

export function applyTheme(theme) {
  document.documentElement.setAttribute('data-theme', theme);
  localStorage.setItem('pt-theme', theme);
  document.querySelectorAll('.theme-btn').forEach(btn => {
    btn.classList.toggle('active', btn.dataset.theme === theme);
  });
}

export function setupThemeButtons() {
  document.querySelectorAll('.theme-btn').forEach(btn => {
    btn.addEventListener('click', () => applyTheme(btn.dataset.theme));
  });
}

// ── Toast ──────────────────────────────────────────────────
export function showToast(message, type = 'info', duration = 3500) {
  let container = document.querySelector('.toast-container');
  if (!container) {
    container = document.createElement('div');
    container.className = 'toast-container';
    document.body.appendChild(container);
  }
  const icons = { success: '✓', error: '✕', info: 'ℹ' };
  const toast = document.createElement('div');
  toast.className = `toast ${type}`;
  toast.innerHTML = `<span>${icons[type] || icons.info}</span><span>${message}</span>`;
  container.appendChild(toast);
  setTimeout(() => {
    toast.style.animation = 'fadeOut 0.3s ease forwards';
    setTimeout(() => toast.remove(), 300);
  }, duration);
}

// ── Modal ──────────────────────────────────────────────────
export function openModal(id) {
  document.getElementById(id)?.classList.add('open');
}
export function closeModal(id) {
  document.getElementById(id)?.classList.remove('open');
}
export function setupModals() {
  document.querySelectorAll('.modal-overlay').forEach(overlay => {
    overlay.addEventListener('click', e => {
      if (e.target === overlay) overlay.classList.remove('open');
    });
  });
  document.querySelectorAll('.modal-close').forEach(btn => {
    btn.addEventListener('click', () => btn.closest('.modal-overlay')?.classList.remove('open'));
  });
}

// ── Dropdown ───────────────────────────────────────────────
export function setupDropdowns() {
  document.querySelectorAll('.dropdown').forEach(dropdown => {
    const trigger = dropdown.querySelector('[data-dropdown-trigger]');
    const menu = dropdown.querySelector('.dropdown-menu');
    trigger?.addEventListener('click', e => {
      e.stopPropagation();
      menu?.classList.toggle('open');
    });
  });
  document.addEventListener('click', () => {
    document.querySelectorAll('.dropdown-menu.open').forEach(m => m.classList.remove('open'));
  });
}

// ── Skeleton loaders ────────────────────────────────────────
export function renderSkeletons(container, count = 12) {
  container.innerHTML = Array.from({ length: count }, () => `
    <div class="book-skeleton">
      <div class="skeleton-cover"></div>
      <div class="skeleton-info">
        <div class="skeleton-line"></div>
        <div class="skeleton-line"></div>
      </div>
    </div>`).join('');
}

// ── Panels ─────────────────────────────────────────────────
export function openPanel(id) {
  document.getElementById(id)?.classList.add('open');
}
export function closePanel(id) {
  document.getElementById(id)?.classList.remove('open');
}
