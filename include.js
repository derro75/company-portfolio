function includeHTML() {
  const elements = document.querySelectorAll("[data-include]");
  let loaded = 0;
  const total = elements.length;

  if (total === 0) {
    // No partials found, still dispatch the event
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

      // ✅ Re-run any scripts inside the included file
      el.querySelectorAll("script").forEach(oldScript => {
        const newScript = document.createElement("script");

        // Copy all attributes (src, data-*, etc.)
        Array.from(oldScript.attributes).forEach(attr =>
          newScript.setAttribute(attr.name, attr.value)
        );

        // Copy inline script content if any
        newScript.text = oldScript.text;

        // Replace old script with the new one so it executes
        oldScript.replaceWith(newScript);
      });

    } catch (err) {
      el.innerHTML = `<p style="color:red;">Error loading ${file}</p>`;
      console.error(err);
    } finally {
      loaded++;
      if (loaded === total) {
        // ✅ All partials are loaded
        document.dispatchEvent(new Event("partials-loaded"));
      }
    }
  });
}

document.addEventListener("DOMContentLoaded", includeHTML);

//navigation bar drop down
// Toggle dropdown menus on click (not hover)
document.querySelectorAll('.dropdown-toggle').forEach(toggle => {
  toggle.addEventListener('click', function(e) {
    e.preventDefault();
    
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
    const isExpanded = this.getAttribute('aria-expanded') === 'true';
    this.setAttribute('aria-expanded', !isExpanded);
    
    const menu = this.nextElementSibling;
    if (menu && menu.tagName === 'UL') {
      menu.style.display = isExpanded ? 'none' : 'block';
    }
  });
});

// ✅ FIXED: Mobile-safe dropdown close (robust version)
document.addEventListener('click', function(e) {
  const servicesDropdown = document.querySelector('.services-dropdown');
  if (!servicesDropdown) return;

  // Close only if click is outside the entire dropdown container (trigger + menu)
  if (!servicesDropdown.contains(e.target)) {
    document.querySelectorAll('.dropdown-toggle').forEach(toggle => {
      toggle.setAttribute('aria-expanded', 'false');
      const menu = toggle.nextElementSibling;
      if (menu && menu.tagName === 'UL') {
        menu.style.display = 'none';
      }
    });
  }
});

// Optional: Highlight active link on page load
document.querySelectorAll('.front-nav a').forEach(link => {
  if (link.href === window.location.href) {
    link.parentElement.classList.add('active');
  }
});

// our services pointer

// Simple SPA router (no dependencies) — ✅ FIXED FOR -section SUFFIX
function renderPage() {
  const path = window.location.pathname;
  
  // Hide all page sections
  document.querySelectorAll('.page-section').forEach(el => {
    el.style.display = 'none';
  });

  // Show matching section
  const pageId = path === '/' || path === '/index.html' 
    ? 'home' 
    : path.substring(1).split('/')[0]; // handles /about/ → 'about'

  // ✅ Look for ID with '-section' suffix
  const targetSection = document.getElementById(pageId + '-section');
  if (targetSection) {
    targetSection.style.display = 'block';
  } else {
    // Fallback to home-section
    const homeSection = document.getElementById('home-section');
    if (homeSection) homeSection.style.display = 'block';
  }

  // Update active nav link
  document.querySelectorAll('.mainmenu a').forEach(link => {
    const href = link.getAttribute('href');
    if (!href) return;
    
    // Normalize link href to absolute path for comparison
    try {
      const linkUrl = new URL(href, window.location.origin);
      const isActive = linkUrl.pathname === path ||
                      (path === '/' && (href === './' || href === 'index.html'));
      link.parentElement.classList.toggle('active', isActive);
    } catch (e) {
      // Invalid URL (e.g., javascript:), skip
    }
  });
}

// Handle back/forward buttons
window.addEventListener('popstate', renderPage);

// ✅ Initialize router AFTER partials load
function initRouter() {
  // Improved SPA link interception (handles href="about", href="/contact", etc.)
  document.body.addEventListener('click', function(e) {
    const target = e.target.closest('a[href]');
    if (!target) return;

    const href = target.getAttribute('href');
    // Only intercept internal non-external, non-hash, non-empty links
    if (href && 
        !href.startsWith('#') && 
        !href.startsWith('http') && 
        !href.startsWith('mailto:') && 
        !href.startsWith('tel:') && 
        href !== '' &&
        href !== './' // let ./ go to / (handled by router)
    ) {
      e.preventDefault();
      // Normalize: ensure path starts with /
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

// Wait for partials to load first
document.addEventListener('partials-loaded', initRouter);

// Fallback: if no partials, run after short delay
document.addEventListener('DOMContentLoaded', () => {
  setTimeout(() => {
    if (!window.routerInitialized) {
      initRouter();
      window.routerInitialized = true;
    }
  }, 50);
});