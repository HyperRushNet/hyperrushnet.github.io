(async () => {
  const games = await fetch("https://hyperrushnet.github.io/assets/json/games.json").then(r => r.json());

  const path = location.pathname.replace(/\/(index\.html)?$/, "").toLowerCase();
  const game = games.find(g => g.link.toLowerCase().replace(/\/$/, "") === path);
  if (!game) return;

  // 🕶️ Anti-jumpscare overlay (alleen voor horror)
  if (game.category.toLowerCase() === "horror") {
    const overlay = document.createElement("div");
    overlay.style.cssText = `
      position: fixed;
      inset: 0;
      background: ${window.matchMedia('(prefers-color-scheme: dark)').matches ? '#000' : '#fff'};
      z-index: 2147483647;
    `;
    document.body.appendChild(overlay);

    const proceed = confirm(`Warning: "${game.name}" is a horror game. Do you want to continue?`);
    if (!proceed) {
      location.href = "/";
      return;
    }

    overlay.remove();
  }

  // 🎮 Titel instellen en observeren
  const setTitle = () => document.title = game.name;
  setTitle();
  const observer = new MutationObserver(() => {
    if (document.title !== game.name) setTitle();
  });
  observer.observe(document.querySelector('title') || document.head.appendChild(document.createElement('title')), { childList: true });

  // 🛡️ Blokkeer alle vormen van redirects/popup/open-nav hacks
  const blockNavigation = () => {
    const noop = () => null;
    const noopStr = { get: () => noop, set: noop };

    // Blokkeer standaard methodes
    window.open = noop;
    window.location.assign = noop;
    window.location.replace = noop;
    window.location.reload = noop;

    // Blokkeer window.top/parent manipulaties
    try {
      Object.defineProperty(window.top, "location", { set: noop });
      Object.defineProperty(window.parent, "location", { set: noop });
      Object.freeze(window.location);
    } catch {}

    try {
      Object.defineProperty(window, "top", { configurable: false, writable: false, value: window });
      Object.defineProperty(window, "parent", { configurable: false, writable: false, value: window });
      Object.defineProperty(window, "frameElement", { configurable: false, writable: false, value: null });
      Object.defineProperty(window, "frames", { configurable: false, writable: false, value: [] });
      Object.defineProperty(window, "self", { configurable: false, writable: false, value: window });
    } catch {}

    try {
      delete window.opener;
    } catch {}

    try {
      window.onbeforeunload = null;
    } catch {}

    // Extra observer: detecteer en blokkeer anchors en iframes
    const domBlockObserver = new MutationObserver((mutations) => {
      mutations.forEach(m => {
        [...m.addedNodes].forEach(node => {
          if (node.tagName === 'A') node.target = '_self';
          if (node.tagName === 'IFRAME') {
            node.remove(); // of: node.src = 'about:blank'
          }
        });
      });
    });
    domBlockObserver.observe(document.body, { childList: true, subtree: true });
  };

  blockNavigation();
})();
