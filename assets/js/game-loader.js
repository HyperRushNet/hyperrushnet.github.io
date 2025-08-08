(() => {
  // Notificatie container
  let container = document.createElement("div");
  Object.assign(container.style, {
    position: "fixed",
    top: "12px",
    right: "12px",
    zIndex: 2147483647,
    fontFamily: "sans-serif",
    fontSize: "14px",
    pointerEvents: "none",
    maxWidth: "300px",
  });
  document.body.appendChild(container);

  // Functie om notificatie te tonen
  function showNotification(msg, duration = 3000) {
    const notif = document.createElement("div");
    notif.textContent = msg;
    Object.assign(notif.style, {
      background: "#fee2e2",
      color: "#900",
      padding: "8px 12px",
      marginTop: "8px",
      borderRadius: "5px",
      boxShadow: "0 2px 6px rgba(0,0,0,0.2)",
      pointerEvents: "auto",
      userSelect: "none",
    });
    container.appendChild(notif);
    setTimeout(() => {
      notif.style.transition = "opacity 0.5s";
      notif.style.opacity = "0";
      setTimeout(() => notif.remove(), 500);
    }, duration);
  }

  // Detecteer en blokkeer ongewenste redirects
  function blockNavigation(msg) {
    console.warn("Blocked navigation:", msg);
    showNotification(`Navigatie geblokkeerd`);
  }

  // --- window.open overschrijven ---
  const origOpen = window.open;
  window.open = function (url, target, ...args) {
    // Optioneel: alleen blokkeer target als het begint met underscore behalve _hrncustomredirect
    if (target && target.startsWith("_") && target.toLowerCase() !== "_hrncustomredirect") {
      blockNavigation(`window.open met target '${target}' geblokkeerd`);
      return null;
    }
    return origOpen.call(window, url, target, ...args);
  };

  // --- location.assign & replace overschrijven ---
  ["assign", "replace"].forEach(fnName => {
    const origFn = window.location[fnName];
    window.location[fnName] = function (url) {
      blockNavigation(`window.location.${fnName}(${url}) geblokkeerd`);
    };
  });

  // --- location setter overschrijven ---
  try {
    Object.defineProperty(window, "location", {
      configurable: true,
      enumerable: true,
      get: () => window.location,
      set: (url) => {
        blockNavigation(`window.location = ${url} geblokkeerd`);
      },
    });
  } catch {}

  // --- Link clicks onderscheppen ---
  document.addEventListener("click", e => {
    let el = e.target;
    while (el && el !== document) {
      if (el.tagName === "A" && el.href) {
        const target = el.getAttribute("target")?.toLowerCase();
        if (target && target.startsWith("_") && target !== "_hrncustomredirect") {
          e.preventDefault();
          e.stopImmediatePropagation();
          blockNavigation(`Link met target '${target}' geblokkeerd`);
          break;
        }
      }
      el = el.parentNode;
    }
  }, true);

  // --- Unity WebGL OpenURL patchen ---
  function blockUnityOpenURL(url) {
    blockNavigation(`Unity OpenURL poging naar: ${url} geblokkeerd`);
  }

  if (window.unityInstance?.SendMessage) {
    const origSendMessage = window.unityInstance.SendMessage;
    window.unityInstance.SendMessage = function (go, method, param) {
      if (method.toLowerCase() === "openurl") {
        blockUnityOpenURL(param);
        return;
      }
      return origSendMessage.apply(this, arguments);
    };
  }

  if (window.Module?.OpenURL) {
    const origOpenURL = window.Module.OpenURL;
    window.Module.OpenURL = function (url) {
      blockUnityOpenURL(url);
    };
  }

  // --- beforeunload event niet blokkeren om niet irritant te zijn ---
  // Alleen een console.warn als gebruiker probeert te refreshen/verlaten.
  window.addEventListener("beforeunload", (e) => {
    console.warn("beforeunload event gedetecteerd, maar niet geblokkeerd.");
  });

  console.log("✅ Navigatie blokker actief, maar gameplay blijft werken.");
})();
