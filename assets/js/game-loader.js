(async () => {
  // --- Helper: custom async confirm modal ---
  function showCustomConfirm(message) {
    return new Promise(resolve => {
      let modal = document.getElementById('customConfirmModal');
      if (!modal) {
        modal = document.createElement('div');
        modal.id = 'customConfirmModal';
        modal.innerHTML = `
          <style>
            #customConfirmModal {
              position: fixed; top: 0; left: 0; width: 100vw; height: 100vh;
              background: #000;
              display: none;
              align-items: center; justify-content: center;
              z-index: 999999;
            }
            #customConfirmModal.show {
              display: flex;
            }
            #customConfirmModal .modal-content {
              background: #fff;
              padding: 32px 36px;
              border-radius: 14px;
              max-width: 380px;
              width: 90%;
              margin: 0 16px;
              box-shadow: 0 14px 28px rgba(0,0,0,0.28);
              text-align: center;
              font-family: 'Segoe UI', sans-serif;
              color: #222;
            }
            #customConfirmModal p {
              margin: 0 0 28px;
              font-size: 18px;
              font-weight: 700;
              line-height: 1.4;
            }
            #customConfirmModal .modal-buttons {
              display: flex;
              justify-content: center;
              gap: 18px;
            }
            #customConfirmModal button {
              flex: 1;
              padding: 14px 0;
              border-radius: 10px;
              font-size: 17px;
              font-weight: 700;
              border: none;
              cursor: pointer;
              color: white;
              box-shadow: 0 5px 12px rgba(0,0,0,0.12);
              transition: background-color 0.25s ease, box-shadow 0.25s ease;
            }
            #customConfirmModal button.continue {
              background: #4caf50;
            }
            #customConfirmModal button.continue:hover,
            #customConfirmModal button.continue:focus {
              background: #43a047;
              box-shadow: 0 7px 16px rgba(76, 175, 80, 0.45);
              outline: none;
            }
            #customConfirmModal button.cancel {
              background: #f44336;
            }
            #customConfirmModal button.cancel:hover,
            #customConfirmModal button.cancel:focus {
              background: #d32f2f;
              box-shadow: 0 7px 16px rgba(244, 67, 54, 0.45);
              outline: none;
            }
          </style>
          <div class="modal-content" role="dialog" aria-modal="true" aria-labelledby="modalTitle">
            <p id="modalTitle"></p>
            <div class="modal-buttons">
              <button class="continue" id="confirmYes">Yes</button>
              <button class="cancel" id="confirmNo">No</button>
            </div>
          </div>
        `;
        document.body.appendChild(modal);
      }

      const yesBtn = modal.querySelector('#confirmYes');
      const noBtn = modal.querySelector('#confirmNo');
      const title = modal.querySelector('#modalTitle');

      // Zet bericht
      title.textContent = message;

      // Mute + pauzeer alle media op pagina
      document.querySelectorAll('audio, video').forEach(el => {
        el.muted = true;
        el.pause();
      });

      // Toon modal
      modal.classList.add('show');

      function cleanup(result) {
        modal.classList.remove('show');
        yesBtn.removeEventListener('click', onYes);
        noBtn.removeEventListener('click', onNo);
        resolve(result);
      }

      function onYes() { cleanup(true); }
      function onNo() { cleanup(false); }

      yesBtn.addEventListener('click', onYes);
      noBtn.addEventListener('click', onNo);
    });
  }

  // --- Main logic ---

  const games = await fetch("https://hyperrushnet.github.io/assets/json/games.json").then(r => r.json());

  const path = location.pathname.replace(/\/(index\.html)?$/, "").toLowerCase();

  const game = games.find(g => g.link.toLowerCase().replace(/\/$/, "") === path);
  if (!game) return;

  if (game.category.toLowerCase() === "horror") {
    const proceed = await showCustomConfirm(`Warning: "${game.name}" is a horror game. Continue?`);
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
