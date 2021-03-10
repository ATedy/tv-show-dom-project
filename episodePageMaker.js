// search Input the input field for the episodes
const searchBar = document.getElementById("searchInput");
// text displaying the no of searched episode
let displayedText = document.getElementById("episodeDisplay");
//episode container div of each episode
const episodeContainer = document.getElementsByClassName("episodeContainer");
// episodeDropdown the select tag id
const episodeDropdown = document.getElementById("episodeDropdown");

/*
- makePageForEpisodes function creates the page for episodes 
- it will remove some class from the show displaying fun and add new class
*/

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

/*
- search episode function, compares the searched value with name and summary of each episode
*/

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
    }
  });
  // it will create page with filtered episodes
  makePageForEpisodes(filteredEpisodes);

  //Displaying how many episodes found using the global variable episodeList
  let displayedNumbers = filteredEpisodes.length;
  displayedText.innerHTML = `Displaying ${displayedNumbers}/${episodeList.length} episodes`;
  rootElem.insertAdjacentElement("beforebegin", displayedText);
}

/*
- All episode dropdown maker 
- takes another Ev listener and to show selected episode
*/

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

// This func called with the event on the drop down
function displayEpisode(e, episodeList) {
  // if value is allEpisode - all page wil be displayed
  if (e.target.value === "allEpisodes") {
    makePageForEpisodes(episodeList);
  } else {
    // makeEpisode takes an array using the [] we are passing a single element as an array
    makePageForEpisodes([episodeList[e.target.value]]);
  }
}
