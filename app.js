const uiCardsContainer = document.getElementById("cardsContainer");
const uiTryCount = document.getElementById("tryCount");
const uiName = document.querySelector("#successMessage p");
const uiSuccessMessage = uiName.parentElement;
const uiMenu = document.getElementById("menu");
const uiBtnStartGame = document.getElementById("startGame");
const uiGameHeader = document.getElementById("game-header");
let tryCount = 0;
let flippedCount = 0;
let totalPairs = 6;
let foundPairs = 0;

uiCardsContainer.addEventListener("click", (e) => {
  const target = e.target.parentElement;
  if (
    target.classList.contains("content") &&
    !target.classList.contains("flipped")
  ) {
    flippedCount++;
    target.classList.toggle("flipped");
  }

  if (flippedCount === 2) {
    flippedCount = 0;
    tryCount++;
    uiTryCount.classList.add("anim-trycount");
    uiTryCount.innerText = tryCount;
    uiCardsContainer.style.pointerEvents = "none";

    setTimeout(function () {
      uiTryCount.classList.remove("anim-trycount");
      uiCardsContainer.style.pointerEvents = "auto";
      const flippedCards = Array.from(
        document.querySelectorAll(".flipped:not(.found)")
      );
      isCorrect(flippedCards);
      resetFlipped(flippedCards);
    }, 1500);
  }
});

function resetFlipped(cards) {
  cards.forEach((card) => {
    if (!card.classList.contains("found")) {
      card.classList.remove("flipped");
    }
  });
}

function isCorrect(cards) {
  if (
    cards[0].parentElement.dataset.pair === cards[1].parentElement.dataset.pair
  ) {
    cards.forEach((card) => card.classList.add("found", "anim-success"));
    foundPairs++;
    successMessage(cards[0].parentElement.dataset.name);
    isGameWon(6);
  }
}

function isGameWon() {
  if (foundPairs === totalPairs) {
    uiMenu.classList.remove("anim-disappear");
    setTimeout(() => {
      uiMenu.style.display = "flex";
      uiMenu.classList.add("anim-appear");
    }, 500);
  }
}

function fillGrid() {
  uiGameHeader.style.transform = "unset";
  uiMenu.classList.add("anim-disappear");
  setTimeout(() => {
    uiMenu.style.display = "none";
    uiCardsContainer.classList.add("anim-appear");
  }, 500);

  uiCardsContainer.style.pointerEvents = "none";
  foundPairs = 0;
  uiCardsContainer.innerHTML = "";

  let shuffledDB = db.sort(func);
  function func(a, b) {
    return 0.5 - Math.random();
  }
  let selection = shuffledDB.slice(0, 6);

  selection.forEach((item) => {
    const html = `
    <div class="card" data-pair="${item.id}" data-name="${item.name}">
      <div class="content">
        <div class="front"></div>
        <div class="back"><img src="${item.face1.content}" alt=""></div>
      </div>
    </div>
    <div class="card" data-pair="${item.id}" data-name="${item.name}">
      <div class="content">
        <div class="front"></div>
        <div class="back"><img src="${item.face2.content}" alt=""></div>
      </div>
    </div>
  `;

    uiCardsContainer.innerHTML += html;
  });

  document.querySelectorAll(".card").forEach((card, i) => {
    card.style.order = `${getRandom(1, 12)}`;

    setTimeout(() => {
      uiCardsContainer.style.pointerEvents = "auto";
    }, 300);
  });
}

function successMessage(name) {
  uiName.innerText = name;
  uiName.classList.add("anim-name");
  setTimeout(() => {
    uiName.classList.remove("anim-name");
  }, 2000);
}

uiBtnStartGame.addEventListener("click", (e) => {
  e.preventDefault();

  tryCount = 0;
  uiTryCount.innerText = tryCount;
  fillGrid();
});
