(() => {
  // Blokkeer clicks op <a href> en andere pointer-events die leiden tot navigatie
  document.addEventListener("click", e => {
    let el = e.target;
    while (el && el !== document) {
      if (el.tagName === "A" && el.href) {
        e.preventDefault();
        e.stopImmediatePropagation();
        alert("Link-click geblokkeerd");
        break;
      }
      el = el.parentNode;
    }
  }, true);

  // Blokkeer navigaties op window.open
  const originalOpen = window.open;
  window.open = function() {
    alert("window.open geblokkeerd");
    return null;
  };

  // Blokkeer location.assign en replace
  ['assign', 'replace'].forEach(fn => {
    window.location[fn] = function() {
      alert(`location.${fn} geblokkeerd`);
    };
  });

  // Block set window.location
  Object.defineProperty(window, 'location', {
    configurable: false,
    enumerable: true,
    get() { return window._realLocation || document.location; },
    set(url) {
      alert("window.location assignment geblokkeerd");
    }
  });

  // Blokkeer beforeunload navigaties
  window.addEventListener("beforeunload", e => {
    e.preventDefault();
    e.returnValue = "";
    alert("Beforeunload geblokkeerd");
    return "";
  });

  console.log("🚫 Navigatie blokkades geladen");
})();
