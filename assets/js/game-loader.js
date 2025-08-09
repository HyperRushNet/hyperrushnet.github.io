(function() {
  // Wacht tot Module en Module.fetch bestaan
  function waitForModuleFetch(maxTries = 50, interval = 100) {
    return new Promise((resolve, reject) => {
      let tries = 0;
      const timer = setInterval(() => {
        tries++;
        if (typeof Module !== 'undefined' && typeof Module.fetch === 'function') {
          clearInterval(timer);
          resolve(Module.fetch);
        } else if (tries >= maxTries) {
          clearInterval(timer);
          reject('Module.fetch niet gevonden na wachten');
        }
      }, interval);
    });
  }

  // Hook de fetch functie
  waitForModuleFetch().then(originalFetch => {
    Module.fetch = function(resource, options) {
      options = options || {};
      options.redirect = 'manual'; // voorkom automatische redirect opvolging

      return originalFetch(resource, options).then(response => {
        if ((response.status >= 300 && response.status < 400) || response.type === 'opaqueredirect') {
          alert('Redirect gedetecteerd en geblokkeerd:\nURL: ' + response.url + '\nStatus: ' + response.status);
          // Redirect blokkeren door error te gooien
          return Promise.reject(new Error('Redirect geblokkeerd: ' + response.url));
        }
        return response;
      }).catch(err => {
        alert('Fetch hook error:\n' + err);
        throw err;
      });
    };
    alert('Module.fetch succesvol gehooked om redirects te blokkeren');
  }).catch(err => {
    alert('Error bij hooken Module.fetch:\n' + err);
  });
})();
