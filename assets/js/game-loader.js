(() => {
  const alertMsg = "Navigatie geblokkeerd door beveiliging!";

  // --- Overlay die ALLES blokkeert ---
  const overlay = document.createElement("div");
  Object.assign(overlay.style, {
    position: "fixed",
    top: "0",
    left: "0",
    width: "100vw",
    height: "100vh",
    backgroundColor: "rgba(0,0,0,0.5)",
    color: "white",
    fontSize: "2rem",
    display: "flex",
    alignItems: "center",
    justifyContent: "center",
    zIndex: 2147483647, // max z-index
    userSelect: "none",
    pointerEvents: "auto",
  });
  overlay.textContent = alertMsg;

  // Voeg toe aan body
  document.documentElement.appendChild(overlay);

  // Blokkeer ALLE pointer events op de hele pagina
  document.documentElement.style.pointerEvents = "none";
  // Behalve op overlay zelf
  overlay.style.pointerEvents = "auto";

  // --- Helper functie voor alert + blokkeermelding ---
  function blockNavigation(msg) {
    console.warn("Blocked navigation: ", msg);
    alert(alertMsg);
  }

  // --- Overwrite window.open ---
  const originalWindowOpen = window.open;
  window.open = function (...args) {
    blockNavigation(`window.open(${args.join(", ")})`);
    return null;
  };

  // --- Overwrite location.assign en location.replace ---
  const locationProto = Object.getPrototypeOf(window.location);
  ['assign', 'replace'].forEach(method => {
    const original = window.location[method];
    window.location[method] = function (url) {
      blockNavigation(`location.${method}(${url})`);
    };
  });

  // --- Overwrite window.location setter ---
  try {
    Object.defineProperty(window, 'location', {
      configurable: false,
      enumerable: true,
      get() { return window.location; },
      set(url) { blockNavigation(`window.location = ${url}`); }
    });
  } catch(e) {
    // fallback: sommige browsers blokkeren dit
  }

  // --- Blokkeer link clicks overal ---
  document.addEventListener("click", e => {
    let el = e.target;
    while (el && el !== document) {
      if (el.tagName === "A" && el.href) {
        e.preventDefault();
        e.stopImmediatePropagation();
        blockNavigation(`Klik op link naar ${el.href}`);
        break;
      }
      el = el.parentNode;
    }
  }, true);

  // --- Blokkeer navigatie via keyboard (bv. F5, Ctrl+R, Alt+Left) ---
  window.addEventListener("keydown", e => {
    if (
      e.key === "F5" || 
      (e.ctrlKey && e.key.toLowerCase() === "r") ||
      (e.altKey && e.key === "ArrowLeft")
    ) {
      e.preventDefault();
      blockNavigation(`Navigatie via keyboard: ${e.key}`);
    }
  }, true);

  // --- Blokkeer beforeunload (tab sluiten / refresh) ---
  window.addEventListener("beforeunload", e => {
    e.preventDefault();
    e.returnValue = alertMsg;
    return alertMsg;
  });

  // --- Blokkeer pagehide / unload events ---
  window.addEventListener("pagehide", e => {
    e.preventDefault();
    blockNavigation("Pagehide event");
  });

  // --- Overwrite Unity WebGL OpenURL calls via SendMessage & Module ---
  function blockUnityOpenURL(url) {
    blockNavigation(`Unity OpenURL geprobeerd: ${url}`);
  }

  // unityInstance SendMessage hack (Unity < 2021)
  if(window.unityInstance && typeof window.unityInstance.SendMessage === "function") {
    const origSendMessage = window.unityInstance.SendMessage;
    window.unityInstance.SendMessage = function(go, method, param) {
      if (method.toLowerCase() === "openurl") {
        blockUnityOpenURL(param);
        return;
      }
      return origSendMessage.apply(this, arguments);
    };
  }

  // Module.OpenURL hack (Unity 2021+)
  if(window.Module && typeof window.Module.OpenURL === "function") {
    const origOpenURL = window.Module.OpenURL;
    window.Module.OpenURL = function(url) {
      blockUnityOpenURL(url);
    };
  }

  console.log("🚫 Ultieme navigatie blokkades geactiveerd!");
})();
