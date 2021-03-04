const rootElem = document.getElementById("root");
// the main container of the page
rootElem.classList.add("parentElement");

// an async function change the generic url to one Api url using the show_Id provide in the show.js and  returns full Api url of a show
function showApiDisplayer() {
  let currentShowId = showDropdown.value;
  let tvShowApi = "https://api.tvmaze.com/shows/SHOW_ID/episodes";
  let currentShowApi = tvShowApi.replace("SHOW_ID", currentShowId);
  return currentShowApi;
}
/*

- this update function get called with the event on change of the shows dropdown
- apiUrl will Api of a current show selected in the show dropdown
- episodeList a global variable hold the json data after the fetch is done
- The if condition is to stop fetching when we are displaying all shows selecting from the show dropdown, we ony fetch for the show names only

*/
async function updateShows() {
  if (showDropdown.value !== "allShows") {
    let apiUrl = showApiDisplayer();

    fetchedPromise = await fetch(apiUrl);
    episodesList = await fetchedPromise.json();
    // using the global variable we'll make new webpage and episode dropdown when a show is selected
    makePageForEpisodes(episodesList);
    allEpisodesDropdown(episodesList);
  } else {
    makeAllShowsPage(allShows);
  }
}

/*
 - setup is an async functions and will load on start of the page
 - fetching and getting the data will be done here using the first show in the list to make the webpage on loading
 - after the on change event is fired the updateShows function will call these above functions to make a page for the selected show when user selects a show
 -  try and catch error handling added 
 - The function called inside the setup without events  will load on the start of the program.
*/

async function setup() {
  try {
    allShowsDropdown();
    makeAllShowsPage(allShows);

    let fetchedPromise = await fetch(showApiDisplayer());
    episodesList = await fetchedPromise.json();

    showDropdown.addEventListener("change", updateShows);
    searchBar.addEventListener("keyup", (e) => searchEpisode(e, episodesList));
    showSearchInput.addEventListener("keyup", searchShow);
    allEpisodesDropdown(episodesList);
  } catch (error) {
    console.log(error);
  }
}

window.onload = setup;

//----------- Alternative solutions-------------

// //Refreshing the dropdown after selecting
// episodeDropdown.addEventListener("mouseover", (e) => {
//   document.location.reload(true);
//

// let innerHTML = `<h2 class="episodeTitle">${episode.name}
//     <span class="episodeCode">
//     S${zeroPad(episode.season, 2)} E${zeroPad(episode.number, 2)}
//     </span>
//     </h2>
//     <hr>
//     <img src="${imgSrc}">
//     <h3 class="summaryTitle">Summary:</h3>
//     <div class="summaryText">${episode.summary}</div>
//     <a class="episodeLink" href=${episode.url} target="_blank">More...</a>`;
//   episodeBlock.innerHTML = innerHTML;
