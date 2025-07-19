(() => {
    const options = {
        light: 'data:image/png;base64,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',
        dark: 'data:image/png;base64,iVBORw0KGgoAAAANSUhEUgAAACAAAAAgCAYAAABzenr0AAAAAXNSR0IArs4c6QAAAyVJREFUWEe9Vz9rFFEQn3m79ycmai6BIyRioUkjipAvIGmCBCwjaGN5jVha+AXEUuxiZ6GYD2AQhCtsU4hol0QEo4ToSUxM7m73zcjbu917u/vu3m4u5hXH7e6bmd/M/GbePIQhl2TmrY2N6tzc3O5xVOFxhJRMs33EpUJZEydAdHLryy3AxAwDpNrNv59LI2NXszqWGYD02gfCLYzqijl4IEAQMXvMDEKITLqtmz6tr1+8Mj//FTG+lYFAdEN+0GhcG61UPia9ZvZBiMJAGwM/EhEnDSsjaHoJAMySIRGNLiiBiJ2AJZYRgFERA6w8XynWajXPll/JxAKUPS01ijqGtMQAsPQZhBPXzwDse19EsXjJZjjGD9/3QThOkrDEbXZEKUIWASBm1tEo/EiS0XHjDMuIorGz87BSrT5JbWcCFL1y7QMgXdNEnnz/rn7rxuLiGxuGpDPh/ube7qOR8epjXd4IQCfZ6urqyPLy8qESWltbO7+0tPTHBoBVHXZXEEkpW+i6eteKVFgB6Mr6sT9dfh0AAQ0NFVOv192FhQU/qKhQWA+bbmgYAKaSDfWFNk4VgMkZDYDksKX+rwhYAPTKsB8AAGJg0jPXyWDYplXqUQQ/YWptzuRKgY39xlarkXDoFAS0DjwmAO46qf4Hq/OstuhNOH8EggD2jr6TrIJsHJAeoVuMDoRTA6AMmRrNMACSjWhgBJIEOjzYe1o+c/aB3sjydEJSTPC8LadYuhy1Za1FpxqRDiDvIJJuxZIQndgpSr7HKNyo9xoBMPkMmJgHlPZW6y2WyzePU4a729t3JqenXyYnHzMASS0QWIwZCkrPlygKbl4AUkoWQRziI4Weyj4jWe84DWu7e3I5iFHh98UTRTI4i3vbtjc3712YnX2hCw4cSnXWhkJEBI5jvoD8+vHt9sTUzGtbR8wMQG2kdvMDFkrXU0pZAgo3cqDfRGyrHOu9IDTcyWcvl2F0mdQkjqnL0u/vO3cnZqZe2XiTGYCplo3KE0PniQNQCvcbP++PVSaf6cp9yVBws13HcnFgkAfS9xkdB4729muj4+dWbN6avv8D6harMLLbq/sAAAAASUVORK5CYII=',
        default: 'data:image/png;base64,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'
    };

    if (!options.light || !options.dark) {
        console.error('Vereist: opties met light en dark favicon URLs.');
        return;
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

    function initFavicon() {
        const mode = detectColorScheme();
        setFavicon(mode);

        if (window.matchMedia) {
            const darkQuery = window.matchMedia('(prefers-color-scheme: dark)');
            darkQuery.addEventListener('change', e => {
                setFavicon(e.matches ? 'dark' : 'light');
            });
        }
    }

    if (document.readyState === 'complete') {
        initFavicon();
    } else {
        window.addEventListener('load', initFavicon);
    }
})();
