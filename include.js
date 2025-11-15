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

  // Close dropdown when clicking outside
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

  // Optional: Highlight active link on page load
  document.querySelectorAll('.front-nav a').forEach(link => {
    if (link.href === window.location.href) {
      link.parentElement.classList.add('active');
    }
  });











  // our services pointer








  // Simple SPA router (no dependencies)
  function renderPage() {
    const path = window.location.pathname;
    
    // Hide all page sections
    document.querySelectorAll('.page-section').forEach(el => {
      el.style.display = 'none';
    });

    // Show matching section
    const pageId = path === '/' || path === '/index.html' 
      ? 'home' 
      : path.substring(1); // removes leading '/'

    const targetSection = document.getElementById(pageId + '-section');
    if (targetSection) {
      targetSection.style.display = 'block';
    } else {
      // Fallback to home
      document.getElementById('home-section').style.display = 'block';
    }

    // Update active nav link
    document.querySelectorAll('.mainmenu a').forEach(link => {
      link.parentElement.classList.toggle('active', 
        link.getAttribute('href') === path || 
        (path === '/' && link.getAttribute('href') === './')
      );
    });
  }

  // Handle back/forward buttons
  window.addEventListener('popstate', renderPage);

  // Run on load
  document.addEventListener('DOMContentLoaded', () => {
    // Optional: smooth scroll on anchor clicks
    document.body.addEventListener('click', e => {
      if (e.target.matches('a[href^="/"]:not([href="/"])')) {
        e.preventDefault();
        const href = e.target.getAttribute('href');
        window.history.pushState({}, '', href);
        renderPage();
      }
    });

    renderPage();
  });