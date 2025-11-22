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

// === MOBILE MENU LOGIC ===
let isMobileMenuOpen = false;

function initMobileMenu() {
  const mobileMenu = document.getElementById('mobile-menu');
  const closeBtn = mobileMenu?.querySelector('.close-btn');
  const servicesToggle = mobileMenu?.querySelector('.mobile-services-toggle');
  const servicesDropdown = mobileMmenu?.querySelector('.mobile-services-dropdown');

  // Add hamburger to .geta_quote if not exists
  const quoteContainer = document.querySelector('.geta_quote');
  if (quoteContainer && !quoteContainer.querySelector('.hamburger')) {
    const hamburger = document.createElement('div');
    hamburger.className = 'hamburger';
    hamburger.innerHTML = '<div></div><div></div><div></div>';
    quoteContainer.appendChild(hamburger);

    hamburger.addEventListener('click', () => {
      mobileMenu.style.display = 'block';
      isMobileMenuOpen = true;
    });
  }

  if (closeBtn) {
    closeBtn.addEventListener('click', () => {
      mobileMenu.style.display = 'none';
      isMobileMenuOpen = false;
    });
  }

  if (servicesToggle && servicesDropdown) {
    servicesToggle.addEventListener('click', () => {
      const isExpanded = servicesToggle.getAttribute('aria-expanded') === 'true';
      servicesToggle.setAttribute('aria-expanded', !isExpanded);
      servicesDropdown.style.display = isExpanded ? 'none' : 'block';
      
      const chevron = servicesToggle.querySelector('.bi-chevron-down');
      if (chevron) {
        chevron.style.transform = isExpanded ? 'rotate(0deg)' : 'rotate(180deg)';
      }
    });
  }

  // Close menu on link click
  mobileMenu?.querySelectorAll('a').forEach(link => {
    link.addEventListener('click', () => {
      mobileMenu.style.display = 'none';
      isMobileMenuOpen = false;
    });
  });
}

// === DESKTOP DROPDOWN LOGIC ===
function initDesktopDropdowns() {
  // Remove any existing listeners to prevent duplicates
  document.querySelectorAll('.dropdown-toggle').forEach(toggle => {
    toggle.removeEventListener('click', handleDropdownClick);
  });

  // Attach fresh listeners
  document.querySelectorAll('.dropdown-toggle').forEach(toggle => {
    toggle.addEventListener('click', handleDropdownClick);
  });

  // Reattach outside-click handler
  document.removeEventListener('click', handleOutsideClick);
  document.addEventListener('click', handleOutsideClick);
}

function handleDropdownClick(e) {
  e.preventDefault();
  
  const toggle = e.currentTarget;
  
  // Close other open dropdowns
  document.querySelectorAll('.dropdown-toggle').forEach(otherToggle => {
    if (otherToggle !== toggle) {
      otherToggle.setAttribute('aria-expanded', 'false');
      const otherMenu = otherToggle.nextElementSibling;
      if (otherMenu && otherMenu.tagName === 'UL') {
        otherMenu.style.display = 'none';
      }
    }
  });
  
  // Toggle current dropdown
  const isExpanded = toggle.getAttribute('aria-expanded') === 'true';
  toggle.setAttribute('aria-expanded', !isExpanded);
  
  const menu = toggle.nextElementSibling;
  if (menu && menu.tagName === 'UL') {
    menu.style.display = isExpanded ? 'none' : 'block';
  }
}

function handleOutsideClick(e) {
  if (!e.target.closest('.front-nav')) {
    document.querySelectorAll('.dropdown-toggle').forEach(toggle => {
      toggle.setAttribute('aria-expanded', 'false');
      const menu = toggle.nextElementSibling;
      if (menu && menu.tagName === 'UL') {
        menu.style.display = 'none';
      }
    });
  }
}

// === RESPONSIVE INITIALIZATION ===
function updateLayout() {
  const isMobile = window.innerWidth < 800;

  if (isMobile) {
    // Hide desktop nav
    const frontNav = document.querySelector('.front-nav');
    if (frontNav) frontNav.style.display = 'none';
    
    // Show hamburger + init mobile menu
    initMobileMenu();
  } else {
    // Show desktop nav
    const frontNav = document.querySelector('.front-nav');
    if (frontNav) frontNav.style.display = '';
    
    // Init desktop dropdowns
    initDesktopDropdowns();
  }
}

// === SPA ROUTER ===
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

// === INITIALIZATION SEQUENCE ===
// Run after partials are loaded
document.addEventListener('partials-loaded', () => {
  updateLayout(); // Initialize layout based on screen size
  initRouter();   // Initialize SPA router
  
  // Also run on resize
  window.addEventListener('resize', updateLayout);
});

// Fallback: if no partials, run after short delay
document.addEventListener('DOMContentLoaded', () => {
  setTimeout(() => {
    if (!window.routerInitialized) {
      initRouter();
      window.routerInitialized = true;
    }
  }, 50);
});