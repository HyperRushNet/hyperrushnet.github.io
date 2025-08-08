(() => {
  // Zorg dat notifications bestaan
  if (!window.hrn) window.hrn = {};
  if (!window.hrn.notifications) {
    window.hrn.notifications = {};
  }
  if (!window.hrn.notifications.show) {
    window.hrn.notifications.show = (msg, type = "info", time = 3000) => alert(msg);
  }

  const notify = (msg) => {
    try {
      window.hrn.notifications.show(msg, "error", 3500);
    } catch {
      alert(msg);
    }
  };

  // Huidige URL onthouden
  let currentUrl = location.href;

  // Functie om terug te zetten naar de oude URL en notificeren
  function blockRedirect(reason) {
    if (location.href !== currentUrl) {
      notify(`Redirect geblokkeerd: ${reason}`);
      // Terugzetten zonder reload
      history.pushState(null, document.title, currentUrl);
    }
  }

  // Override location.href setter
  Object.defineProperty(window.location, 'href', {
    configurable: true,
    enumerable: true,
    get() {
      return currentUrl;
    },
    set(url) {
      notify(`Redirect geblokkeerd via location.href = ${url}`);
      // Niet toestaan
    }
  });

  // Override assign
  const originalAssign = location.assign;
  location.assign = function(url) {
    notify(`Redirect geblokkeerd via location.assign(${url})`);
    // niet uitvoeren
  };

  // Override replace
  const originalReplace = location.replace;
  location.replace = function(url) {
    notify(`Redirect geblokkeerd via location.replace(${url})`);
    // niet uitvoeren
  };

  // Override history.pushState en replaceState om URL manipulatie te detecteren
  const originalPushState = history.pushState;
  history.pushState = function(state, title, url) {
    if (url && url !== currentUrl) {
      notify(`Redirect geblokkeerd via history.pushState(${url})`);
      return; // Niet doorvoeren
    }
    return originalPushState.apply(this, arguments);
  };

  const originalReplaceState = history.replaceState;
  history.replaceState = function(state, title, url) {
    if (url && url !== currentUrl) {
      notify(`Redirect geblokkeerd via history.replaceState(${url})`);
      return; // Niet doorvoeren
    }
    return originalReplaceState.apply(this, arguments);
  };

  // Monitor URL elke 100ms (fallback)
  setInterval(() => {
    if (location.href !== currentUrl) {
      blockRedirect('URL verandering gedetecteerd');
    }
  }, 100);

  // Blokkeer ook links met target die niet mag (volgens jouw regels)
  const isBlockedTarget = (target) => {
    const allowList = ["_hrncustomredirect"];
    return typeof target === "string" && target.startsWith("_") && !allowList.includes(target.toLowerCase());
  };

  document.addEventListener('click', e => {
    let el = e.target;
    while(el && el !== document) {
      if(el.tagName === "A" && el.href) {
        const target = el.getAttribute('target')?.toLowerCase();
        if(target && isBlockedTarget(target)) {
          notify("Redirect geblokkeerd (verboden target)");
          e.preventDefault();
          break;
        }
      }
      el = el.parentNode;
    }
  }, true);
})();
