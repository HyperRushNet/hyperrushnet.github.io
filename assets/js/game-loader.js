(() => {
  // Override window.open
  window.open = () => null;

  // Override location.assign & location.replace
  ['assign', 'replace'].forEach(fn => {
    window.location[fn] = () => {};
  });

  // Block all <a> link clicks
  document.addEventListener('click', e => {
    let el = e.target;
    while (el && el !== document) {
      if (el.tagName === 'A' && el.href) {
        e.preventDefault();
        e.stopImmediatePropagation();
        break;
      }
      el = el.parentNode;
    }
  }, true);
})();
