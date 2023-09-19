import 'core-js/stable';
import 'regenerator-runtime/runtime';
import * as model from './model.js';
import { MODAL_CLOSE_SEC } from './config.js';
import recipeView from './views/recepieView.js';
import searchView from './views/searchView.js';
import resultsView from './views/resultsView.js';
import paginationView from './views/paginationView.js';
import AddRecipeView from './views/addRecipeView.js';
import { async } from 'regenerator-runtime';
import bookmarksView from './views/bookmarksView.js';
import addRecipeView from './views/addRecipeView.js';

// if (module.hot) {
//   module.hot.accept();
// }

const controlRecipes = async function () {
  try {
    const id = window.location.hash.slice(1);
    if (!id) return;
    recipeView.renderSpinner();
    // 0) Update results view to mark selected search result
    resultsView.update(model.getSearchResultsPage());

    //3.) Updating bookmarks view
    bookmarksView.update(model.state.bookmarks);

    // 1.) Loading recipe
    await model.loadRecipe(id);
    // 2.) Rendereing the recipe
    recipeView.render(model.state.recipe);
  } catch (error) {
    recipeView.renderError();
    console.error(error);
  }
};
const controlSearchResults = async function () {
  try {
    resultsView.renderSpinner();
    // console.log(resultsView);
    // 1) Get search query
    const query = searchView.getQuery();
    if (!query) return;

    // 2) Load search results
    await model.loadSearchResults(query);

    // 3) Render results
    resultsView.render(model.getSearchResultsPage());

    // 4) Render initial pagination buttons
    paginationView.render(model.state.search);
  } catch (err) {
    console.log(err);
  }
};

const controlPagination = function (goToPage) {
  // 3) Render NEW results
  resultsView.render(model.getSearchResultsPage(goToPage));

  // 4) Render NEW pagination buttons
  paginationView.render(model.state.search);
};

const controlServings = function (newServings) {
  // Update the recipe servings(in the state)

  model.updateServings(newServings);
  //Update the view
  // recipeView.render(model.state.recipe);
  recipeView.update(model.state.recipe);
};

const controlAddBookmark = function () {
  // 1) Add or remove bookmark
  if (!model.state.recipe.bookmarked) {
    model.addBookmark(model.state.recipe);
  } else {
    model.deleteBookmark(model.state.recipe.id);
  }
  // Update recipe view
  recipeView.update(model.state.recipe);

  //Render bookmarks
  bookmarksView.render(model.state.bookmarks);
};

const controlBookmarks = function () {
  bookmarksView.render(model.state.bookmarks);
};

const controlAddRecipe = async function (newRecipe) {
  try {
    addRecipeView.renderSpinner();
    await model.uploadRecipe(newRecipe);
    console.log(model.state.recipe);

    //Render recipe
    recipeView.render(model.state.recipe);

    //Sucess message
    addRecipeView.renderMessage();

    //Render bookmark view
    bookmarksView.render(model.state.bookmarks);

    //Change ID in URL
    window.history.pushState(null, '', `#${model.state.recipe.id}`);

    //Close form window
    setTimeout(function () {
      addRecipeView.hideWindow();
    }, MODAL_CLOSE_SEC * 1000);
  } catch (err) {
    console.error('😲😲😲', err);
    addRecipeView.renderError(err.message);
  }
};

/* ADDS EVENT HANDLERS TO VIEW AND PASSES CALLBACK FUNCTION FROM CONTROLLER */

const init = function () {
  bookmarksView.addHandlerRender(controlBookmarks);
  recipeView.addHandlerRender(controlRecipes);
  recipeView.addHandlerUpdateServings(controlServings);
  recipeView.addHandlerAddBookmark(controlAddBookmark);
  searchView.addHandlerSearch(controlSearchResults);
  paginationView.addHandlerClick(controlPagination);
  addRecipeView.addHandlerUpload(controlAddRecipe);
  console.log('Welcome');
};
init();
