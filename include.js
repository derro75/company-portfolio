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

    // ✅ CACHE BUSTING + NO-STORE FETCH
    const bust = `?v=${Date.now()}`;

    try {
      const response = await fetch(file + bust, {
        cache: "no-store"
      });

      if (!response.ok) throw new Error(`Failed to fetch ${file}`);
      const html = await response.text();
      el.innerHTML = html;

      // ✅ Re-run any scripts inside the included file
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

// Simple SPA router (no dependencies) — ✅ FIXED FOR -section SUFFIX
function renderPage() {
  const path = window.location.pathname;
  
  // Hide all page sections
  document.querySelectorAll('.page-section').forEach(el => {
    el.style.display = 'none';
  });

  // Show matching section and auto-scroll
  const pageId = path === '/' || path === '/index.html' 
    ? 'home' 
    : path.substring(1).split('/')[0];

  let targetSection = document.getElementById(pageId + '-section');
  if (!targetSection) {
    targetSection = document.getElementById('home-section'); // fallback
  }

  if (targetSection) {
    targetSection.style.display = 'block';

    // ✅ Auto-scroll to section after render
    requestAnimationFrame(() => {
      setTimeout(() => {
        targetSection.scrollIntoView({ 
          behavior: 'smooth', 
          block: 'start' 
        });
      }, 50);
    });
  }


if (targetSection) {
  targetSection.style.display = 'block';

  requestAnimationFrame(() => {
    setTimeout(() => {
      if (pageId === 'home') {
        // Scroll to very top (not a section)
        window.scrollTo({ top: 0, behavior: 'smooth' });
      } else {
        // Scroll to section
        targetSection.scrollIntoView({ 
          behavior: 'smooth', 
          block: 'start' 
        });
      }
    }, 50);
  });
}
  // Update active nav link (unchanged)
  document.querySelectorAll('.mainmenu a').forEach(link => {
    const href = link.getAttribute('href');
    if (!href) return;
    
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
// ✅ Enhanced SPA link interception — excludes dropdowns & home
document.body.addEventListener('click', function(e) {
  const target = e.target.closest('a[href]');
  if (!target) return;

  const href = target.getAttribute('href');
  
  // ❌ Skip if:
  // - It's a dropdown toggle (javascript:void or has .dropdown-toggle)
  // - It's the Home link ("./", "", or "#")
  const isDropdown = target.classList.contains('dropdown-toggle') || 
                    href === 'javascript:void(0);';
  const isHome = href === './' || href === '' || href === '#';

  if (isDropdown || isHome) {
    return; // Let browser/native JS handle it
  }

  // ✅ Only intercept true page-like links
  if (href && 
      !href.startsWith('#') && 
      !href.startsWith('http') && 
      !href.startsWith('mailto:') && 
      !href.startsWith('tel:') &&
      href !== 'javascript:void(0);'
  ) {
    e.preventDefault();
    let newPath = href.startsWith('/') ? href : '/' + href;
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


// menu.js
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

// ✅ Arrow guidance — runs AFTER partials are loaded (FIXED & ROBUST)
document.addEventListener('partials-loaded', function() {
  const arrow = document.querySelector('.mobile-arrow-guide');
  const menuToggle = document.querySelector('.mobile-menu-toggle');

  if (!arrow || !menuToggle) return;

  const hasSeenArrow = localStorage.getItem('sherrickWebHasSeenArrow') === 'true';

  // Add class to enable animation (instead of inline opacity)
  if (!hasSeenArrow && window.innerWidth <= 799) {
    setTimeout(() => {
      arrow.classList.add('arrow-visible');
    }, 3000);
  }

  function dismissArrow() {
    arrow.classList.remove('arrow-visible');
    localStorage.setItem('sherrickWebHasSeenArrow', 'true');
  }

  menuToggle.addEventListener('click', dismissArrow);

  // Also dismiss on first dropdown use
  document.querySelectorAll('.dropdown-toggle').forEach(toggle => {
    toggle.addEventListener('click', () => {
      if (!hasSeenArrow) dismissArrow();
    });
  });
});

document.addEventListener('partials-loaded', function () {
  const images = document.querySelectorAll('.carousel-image');
  const dots = document.querySelectorAll('.dot');
  const carousel = document.querySelector('.hero-carousel');

  if (!images.length || !dots.length || !carousel) return;

  let currentIndex = 0;
  let intervalId = null;

  function showImage(index) {
    images.forEach(img => img.classList.remove('active'));
    dots.forEach(dot => dot.classList.remove('active'));

    images[index].classList.add('active');
    dots[index].classList.add('active');
  }

  function nextImage() {
    currentIndex = (currentIndex + 1) % images.length;
    showImage(currentIndex);
  }

  function startCarousel() {
    stopCarousel();
    intervalId = setInterval(nextImage, 4000);
  }

  function stopCarousel() {
    if (intervalId) clearInterval(intervalId);
  }

  // Start after 3 seconds
  setTimeout(startCarousel, 3000);

  // Pause on hover
  carousel.addEventListener('mouseenter', stopCarousel);
  carousel.addEventListener('mouseleave', startCarousel);

  // Dot navigation
  dots.forEach(dot => {
    dot.addEventListener('click', function () {
      currentIndex = Number(this.dataset.index);
      showImage(currentIndex);
    });
  });
});

// ✅ FAQ toggle — runs AFTER partials load (fixes race condition)
document.addEventListener('partials-loaded', function() {
  document.querySelectorAll('.faq-toggle').forEach(button => {
    // Remove existing listener (in case of duplicate execution)
    const handler = () => {
      const item = button.closest('.faq-item');
      const isActive = item.classList.contains('active');

      // Close all
      document.querySelectorAll('.faq-item').forEach(i => i.classList.remove('active'));

      // Open clicked one
      if (!isActive) item.classList.add('active');
    };

    button.removeEventListener('click', handler);
    button.addEventListener('click', handler);
  });
});