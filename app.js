const uiMainScreen = document.getElementById("main-screen");
const uiMenu = document.getElementById("menu");
const uiBtnStartGame = document.getElementById("startGame");
const uiBtnGameReview = document.getElementById("gameReview");
const uiBtnOpenSettings = document.getElementById("openSettings");
const uiGameHeader = document.getElementById("game-header");
const uiTryCount = document.getElementById("tryCount");
const uiName = document.querySelector("#successMessage p");
const uiSuccessMessage = uiName.parentElement;
const uiCardsContainer = document.getElementById("cardsContainer");
const uiSettings = document.getElementById("settings");
const uiBody = document.querySelector("body");

let db = [];
let tryCount = 0;
let flippedCount = 0;
let totalPairs = 6;
let foundPairs = 0;
let reviewSelection = [];

uiBody.style.backgroundColor = localStorage.getItem("backgroundClr");

url = "https://api.jsonbin.io/b/6030d5b07c58305d3957836a/latest";

async function getData(dataSrc) {
  // read JSON
  let response = await fetch(dataSrc);
  data = await response.json();
  // store locally
  data.forEach((item) => {
    db.push(item);
  });
}

getData(url).then(() => (uiBtnStartGame.disabled = false));

// generate random integer
function getRandom(min, max) {
  min = Math.ceil(min);
  max = Math.floor(max);
  return Math.floor(Math.random() * (max - min + 1)) + min;
}

// set counters and UI to default/empty
function initGame() {
  tryCount = 0;
  flippedCount = 0;
  foundPairs = 0;
  uiTryCount.innerText = tryCount;
  uiName.innerText = "";
  uiCardsContainer.innerHTML = "";

  transitionOut(uiMainScreen);
  setTimeout(() => {
    transitionIn(uiGameHeader);
  }, 200);
  transitionIn(uiCardsContainer);
}

// prepare game board
function startGame() {
  initGame();
  fillGrid(localStorage.getItem("backgroundIMG"));
}

// randomize cards and display them on the page
function fillGrid(backgroundIMG) {
  let shuffledDB = db.sort(shuffle);
  function shuffle(a, b) {
    return 0.5 - Math.random();
  }

  let selection = shuffledDB.slice(0, 6);
  reviewSelection = selection;

  selection.forEach((item) => {
    const html = `
    <div class="card" style="order:${getRandom(1, 12)}" data-pair="${
      item.id
    }" data-name="${item.name}">
      <div class="content">
        <div class="front frontbg${backgroundIMG}"></div>
        <div class="back"><img src="${item.face1.content}" alt=""></div>
      </div>
    </div>
    <div class="card" style="order:${getRandom(1, 12)}" data-pair="${
      item.id
    }" data-name="${item.name}">
      <div class="content">
      <div class="front frontbg${backgroundIMG}"></div>
        <div class="back"><img src="${item.face2.content}" alt=""></div>
      </div>
    </div>
  `;

    uiCardsContainer.innerHTML += html;
  });

  gameIsOn();
}

// while the game is running
function gameIsOn() {
  uiCardsContainer.addEventListener("click", (e) => {
    const target = e.target.parentElement;
    if (
      target.classList.contains("content") &&
      !target.classList.contains("flipped")
    ) {
      flippedCount++;
      target.classList.add("flipped");
    }

    if (flippedCount === 2) {
      uiCardsContainer.style.pointerEvents = "none";
      tryCount++;
      const flippedCards = Array.from(
        document.querySelectorAll(".flipped:not(.found)")
      );
      let name = checkPair(flippedCards);

      updateUI(name, flippedCards);
      flippedCount = 0;

      if (foundPairs === totalPairs) {
        setTimeout(() => {
          victory();
        }, 500);
      }
    }
  });
}

// check if selected pair is correct
function checkPair(cards) {
  if (
    cards[0].parentElement.dataset.pair === cards[1].parentElement.dataset.pair
  ) {
    setTimeout(() => {
      cards.forEach((card) => card.classList.add("found", "anim-success"));
    }, 500);
    foundPairs++;
    return cards[0].parentElement.dataset.name;
  }
}

// update UI after a pair selection
function updateUI(name, cards) {
  uiTryCount.classList.add("anim-trycount");
  uiTryCount.innerText = tryCount;
  if (name) {
    uiName.innerText = name;
    uiName.style.opacity = "1";
    setTimeout(() => {
      uiName.style.opacity = "0";
    }, 1300);
  }
  setTimeout(() => {
    uiTryCount.classList.remove("anim-trycount");
    cards.forEach((card) => {
      card.classList.remove("flipped");
    });
    uiCardsContainer.style.pointerEvents = "auto";
  }, 1000);
}

// when game is won
function victory() {
  if (document.getElementById("reviewList")) {
    document.getElementById("reviewList").remove();
  }

  transitionOut(uiCardsContainer);
  setTimeout(() => {
    transitionOut(uiGameHeader);
    transitionIn(uiMainScreen);
  }, 200);

  uiBtnGameReview.disabled = false;
}

// previous game review
function review(selection) {
  const list = document.createElement("UL");
  list.setAttribute("id", "reviewList");

  selection.forEach((item) => {
    const listItem = document.createElement("LI");
    listItem.innerHTML = `
    <div class="review">
      <a target="_blank" href="https://www.google.com/search?as_sitesearch=wikipedia.org&q=${item.name}"><h2 class="review-name">${item.name}</h2></a>
      <div class="review-images">
        <a target="_blank" href="https://www.google.com/searchbyimage?&image_url=${item.face1.content}"><img src="${item.face1.content}" alt=""></a>
        <a target="_blank" href="https://www.google.com/searchbyimage?&image_url=${item.face2.content}"><img src="${item.face2.content}" alt=""></a>
      </div>
    </div>
  `;
    listItem.classList.add("anim-appear");
    list.append(listItem);
  });

  uiMainScreen.append(list);
  list.classList.add("anim-scale");
}

// menu interaction
uiBtnStartGame.addEventListener("click", (e) => {
  e.preventDefault();

  uiSettings.classList.add("display-none");

  startGame();
});

uiBtnGameReview.addEventListener("click", (e) => {
  e.preventDefault();

  review(reviewSelection);
});

uiBtnOpenSettings.addEventListener("click", (e) => {
  e.preventDefault();

  uiSettings.classList.toggle("display-none");
});

uiSettings.addEventListener("click", (e) => {
  if (e.target.classList.contains("setting-pattern")) {
    document
      .querySelectorAll(".settings-card-patterns .selected")
      .forEach((item) => {
        item.classList.remove("selected");
      });
    e.target.classList.add("selected");
    localStorage.setItem("backgroundIMG", e.target.dataset.id);
  }

  if (e.target.classList.contains("setting-color")) {
    document
      .querySelectorAll(".settings-background-colors .selected")
      .forEach((item) => {
        item.classList.remove("selected");
      });
    e.target.classList.add("selected");
    localStorage.setItem("backgroundClr", e.target.style.backgroundColor);
    uiBody.style.backgroundColor = e.target.style.backgroundColor;
  }
});

function transitionOut(item) {
  item.classList.remove("anim-appear");
  item.classList.add("anim-disappear");
  setTimeout(() => {
    item.classList.add("display-none");
  }, 200);
}

function transitionIn(item) {
  setTimeout(() => {
    item.classList.remove("display-none");
    item.classList.remove("anim-disappear");
    item.classList.add("anim-appear");
  }, 200);
}
