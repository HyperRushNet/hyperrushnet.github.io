(async () => {
  const games = await fetch("https://hyperrushnet.github.io/assets/json/games.json").then(r => r.json());

  const path = location.pathname.replace(/\/(index\.html)?$/, "").toLowerCase();

  const game = games.find(g => g.link.toLowerCase().replace(/\/$/, "") === path);
  if (!game) return;

  // Horror waarschuwing met confirm
  if (game.category.toLowerCase() === "horror") {
    const proceed = confirm(`Warning: "${game.name}" is a horror game. Do you want to continue?`);
    if (!proceed) {
      location.href = "/";
      return;
    }
  }

  // Titel forceren en terugzetten als die verandert
  const setTitle = () => document.title = game.name;
  setTitle();

  const observer = new MutationObserver(() => {
    if (document.title !== game.name) setTitle();
  });
  observer.observe(document.querySelector('title') || document.head.appendChild(document.createElement('title')), { childList: true });

  // Redirect / externe navigatie blokkeren en waarschuwing tonen
  const showWarning = (msg) => {
    // Als je een custom notifications systeem hebt, gebruik dat, anders alert
    if (window.hrn?.notifications?.show) {
      window.hrn.notifications.show(msg, "info", 3000);
    } else {
      alert(msg);
    }
  };

  // window.open blokkeren bij _top/_parent targets
  const originalOpen = window.open;
  window.open = function(url, target, ...args) {
    if (target && (target.includes("_top") || target.includes("_parent"))) {
      showWarning("Redirect blocked: window.open with target " + target);
      return null;
    }
    return originalOpen.call(window, url, target, ...args);
  };

  // location.assign en location.replace blokkeren
  location.assign = (url) => showWarning("Redirect blocked: location.assign");
  location.replace = (url) => showWarning("Redirect blocked: location.replace");

  // Protect locatie property op window, top en parent
  const protectLocation = (obj, name) => {
    try {
      const desc = Object.getOwnPropertyDescriptor(obj, "location");
      if (!desc || desc.configurable) {
        Object.defineProperty(obj, "location", {
          configurable: true,
          enumerable: true,
          get: () => window.location,
          set: (url) => showWarning(`${name}.location = ${url} blocked`),
        });
      }
    } catch {}
  };
  [window, top, parent].forEach((obj, i) =>
    protectLocation(obj, i === 0 ? "window" : i === 1 ? "top" : "parent")
  );

  // Link clicks blokkeren
  document.addEventListener(
    "click",
    (e) => {
      let el = e.target;
      while (el && el !== document) {
        if (el.tagName === "A" && el.href) {
          showWarning("Redirect blocked: <a> click");
          e.preventDefault();
          break;
        }
        el = el.parentNode;
      }
    },
    true
  );
})();
