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

  const showWarning = (msg) => {
    if (window.hrn?.notifications?.show) {
      window.hrn.notifications.show(msg, "info", 3000);
    } else {
      alert(msg);
    }
  };

  // Targets om te blokkeren
  const blockedTargets = [
    "_top", "_parent", "_blank", "_self", "_new", "_search",
    "_media", "_content", "_popup", "_external", "_help", "_window"
  ];

  // Blokkeer window.open met ongewenste target
  const originalOpen = window.open;
  window.open = function(url, target, ...args) {
    if (target && blockedTargets.includes(target.toLowerCase())) {
      showWarning(`Redirect blocked: window.open with target "${target}"`);
      return null;
    }
    return originalOpen.call(window, url, target, ...args);
  };

  // Blokkeer location redirects
  location.assign = (url) => showWarning("Redirect blocked: location.assign");
  location.replace = (url) => showWarning("Redirect blocked: location.replace");

  // Bescherm location property op window, top, parent
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

  // Link clicks blokkeren met ongewenste target
  document.addEventListener(
    "click",
    (e) => {
      let el = e.target;
      while (el && el !== document) {
        if (el.tagName === "A" && el.href) {
          const target = el.getAttribute("target")?.toLowerCase();
          if (target && blockedTargets.includes(target)) {
            showWarning(`Redirect blocked: <a> click with target "${target}"`);
            e.preventDefault();
            break;
          }
        }
        el = el.parentNode;
      }
    },
    true
  );
})();
