(async () => {
  const games = await fetch("https://hyperrushnet.github.io/assets/json/games.json").then(r => r.json());
  const path = location.pathname.replace(/\/(index\.html)?$/, "").toLowerCase();
  const game = games.find(g => g.link.toLowerCase().replace(/\/$/, "") === path);
  if (!game) return;

  if (game.category.toLowerCase() === "horror") {
    if (!confirm(`Warning: "${game.name}" is a horror game. Do you want to continue?`)) {
      location.href = "/";
      return;
    }
  }

  // Fix titel en observeer veranderingen
  const setTitle = () => (document.title = game.name);
  setTitle();
  const observer = new MutationObserver(() => {
    if (document.title !== game.name) setTitle();
  });
  observer.observe(document.querySelector('title') || document.head.appendChild(document.createElement('title')), { childList: true });

  // Blokkeer redirects
  const originalOpen = window.open;
  window.open = function(url, target, features) {
    if (target && (target.includes('_top') || target.includes('_parent'))) {
      alert('Redirect blocked via window.open!');
      return null;
    }
    return originalOpen.apply(this, arguments);
  };

  ['assign', 'replace'].forEach(fn => {
    const originalFn = location[fn];
    location[fn] = function(url) {
      alert(`Redirect blocked via location.${fn}!`);
    };
  });
})();
