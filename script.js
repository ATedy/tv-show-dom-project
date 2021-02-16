//You can edit ALL of the code here
function setup() {
  const allEpisodes = getAllEpisodes();
  makePageForEpisodes(allEpisodes);
}

function makePageForEpisodes(episodeList) {
  const rootElem = document.getElementById("root");
  // rootElem.textContent = `Got ${episodeList[0].name} episodes(s)`;

  for( let i = 0; i < episodeList.length; i++){
    let episodeContainer = document.createElement("div");
    episodeContainer.className = "episodeContainer";
    let episodeName = document.createElement("h2");
    let episodeImg = document.createElement("img");
    let episodeSummary = document.createElement("p");
    
    //giving values to the elements
    if(episodeList[i].number < 10){
      episodeName.innerHTML = episodeList[i].name + " " + "-" + " " + "S0" + episodeList[i].season + "E0" + episodeList[i].number;
    }
    else{
      episodeName.innerHTML = episodeList[i].name + " " + "-" + " " + "S0" + episodeList[i].season + "E" + episodeList[i].number;
    }
    
    episodeImg.src = episodeList[i].image.medium;
    episodeSummary.innerHTML = episodeList[i].summary;

    // appending elements of each episode
    episodeContainer.appendChild(episodeName);
    episodeContainer.appendChild(episodeImg);
    episodeContainer.appendChild(episodeSummary);
    // episodeContainer.append(episodeList[i].summary);

    rootElem.appendChild(episodeContainer);
    console.log(episodeContainer);
  }
  
  



}

window.onload = setup;
