(() => {
  const showWarning = (msg) => {
    alert("🔒 Redirect geblokkeerd: " + msg);
    // Hier kan je ook jouw notificatie gebruiken:
    // window.hrn?.notifications?.show(msg, "warning", 4000);
  };

  const preventRedirect = (objName, obj) => {
    try {
      const originalHref = obj.location.href;

      Object.defineProperty(obj, "location", {
        configurable: true,
        enumerable: true,
        get: () => window.location,
        set: (val) => {
          showWarning(`${objName}.location = "${val}" geblokkeerd`);
        },
      });

      ["assign", "replace"].forEach(method => {
        if (typeof obj.location[method] === "function") {
          obj.location[method] = function (...args) {
            showWarning(`${objName}.location.${method}("${args[0]}") geblokkeerd`);
          };
        }
      });

      // let ook op href direct setten
      Object.defineProperty(obj.location, "href", {
        configurable: true,
        enumerable: true,
        get: () => originalHref,
        set: (val) => {
          showWarning(`${objName}.location.href = "${val}" geblokkeerd`);
        },
      });
    } catch (e) {
      console.warn(`Kan ${objName}.location niet beveiligen`, e);
    }
  };

  ["window", "top", "parent"].forEach(name => {
    try {
      preventRedirect(name, eval(name));
    } catch {}
  });

  // window.open blokkeren met specifieke target check
  const originalOpen = window.open;
  window.open = function (url, target = "", ...rest) {
    if (url && typeof url === "string" && !target.includes("hrncustom")) {
      showWarning(`window.open("${url}", "${target}") geblokkeerd`);
      return null;
    }
    return originalOpen.call(window, url, target, ...rest);
  };

  // Intercept link clicks
  document.addEventListener("click", (e) => {
    let el = e.target;
    while (el && el !== document) {
      if (el.tagName === "A" && el.href) {
        const href = el.getAttribute("href");
        const target = el.getAttribute("target")?.toLowerCase();
        if (href && !href.startsWith("#")) {
          showWarning(`Navigatie naar ${href} geblokkeerd`);
          e.preventDefault();
          return;
        }
      }
      el = el.parentNode;
    }
  }, true);

  // Controleer op directe URL veranderingen elke 200ms
  let currentHref = location.href;
  setInterval(() => {
    if (location.href !== currentHref) {
      showWarning(`Redirect naar ${location.href} geblokkeerd`);
      history.pushState(null, "", currentHref);
    }
  }, 200);
})();
