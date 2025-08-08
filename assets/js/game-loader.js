(() => {
  // Notification container in shadow DOM
  let host = document.createElement("div");
  Object.assign(host.style, {
    all: "initial",
    position: "fixed",
    top: "10px",
    right: "10px",
    zIndex: 2147483647,
    pointerEvents: "none",
  });
  document.documentElement.appendChild(host);
  const shadowRoot = host.attachShadow({ mode: "open" });

  const styleEl = document.createElement("style");
  styleEl.textContent = `
    .notif {
      background: #fee2e2;
      color: #900;
      padding: 8px 14px;
      margin-top: 8px;
      border-radius: 5px;
      box-shadow: 0 0 10px rgba(150, 0, 0, 0.7);
      font-family: sans-serif;
      font-size: 13px;
      pointer-events: auto;
      user-select: none;
      max-width: 280px;
    }
  `;
  shadowRoot.appendChild(styleEl);

  const notifBox = document.createElement("div");
  shadowRoot.appendChild(notifBox);

  function showNotif(msg) {
    const n = document.createElement("div");
    n.className = "notif";
    n.textContent = msg;
    notifBox.appendChild(n);
    setTimeout(() => {
      n.style.transition = "opacity 0.6s";
      n.style.opacity = "0";
      setTimeout(() => n.remove(), 600);
    }, 3000);
  }

  // Block function
  function block(msg) {
    console.warn("[NAV BLOCKER]", msg);
    showNotif(msg);
  }

  // Overwrite window.open robustly
  function overwriteOpen() {
    const originalOpen = window.open;
    Object.defineProperty(window, "open", {
      configurable: true,
      enumerable: true,
      writable: false,
      value: function (url, target, ...args) {
        if (target && target.startsWith("_") && target.toLowerCase() !== "_hrncustomredirect") {
          block(`window.open('${url}', '${target}') geblokkeerd`);
          return null;
        }
        return originalOpen.call(window, url, target, ...args);
      },
    });
  }

  // Overwrite window.location setters & methods
  function overwriteLocation() {
    const loc = window.location;

    // location.assign
    const origAssign = loc.assign.bind(loc);
    loc.assign = function (url) {
      block(`window.location.assign('${url}') geblokkeerd`);
    };

    // location.replace
    const origReplace = loc.replace.bind(loc);
    loc.replace = function (url) {
      block(`window.location.replace('${url}') geblokkeerd`);
    };

    // setter for location (harder)
    try {
      Object.defineProperty(window, "location", {
        configurable: true,
        enumerable: true,
        get() {
          return loc;
        },
        set(url) {
          block(`window.location = '${url}' geblokkeerd`);
        },
      });
    } catch (e) {
      // fallback: browsers kunnen dit blokkeren
    }
  }

  // Intercept link clicks
  function interceptClicks() {
    document.addEventListener("click", e => {
      let el = e.target;
      while (el && el !== document) {
        if (el.tagName === "A" && el.href) {
          const target = el.getAttribute("target")?.toLowerCase();
          if (target && target.startsWith("_") && target !== "_hrncustomredirect") {
            e.preventDefault();
            e.stopImmediatePropagation();
            block(`Link met target '${target}' geblokkeerd`);
            return;
          }
        }
        el = el.parentNode;
      }
    }, true);
  }

  // Patch Unity OpenURL methods if present
  function patchUnity() {
    try {
      if (window.unityInstance && window.unityInstance.SendMessage) {
        const origSendMessage = window.unityInstance.SendMessage.bind(window.unityInstance);
        window.unityInstance.SendMessage = (go, method, param) => {
          if (method.toLowerCase() === "openurl") {
            block(`Unity SendMessage OpenURL poging naar '${param}' geblokkeerd`);
            return;
          }
          return origSendMessage(go, method, param);
        };
      }
      if (window.Module && window.Module.OpenURL) {
        const origOpenURL = window.Module.OpenURL.bind(window.Module);
        window.Module.OpenURL = (url) => {
          block(`Unity Module.OpenURL poging naar '${url}' geblokkeerd`);
        };
      }
    } catch {}
  }

  // Re-apply overrides aggressively
  function watchdog() {
    overwriteOpen();
    overwriteLocation();
    patchUnity();
  }

  // Initial setup
  interceptClicks();
  watchdog();

  // Mutation observer to detect changes and reapply patches
  const mo = new MutationObserver(() => {
    watchdog();
  });

  mo.observe(document.documentElement, { childList: true, subtree: true });

  // Also check every 2s to re-apply overrides, if overwritten
  setInterval(() => {
    watchdog();
  }, 2000);

  console.log("✅ Navigation blocker active with persistent overwrite.");
})();
