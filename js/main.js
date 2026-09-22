document.addEventListener('DOMContentLoaded', () => {
  const menuToggle = document.querySelector('.menu-toggle');
  const navLinks = document.querySelector('.nav-links');
  const themeToggle = document.querySelector('.theme-toggle');
  const themeIcon = document.querySelector('.theme-icon');
  const themeColor = document.querySelector('meta[name="theme-color"]');

  const applyTheme = (theme, persist = false) => {
    const isDark = theme === 'dark';
    document.documentElement.dataset.theme = theme;
    document.documentElement.style.colorScheme = theme;

    if (themeIcon) themeIcon.textContent = isDark ? '☀' : '☾';
    if (themeToggle) {
      const label = isDark ? 'Switch to light theme' : 'Switch to dark theme';
      themeToggle.setAttribute('aria-label', label);
      themeToggle.setAttribute('title', label);
    }
    if (themeColor) themeColor.setAttribute('content', isDark ? '#0b0e13' : '#ffffff');

    if (persist) {
      try {
        localStorage.setItem('theme', theme);
      } catch (error) {
        // The selected theme still applies for this page when storage is unavailable.
      }
    }
  };

  applyTheme(document.documentElement.dataset.theme === 'light' ? 'light' : 'dark');

  if (themeToggle) {
    themeToggle.addEventListener('click', () => {
      const nextTheme = document.documentElement.dataset.theme === 'dark' ? 'light' : 'dark';
      applyTheme(nextTheme, true);
    });
  }

  const feedControls = document.querySelector('[data-feed-controls]');

  if (feedControls) {
    const searchInput = feedControls.querySelector('[data-post-search]');
    const filterButtons = Array.from(feedControls.querySelectorAll('[data-post-filter]'));
    const postItems = Array.from(document.querySelectorAll('[data-post-item]'));
    const yearGroups = Array.from(document.querySelectorAll('[data-year-group]'));
    const count = feedControls.querySelector('[data-post-count]');
    const empty = document.querySelector('[data-post-empty]');
    let activeFilter = 'all';

    const updateFeed = () => {
      const query = searchInput ? searchInput.value.trim().toLowerCase() : '';
      let visibleCount = 0;

      postItems.forEach((item) => {
        const tags = (item.dataset.tags || '').split(/\s+/);
        const matchesFilter = activeFilter === 'all' || tags.includes(activeFilter);
        const matchesSearch = !query || (item.dataset.search || '').includes(query);
        const visible = matchesFilter && matchesSearch;
        item.hidden = !visible;
        if (visible) visibleCount += 1;
      });

      yearGroups.forEach((group) => {
        group.hidden = !group.querySelector('[data-post-item]:not([hidden])');
      });

      if (count) count.textContent = `${visibleCount} ${visibleCount === 1 ? 'post' : 'posts'}`;
      if (empty) empty.hidden = visibleCount !== 0;
    };

    if (searchInput) searchInput.addEventListener('input', updateFeed);

    filterButtons.forEach((button) => {
      button.addEventListener('click', () => {
        activeFilter = button.dataset.postFilter || 'all';
        filterButtons.forEach((item) => {
          const selected = item === button;
          item.classList.toggle('active', selected);
          item.setAttribute('aria-pressed', String(selected));
        });
        updateFeed();
      });
    });

    updateFeed();
  }

  if (!menuToggle || !navLinks) return;

  const closeMenu = () => {
    navLinks.classList.remove('active');
    menuToggle.classList.remove('active');
    menuToggle.setAttribute('aria-expanded', 'false');
    menuToggle.setAttribute('aria-label', 'Open navigation');
  };

  menuToggle.addEventListener('click', () => {
    const isOpen = navLinks.classList.toggle('active');
    menuToggle.classList.toggle('active', isOpen);
    menuToggle.setAttribute('aria-expanded', String(isOpen));
    menuToggle.setAttribute('aria-label', isOpen ? 'Close navigation' : 'Open navigation');
  });

  navLinks.querySelectorAll('.nav-link').forEach((link) => {
    link.addEventListener('click', closeMenu);
  });

  document.addEventListener('keydown', (event) => {
    if (event.key === 'Escape' && navLinks.classList.contains('active')) {
      closeMenu();
      menuToggle.focus();
    }
  });
});
