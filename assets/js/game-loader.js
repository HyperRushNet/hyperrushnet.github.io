<script>
(function() {
  // Helper om redirect responses te herkennen
  function isRedirectStatus(status) {
    return status >= 300 && status < 400;
  }

  // Overschrijf fetch
  const originalFetch = window.fetch;
  window.fetch = function(resource, init) {
    return originalFetch(resource, init).then(response => {
      if (isRedirectStatus(response.status)) {
        console.warn('Redirect gedetecteerd en geblokkeerd via fetch:', response.url, 'status:', response.status);
        // Hier kan je een aangepaste response teruggeven, bijvoorbeeld error of lege response
        // We gooien nu een error om de redirect af te breken
        return Promise.reject(new Error('Redirect geblokkeerd: ' + response.url));
      }
      return response;
    });
  };

  // Overschrijf XMLHttpRequest
  const originalOpen = XMLHttpRequest.prototype.open;
  const originalSend = XMLHttpRequest.prototype.send;

  XMLHttpRequest.prototype.open = function(method, url) {
    this._url = url;  // sla url op voor later gebruik
    originalOpen.apply(this, arguments);
  };

  XMLHttpRequest.prototype.send = function(body) {
    this.addEventListener('readystatechange', function() {
      if (this.readyState === 2) { // Headers ontvangen
        if (isRedirectStatus(this.status)) {
          console.warn('Redirect gedetecteerd en geblokkeerd via XHR:', this._url, 'status:', this.status);
          // Hier kan je de request stoppen door abort te doen
          this.abort();
        }
      }
    });
    originalSend.apply(this, arguments);
  };

  console.log('Web request redirect blocker geladen.');
})();
</script>
