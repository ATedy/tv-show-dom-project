//parent Element for the whole body content
const rootElem = document.getElementById("root");
rootElem.classList.add("parentElement");
// searchInput the input field
const searchBar = document.getElementById("searchInput");

let displayedText = document.getElementById("episodeDisplay");
//episode container div of each episode
const episodeContainer = document.getElementsByClassName("episodeContainer");
// episodeDropdown the select tag id
const episodeDropdown = document.getElementById("episodeDropdown");
// showDropdown the select tag id
const showDropdown = document.getElementById("showDropdown");

let oneShowContainer;
// showSearch Input the select tag id
const showSearchInput = document.getElementById("showSearch");
// all shows are in the allShows Array
const allShows = getAllShows();
// global variable that will hold the fetched data from the api
let episodesList;

// an async function change the generic url to one Api url using the show_Id provide in the show.js and  returns full Api url of a show
function showApiDisplayer() {
  let currentShowId = showDropdown.value;
  let tvShowApi = "https://api.tvmaze.com/shows/SHOW_ID/episodes";
  let currentShowApi = tvShowApi.replace("SHOW_ID", currentShowId);
  // console.log(currentShowApi);
  return currentShowApi;
}

// Level 400 - Api
// this function get called with the even on change of the shows dropdown
// apiUrl will Api of a current show selected in the show dropdown
// the global variable in here will hold the json data
async function updateShows() {
  let apiUrl = showApiDisplayer();

  fetchedPromise = await fetch(apiUrl);
  episodesList = await fetchedPromise.json();
  // using the global variable we'll make new webpage and episode dropdown when a show is selected
  makePageForEpisodes(episodesList);
  allEpisodesDropdown(episodesList);
}

// Level100 showing all the episodes on the page
function makePageForEpisodes(episodeList) {
  displayedText.innerHTML = "";
  searchBar.style.display = "inline";
  episodeDropdown.style.display = "inline";
  rootElem.innerHTML = "";
  rootElem.classList.add("parentElement");
  rootElem.classList.remove("allShowContainer");
  showSearchInput.style.display = "none";
  for (let i = 0; i < episodeList.length; i++) {
    let episodeContainer = document.createElement("div");
    episodeContainer.className = "episodeContainer";
    let episodeName = document.createElement("h4");
    let episodeImg = document.createElement("img");
    let episodeSummary = document.createElement("p");

    //deciding which episode should tak what season number
    if (episodeList[i].number < 10) {
      episodeName.innerHTML = ` ${episodeList[i].name} - S0${episodeList[i].season}E0${episodeList[i].number}`;
    } else {
      episodeName.innerHTML = ` ${episodeList[i].name} - S0${episodeList[i].season}E${episodeList[i].number}`;
    }

    if (episodeList[i].image === null) {
      // some of the shows doesn't provide photo, a default photo for them
      episodeImg.src =
        "https://cdn3.vectorstock.com/i/thumb-large/25/72/picture-coming-soon-icon-vector-31612572.jpg";
    } else {
      episodeImg.src = episodeList[i].image.medium;
    }

    episodeSummary.innerHTML = episodeList[i].summary;

    // appending elements of each episode
    episodeContainer.appendChild(episodeName);
    episodeContainer.appendChild(episodeImg);
    episodeContainer.appendChild(episodeSummary);
    rootElem.appendChild(episodeContainer);
  }
}

// Level 200- searching fro episode in the input field
function searchEpisode(e, episodeList) {
  // catches the user input value from the input field and lowercase it
  let searchValue = e.target.value.toLowerCase();
  const filteredEpisodes = [];
  //filters the episodes and push the to the filtered array
  episodeList.forEach((episode) => {
    if (
      episode.name.toLowerCase().includes(searchValue) === true ||
      episode.summary.toLowerCase().includes(searchValue) === true
    ) {
      filteredEpisodes.push(episode);
    } else {
      for (let i = 0; i < episodeContainer.length; i++) {
        episodeContainer[i].classList.add("hidden");
      }
    }
  });
  // it will create page with filtered episodes
  makePageForEpisodes(filteredEpisodes);

  //Displaying how many episodes found using the global variable episodeList
  let displayedNumbers = filteredEpisodes.length;
  displayedText.innerHTML = `Displaying ${displayedNumbers}/${episodeList.length} episodes`;
  rootElem.insertAdjacentElement("beforebegin", displayedText);
}

//Level-300 Episode dropdown - displaying and selecting episode from the dropdown

function allEpisodesDropdown(episodeList) {
  episodeDropdown.innerHTML = "";
  for (let i = 0; i < episodeList.length; i++) {
    let oneEpisodeDropdown = document.createElement("option");
    // each option element is getting index of the allEpisodes array as its value
    oneEpisodeDropdown.value = i;
    if (episodeList[i].number < 10) {
      oneEpisodeDropdown.innerHTML = `S0${episodeList[i].season}E0${episodeList[i].number} - ${episodeList[i].name}`;
    } else {
      oneEpisodeDropdown.innerHTML = `S0${episodeList[i].season}E${episodeList[i].number} - ${episodeList[i].name}`;
    }
    episodeDropdown.appendChild(oneEpisodeDropdown);
  }
  //All-Episodes will be addded as a first option element using the prepend in the dropdown
  let firstOption = document.createElement("option");
  firstOption.value = "allEpisodes";
  firstOption.innerHTML = "All-Episodes";
  episodeDropdown.prepend(firstOption);

  //we using the displayEpisode function with the event here
  episodeDropdown.addEventListener("change", (e) =>
    displayEpisode(e, episodeList)
  );
}

function displayEpisode(e, episodeList) {
  // if value is allEpisode - all page wil be displayed
  if (e.target.value === "allEpisodes") {
    makePageForEpisodes(episodeList);
  } else {
    // makeEpisode takes an array using the [] we are passing a single element as an array
    makePageForEpisodes([episodeList[e.target.value]]);
  }
}

//for the shows

function allShowsDropdown() {
  // sorting the allshows array by show name, it will compare the case -insensitively
  allShows.sort(function (firstShow, secondShow) {
    let nameA = firstShow.name.toUpperCase(); // ignore upper and lowercase
    let nameB = secondShow.name.toUpperCase(); // ignore upper and lowercase
    if (nameA < nameB) {
      // nameA is smaller
      return -1;
    }
    if (nameA > nameB) {
      // nameA is bigger
      return 1;
    }
    // names must be equal
    return 0;
  });

  // sorting with id
  // allShows.sort(function (firstShow, secondShow) {
  //   return firstShow.id - b.secondShow;
  // });

  //All-Episodes will be addded as a first option element using the prepend in the dropdown

  for (let i = 0; i < allShows.length; i++) {
    let oneShowDropdown = document.createElement("option");
    // each option element is getting index of the allEpisodes array as its value
    oneShowDropdown.value = `${allShows[i].id}`;
    oneShowDropdown.innerHTML = `${allShows[i].name}`;
    // console.log(oneShowDropdown.value);
    showDropdown.appendChild(oneShowDropdown);
  }

  let firstShowOption = document.createElement("option");
  firstShowOption.value = "allShows";
  firstShowOption.innerHTML = "All-Shows";
  showDropdown.prepend(firstShowOption);
}

function allShowsPageDisplayer() {
  showSearchInput.style.display = "inline";
  searchBar.style.display = "none";
  episodeDropdown.style.display = "none";
  episodeDisplay.innerHTML = "Displaying All shows";
  if (showDropdown.value == "allShows") {
    rootElem.innerHTML = "";
    rootElem.classList.remove("parentElement");
    rootElem.classList.add("allShowContainer");

    for (let i = 0; i < allShows.length; i++) {
      oneShowContainer = document.createElement("div");
      oneShowContainer.classList.add("oneShowContainer");
      let showName = document.createElement("h3");
      //div container all the info in each show
      let showInfoContainer = document.createElement("div");
      showInfoContainer.classList.add("showInfoContainer");
      let showImg = document.createElement("img");
      let showSummary = document.createElement("p");
      //showStatus contains the rating, genre, runtime
      let statusContainer = document.createElement("div");
      statusContainer.classList.add("statusContainer");

      let showRated = document.createElement("h4");
      let showGenres = document.createElement("h4");
      let showStatus = document.createElement("h4");
      let showRuntime = document.createElement("h4");

      showName.innerHTML = allShows[i].name;

      if (allShows[i].image === null) {
        // some of the shows doesn't provide photo, a default photo for them
        showImg.src =
          "https://cdn3.vectorstock.com/i/thumb-large/25/72/picture-coming-soon-icon-vector-31612572.jpg";
      } else {
        showImg.src = allShows[i].image.medium;
      }

      showSummary.innerHTML = allShows[i].summary;
      showRated.innerHTML = `Rated: ${allShows[i].rating.average}`;
      showGenres.innerHTML = allShows[i].genres;
      showStatus.innerHTML = allShows[i].status;
      showRuntime.innerHTML = allShows[i].runtime;

      // appending elements of each episode
      statusContainer.append(showRated);
      statusContainer.append(showGenres);
      statusContainer.append(showStatus);
      statusContainer.append(showRuntime);

      showInfoContainer.appendChild(showImg);
      showInfoContainer.appendChild(showSummary);
      showInfoContainer.appendChild(statusContainer);

      oneShowContainer.appendChild(showName);
      oneShowContainer.appendChild(showInfoContainer);

      rootElem.appendChild(oneShowContainer);
    }
  }
}

// setup is an async functions and will load on start of the page
async function setup() {
  // fetching and getting the data will be done here using the first show in the list to make the webpage on loading
  // all the searchEpisode, allEpisodeDropdown will work just for the first show in the list
  // after the on change event is fired the updateShows function will call these above functions to make a page for the selected show when user selects a show

  // try and catch error handling added
  try {
    allShowsDropdown();
    let fetchedPromise = await fetch(showApiDisplayer());
    episodesList = await fetchedPromise.json();
    // episodesList = await allEpisodes();

    showDropdown.addEventListener("change", updateShows);
    showDropdown.addEventListener("change", allShowsPageDisplayer);
    makePageForEpisodes(episodesList);
    searchBar.addEventListener("keyup", (e) => searchEpisode(e, episodesList));
    // showSearchInput.addEventListener("keyup", (e) => searchShow(e, allShows));
    allEpisodesDropdown(episodesList);
  } catch (error) {
    console.log(error);
  }
}

window.onload = setup;

// //Refreshing the dropdown after selecting
// episodeDropdown.addEventListener("mouseover", (e) => {
//   document.location.reload(true);
//
