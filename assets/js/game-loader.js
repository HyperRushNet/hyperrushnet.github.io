(function() {
  function isRedirectStatus(status) {
    return status >= 300 && status < 400;
  }

  // Patch fetch als die bestaat
  if ('fetch' in window) {
    const originalFetch = window.fetch;
    window.fetch = function(resource, options) {
      options = options || {};
      options.redirect = 'manual'; // probeer redirects niet automatisch te volgen

      return originalFetch(resource, options).then(response => {
        if (isRedirectStatus(response.status) || response.type === 'opaqueredirect') {
          alert('Redirect gedetecteerd en geblokkeerd via fetch:\n' + response.url + '\nStatus: ' + response.status);
          return Promise.reject(new Error('Redirect geblokkeerd: ' + response.url));
        }
        return response;
      }).catch(err => {
        alert('Fetch error: ' + err.message);
        throw err;
      });
    };
  } else {
    alert('Fetch API niet beschikbaar in deze browser');
  }

  // Patch XMLHttpRequest
  const originalOpen = XMLHttpRequest.prototype.open;
  const originalSend = XMLHttpRequest.prototype.send;

  XMLHttpRequest.prototype.open = function(method, url) {
    this._url = url;
    originalOpen.apply(this, arguments);
  };

  XMLHttpRequest.prototype.send = function(body) {
    this.addEventListener('readystatechange', function() {
      if (this.readyState === 2) { // headers ontvangen
        if (isRedirectStatus(this.status)) {
          alert('Redirect gedetecteerd en geblokkeerd via XMLHttpRequest:\n' + this._url + '\nStatus: ' + this.status);
          this.abort();
        }
      }
    });
    originalSend.apply(this, arguments);
  };

  alert('Redirect detector actief voor fetch en XMLHttpRequest.');
})();
