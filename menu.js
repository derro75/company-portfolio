// Mobile Menu Toggle
function initMobileMenu() {
  const mobileMenu = document.getElementById('mobile-menu');
  const mobileMenuToggle = document.querySelector('.mobile-menu-toggle'); // Changed from .hamburger
  const closeBtn = document.querySelector('.close-btn');
  const mobileServicesToggle = document.querySelector('.mobile-services-toggle');

  // Open mobile menu
  if (mobileMenuToggle) {
    mobileMenuToggle.addEventListener('click', () => {
      mobileMenu.style.display = 'flex'; // or 'block'
      document.body.style.overflow = 'hidden'; // Prevent scrolling
    });
  }

  // Close mobile menu
  if (closeBtn) {
    closeBtn.addEventListener('click', () => {
      mobileMenu.style.display = 'none';
      document.body.style.overflow = 'auto'; // Re-enable scrolling
    });
  }

  // Toggle mobile services dropdown
  if (mobileServicesToggle) {
    mobileServicesToggle.addEventListener('click', function(e) {
      e.preventDefault();
      const isExpanded = this.getAttribute('aria-expanded') === 'true';
      this.setAttribute('aria-expanded', !isExpanded);

      const dropdown = this.nextElementSibling;
      if (dropdown && dropdown.classList.contains('mobile-services-dropdown')) {
        dropdown.style.display = isExpanded ? 'none' : 'block';
      }
    });
  }

  // Close mobile menu when clicking outside
  mobileMenu.addEventListener('click', function(e) {
    if (e.target === mobileMenu) {
      mobileMenu.style.display = 'none';
      document.body.style.overflow = 'auto';
    }
  });

  // Close mobile menu when clicking a link
  const mobileLinks = document.querySelectorAll('#mobile-menu .mobile-menu-list a');
  mobileLinks.forEach(link => {
    link.addEventListener('click', () => {
      mobileMenu.style.display = 'none';
      document.body.style.overflow = 'auto';
    });
  });
}

// Initialize mobile menu after DOM loads
document.addEventListener('DOMContentLoaded', initMobileMenu);