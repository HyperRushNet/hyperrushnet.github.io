(function() {
  function blockNavigation(reason) {
    alert('Pagina navigatie poging geblokkeerd:\n' + reason);
  }

  // Override window.location assignment
  const originalLocation = window.location;

  Object.defineProperty(window, 'location', {
    configurable: false,
    enumerable: true,
    get() {
      return originalLocation;
    },
    set(value) {
      blockNavigation('window.location assignment: ' + value);
      // Geen redirect uitvoeren
    }
  });

  // Override location.assign()
  const originalAssign = window.location.assign;
  window.location.assign = function(url) {
    blockNavigation('window.location.assign: ' + url);
    // Geen redirect uitvoeren
  };

  // Override location.replace()
  const originalReplace = window.location.replace;
  window.location.replace = function(url) {
    blockNavigation('window.location.replace: ' + url);
    // Geen redirect uitvoeren
  };

  // Override window.open (voor nieuwe tab navigaties)
  const originalOpen = window.open;
  window.open = function(url, name, specs) {
    blockNavigation('window.open: ' + url);
    // Kan hier eventueel origineel open aanroepen als je wilt toestaan:
    // return originalOpen.call(window, url, name, specs);
    return null; // blokkeren
  };

  alert('Pagina navigatie-blokkade actief (window.location + open overriden)');
})();
