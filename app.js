const uiMenu = document.getElementById("menu");
const uiBtnStartGame = document.getElementById("startGame");
const uiGameHeader = document.getElementById("game-header");
const uiTryCount = document.getElementById("tryCount");
const uiName = document.querySelector("#successMessage p");
const uiSuccessMessage = uiName.parentElement;
const uiCardsContainer = document.getElementById("cardsContainer");

let db = [];
let tryCount = 0;
let flippedCount = 0;
let totalPairs = 6;
let foundPairs = 0;

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

getData(url);

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
}

// prepare game board
function startGame() {
  initGame();
  uiMenu.style.display = "none";
  uiGameHeader.style.display = "flex";
  uiCardsContainer.style.display = "grid";
  fillGrid();
}

// randomize cards and display them on the page
function fillGrid() {
  let shuffledDB = db.sort(shuffle);
  function shuffle(a, b) {
    return 0.5 - Math.random();
  }

  let selection = shuffledDB.slice(0, 6);
  selection.forEach((item) => {
    const html = `
    <div class="card" style="order:${getRandom(1, 12)}" data-pair="${
      item.id
    }" data-name="${item.name}">
      <div class="content">
        <div class="front"></div>
        <div class="back"><img src="${item.face1.content}" alt=""></div>
      </div>
    </div>
    <div class="card" style="order:${getRandom(1, 12)}" data-pair="${
      item.id
    }" data-name="${item.name}">
      <div class="content">
        <div class="front"></div>
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
  setTimeout(() => {
    uiGameHeader.style.display = "none";
  }, 500);
  setTimeout(() => {
    uiCardsContainer.style.display = "none";
  }, 1000);
  setTimeout(() => {
    uiMenu.style.display = "flex";
  }, 1500);
}

// menu interaction
uiBtnStartGame.addEventListener("click", (e) => {
  e.preventDefault();

  startGame();
});
