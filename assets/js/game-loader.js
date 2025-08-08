(() => {
  // Create guardian UI in a Shadow DOM
  const host = document.createElement("div");
  host.style = "all: initial; position: fixed; top: 10px; left: 10px; z-index: 999999; pointer-events: none;";
  const root = host.attachShadow({ mode: "open" });

  const style = document.createElement("style");
  style.textContent = `
    .guardian-warning {
      background: red;
      color: white;
      font-family: sans-serif;
      font-size: 14px;
      padding: 8px 12px;
      border-radius: 6px;
      font-weight: bold;
      display: none;
      pointer-events: auto;
    }
    .guardian-warning.show {
      display: block;
    }
  `;
  root.appendChild(style);

  const warningBox = document.createElement("div");
  warningBox.className = "guardian-warning";
  warningBox.textContent = "🚨 Poging tot verlaten geblokkeerd!";
  root.appendChild(warningBox);

  document.documentElement.appendChild(host);

  // Add fake history entry so we can attempt to block back
  try {
    history.pushState(null, "", location.href);
  } catch {}

  // Watch for visibility loss (tab close or redirect)
  document.addEventListener("visibilitychange", () => {
    if (document.hidden) {
      // Show warning
      warningBox.classList.add("show");

      // Try to "pull back" the page (may not always work)
      try {
        history.pushState(null, "", location.href);
      } catch {}

      console.warn("[guardian] Redirect attempt detected and blocked visually.");
    }
  });

  // Optional: block back button (loop)
  window.addEventListener("popstate", () => {
    try {
      history.pushState(null, "", location.href);
    } catch {}
  });
})();
