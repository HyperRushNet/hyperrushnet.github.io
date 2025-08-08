(() => {
  // Melding tonen in de console
  console.log("🚫 Navigatieblokkade actief!");

  // Waarschuwingsfunctie
  function warn(msg) {
    try {
      // Maak visuele notificatie in DOM
      const existing = document.getElementById("redirect-block-notif");
      if (existing) return; // 1 notificatie tegelijk

      const notif = document.createElement("div");
      notif.id = "redirect-block-notif";
      notif.textContent = msg;
      Object.assign(notif.style, {
        position: "fixed",
        bottom: "20px",
        right: "20px",
        background: "rgba(255,0,0,0.8)",
        color: "white",
        padding: "10px 20px",
        fontSize: "14px",
        borderRadius: "8px",
        zIndex: 9999999,
        fontFamily: "Arial,sans-serif",
        userSelect: "none",
      });
      document.body.appendChild(notif);

      setTimeout(() => notif.remove(), 3000);
    } catch {}
  }

  // Override window.open
  const originalOpen = window.open;
  window.open = function(...args) {
    warn("window.open geblokkeerd");
    return null;
  };

  // Override location.assign & location.replace
  ['assign', 'replace'].forEach(fn => {
    const original = window.location[fn];
    window.location[fn] = function(url) {
      warn(`window.location.${fn} geblokkeerd`);
      console.warn(`Navigatie via location.${fn} geblokkeerd: ${url}`);
    };
  });

  // Proxy voor window.location setter blokkade
  try {
    const loc = window.location;
    Object.defineProperty(window, "location", {
      configurable: false,
      enumerable: true,
      get() {
        return loc;
      },
      set(url) {
        warn("Directe toewijzing van window.location geblokkeerd");
        console.warn("Navigatie via window.location = geblokkeerd: ", url);
      }
    });
  } catch (e) {
    // Als definieer property faalt, skip
    console.warn("Kon window.location niet overschrijven:", e);
  }

  // Click event capturing op alle <a> tags
  document.addEventListener("click", e => {
    let el = e.target;
    while(el && el !== document) {
      if (el.tagName === "A" && el.href) {
        e.preventDefault();
        e.stopImmediatePropagation();
        warn("Link-navigatie geblokkeerd");
        console.warn("Navigatie via <a href> geblokkeerd: ", el.href);
        break;
      }
      el = el.parentNode;
    }
  }, true);

  // Beforeunload event om tab sluiten ook te waarschuwen
  window.addEventListener("beforeunload", (e) => {
    const msg = "Navigatie of tab sluiten is geblokkeerd!";
    e.preventDefault();
    e.returnValue = msg;
    return msg;
  });

  // Optioneel: overlay die alles blokkeert (kan je verwijderen of aanpassen)
  /*
  const overlay = document.createElement("div");
  Object.assign(overlay.style, {
    position: "fixed",
    top: 0, left: 0, right: 0, bottom: 0,
    backgroundColor: "rgba(0,0,0,0.3)",
    zIndex: 9999998,
    pointerEvents: "auto",
  });
  document.body.appendChild(overlay);
  overlay.addEventListener("click", e => e.stopPropagation());
  */

  // Unity specifiek: probeer SendMessage of Module.OpenURL te overriden
  if(window.unityInstance && typeof window.unityInstance.SendMessage === "function") {
    const origSendMessage = window.unityInstance.SendMessage;
    window.unityInstance.SendMessage = function(go, method, param) {
      if(method.toLowerCase().includes("openurl")) {
        warn("Unity OpenURL geblokkeerd: " + param);
        return;
      }
      return origSendMessage.apply(this, arguments);
    };
  }
  if(window.Module && typeof window.Module.OpenURL === "function") {
    const origModuleOpenURL = window.Module.OpenURL;
    window.Module.OpenURL = function(url) {
      warn("Unity Module.OpenURL geblokkeerd: " + url);
    };
  }

})();
