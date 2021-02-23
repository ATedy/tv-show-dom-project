// You can edit ALL of the code here
// const allEpisodes = getAllEpisodes();

// const allEpisodes = function(){
//   fetch("https://api.tvmaze.com/shows/82/episodes")
//   .then(function()

// }
let rootElem = document.getElementById("root");
const searchBar = document.getElementById("searchInput");
let episodeContainer = document.getElementsByClassName("episodeContainer");

const episodeDropdown = document.getElementById("episodeDropdown");

async function allEpisodes() {
  const promise = await fetch("https://api.tvmaze.com/shows/82/episodes");
  const episodes = await promise.json();
  return episodes;
}

// async function setup() {
//   const epList = await getEpisodes();


console.log(episodeContainer.length);

function searchEpisode(e, episodeList) {
  // catches the user input value from the input field
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

async function setup() {

  const episodesList = await allEpisodes();
  makePageForEpisodes(episodesList);
  searchBar.addEventListener("keyup", (e) =>  searchEpisode(e, episodesList));
  dropdownDisplay(episodesList);
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






//Level-300 Episode dropdown



function dropdownDisplay(episodeList) {
 
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
  let firstOption = document.createElement('option');
  firstOption.value = "allEpisodes";
  firstOption.innerHTML = "All-Episodes";
  episodeDropdown.prepend(firstOption);
  episodeDropdown.addEventListener('change', (e) => displayEpisode(e, episodeList))

   // temp holds the value of each option every time the event fired
  // let temp = episodeDropdown.value;
  // console.log(temp);
  // for (let j = 0; j < episodeContainer.length; j++) {
  //   episodeContainer[j].classList.add("hidden");
  // }
  // episodeContainer[temp].classList.remove("hidden");

  // //Refreshing the dropdown after selecting
  // episodeDropdown.addEventListener("mouseover", (e) => {
  //   document.location.reload(true);
  // });
}


function displayEpisode(e, episodeList){
  if(e.target.value === "allEpisodes"){
    makePageForEpisodes(episodeList);
  }else{
    // makeEpisode takes an array
    makePageForEpisodes([episodeList[e.target.value]]);

  }

  

}



// e.preventDefault();
