//You can edit ALL of the code here
const allEpisodes = getAllEpisodes();
let rootElem = document.getElementById("root");
function setup() {
  makePageForEpisodes(allEpisodes);
}
// parent container for all the divs

function makePageForEpisodes(episodeList) {
  for (let i = 0; i < episodeList.length; i++) {
    let episodeContainer = document.createElement("div");
    episodeContainer.className = "episodeContainer";
    let episodeName = document.createElement("h4");
    let episodeImg = document.createElement("img");
    let episodeSummary = document.createElement("p");

    //giving values to the elements
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

window.onload = setup;

//Level 200
const searchBar = document.getElementById("searchInput");
let episodeContainer = document.getElementsByClassName("episodeContainer");

function searchEpisode(e) {
  // catching the user input value from the input field
  let searchValue = e.target.value.toLowerCase();
  const filteredEpisodes = [];
  //filters the episodes and push the to the filtered array
  allEpisodes.forEach((episode) => {
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

searchBar.addEventListener("keyup", searchEpisode);
