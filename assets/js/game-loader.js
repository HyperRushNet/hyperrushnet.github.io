<script>
(function() {
  function isRedirectStatus(status) {
    return status >= 300 && status < 400;
  }

  // Wacht tot Module en Module.fetch beschikbaar zijn
  function hookUnityFetch() {
    if (typeof Module !== 'undefined' && Module['fetch']) {
      const originalFetch = Module['fetch'];

      Module['fetch'] = function(resource, options) {
        options = options || {};
        // Forceer redirect mode op 'manual' om redirects niet automatisch te volgen
        options.redirect = 'manual';

        return originalFetch(resource, options).then(response => {
          if (isRedirectStatus(response.status) || response.type === 'opaqueredirect') {
            console.warn('Redirect gedetecteerd en geblokkeerd via Unity fetch:', response.url, 'status:', response.status);
            // Redirect blokkeren door een rejected promise terug te geven
            return Promise.reject(new Error('Redirect geblokkeerd: ' + response.url));
          }
          return response;
        }).catch(err => {
          console.error('Fout in fetch hook:', err);
          throw err;
        });
      };

      console.log('UnityLoader.js fetch functie succesvol gehooked voor redirect blokkering.');
    } else {
      // Module of Module.fetch nog niet beschikbaar? Probeer opnieuw over 100ms
      setTimeout(hookUnityFetch, 100);
    }
  }

  hookUnityFetch();
})();
</script>
