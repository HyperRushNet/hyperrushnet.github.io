(async () => {
  const games = await fetch("https://hyperrushnet.github.io/assets/json/games.json").then(r => r.json());
  const path = location.pathname.replace(/\/(index\.html)?$/, "").toLowerCase();
  const game = games.find(g => g.link.toLowerCase().replace(/\/$/, "") === path);
  if (!game) return;

  // Create and show confirm modal
  const showCustomConfirm = (message) => {
    return new Promise(resolve => {
      if (document.getElementById("customConfirmModal")) {
        document.getElementById("modalMessage").textContent = message;
        modal.style.display = "flex";
        return;
      }

      const modal = document.createElement("div");
      modal.id = "customConfirmModal";
      modal.style = `
        position: fixed; top: 0; left: 0; width: 100vw; height: 100vh;
        background: #000; display: flex; align-items: center; justify-content: center;
        z-index: 999999;
      `;

      modal.innerHTML = `
        <div style="
          background: #fff; padding: 36px; border-radius: 14px;
          max-width: 400px; width: 90%; margin: 0 16px; text-align: center;
          font-family: 'Segoe UI', sans-serif; color: #222; box-shadow: 0 14px 28px rgba(0,0,0,0.28);
        ">
          <p id="modalMessage" style="font-size: 18px; font-weight: 700; line-height: 1.4; margin-bottom: 24px;">${message}</p>
          <div style="display: flex; gap: 18px;">
            <button id="confirmYes" style="flex: 1; padding: 14px 0; border-radius: 10px; font-size: 17px; font-weight: 700; border: none; cursor: pointer; background: #4caf50; color: white;">Yes</button>
            <button id="confirmNo" style="flex: 1; padding: 14px 0; border-radius: 10px; font-size: 17px; font-weight: 700; border: none; cursor: pointer; background: #f44336; color: white;">No</button>
          </div>
        </div>
      `;

      document.body.appendChild(modal);

      document.getElementById("confirmYes").onclick = () => {
        modal.remove();
        resolve(true);
      };
      document.getElementById("confirmNo").onclick = () => {
        modal.remove();
        resolve(false);
      };

      // Mute and pause all audio/video
      document.querySelectorAll('audio, video').forEach(el => {
        el.muted = true;
        el.pause();
      });
    });
  };

  if (game.category.toLowerCase() === "horror") {
    const confirmed = await showCustomConfirm(`Warning: "${game.name}" is a horror game. Continue?`);
    if (!confirmed) {
      location.href = "/";
      return;
    }
  }

  // Title lock
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

  const blockedTargets = ["_top", "_parent", "_blank", "_self", "_new", "_search", "_media", "_content", "_popup", "_external", "_help", "_window", "_main", "_home", "_download", "_iframe", "_dialog", "_browser", "_redirect", "_login", "_register", "_logoff", "_exit", "_start", "_end", "_print", "_view", "_edit", "_share", "_preview", "_run", "_exec", "_forward", "_back", "_open", "_about", "_contact", "_support", "_close", "_tab", "_page", "_lightbox", "_modal", "_child", "_parentframe", "_topframe", "_overlay", "_portal", "_dash", "_menu", "_panel", "_win", "_float", "_tool", "_tray", "_mediawindow", "_fullscreen", "_expand", "_collapse", "_gallery", "_zoom", "_profile", "_settings", "_options", "_admin", "_control", "_dashboard", "_stats", "_sandbox", "_test", "_dev", "_stage", "_live", "_prod", "_demo", "_example", "_case"];

  const originalOpen = window.open;
  window.open = function(url, target, ...args) {
    if (target && blockedTargets.includes(target.toLowerCase())) {
      showWarning(`Redirect blocked: window.open with target "${target}"`);
      return null;
    }
    return originalOpen.call(window, url, target, ...args);
  };

  location.assign = (url) => showWarning("Redirect blocked: location.assign");
  location.replace = (url) => showWarning("Redirect blocked: location.replace");

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

  document.addEventListener("click", (e) => {
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
  }, true);

  // Load the game script (only after confirm)
  const gameScriptUrl = game.script || "/game/main.js"; // adjust if needed
  const script = document.createElement("script");
  script.src = gameScriptUrl;
  script.defer = true;
  document.body.appendChild(script);
})();
