
function applyColorSchemeFavicon(options) {
    if (!options || !options.light || !options.dark) {
        return Promise.reject(new Error('Vereist: opties met light en dark favicon URLs.'));
    }

    function detectColorScheme() {
        if (window.matchMedia) {
            if (window.matchMedia('(prefers-color-scheme: dark)').matches) {
                return 'dark';
            }
            if (window.matchMedia('(prefers-color-scheme: light)').matches) {
                return 'light';
            }
        }
        return 'unknown';
    }

    function setFavicon(mode) {
        const oldLinks = document.querySelectorAll('link[rel="icon"]');
        oldLinks.forEach(link => link.remove());

        const link = document.createElement('link');
        link.rel = 'icon';
        link.type = 'image/x-icon';

        if (mode === 'dark') link.href = options.dark;
        else if (mode === 'light') link.href = options.light;
        else link.href = options.default || options.light;

        document.head.appendChild(link);
    }

    return new Promise(resolve => {
        if (document.readyState === 'complete') {
            // Pagina is al geladen
            const mode = detectColorScheme();
            setFavicon(mode);

            if (window.matchMedia) {
                const darkQuery = window.matchMedia('(prefers-color-scheme: dark)');
                darkQuery.addEventListener('change', e => {
                    setFavicon(e.matches ? 'dark' : 'light');
                });
            }
            resolve();
        } else {
            // Wacht tot pagina geladen is
            window.addEventListener('load', () => {
                const mode = detectColorScheme();
                setFavicon(mode);

                if (window.matchMedia) {
                    const darkQuery = window.matchMedia('(prefers-color-scheme: dark)');
                    darkQuery.addEventListener('change', e => {
                        setFavicon(e.matches ? 'dark' : 'light');
                    });
                }
                resolve();
            });
        }
    });
}
