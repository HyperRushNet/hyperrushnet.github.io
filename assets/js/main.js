(() => {
  const fallbackSrc = "https://placehold.co/600x400/2C2F33/FFFFFF?text=FAILED&font=montserrat&bold=true&font_size=48";

  let allGames = [];
  let activeCategory = null;
  let resizeScheduled = false;

  const sidebar = document.getElementById("sidebar");
  const menuToggle = document.getElementById("menuToggle");
  const categoryList = document.getElementById("categoryList");
  const gameCardsContainer = document.getElementById("gameCardsContainer");
  const searchInput = document.getElementById("searchInput");
  const searchBtn = document.getElementById("searchBtn");
  const appWrapper = document.getElementById("appWrapper");
  const body = document.body;
  const overlay = document.querySelector(".overlay");

  menuToggle.addEventListener("click", () => {
    const isOpen = sidebar.classList.toggle("open");
    appWrapper.classList.toggle("active", isOpen);
    body.classList.toggle("lock-scroll", isOpen);
  });

  appWrapper.addEventListener("click", (e) => {
    if (
      sidebar.classList.contains("open") &&
      !sidebar.contains(e.target) &&
      !menuToggle.contains(e.target)
    ) {
      sidebar.classList.remove("open");
      appWrapper.classList.remove("active");
      body.classList.remove("lock-scroll");
    }
  });

  function updateOverlaySize() {
    if (!overlay) return;
    overlay.style.width = window.innerWidth + "px";
    overlay.style.height = window.innerHeight + "px";
  }

  function adjustGridColumns() {
    const containerWidth = gameCardsContainer.clientWidth;
    const styles = getComputedStyle(document.documentElement);
    const gap = parseInt(styles.getPropertyValue("--gap")) || 10;
    const minCardWidth = parseInt(styles.getPropertyValue("--min-card-width")) || 160;

    let maxPerRow = Math.floor((containerWidth + gap) / (minCardWidth + gap));
    maxPerRow = Math.max(1, maxPerRow);

    const cardWidth = (containerWidth - (maxPerRow - 1) * gap) / maxPerRow;
    gameCardsContainer.style.gridTemplateColumns = `repeat(${maxPerRow}, ${cardWidth}px)`;
  }

  function onResize() {
    if (resizeScheduled) return;
    resizeScheduled = true;
    requestAnimationFrame(() => {
      updateOverlaySize();
      adjustGridColumns();
      resizeScheduled = false;
    });
  }

  window.addEventListener("resize", onResize);

  function closeSidebar() {
    sidebar.classList.remove("open");
    appWrapper.classList.remove("active");
    body.classList.remove("lock-scroll");
  }

  function renderCategories() {
    const categories = [...new Set(allGames.map(g => g.category))];
    categoryList.innerHTML = "";

    const allBtn = document.createElement("button");
    allBtn.textContent = "Alle games";
    allBtn.onclick = () => {
      activeCategory = null;
      renderCategories();
      renderGames(allGames);
      if (window.innerWidth < 768) closeSidebar();
    };
    if (!activeCategory) allBtn.classList.add("active");
    categoryList.appendChild(allBtn);

    categories.forEach(cat => {
      const btn = document.createElement("button");
      btn.textContent = cat;
      btn.onclick = () => {
        activeCategory = cat;
        renderCategories();
        filterAndRender();
        if (window.innerWidth < 768) closeSidebar();
      };
      if (cat === activeCategory) btn.classList.add("active");
      categoryList.appendChild(btn);
    });
  }

  function renderGames(games) {
    gameCardsContainer.innerHTML = "";
    const fragment = document.createDocumentFragment();

    games.forEach(game => {
      const card = document.createElement("div");
      card.className = "game-card";
      card.onclick = () => {
        window.location.href = `/game?nr=${game.number}`;
      };

      const img = document.createElement("img");
      img.loading = "lazy";
      img.src = game.img;
      img.alt = `${game.name} afbeelding`;

      const originalSrc = game.img;

      img.onerror = function () {
        if (img.dataset.retrying) return;
        img.dataset.retrying = "true";
        img.src = fallbackSrc;

        const retryInterval = setInterval(() => {
          const testImg = new Image();
          testImg.onload = function () {
            clearInterval(retryInterval);
            img.src = originalSrc;
            delete img.dataset.retrying;
          };
          testImg.src = originalSrc + "?t=" + Date.now();
        }, 5000);
      };

      const fade = document.createElement("div");
      fade.className = "game-fade";

      const title = document.createElement("div");
      title.className = "game-title-overlay";
      title.textContent = game.name;

      card.appendChild(img);
      card.appendChild(fade);
      card.appendChild(title);
      fragment.appendChild(card);
    });

    gameCardsContainer.appendChild(fragment);
    adjustGridColumns();
  }

  function filterAndRender() {
    const term = searchInput.value.toLowerCase().trim();
    let filtered;

    if (term) {
      filtered = allGames.filter(g => g.name.toLowerCase().includes(term));
    } else if (activeCategory) {
      filtered = allGames.filter(g => g.category === activeCategory);
    } else {
      filtered = allGames;
    }

    renderGames(filtered);
    if (window.innerWidth < 768 && sidebar.classList.contains("open")) {
      closeSidebar();
    }
  }

  searchBtn.addEventListener("click", filterAndRender);
  searchInput.addEventListener("keypress", e => {
    if (e.key === "Enter") filterAndRender();
  });

  fetch("/assets/json/games.json")
    .then(res => res.json())
    .then(data => {
      allGames = data;
      renderCategories();
      renderGames(allGames);
      updateOverlaySize();
      adjustGridColumns();
    })
    .catch(err => {
      console.error("Fout bij laden van games.json:", err);
    });
})();
