(() => {
  const blockNav = (src) => {
    console.warn(`[BLOCKED] ${src}`);
    alert(`🚫 Redirect attempt via ${src} was blocked`);
  };

  // Block window.location changes
  Object.defineProperty(window, 'location', {
    configurable: false,
    enumerable: true,
    get: () => window._realLocation || document.location,
    set: (v) => {
      blockNav("window.location SET");
    }
  });

  // Block location.assign and location.replace
  ['assign', 'replace'].forEach(fn => {
    window.location[fn] = () => blockNav(`location.${fn}`);
  });

  // Block window.open
  window.open = () => {
    blockNav("window.open");
    return null;
  };

  // Block <a href> clicks
  document.addEventListener("click", (e) => {
    let el = e.target;
    while (el) {
      if (el.tagName === "A" && el.href) {
        e.preventDefault();
        blockNav("<a href>");
        break;
      }
      el = el.parentNode;
    }
  }, true);

  // Intercept Unity SendMessage calls (optional, for extra safety)
  const originalSendMessage = window.SendMessage;
  window.SendMessage = function (...args) {
    const [obj, method, param] = args;
    if (typeof param === "string" && param.startsWith("http")) {
      blockNav(`SendMessage(${method})`);
      return;
    }
    return originalSendMessage?.apply(this, args);
  };

  // Block Application.OpenURL simulation (some Unity games call this)
  window.openURL = (url) => {
    blockNav("Application.OpenURL");
  };

  // Before unload
  window.addEventListener("beforeunload", (e) => {
    e.preventDefault();
    e.returnValue = "";
    blockNav("beforeunload");
    return "";
  });

  console.log("✅ Unity-safe navigation blocker loaded");
})();
