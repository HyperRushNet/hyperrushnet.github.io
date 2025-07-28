    (function () {
      const wrapper = document.getElementById("wrapper");

      function getQueryParam(name) {
        const match = new RegExp("[?&]" + name + "=([^&]*)").exec(location.search);
        return match ? decodeURIComponent(match[1].replace(/\+/g, " ")) : null;
      }

      const nrRaw = getQueryParam("nr");
      if (!nrRaw) {
        wrapper.innerHTML = '⚠️ No game number provided.<br><br>Use e.g.: <code>?nr=1</code>';
        document.title = 'No game - HyperRush';
        return;
      }

      const nr = parseInt(nrRaw, 10);
      if (isNaN(nr) || nr < 1) {
        wrapper.innerHTML = '⚠️ Invalid game number.<br><br>Use a positive number like <code>?nr=1</code>';
        document.title = 'Invalid game - HyperRush';
        return;
      }

      fetch("https://hyperrushnet.github.io/json/games.json").then(r => {
        if (!r.ok) throw new Error("Could not load games.json");
        return r.json();
      }).then(games => {
        const game = games.find(g => g.number === nr);
        if (!game) {
          wrapper.innerHTML = `⚠️ No game found with number ${nr}.`;
          document.title = "Game not found - HyperRush";
          return;
        }

        if (typeof game.link !== 'string' || !/^\/[a-zA-Z0-9\-_/]+$/.test(game.link)) {
          wrapper.innerHTML = '⚠️ Invalid game link.';
          document.title = 'Invalid game - HyperRush';
          return;
        }

        document.title = `${game.name} - HyperRush`;

        const iframe = document.createElement("iframe");
        iframe.src = game.link;
        iframe.setAttribute("sandbox", "allow-scripts allow-same-origin");
        iframe.setAttribute("allowfullscreen", "true");
        iframe.setAttribute("loading", "eager");
        iframe.width = "100%";
        iframe.height = "100%";

        wrapper.innerHTML = '';
        wrapper.appendChild(iframe);

        // Blokkeer window.open met redirect
        const originalOpen = window.open;
        window.open = function (url, target, features) {
          if (['_top', '_parent', '_self'].includes(target)) {
            if (window.hrn && hrn.notifications) {
              hrn.notifications.show("Redirect blocked!", "info", "2500");
            }
            console.warn("Blocked redirect via window.open to", target);
            return null;
          }
          return originalOpen.call(window, url, target, features);
        };

        // Extra: detecteer pogingen tot top-navigatie via focus tricks (optioneel)
        window.addEventListener('beforeunload', e => {
          if (document.activeElement === iframe) {
            if (window.hrn && hrn.notifications) {
              hrn.notifications.show("Redirect blocked!", "info", "2500");
            }
            e.preventDefault();
            e.returnValue = '';
          }
        });

        // FPS meter (optioneel)
        iframe.onload = () => {
          try {
            const doc = iframe.contentDocument || iframe.contentWindow.document;
            const win = iframe.contentWindow;

            const fpsBox = doc.createElement("div");
            fpsBox.style.cssText = `
              position:fixed;top:8px;left:8px;background:rgba(0,0,0,0.6);
              color:#0f0;font:14px monospace;padding:4px 8px;z-index:9999;
              pointer-events:none;user-select:none;border-radius:4px;
            `;
            fpsBox.textContent = "FPS: --";
            doc.body.appendChild(fpsBox);

            let lastTime = performance.now(), frames = 0;
            function updateFPS() {
              const now = performance.now();
              frames++;
              if (now - lastTime >= 1000) {
                fpsBox.textContent = "FPS: " + frames;
                frames = 0;
                lastTime = now;
              }
              win.requestAnimationFrame(updateFPS);
            }
            win.requestAnimationFrame(updateFPS);
          } catch (e) {
            console.warn("FPS meter failed:", e);
          }
        };
      }).catch(err => {
        wrapper.innerHTML = '⚠️ Error loading games.json.<br><br>' + err.message;
        document.title = 'Loading error - HyperRush';
      });
    })();
    