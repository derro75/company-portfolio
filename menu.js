document.addEventListener('DOMContentLoaded', function() {
  const arrow = document.querySelector('.mobile-arrow-guide');

  // Show after 3 seconds (for new visitors)
  setTimeout(() => {
    if (window.innerWidth <= 768) { // Mobile only
      arrow.style.opacity = '1';
      arrow.style.transition = 'opacity 0.5s ease';
    }
  }, 3000);

  // Or hide it if user clicks the menu (optional)
  document.querySelector('.mobile-menu-toggle').addEventListener('click', function() {
    arrow.style.opacity = '0';
  });
});