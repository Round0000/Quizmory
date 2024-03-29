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
const uiCategories = document.getElementById("categories");
const uiSpeedrun = document.getElementById("speedrun");

let db = [];
let tryCount = 0;
let flippedCount = 0;
let totalPairs = 6;
let foundPairs = 0;
let reviewSelection = [];
let speedrun = false;

let storedImg = localStorage.getItem("backgroundIMG");
let storedClr = localStorage.getItem("backgroundClr");

function retrieveSettings() {
  uiBody.style.backgroundColor = "#85adb1";
  if (storedClr) {
    uiBody.style.backgroundColor = storedClr;
  }

  if (!storedImg) {
    localStorage.setItem("backgroundIMG", "01");
  }

  document.querySelectorAll(".setting-pattern").forEach((item) => {
    if (item.dataset.id === storedImg) {
      item.classList.add("selected");
    }
  });

  document.querySelectorAll(".setting-color").forEach((item) => {
    item.classList.remove("selected");
    if (item.style.backgroundColor === storedClr) {
      item.classList.add("selected");
    }
  });
}

retrieveSettings();

const categories = [
  {
    id: "dbPaintings01",
    url: "https://api.jsonbin.io/b/6030d5b07c58305d3957836a/latest",
  },
  {
    id: "dbAlbums01",
    url: "https://api.jsonbin.io/b/6038fb920866664b1083d3b5/latest",
  },
  {
    id: "dbPlaces01",
    url: "https://api.jsonbin.io/b/603e62fb81087a6a8b94b429/latest",
  },
  {
    id: "dbMovies01",
    url: "https://api.jsonbin.io/b/603f928b0866664b1087e551/latest",
  },
  {
    id: "dbObadia01",
    url: "https://api.jsonbin.io/b/616c0ee7aa02be1d445a9c62/latest",
  },
];

uiCategories.addEventListener("click", (e) => {
  if (e.target.classList.contains("category")) {
    db = [];
    uiBtnStartGame.disabled = true;
    const i = categories.findIndex((x) => x.id === e.target.dataset.id);

    getData(categories[i].url).then(() => {
      uiBtnStartGame.disabled = false;
      uiBtnStartGame.classList.add("anim-bump");
      setTimeout(() => {
        uiBtnStartGame.classList.remove("anim-bump");
      }, 500);
    });
  }
});

async function getData(dataSrc) {
  // read JSON
  let response = await fetch(dataSrc);
  data = await response.json();
  // store locally
  data.forEach((item) => {
    db.push(item);
  });
}

// generate random integer
function getRandom(min, max) {
  min = Math.ceil(min);
  max = Math.floor(max);
  return Math.floor(Math.random() * (max - min + 1)) + min;
}

// timer function for speed mode
function timer(max) {
  const inter = setInterval(countdown, 1000);
  let time = max;
  uiTryCount.innerText = time;
  function countdown() {
    if (time === 0 || foundPairs === totalPairs) {
      clearInterval(inter);
      uiTryCount.innerText = "...";
      uiCardsContainer.style.pointerEvents = "none";
      setTimeout(() => {
        backToMain();
      }, 2000);
    } else {
      time--;
      uiTryCount.innerText = time;
    }
  }

  uiTryCount.addEventListener("click", () => {
    clearInterval(inter);
    uiTryCount.innerText = "...";
  });
}

// set counters and UI to default/empty
function initGame() {
  tryCount = 0;
  flippedCount = 0;
  foundPairs = 0;

  uiName.innerText = "";
  uiCardsContainer.innerHTML = "";
  uiCardsContainer.style.pointerEvents = "none";

  document.getElementById("topAnchor").style.display = "none";
  transitionOut(uiMainScreen);
  setTimeout(() => {
    // transitionIn(uiGameHeader);
    transitionMove(uiGameHeader, "in");
    if (document.getElementById("reviewList")) {
      document.getElementById("reviewList").remove();
    }
  }, 200);

  setTimeout(() => {
    if (speedrun) {
      timer(30);
    } else {
      uiTryCount.innerText = tryCount;
    }

    uiCardsContainer.style.pointerEvents = "auto";
  }, 1500);

  transitionIn(uiCardsContainer);
}

// prepare game board
function startGame() {
  initGame();
  fillGrid(storedImg);
}

// randomize cards and display them on the page
function fillGrid(imgID) {
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
        <div class="front frontbg${imgID}"></div>
        <div class="back"><img src="${item.face1.content}" alt=""></div>
      </div>
    </div>
    <div class="card" style="order:${getRandom(1, 12)}" data-pair="${
      item.id
    }" data-name="${item.name}">
      <div class="content">
      <div class="front frontbg${imgID}"></div>
        <div class="back"><img src="${item.face2.content}" alt=""></div>
      </div>
    </div>
  `;

    uiCardsContainer.innerHTML += html;
  });

  setTimeout(() => {
    gameIsOn();
  }, 1000);
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
      if (!speedrun) {
        tryCount++;
      }
      const flippedCards = Array.from(
        document.querySelectorAll(".flipped:not(.found)")
      );
      let name = checkPair(flippedCards);

      updateUI(name, flippedCards);
      flippedCount = 0;

      if (foundPairs === totalPairs) {
        setTimeout(() => {
          backToMain(true);
        }, 2000);
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
    }, 600);
    foundPairs++;
    return cards[0].parentElement.dataset.name;
  }
}

// update UI after a pair selection
function updateUI(name, cards, speed) {
  let gamespeed;
  if (speedrun) {
    gamespeed = 1000;
  } else {
    gamespeed = 2000;
    uiTryCount.classList.add("anim-trycount");
    uiTryCount.innerText = tryCount;
  }

  if (name) {
    uiName.innerText = name;
    uiName.style.opacity = "1";
    setTimeout(() => {
      uiName.style.opacity = "0";
    }, gamespeed);
  }
  setTimeout(() => {
    uiTryCount.classList.remove("anim-trycount");
    cards.forEach((card) => {
      card.classList.remove("flipped");
    });
    uiCardsContainer.style.pointerEvents = "auto";
  }, gamespeed);
}

// when game is won
function backToMain(victory) {
  transitionOut(uiCardsContainer);
  setTimeout(() => {
    transitionMove(uiGameHeader, "out");
    transitionIn(uiMainScreen);
    uiSettings.classList.remove("anim-disappear");
    uiTryCount.innerText = "...";
  }, 200);

  if (victory) {
    uiBtnGameReview.disabled = false;
  }
}

// previous game review
function review(selection) {
  const list = document.createElement("UL");
  list.setAttribute("id", "reviewList");
  document.getElementById("topAnchor").style.display = "block";

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
  document.getElementById("aReview").scrollIntoView();
}

// leave the game
uiTryCount.addEventListener("click", () => {
  backToMain();
});

// menu interaction
uiBtnStartGame.addEventListener("click", (e) => {
  e.preventDefault();

  transitionOut(uiSettings);

  startGame();
});

uiBtnGameReview.addEventListener("click", (e) => {
  e.preventDefault();

  uiBtnGameReview.disabled = true;

  review(reviewSelection);
});

uiBtnOpenSettings.addEventListener("click", (e) => {
  e.preventDefault();

  uiSettings.classList.toggle("display-none");
  if (!uiSettings.classList.contains("display-none")) {
    document.getElementById("aSettings").scrollIntoView();
  }
});

// Settings section
uiSettings.addEventListener("click", (e) => {
  if (uiSpeedrun.checked) {
    speedrun = true;
  } else {
    speedrun = false;
  }

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

// Transition helpers
function transitionOut(item, translate) {
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

function transitionMove(item, way) {
  if (way === "in") {
    item.classList.remove("anim-leave");
    item.classList.remove("display-none");
    item.classList.add("anim-enter");
  } else if (way === "out") {
    item.classList.remove("anim-enter");
    item.classList.add("anim-leave");
    setTimeout(() => {
      item.classList.add("display-none");
    }, 500);
  }
}
