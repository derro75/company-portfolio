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

// ✅ Extracted close handler for reuse
function closeDropdowns(e) {
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

// ✅ New: Reinitialize dropdowns after SPA navigation
function initDropdowns() {
  // Remove existing listeners by cloning nodes
  const toggles = document.querySelectorAll('.dropdown-toggle');
  toggles.forEach(toggle => {
    const clone = toggle.cloneNode(true);
    toggle.parentNode.replaceChild(clone, toggle);
  });

  // Reattach fresh click handlers
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

  // Reattach outside-click handler
  document.removeEventListener('click', closeDropdowns);
  document.addEventListener('click', closeDropdowns);
}

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

  // ✅ Critical: Reinitialize dropdowns after every navigation
  initDropdowns();
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