/**
 * ZYNQ Game Hub - Dynamic Category Loading
 */
let activeCategory = null;
const imageCache = {};

// DOM Elements
const sidebar = document.getElementById("sidebar");
const menuToggle = document.getElementById("menuToggle");
const categoryList = document.getElementById("categoryList");
const gameCardsContainer = document.getElementById("gameCardsContainer");
const searchInput = document.getElementById("searchInput");
const searchBtn = document.getElementById("searchBtn");
const appWrapper = document.getElementById("appWrapper");

/**
 * Utility: Capitalize First Letter
 */
const capitalize = (str) => str.charAt(0).toUpperCase() + str.slice(1).toLowerCase();

/**
 * INITIALIZATION: ZYNQ Games Engine
 */
async function initZynq() {
    try {
        // Initialize the engine (fetches the global database)
        await ZYNQ.games.init({
            mode: "all",
            sort: "name"
        });

        console.log("ZYNQ Loaded. Total games available:", ZYNQ.games.total);
        
        renderCategories();
        renderGames(ZYNQ.games.list); 
    } catch (err) {
        console.error("Error initializing ZYNQ:", err);
    }
}

/**
 * UI EVENT LISTENERS
 */
menuToggle.addEventListener("click", () => {
    const isOpen = sidebar.classList.toggle("open");
    appWrapper.classList.toggle("active", isOpen);
    document.body.classList.toggle("lock-scroll", isOpen);
});

appWrapper.addEventListener("click", (e) => {
    if (sidebar.classList.contains("open") && !sidebar.contains(e.target) && !menuToggle.contains(e.target)) {
        closeSidebar();
    }
});

function closeSidebar() {
    sidebar.classList.remove("open");
    appWrapper.classList.remove("active");
    document.body.classList.remove("lock-scroll");
}

/**
 * CATEGORY LOGIC
 * Automatically fetches categories and formats them
 */
function renderCategories() {
    // 1. Get unique categories from the dataset
    // 2. Filter out empty ones
    // 3. Sort them alphabetically
    const rawCategories = [...new Set(ZYNQ.games.all.map(g => g.category).filter(Boolean))];
    rawCategories.sort();
    
    categoryList.innerHTML = "";
    
    // Create "All Games" Button
    const allBtn = document.createElement("button");
    allBtn.textContent = "All Games";
    allBtn.onclick = () => {
        activeCategory = null;
        ZYNQ.games.reset();
        renderGames(ZYNQ.games.list);
        if (window.innerWidth < 768) closeSidebar();
    };
    categoryList.appendChild(allBtn);

    // Create Dynamic Buttons
    rawCategories.forEach(cat => {
        const btn = document.createElement("button");
        
        // Ensure first letter is uppercase
        btn.textContent = capitalize(cat);
        
        btn.onclick = () => {
            activeCategory = cat; // Use the raw category for the filter
            ZYNQ.games.getByCategory(cat);
            renderGames(ZYNQ.games.list);
            if (window.innerWidth < 768) closeSidebar();
        };
        categoryList.appendChild(btn);
    });
}

/**
 * GAME RENDERING
 */
function renderGames(games) {
    gameCardsContainer.innerHTML = "";
    
    games.forEach(game => {
        const card = document.createElement("div");
        card.className = "game-card";
        
        // Navigate using ZYNQ schema (url or alias)
        card.onclick = () => {
            window.location.href = game.url; 
        };

        // Image Handling
        let img;
        const thumbUrl = game.thumb;

        if (imageCache[thumbUrl]) {
            img = imageCache[thumbUrl].cloneNode();
        } else {
            img = document.createElement("img");
            img.loading = "lazy";
            img.src = thumbUrl;
            img.alt = game.name;
            imageCache[thumbUrl] = img;
        }

        const fallbackSrc = "https://placehold.co/600x400/2C2F33/FFFFFF?text=IMAGE+NOT+FOUND";

        img.onerror = function () {
            if (img.dataset.retrying) return;
            img.dataset.retrying = "true";
            img.src = fallbackSrc;
        };

        const fade = document.createElement("div");
        fade.className = "game-fade";

        const title = document.createElement("div");
        title.className = "game-title-overlay";
        title.textContent = game.name;

        card.appendChild(img);
        card.appendChild(fade);
        card.appendChild(title);
        gameCardsContainer.appendChild(card);
    });
    
    adjustGridColumns();
}

/**
 * FILTER & SEARCH (Using ZYNQ API)
 */
function filterAndRender() {
    const term = searchInput.value.toLowerCase().trim();
    
    if (term) {
        ZYNQ.games.search(term);
    } else if (activeCategory) {
        ZYNQ.games.getByCategory(activeCategory);
    } else {
        ZYNQ.games.reset();
    }

    renderGames(ZYNQ.games.list);
}

/**
 * LAYOUT UTILS
 */
function adjustGridColumns() {
    const containerWidth = gameCardsContainer.clientWidth;
    const gap = 15; 
    const minCardWidth = 160;

    let maxPerRow = Math.floor((containerWidth + gap) / (minCardWidth + gap));
    maxPerRow = Math.max(1, maxPerRow);

    const cardWidth = (containerWidth - (maxPerRow - 1) * gap) / maxPerRow;
    gameCardsContainer.style.gridTemplateColumns = `repeat(${maxPerRow}, ${cardWidth}px)`;
}

// Global Listeners
searchBtn.addEventListener("click", filterAndRender);
searchInput.addEventListener("keypress", e => {
    if (e.key === "Enter") filterAndRender();
});

window.addEventListener("resize", () => {
    adjustGridColumns();
});

// App Start
document.addEventListener("DOMContentLoaded", () => {
    initZynq();
    adjustGridColumns();
});
