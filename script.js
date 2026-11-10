import { localRecipes } from "./data.js";

const API_BASE = "https://www.themealdb.com/api/json/v1/1";
const FAVORITES_KEY = "cookmate-favorites-v1";

const searchForm = document.querySelector("#searchForm");
const searchInput = document.querySelector("#searchInput");
const recipeGrid = document.querySelector("#recipeGrid");
const favoriteGrid = document.querySelector("#favoriteGrid");
const favoriteEmpty = document.querySelector("#favoriteEmpty");
const favoriteCount = document.querySelector("#favoriteCount");
const statusText = document.querySelector("#status");
const categoryFilter = document.querySelector("#categoryFilter");
const cuisineFilter = document.querySelector("#cuisineFilter");
const recipeHeading = document.querySelector("#recipeHeading");
const emptyState = document.querySelector("#emptyState");
const modal = document.querySelector("#modal");
const modalBody = document.querySelector("#modalBody");
const toast = document.querySelector("#toast");

let currentRecipes = [...localRecipes];
let activeSearch = "";
let toastTimer;

function getFavorites() {
  try {
    return JSON.parse(localStorage.getItem(FAVORITES_KEY)) || [];
  } catch {
    return [];
  }
}

function saveFavorites(favorites) {
  localStorage.setItem(FAVORITES_KEY, JSON.stringify(favorites));
  updateFavoriteCount();
  renderFavorites();
}

function updateFavoriteCount() {
  favoriteCount.textContent = getFavorites().length;
}

function showToast(message) {
  toast.textContent = message;
  toast.classList.add("show");
  clearTimeout(toastTimer);
  toastTimer = setTimeout(() => toast.classList.remove("show"), 2200);
}

function escapeHTML(value = "") {
  return String(value).replace(
    /[&<>"']/g,
    (char) =>
      ({
        "&": "&amp;",
        "<": "&lt;",
        ">": "&gt;",
        '"': "&quot;",
        "'": "&#039;",
      }[char])
  );
}

function normalizeRecipe(meal) {
  const ingredients = [];
  for (let i = 1; i <= 20; i++) {
    const ingredient = meal[`strIngredient${i}`]?.trim();
    const measure = meal[`strMeasure${i}`]?.trim();
    if (ingredient)
      ingredients.push({ name: ingredient, measure: measure || "" });
  }

  return {
    id: `api-${meal.idMeal}`,
    apiId: meal.idMeal,
    name: meal.strMeal || "Untitled recipe",
    category: meal.strCategory || "Recipe",
    area: meal.strArea || "International",
    image: meal.strMealThumb || "",
    description:
      "A recipe from TheMealDB. Open it to view the ingredients and cooking method.",
    time: null,
    difficulty: "See instructions",
    ingredients,
    instructions: (meal.strInstructions || "")
      .split(/\r?\n/)
      .map((step) => step.trim())
      .filter(Boolean),
    source: meal.strSource || meal.strYoutube || "",
  };
}

function getIngredientNames(recipe) {
  return (recipe.ingredients || []).map((item) =>
    typeof item === "string" ? item : item.name
  );
}

function recipeCard(recipe) {
  const favorites = getFavorites();
  const isFavorite = favorites.includes(String(recipe.id));
  const ingredientNames = getIngredientNames(recipe).slice(0, 3);
  const tags = ingredientNames
    .map((name) => `<span class="tag">${escapeHTML(name)}</span>`)
    .join("");

  return `
    <article class="recipe-card">
      <div class="card-image-wrap" data-open="${escapeHTML(recipe.id)}">
        <img class="card-image" src="${escapeHTML(
          recipe.image
        )}" alt="${escapeHTML(recipe.name)}" loading="lazy"
          onerror="this.src='https://images.unsplash.com/photo-1498837167922-ddd27525d352?auto=format&fit=crop&w=900&q=80'">
        <span class="card-category">${escapeHTML(
          recipe.category || "Recipe"
        )}</span>
      </div>
      <button class="favorite-btn ${
        isFavorite ? "is-favorite" : ""
      }" type="button"
        data-favorite="${escapeHTML(recipe.id)}" aria-label="${
    isFavorite ? "Remove from" : "Add to"
  } favourites"
        title="${
          isFavorite ? "Remove from favourites" : "Add to favourites"
        }">${isFavorite ? "♥" : "♡"}</button>
      <div class="card-body">
        <div class="card-title-row">
          <h3 data-open="${escapeHTML(recipe.id)}">${escapeHTML(
    recipe.name
  )}</h3>
        </div>
        <p class="card-description">${escapeHTML(
          recipe.description || "A delicious recipe to try at home."
        )}</p>
        <div class="tags">${
          tags || '<span class="tag green">Easy to explore</span>'
        }</div>
        <div class="card-meta">
          <span>🌍 ${escapeHTML(recipe.area || "Various")}</span>
          <button class="view-recipe" type="button" data-open="${escapeHTML(
            recipe.id
          )}">View recipe →</button>
        </div>
      </div>
    </article>`;
}

function renderRecipes(recipes, message = "") {
  currentRecipes = recipes;
  const category = categoryFilter.value.toLowerCase();
  const cuisine = cuisineFilter.value.toLowerCase();

  const filtered = recipes.filter((recipe) => {
    const categoryMatch =
      !category || (recipe.category || "").toLowerCase() === category;
    const area = (recipe.area || "").toLowerCase();
    const cuisineMatch =
      !cuisine ||
      (cuisine === "indian"
        ? area.includes("indian")
        : cuisine === "italian"
        ? area.includes("italian")
        : !["indian", "italian"].includes(area));
    return categoryMatch && cuisineMatch;
  });

  recipeGrid.innerHTML = filtered.map(recipeCard).join("");
  emptyState.classList.toggle("hidden", filtered.length !== 0);
  statusText.textContent =
    message ||
    `${filtered.length} recipe${filtered.length === 1 ? "" : "s"} to explore`;
}

function renderFavorites() {
  const favoriteIds = getFavorites();
  const allKnown = [...localRecipes, ...currentRecipes];
  const unique = new Map(allKnown.map((recipe) => [String(recipe.id), recipe]));
  const saved = favoriteIds.map((id) => unique.get(String(id))).filter(Boolean);

  favoriteGrid.innerHTML = saved.map(recipeCard).join("");
  favoriteEmpty.classList.toggle("hidden", saved.length > 0);
  favoriteCount.textContent = favoriteIds.length;
}

function findRecipeById(id) {
  const allKnown = [...localRecipes, ...currentRecipes];
  return allKnown.find((recipe) => String(recipe.id) === String(id));
}

function toggleFavorite(id) {
  const favorites = getFavorites();
  const key = String(id);
  const exists = favorites.includes(key);

  const updated = exists
    ? favorites.filter((item) => item !== key)
    : [...favorites, key];

  saveFavorites(updated);
  renderRecipes(currentRecipes, statusText.textContent);
  showToast(exists ? "Removed from favourites" : "Added to favourites ♥");
}

async function fetchJSON(url) {
  const response = await fetch(url);
  if (!response.ok) throw new Error(`API request failed (${response.status})`);
  return response.json();
}

async function searchOnline(query) {
  const trimmed = query.trim();
  if (!trimmed) return [];

  // A comma-separated search is treated as an ingredient search.
  if (trimmed.includes(",")) {
    const ingredients = [
      ...new Set(
        trimmed
          .split(",")
          .map((item) => item.trim())
          .filter(Boolean)
      ),
    ];
    const results = await Promise.all(
      ingredients.map(async (ingredient) => {
        const data = await fetchJSON(
          `${API_BASE}/filter.php?i=${encodeURIComponent(ingredient)}`
        );
        return (data.meals || []).map((meal) => meal.idMeal);
      })
    );

    if (!results.length || results.some((list) => list.length === 0)) return [];
    const commonIds = results[0].filter((id) =>
      results.every((list) => list.includes(id))
    );
    const detailResults = await Promise.all(
      commonIds.slice(0, 12).map(async (id) => {
        const data = await fetchJSON(
          `${API_BASE}/lookup.php?i=${encodeURIComponent(id)}`
        );
        return data.meals?.[0] ? normalizeRecipe(data.meals[0]) : null;
      })
    );
    return detailResults.filter(Boolean);
  }

  // Single word/name: try recipe-name search first, then ingredient filter.
  const nameData = await fetchJSON(
    `${API_BASE}/search.php?s=${encodeURIComponent(trimmed)}`
  );
  if (nameData.meals?.length)
    return nameData.meals.slice(0, 18).map(normalizeRecipe);

  const ingredientData = await fetchJSON(
    `${API_BASE}/filter.php?i=${encodeURIComponent(trimmed)}`
  );
  const meals = (ingredientData.meals || []).slice(0, 12);

  const details = await Promise.all(
    meals.map(async (meal) => {
      const data = await fetchJSON(
        `${API_BASE}/lookup.php?i=${encodeURIComponent(meal.idMeal)}`
      );
      return data.meals?.[0] ? normalizeRecipe(data.meals[0]) : null;
    })
  );
  return details.filter(Boolean);
}

function localSearch(query) {
  const terms = query
    .toLowerCase()
    .split(",")
    .map((item) => item.trim())
    .filter(Boolean);
  return localRecipes.filter((recipe) => {
    const searchable = [
      recipe.name,
      recipe.category,
      recipe.area,
      ...getIngredientNames(recipe),
    ]
      .join(" ")
      .toLowerCase();
    return terms.every((term) => searchable.includes(term));
  });
}

async function handleSearch(query) {
  activeSearch = query.trim();
  recipeHeading.textContent = activeSearch
    ? "Search results"
    : "Explore recipes";
  categoryFilter.value = "";
  cuisineFilter.value = "";

  if (!activeSearch) {
    renderRecipes(
      localRecipes,
      "Showing your built-in recipes. Search ingredients to discover more."
    );
    return;
  }

  statusText.textContent = "Finding recipes for your ingredients...";
  recipeGrid.innerHTML = "";
  emptyState.classList.add("hidden");

  try {
    const online = await searchOnline(activeSearch);
    const local = localSearch(activeSearch);
    const combined = [...online, ...local];
    const unique = new Map(
      combined.map((recipe) => [String(recipe.id), recipe])
    );
    const results = [...unique.values()];

    if (results.length) {
      renderRecipes(
        results,
        `Found ${results.length} recipe${
          results.length === 1 ? "" : "s"
        } for "${activeSearch}".`
      );
    } else {
      renderRecipes(
        [],
        `No exact matches for "${activeSearch}". Try fewer ingredients or another keyword.`
      );
    }
  } catch (error) {
    console.warn("CookMate API unavailable:", error);
    const fallback = localSearch(activeSearch);
    if (fallback.length) {
      renderRecipes(
        fallback,
        "Showing matching built-in recipes because the online recipe service is unavailable."
      );
    } else {
      renderRecipes(
        [],
        "The online recipe service is unavailable and no built-in recipe matched. Try potato, paneer, rice, tomato or pasta."
      );
    }
  }
}

function openRecipe(id) {
  const recipe = findRecipeById(id);
  if (!recipe) {
    showToast("Recipe details are not available. Search again.");
    return;
  }

  const ingredients = (recipe.ingredients || [])
    .map((item) => {
      if (typeof item === "string") return `<li>${escapeHTML(item)}</li>`;
      return `<li>${escapeHTML(item.measure)} ${escapeHTML(item.name)}</li>`;
    })
    .join("");

  const instructions = (recipe.instructions || [])
    .map((step) => `<li>${escapeHTML(step)}</li>`)
    .join("");
  const timeText = recipe.time
    ? `${recipe.time} minutes`
    : "See cooking method";
  const source = recipe.source
    ? `<p class="source-note">Recipe source: <a href="${escapeHTML(
        recipe.source
      )}" target="_blank" rel="noopener noreferrer">Open original source ↗</a></p>`
    : `<p class="source-note">Built-in CookMate recipe</p>`;

  modalBody.innerHTML = `
    <img class="modal-hero" src="${escapeHTML(recipe.image)}" alt="${escapeHTML(
    recipe.name
  )}"
      onerror="this.src='https://images.unsplash.com/photo-1498837167922-ddd27525d352?auto=format&fit=crop&w=900&q=80'">
    <div class="modal-details">
      <p class="eyebrow">${escapeHTML(
        recipe.area || "COOKMATE RECIPE"
      )} · ${escapeHTML(recipe.category || "RECIPE")}</p>
      <h2 id="modalTitle">${escapeHTML(recipe.name)}</h2>
      <p class="modal-description">${escapeHTML(
        recipe.description || "A delicious recipe to prepare at home."
      )}</p>
      <div class="modal-meta"><span>⏱ ${escapeHTML(
        timeText
      )}</span><span>🍽 ${escapeHTML(
    recipe.difficulty || "Home cooking"
  )}</span></div>
      <h3>Ingredients</h3>
      <ul class="ingredient-list">${
        ingredients || "<li>Ingredients are not listed for this recipe.</li>"
      }</ul>
      <h3>How to make it</h3>
      <ol class="instruction-list">${
        instructions ||
        "<li>Open the original recipe source for the full method.</li>"
      }</ol>
      ${source}
    </div>`;

  modal.classList.remove("hidden");
  document.body.classList.add("modal-open");
  document.querySelector("#closeModal").focus();
}

function closeModal() {
  modal.classList.add("hidden");
  document.body.classList.remove("modal-open");
}

searchForm.addEventListener("submit", (event) => {
  event.preventDefault();
  handleSearch(searchInput.value);
  document.querySelector("#recipes").scrollIntoView({ behavior: "smooth" });
});

document.querySelectorAll(".idea-chip").forEach((button) => {
  button.addEventListener("click", () => {
    searchInput.value = button.dataset.search;
    handleSearch(button.dataset.search);
    document.querySelector("#recipes").scrollIntoView({ behavior: "smooth" });
  });
});

categoryFilter.addEventListener("change", () => renderRecipes(currentRecipes));
cuisineFilter.addEventListener("change", () => renderRecipes(currentRecipes));

document.addEventListener("click", (event) => {
  const favoriteButton = event.target.closest("[data-favorite]");
  if (favoriteButton) {
    event.stopPropagation();
    toggleFavorite(favoriteButton.dataset.favorite);
    return;
  }

  const openButton = event.target.closest("[data-open]");
  if (openButton) openRecipe(openButton.dataset.open);
});

document.querySelector("#closeModal").addEventListener("click", closeModal);
document.querySelector("#modalBackdrop").addEventListener("click", closeModal);
document.addEventListener("keydown", (event) => {
  if (event.key === "Escape" && !modal.classList.contains("hidden"))
    closeModal();
});

document.querySelector("#resetSearch").addEventListener("click", () => {
  searchInput.value = "";
  activeSearch = "";
  recipeHeading.textContent = "Explore recipes";
  categoryFilter.value = "";
  cuisineFilter.value = "";
  renderRecipes(localRecipes, "Showing your 10 built-in recipes.");
});

document.querySelector("#year").textContent = new Date().getFullYear();

// Initial view: local recipes appear immediately; no API is needed to load the home page.
updateFavoriteCount();
renderRecipes(
  localRecipes,
  "Showing 10 built-in recipes. Search ingredients to discover more online."
);
renderFavorites();
