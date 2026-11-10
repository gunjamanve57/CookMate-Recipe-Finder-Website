## CookMate -- Recipe Finder Website

# About the Project
CookMate is a frontend recipe-finder website that helps users discover
meals using ingredients available in their kitchen. Users can search for
recipes, explore categories and cuisines, view recipe details, and save
favourites.
The main idea behind this project is to make it easier to decide.

# Features
Features
- Ingredient-based search: Search using one ingredient or multiple
  comma-separated ingredients (for example, potato, tomato).
- Recipe-name search: Search for a recipe by its name.
- Online recipe search: Fetch recipe information from TheMealDB
  API.
- Built-in recipes: Includes 10 locally stored recipes that are
  available when the website first loads.
- Fallback support: If the online recipe service is unavailable,
  CookMate tries to show matching built-in recipes.
- Category and cuisine filters: Filter recipes by category and
  cuisine.
- Recipe details: View recipe images, ingredients, instructions,
  and source links when available.
- Favourites: Add or remove favourite recipes. Favourite IDs are
  stored in the browser's local storage.
- Responsive layout: The CSS includes layouts for desktop, tablet,
  and smaller screens.

# Technologies Used
- - HTML -- to create the structure of the website.
- CSS -- to design the pages and make the layout responsive.
- JavaScript -- to handle search, filters, recipe details and
  favourites.
- TheMealDB API -- to get recipe information.
- Local Storage -- to save favourite recipe IDs in the browser.

# Project Files
Keep these files together in the same project folder:
CookMate/
├── index.html
├── style.css
├── script.js
└── data.js
- index.html contains the website sections and layout.
- style.css contains the design and responsive styling.
- script.js contains the website functionality and API requests.
- data.js contains the sample recipes used as local data.

# How the API Is Used
CookMate uses TheMealDB API to search for recipes and get their details.
-CookMate uses TheMealDB API:
     https://www.themealdb.com/api/json/v1/1

The JavaScript code uses these endpoints:
 
  search.php?s=...   Search recipes by name
filter.php?i=...   Find recipes by ingredient
lookup.php?i=...   Get full details for a recipe

The project currently uses TheMealDB's public test key (1) in the API
URL. Online search requires an internet connection and depends on the
API being available.

# Running the Project
1. Download or clone the project folder.
2. Open the folder in Visual Studio Code.
3. Run index.html using the Live Server extension.
4. Make sure the internet connection is on when using API-based search.
A local server such as Live Server is recommended because the JavaScript
files use ES modules.

# How to Use CookMate
1. Open the website.
2. Enter a recipe name or ingredients in the search box.
3. Select a category or cuisine if needed.
4. Open a recipe to see its ingredients and instructions.
5. Use the favourite option to save recipes for later.

# Sample Recipes
The project also contains sample recipes in data.js, such as:
- Paneer Butter Masala
- Vegetable Biryani
- Aloo Paratha
- Masala Dosa
- Punjabi Chole
- Dal Tadka
- Palak Paneer
- Vegetable Pulao
- Tomato Masala Pasta
- Fluffy Pancakes

# Limitations
- This is a frontend project. It does not have a separate backend or
  user account system.
- Favourites are saved in the current browser, so they are not
  automatically shared across devices.
- Recipe search through TheMealDB needs an internet connection and
  depends on the API being available.
- Sample recipes are used as fallback data when an API request fails.

# Future Improvements
Some features that can be added in the future are:
- User login and registration.
- A backend and database.
- A feature to show which ingredients are missing for a selected
  recipe.
- More recipe filters and options.

# Credits
- Recipe data: TheMealDB
- Fonts: Google Fonts
- Recipe and hero images: Unsplash

CookMate -- Find a recipe with the ingredients you have.
Made with CookMate -- Happy Cooking!


