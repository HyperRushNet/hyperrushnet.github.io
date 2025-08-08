(() => {
  function throttle(f, d) {
    let t, r;
    return function (...a) {
      const c = this;
      if (!r) {
        f.apply(c, a);
        r = Date.now();
      } else {
        clearTimeout(t);
        t = setTimeout(() => {
          if (Date.now() - r >= d) {
            f.apply(c, a);
            r = Date.now();
          }
        }, d - (Date.now() - r));
      }
    };
  }

  const icons = {
    success: '<svg xmlns="http://www.w3.org/2000/svg" viewBox="0 0 24 24" stroke="currentColor" fill="none" stroke-width="2" stroke-linecap="round" stroke-linejoin="round"><circle cx="12" cy="12" r="10"/><path d="M9 12l2 2 4-4"/></svg>',
    error: '<svg xmlns="http://www.w3.org/2000/svg" viewBox="0 0 24 24" stroke="currentColor" fill="none" stroke-width="2" stroke-linecap="round" stroke-linejoin="round"><circle cx="12" cy="12" r="10"/><line x1="15" y1="9" x2="9" y2="15"/><line x1="9" y1="9" x2="15" y2="15"/></svg>',
    warning: '<svg viewBox="0 0 24 24" stroke="currentColor" fill="none" stroke-width="2" stroke-linecap="round"><polygon points="7.07 2 16.93 2 22 7.07 22 16.93 16.93 22 7.07 22 2 16.93 2 7.07"/><line x1="12" y1="8" x2="12" y2="13"/><line x1="12" y1="16" x2="12.01" y2="16"/></svg>',
    info: '<svg xmlns="http://www.w3.org/2000/svg" viewBox="0 0 24 24" stroke="currentColor" fill="none" stroke-width="2" stroke-linecap="round"><circle cx="12" cy="12" r="10"/><line x1="12" y1="16" x2="12" y2="12"/><line x1="12" y1="8" x2="12.01" y2="8"/></svg>',
  };

  const colors = {
    success: "#d1fae5",
    error: "#fee2e2",
    warning: "#fef3c7",
    info: "#dbeafe",
  };

  const dur = 3000;
  const style = `
    #hrnnotifbox {
      position: fixed;
      top: 12px;
      right: 12px;
      z-index: 2147483647;
      display: flex;
      flex-direction: column;
      gap: 10px;
      pointer-events: none;
      max-width: calc(100vw - 24px);
      overflow: hidden;
    }
    .hrn-notif {
      pointer-events: auto;
      position: relative;
      display: flex;
      align-items: center;
      gap: 10px;
      padding: 10px 14px;
      border-radius: 6px;
      font-family: sans-serif;
      font-weight: 500;
      font-size: 13px;
      color: #111;
      background: var(--b);
      box-shadow: 0 1px 4px rgba(0,0,0,.05);
      opacity: 0;
      transform: translateX(10px);
      transition: opacity .3s ease, transform .3s ease;
      width: 100%;
      max-width: min(320px, 80vw);
      min-width: 180px;
    }
    .hrn-notif.show {
      opacity: 1;
      transform: translateX(0);
    }
    .hrn-notif.fade {
      opacity: 0;
    }
    .hrn-notif svg {
      width: 20px;
      height: 20px;
      stroke: #111;
      stroke-width: 2;
    }
    .hrn-notif span {
      flex: 1;
      display: -webkit-box;
      -webkit-line-clamp: 2;
      -webkit-box-orient: vertical;
      overflow: hidden;
      text-overflow: ellipsis;
      line-height: 1.4em;
    }
    .hrnbar {
      position: absolute;
      bottom: 0;
      left: 0;
      height: 3px;
      width: 100%;
      background: rgba(0,0,0,.05);
    }
    .hrnbar > div {
      height: 100%;
      background: rgba(0,0,0,.2);
      animation: shrink linear forwards;
    }
    @keyframes shrink {
      from { width: 100%; }
      to { width: 0; }
    }`;

  let host, root, box;

  function create(force) {
    try {
      if (host && document.contains(host) && !force) return;
      host = document.createElement("div");
      host.style =
        "all:initial;position:fixed;z-index:2147483647;width:0;height:0;top:0;left:0;pointer-events:none;";
      (document.documentElement || document.body || document.head).appendChild(host);
      root = host.attachShadow({ mode: "open" });
      const s = document.createElement("style");
      s.textContent = style;
      root.appendChild(s);
      box = document.createElement("div");
      box.id = "hrnnotifbox";
      root.appendChild(box);
    } catch {}
  }

  function show(msg, type = "info", time = dur) {
    try {
      if (typeof msg !== "string" || !msg.trim()) return;
      create();
      const fade = 500;
      const el = document.createElement("div");
      el.className = "hrn-notif";
      el.style.setProperty("--b", colors[type] || colors.info);
      el.innerHTML = `${icons[type] || icons.info}<span>${msg}</span><div class="hrnbar"><div style="animation-duration:${time}ms"></div></div>`;
      box.appendChild(el);
      requestAnimationFrame(() => el.classList.add("show"));
      setTimeout(() => {
        el.classList.remove("show");
        el.classList.add("fade");
      }, time - fade);
      setTimeout(() => el.remove(), time + 300);
    } catch {}
  }

  function init() {
    create(true);
    if (!window.hrn) window.hrn = {};
    if (!window.hrn.notifications) window.hrn.notifications = { show: throttle(show, 300) };
  }

  init();

  function watchdog() {
    setInterval(() => {
      if (!document.contains(host)) create(true);
    }, 2000);
  }

  watchdog();

  function recover() {
    try {
      new MutationObserver(() => create()).observe(document.documentElement, { childList: true, subtree: true });
    } catch {}
  }

  recover();

  // Nieuwe redirect blokkering via URL check & reset
  (() => {
    let currentUrl = location.href;

    const showWarning = (msg) => {
      if (window.hrn?.notifications?.show) {
        window.hrn.notifications.show(msg, "error", 3500);
      } else {
        alert(msg);
      }
    };

    function resetUrl() {
      if (location.href !== currentUrl) {
        showWarning("Redirect geblokkeerd!");
        history.pushState(null, document.title, currentUrl);
      }
    }

    setInterval(resetUrl, 100);

    window.addEventListener("popstate", () => {
      if (location.href !== currentUrl) {
        showWarning("Redirect geblokkeerd!");
        history.pushState(null, document.title, currentUrl);
      }
    });

    window.addEventListener("beforeunload", (e) => {
      if (location.href !== currentUrl) {
        showWarning("Redirect geblokkeerd!");
        e.preventDefault();
        e.returnValue = "";
        return "";
      }
    });
  })();

  // Originele redirect blokkades behouden
  const isBlockedTarget = (target) => {
    const allowList = ["_hrncustomredirect"];
    return typeof target === "string" && target.startsWith("_") && !allowList.includes(target.toLowerCase());
  };

  const originalOpen = window.open;
  window.open = function (url, target, ...args) {
    if (target && isBlockedTarget(target)) {
      if (window.hrn?.notifications?.show) {
        window.hrn.notifications.show(`Redirect blocked`, "info", 3500);
      } else {
        alert("Redirect blocked");
      }
      return null;
    }
    return originalOpen.call(window, url, target, ...args);
  };

  location.assign = (url) => {
    if (window.hrn?.notifications?.show) {
      window.hrn.notifications.show("Redirect blocked", "info", 3500);
    } else {
      alert("Redirect blocked");
    }
  };
  location.replace = (url) => {
    if (window.hrn?.notifications?.show) {
      window.hrn.notifications.show("Redirect blocked", "info", 3500);
    } else {
      alert("Redirect blocked");
    }
  };

  const protectLocation = (obj, name) => {
    try {
      const desc = Object.getOwnPropertyDescriptor(obj, "location");
      if (!desc || desc.configurable) {
        Object.defineProperty(obj, "location", {
          configurable: true,
          enumerable: true,
          get: () => window.location,
          set: (url) => {
            if (window.hrn?.notifications?.show) {
              window.hrn.notifications.show(`${name}.location = ${url} blocked`, "info", 3500);
            } else {
              alert(`${name}.location = ${url} blocked`);
            }
          },
        });
      }
    } catch {}
  };

  [window, top, parent].forEach((obj, i) =>
    protectLocation(obj, i === 0 ? "window" : i === 1 ? "top" : "parent")
  );

  document.addEventListener(
    "click",
    (e) => {
      let el = e.target;
      while (el && el !== document) {
        if (el.tagName === "A" && el.href) {
          const target = el.getAttribute("target")?.toLowerCase();
          if (target && isBlockedTarget(target)) {
            if (window.hrn?.notifications?.show) {
              window.hrn.notifications.show(`Redirect blocked`, "info", 3500);
            } else {
              alert("Redirect blocked");
            }
            e.preventDefault();
            break;
          }
        }
        el = el.parentNode;
      }
    },
    true
  );

  // Favicon en console clear (origineel)
  function setFaviconBasedOnTheme() {
    const darkMode = window.matchMedia && window.matchMedia('(prefers-color-scheme: dark)').matches;
    const faviconURL = darkMode
      ? '/assets/images/favicon/ffffff.png'
      : '/assets/images/favicon/000000.png';
    let link = document.querySelector("link[rel~='icon']");
    if (!link) {
      link = document.createElement('link');
      link.rel = 'icon';
      document.head.appendChild(link);
    }
    link.href = faviconURL;
  }

  setFaviconBasedOnTheme();

  if (window.matchMedia) {
    window.matchMedia('(prefers-color-scheme: dark)').addEventListener('change', setFaviconBasedOnTheme);
  }

  (() => {
    const methods = ["log", "info", "warn", "error", "debug", "trace"];
    for (const method of methods) {
      console[method] = () => {
        console.clear();
      };
    }
  })();
})();
