(function () {
  const storageKey = 'taskpro-theme';

  function getCurrentTheme() {
    return document.documentElement.classList.contains('theme-dark') ? 'dark' : 'light';
  }

  function applyTheme(theme) {
    document.documentElement.classList.toggle('theme-dark', theme === 'dark');
    document.documentElement.classList.toggle('theme-light', theme === 'light');
  }

  function updateToggleButtons(theme) {
    const isDark = theme === 'dark';
    document.querySelectorAll('[data-theme-toggle]').forEach((button) => {
      button.setAttribute('aria-pressed', String(isDark));
      const icon = button.querySelector('.theme-toggle__icon');
      const label = button.querySelector('.theme-toggle__label');
      if (icon) {
        icon.textContent = isDark ? '☀️' : '🌙';
      }
      if (label) {
        label.textContent = isDark ? 'Light mode' : 'Dark mode';
      }
    });
  }

  function syncTheme(preferred) {
    applyTheme(preferred);
    updateToggleButtons(preferred);
  }

  function determineInitialTheme() {
    const stored = safeLocalStorage('get');
    if (stored) {
      return stored;
    }
    return document.documentElement.classList.contains('theme-dark') ? 'dark' : 'light';
  }

  function safeLocalStorage(action, value) {
    try {
      if (!('localStorage' in window)) {
        return null;
      }
      if (action === 'get') {
        return localStorage.getItem(storageKey);
      }
      if (action === 'set') {
        localStorage.setItem(storageKey, value);
      }
    } catch (error) {
      return null;
    }
    return null;
  }

  document.addEventListener('DOMContentLoaded', () => {
    const initialTheme = determineInitialTheme();
    syncTheme(initialTheme);

    document.querySelectorAll('[data-theme-toggle]').forEach((button) => {
      button.addEventListener('click', () => {
        const newTheme = getCurrentTheme() === 'dark' ? 'light' : 'dark';
        syncTheme(newTheme);
        safeLocalStorage('set', newTheme);
      });
    });
  });
})();
