// searchInput the input field
const searchBar = document.getElementById("searchInput");

let displayedText = document.getElementById("episodeDisplay");
//episode container div of each episode
const episodeContainer = document.getElementsByClassName("episodeContainer");
// episodeDropdown the select tag id
const episodeDropdown = document.getElementById("episodeDropdown");

let episodesList;

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

/*
 * Role - To add leading zeroes to a number
 * Parameter - Takes 2 parameters
 *  num - the number to which leading zeroes are to be added
 *  places - the number of digits the final result should have
 * Returns - A string containing the num with added leading zeroes to it.
 * Result - zeroPad(5, 3) gives the result as "005"
 ----
 function zeroPad(num, places) {
  // calculate the number of zeroes that need to be prepended to num
  let zero = places - num.toString().length + 1;
  return Array(+(zero > 0 && zero)).join("0") + num;
}
-----
 * This is how we use it inside our function
 oneEpisodeDropdown.innerHTML = `S${zeroPad( episodeList[i].season,2)} E${zeroPad(episodeList[i].number, 2)} - ${episodeList[i].name}`;
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

function displayEpisode(e, episodeList) {
  // if value is allEpisode - all page wil be displayed
  if (e.target.value === "allEpisodes") {
    makePageForEpisodes(episodeList);
  } else {
    // makeEpisode takes an array using the [] we are passing a single element as an array
    makePageForEpisodes([episodeList[e.target.value]]);
  }
}
