(async () => {
  const games = await fetch("https://hyperrushnet.github.io/assets/json/games.json").then(r => r.json());

  const path = location.pathname.replace(/\/(index\.html)?$/, "").toLowerCase();

  const game = games.find(g => g.link.toLowerCase().replace(/\/$/, "") === path);
  if (!game) return;

  if (game.category.toLowerCase() === "horror") {
    const proceed = confirm(`Warning: "${game.name}" is a horror game. Do you want to continue?`);
    if (!proceed) {
      location.href = "/";
      return;
    }
  }

  const setTitle = () => document.title = game.name;
  setTitle();

  const observer = new MutationObserver(() => {
    if (document.title !== game.name) setTitle();
  });
  observer.observe(document.querySelector('title') || document.head.appendChild(document.createElement('title')), { childList: true });
})();
