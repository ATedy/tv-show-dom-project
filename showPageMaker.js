let oneShowContainer;
// showSearch Input the select tag id
const showSearchInput = document.getElementById("showSearch");
// showDropdown the select tag id
const showDropdown = document.getElementById("showDropdown");
// all shows are in the allShows Array
const allShows = getAllShows();
// global variable that will hold the fetched data from the api

function makeAllShowsPage(showList) {
  showSearchInput.style.display = "inline";
  searchBar.style.display = "none";
  episodeDropdown.style.display = "none";
  episodeDisplay.innerHTML = "Displaying All shows";

  rootElem.innerHTML = "";
  rootElem.classList.remove("parentElement");
  rootElem.classList.add("allShowContainer");

  for (let i = 0; i < showList.length; i++) {
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

    showName.innerHTML = showList[i].name;

    if (showList[i].image === null) {
      // some of the shows doesn't provide photo, a default photo for them
      showImg.src =
        "https://cdn3.vectorstock.com/i/thumb-large/25/72/picture-coming-soon-icon-vector-31612572.jpg";
    } else {
      showImg.src = showList[i].image.medium;
    }

    showSummary.innerHTML = showList[i].summary;
    showRated.innerHTML = `Rated: ${showList[i].rating.average}`;
    showGenres.innerHTML = showList[i].genres;
    showStatus.innerHTML = `Status: ${showList[i].status}`;
    showRuntime.innerHTML = `Runtime: ${showList[i].runtime}`;

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
function displayShow() {
  if (showDropdown.value == "allShows") {
    makeAllShowsPage();
  }
}

function searchShow(e) {
  // catches the user input value from the input field and lowercase it
  let searchValue = e.target.value.toLowerCase();
  const filteredShow = [];
  //filters the episodes and push the to the filtered array
  allShows.forEach((show) => {
    let isFoundInGenre = show.genres.some((genre) => {
      return genre.toLowerCase().includes(searchValue);
    });
    // console.log(show.genres);

    if (
      show.name.toLowerCase().includes(searchValue) === true ||
      show.summary.toLowerCase().includes(searchValue) === true ||
      isFoundInGenre
    ) {
      filteredShow.push(show);
    }
  });
  // it will create page with filtered episodes
  makeAllShowsPage(filteredShow);

  //Displaying how many episodes found using the global variable episodeList
  let displayedNumbers = filteredShow.length;
  displayedText.innerHTML = `Displaying ${displayedNumbers}/${allShows.length} shows`;
  rootElem.insertAdjacentElement("beforebegin", displayedText);
}
