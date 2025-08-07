(async () => {
  const games = await fetch("https://hyperrushnet.github.io/assets/json/games.json").then(r => r.json());

  const path = location.pathname.replace(/\/(index\.html)?$/, "").toLowerCase();
  const game = games.find(g => g.link.toLowerCase().replace(/\/$/, "") === path);
  if (!game) return;

  // Gebruik custom dialog in plaats van confirm
  if (game.category.toLowerCase() === "horror") {
    const proceed = await createCustomDialog(`Warning: "${game.name}" is a horror game. Do you want to continue?`);
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

  const blockedTargets = [
    "_top", "_parent", "_blank", "_self", "_new", "_search", "_media", "_content",
    "_popup", "_external", "_help", "_window", "_main", "_home", "_download", "_iframe",
    "_dialog", "_browser", "_redirect", "_login", "_register", "_logoff", "_exit",
    "_start", "_end", "_print", "_view", "_edit", "_share", "_preview", "_run",
    "_exec", "_forward", "_back", "_open", "_about", "_contact", "_support", "_close",
    "_tab", "_page", "_lightbox", "_modal", "_child", "_parentframe", "_topframe", "_overlay",
    "_portal", "_dash", "_menu", "_panel", "_win", "_float", "_tool", "_tray",
    "_mediawindow", "_fullscreen", "_expand", "_collapse", "_gallery", "_zoom", "_profile",
    "_settings", "_options", "_admin", "_control", "_dashboard", "_stats", "_sandbox",
    "_test", "_dev", "_stage", "_live", "_prod", "_demo", "_example", "_case"
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

// ✅ Custom async dialog vervangt confirm()
function createCustomDialog(message) {
  return new Promise((resolve) => {
    // Backdrop
    const backdrop = document.createElement("div");
    backdrop.style.cssText = `
      position: fixed;
      top: 0; left: 0;
      width: 100vw; height: 100vh;
      background: rgba(0,0,0,0.5);
      display: flex;
      align-items: center;
      justify-content: center;
      z-index: 999999;
    `;

    // Dialog
    const dialog = document.createElement("div");
    dialog.style.cssText = `
      background: white;
      padding: 20px;
      border-radius: 8px;
      max-width: 400px;
      text-align: center;
      box-shadow: 0 4px 12px rgba(0,0,0,0.3);
      font-family: sans-serif;
    `;
    dialog.innerHTML = `
      <p style="margin-bottom: 20px; font-size: 16px;">${message}</p>
      <button id="dialog-yes" style="margin-right: 10px; padding: 8px 16px;">Continue</button>
      <button id="dialog-no" style="padding: 8px 16px;">Cancel</button>
    `;

    backdrop.appendChild(dialog);
    document.body.appendChild(backdrop);

    dialog.querySelector("#dialog-yes").onclick = () => {
      document.body.removeChild(backdrop);
      resolve(true);
    };
    dialog.querySelector("#dialog-no").onclick = () => {
      document.body.removeChild(backdrop);
      resolve(false);
    };
  });
}
