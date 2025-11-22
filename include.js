function includeHTML() {
  const elements = document.querySelectorAll("[data-include]");
  let loaded = 0;
  const total = elements.length;

  if (total === 0) {
    document.dispatchEvent(new Event("partials-loaded"));
    return;
  }

  elements.forEach(async el => {
    const file = el.getAttribute("data-include");

    try {
      const response = await fetch(file);
      if (!response.ok) throw new Error(`Failed to fetch ${file}`);
      const html = await response.text();
      el.innerHTML = html;

      el.querySelectorAll("script").forEach(oldScript => {
        const newScript = document.createElement("script");
        Array.from(oldScript.attributes).forEach(attr =>
          newScript.setAttribute(attr.name, attr.value)
        );
        newScript.text = oldScript.text;
        oldScript.replaceWith(newScript);
      });

    } catch (err) {
      el.innerHTML = `<p style="color:red;">Error loading ${file}</p>`;
      console.error(err);
    } finally {
      loaded++;
      if (loaded === total) {
        document.dispatchEvent(new Event("partials-loaded"));
      }
    }
  });
}

document.addEventListener("DOMContentLoaded", includeHTML);

// ✅ Mobile Menu Logic
let isMobileMenuOpen = false;

function initMobileMenu() {
  const hamburger = document.querySelector('.hamburger');
  const mobileMenu = document.getElementById('mobile-menu');
  const closeBtn = mobileMenu.querySelector('.close-btn');
  const servicesToggle = mobileMenu.querySelector('.mobile-services-toggle');
  const servicesDropdown = mobileMenu.querySelector('.mobile-services-dropdown');

  if (!hamburger || !mobileMenu || !closeBtn || !servicesToggle) return;

  // Toggle mobile menu
  hamburger.addEventListener('click', () => {
    isMobileMenuOpen = !isMobileMenuOpen;
    mobileMenu.style.display = isMobileMenuOpen ? 'block' : 'none';
  });

  // Close on X click
  closeBtn.addEventListener('click', () => {
    isMobileMenuOpen = false;
    mobileMenu.style.display = 'none';
  });

  // Toggle services dropdown in mobile menu
  servicesToggle.addEventListener('click', () => {
    const isExpanded = servicesDropdown.style.display === 'block';
    servicesDropdown.style.display = isExpanded ? 'none' : 'block';
    const chevron = servicesToggle.querySelector('.bi-chevron-down');
    if (chevron) {
      chevron.style.transform = isExpanded ? 'rotate(0deg)' : 'rotate(180deg)';
    }
  });

  // Close menu on link click
  mobileMenu.querySelectorAll('a').forEach(link => {
    link.addEventListener('click', () => {
      isMobileMenuOpen = false;
      mobileMenu.style.display = 'none';
    });
  });
}

// ✅ Desktop Dropdown Logic (unchanged)
function initDesktopDropdowns() {
  document.querySelectorAll('.dropdown-toggle').forEach(toggle => {
    toggle.addEventListener('click', function(e) {
      e.preventDefault();
      
      document.querySelectorAll('.dropdown-toggle').forEach(otherToggle => {
        if (otherToggle !== toggle) {
          otherToggle.setAttribute('aria-expanded', 'false');
          const otherMenu = otherToggle.nextElementSibling;
          if (otherMenu && otherMenu.tagName === 'UL') {
            otherMenu.style.display = 'none';
          }
        }
      });
      
      const isExpanded = this.getAttribute('aria-expanded') === 'true';
      this.setAttribute('aria-expanded', !isExpanded);
      
      const menu = this.nextElementSibling;
      if (menu && menu.tagName === 'UL') {
        menu.style.display = isExpanded ? 'none' : 'block';
      }
    });
  });

  document.addEventListener('click', function(e) {
    if (!e.target.closest('.front-nav')) {
      document.querySelectorAll('.dropdown-toggle').forEach(toggle => {
        toggle.setAttribute('aria-expanded', 'false');
        const menu = toggle.nextElementSibling;
        if (menu && menu.tagName === 'UL') {
          menu.style.display = 'none';
        }
      });
    }
  });
}

// ✅ Initialize based on screen size
function updateLayout() {
  const isMobile = window.innerWidth < 800;

  if (isMobile) {
    // Hide desktop dropdown
    document.querySelectorAll('.dropdown-menu').forEach(menu => {
      menu.style.display = 'none';
    });
    // Show hamburger
    const hamburgerContainer = document.querySelector('.geta_quote');
    if (hamburgerContainer) {
      let hamburger = hamburgerContainer.querySelector('.hamburger');
      if (!hamburger) {
        hamburger = document.createElement('div');
        hamburger.className = 'hamburger';
        hamburger.innerHTML = '<div></div><div></div><div></div>';
        hamburgerContainer.appendChild(hamburger);
      }
    }
    initMobileMenu();
  } else {
    // Restore desktop dropdown
    initDesktopDropdowns();
  }
}

// Run on load and resize
document.addEventListener('DOMContentLoaded', () => {
  updateLayout();
  window.addEventListener('resize', updateLayout);
});

// Optional: Highlight active link on page load
document.querySelectorAll('.front-nav a').forEach(link => {
  if (link.href === window.location.href) {
    link.parentElement.classList.add('active');
  }
});

function renderPage() {
  const path = window.location.pathname;
  
  document.querySelectorAll('.page-section').forEach(el => {
    el.style.display = 'none';
  });

  const pageId = path === '/' || path === '/index.html' 
    ? 'home' 
    : path.substring(1).split('/')[0];

  const targetSection = document.getElementById(pageId + '-section');
  if (targetSection) {
    targetSection.style.display = 'block';
  } else {
    const homeSection = document.getElementById('home-section');
    if (homeSection) homeSection.style.display = 'block';
  }

  document.querySelectorAll('.mainmenu a').forEach(link => {
    const href = link.getAttribute('href');
    if (!href) return;
    try {
      const linkUrl = new URL(href, window.location.origin);
      const isActive = linkUrl.pathname === path ||
                      (path === '/' && (href === './' || href === 'index.html'));
      link.parentElement.classList.toggle('active', isActive);
    } catch (e) {}
  });
}

window.addEventListener('popstate', renderPage);

function initRouter() {
  document.body.addEventListener('click', function(e) {
    const target = e.target.closest('a[href]');
    if (!target) return;

    const href = target.getAttribute('href');
    if (href && 
        !href.startsWith('#') && 
        !href.startsWith('http') && 
        !href.startsWith('mailto:') && 
        !href.startsWith('tel:') && 
        href !== '' &&
        href !== './'
    ) {
      e.preventDefault();

      let newPath = href;
      if (!newPath.startsWith('/')) {
        newPath = '/' + newPath;
      }
      window.history.pushState({}, '', newPath);
      renderPage();
    }
  });

  renderPage();
}

document.addEventListener('partials-loaded', initRouter);

document.addEventListener('DOMContentLoaded', () => {
  setTimeout(() => {
    if (!window.routerInitialized) {
      initRouter();
      window.routerInitialized = true;
    }
  }, 50);
});