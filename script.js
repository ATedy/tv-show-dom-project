//parent Element for the whole body content
const rootElem = document.getElementById("root");
// searchInput the input field
const searchBar = document.getElementById("searchInput");
//episode container div of each episode
const episodeContainer = document.getElementsByClassName("episodeContainer");
// episodeDropdown the select tag id
const episodeDropdown = document.getElementById("episodeDropdown");
// showDropdown the select tag id
const showDropdown = document.getElementById("showDropdown");
// all shows are in the allShows Array
const allShows = getAllShows();
let episodesList;
// console.log(allShows.length);

// an async function that returns the fetched promise
function showApiDisplayer() {
  let currentShowId = showDropdown.value;
  let tvShowApi = "https://api.tvmaze.com/shows/SHOW_ID/episodes";
  let currentShowApi = tvShowApi.replace("SHOW_ID", currentShowId);
  // console.log(currentShowApi);
  return currentShowApi;
}

// function apiCall() {
//   showDropdown.addEventListener("change", (e) => {
//     let currentShowId = showDropdown.value;
//     let tvShowApi = "https://api.tvmaze.com/shows/SHOW_ID/episodes";
//     let currentShowApi = tvShowApi.replace("SHOW_ID", currentShowId);
//     console.log(currentShowApi);
//     if (e.isTrusted === true) {
//       console.log("event triggered");
//       console.log(e.target.value);
//     }
//   });
// }

async function allEpisodes() {
  let fetchedPromise;
  // let episodes;

  showDropdown.addEventListener("change", async () => {
    if (showDropdown.value !== 1632) {
      let url = showApiDisplayer();
      console.log(showApiDisplayer());
      fetchedPromise = await fetch(url);

      episodesList = await fetchedPromise.json();

      makePageForEpisodes(episodesList);
      searchBar.addEventListener("keyup", (e) =>
        searchEpisode(e, episodesList)
      );
      allEpisodesDropdown(episodesList);
    }
  });

  // console.log(fetchedPromise);
  // fetchedPromise = await fetch(showApiDisplayer());
  // episodes = await fetchedPromise.json();
  // console.log(episodes);

  // return episodes;
}

// Level100 showing all the episodes on the page
function makePageForEpisodes(episodeList) {
  rootElem.innerHTML = "";
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

    episodeImg.src = episodeList[i].image.medium;
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

  //Displaying how many episodes found
  let displayedNumbers = filteredEpisodes.length;
  let displayedText = document.getElementById("episodeDisplay");
  displayedText.innerHTML = `Displaying ${displayedNumbers}/73 episodes`;
  rootElem.insertAdjacentElement("beforebegin", displayedText);
}

//Level-300 Episode dropdown - displaying and selecting episode from the dropdown

function allEpisodesDropdown(episodeList) {
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

function allShowsDropdown() {
  //All-Episodes will be addded as a first option element using the prepend in the dropdown

  for (let i = 0; i < allShows.length; i++) {
    let oneShowDropdown = document.createElement("option");
    // each option element is getting index of the allEpisodes array as its value
    oneShowDropdown.value = `${allShows[i].id}`;
    oneShowDropdown.innerHTML = `${allShows[i].name}`;
    // console.log(oneShowDropdown.value);
    showDropdown.appendChild(oneShowDropdown);
  }
}

allShowsDropdown();

// setup is an async functions that awaits promise from another async function allEpisodes()
async function setup() {
  episodesList = await allEpisodes();
  await makePageForEpisodes(episodesList);
  searchBar.addEventListener("keyup", (e) => searchEpisode(e, episodesList));
  await allEpisodesDropdown(episodesList);

  //error handling added
  // try {

  // } catch (error) {
  //   console.log(error);
  // }
}

window.onload = setup;

// //Refreshing the dropdown after selecting
// episodeDropdown.addEventListener("mouseover", (e) => {
//   document.location.reload(true);
//
