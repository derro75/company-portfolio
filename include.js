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
