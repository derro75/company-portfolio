document.addEventListener('partials-loaded', function() {
  const toggleBtn = document.querySelector('.mobile-menu-toggle');
  const nav = document.querySelector('.front-nav');

  if (!toggleBtn || !nav) return;

  // Toggle nav visibility
  toggleBtn.addEventListener('click', () => {
    const isCollapsed = nav.classList.contains('collapsed');
    nav.classList.toggle('collapsed', !isCollapsed);

    // Optional: animate chevron or icon
    const img = toggleBtn.querySelector('img');
    if (img) {
      // You could swap to 'close.png' if you have one
      // Or rotate via CSS class
    }
  });

  // Toggle desktop-style dropdowns on mobile (touch-friendly)
  document.querySelectorAll('.dropdown-toggle').forEach(toggle => {
    toggle.addEventListener('click', function(e) {
      e.preventDefault();
      
      const menu = this.nextElementSibling;
      if (!menu || !menu.classList.contains('dropdown-menu')) return;

      const isExpanded = this.getAttribute('aria-expanded') === 'true';
      const newExpanded = !isExpanded;

      this.setAttribute('aria-expanded', newExpanded);
      menu.style.display = newExpanded ? 'flex' : 'none';

      // Optional: rotate chevron
      const chevron = this.querySelector('.bi-chevron-down');
      if (chevron) {
        chevron.style.transform = newExpanded ? 'rotate(180deg)' : 'rotate(0deg)';
      }
    });
  });
});