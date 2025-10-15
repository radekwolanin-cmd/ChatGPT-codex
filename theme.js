(function () {
  const storageKey = 'taskpro-theme';
  const docEl = document.documentElement;

  function getCurrentTheme() {
    return docEl.getAttribute('data-theme') === 'dark' ? 'dark' : 'light';
  }

  function applyTheme(theme) {
    docEl.setAttribute('data-theme', theme === 'dark' ? 'dark' : 'light');
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
    const attr = docEl.getAttribute('data-theme');
    return attr === 'dark' ? 'dark' : 'light';
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

  function initThemeToggle() {
    document.querySelectorAll('[data-theme-toggle]').forEach((button) => {
      button.addEventListener('click', () => {
        const newTheme = getCurrentTheme() === 'dark' ? 'light' : 'dark';
        syncTheme(newTheme);
        safeLocalStorage('set', newTheme);
      });
    });
  }

  function initAccountMenus() {
    const entries = Array.from(document.querySelectorAll('[data-account]'))
      .map((wrapper) => {
        const toggle = wrapper.querySelector('[data-account-toggle]');
        const menu = wrapper.querySelector('[data-account-menu]');
        if (!toggle || !menu) {
          return null;
        }
        menu.hidden = true;
        toggle.setAttribute('aria-expanded', 'false');
        return { wrapper, toggle, menu };
      })
      .filter(Boolean);

    if (!entries.length) {
      return;
    }

    function closeEntry(entry) {
      if (entry.menu.hidden) {
        return;
      }
      entry.menu.hidden = true;
      entry.toggle.setAttribute('aria-expanded', 'false');
      entry.wrapper.classList.remove('account--open');
    }

    function closeAll(except) {
      entries.forEach((entry) => {
        if (except && entry === except) {
          return;
        }
        closeEntry(entry);
      });
    }

    entries.forEach((entry) => {
      const { wrapper, toggle, menu } = entry;

      toggle.addEventListener('click', (event) => {
        event.preventDefault();
        event.stopPropagation();
        if (menu.hidden) {
          closeAll();
          menu.hidden = false;
          wrapper.classList.add('account--open');
          toggle.setAttribute('aria-expanded', 'true');
          const firstItem = menu.querySelector('a, button');
          if (firstItem) {
            firstItem.focus();
          }
        } else {
          closeEntry(entry);
          toggle.focus();
        }
      });

      menu.addEventListener('click', () => {
        closeEntry(entry);
      });

      wrapper.addEventListener('keydown', (event) => {
        if (event.key === 'Escape') {
          closeEntry(entry);
          toggle.focus();
        }
      });
    });

    document.addEventListener('click', (event) => {
      const target = event.target;
      if (!entries.some((entry) => entry.wrapper.contains(target))) {
        closeAll();
      }
    });

    document.addEventListener('keydown', (event) => {
      if (event.key === 'Escape') {
        const openEntry = entries.find((entry) => !entry.menu.hidden);
        if (openEntry) {
          closeEntry(openEntry);
          openEntry.toggle.focus();
        } else {
          closeAll();
        }
      }
    });
  }

  document.addEventListener('DOMContentLoaded', () => {
    const initialTheme = determineInitialTheme();
    syncTheme(initialTheme);
    initThemeToggle();
    initAccountMenus();
  });
})();
