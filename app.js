const uiCardsContainer = document.getElementById("cardsContainer");
let flippedCount = 0;
const uiTryCount = document.getElementById("tryCount");
let tryCount = 0;
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
    uiTryCount.classList.add("anim-rotate");
    uiTryCount.innerText = tryCount;
    uiCardsContainer.style.pointerEvents = "none";

    setTimeout(function () {
      uiTryCount.classList.remove("anim-rotate");
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
    successPopup(cards[0].parentElement.dataset.name);
    console.log("right pair");
    isGameWon(6);
  } else {
    console.log("wrong pair");
  }
}

function isGameWon() {
  if (foundPairs === totalPairs) {
    setTimeout(() => {
      alert("Bravo !");
      uiTryCount.innerText = "Go!";
    }, 300);
  }
}

function fillGrid() {
  foundPairs = 0;
  uiCardsContainer.innerHTML = "";

  let shuffledDB = db.sort(func);
  function func(a, b) {
    return 0.5 - Math.random();
  }
  let selection = shuffledDB.slice(0, 6);

  selection.forEach((item) => {
    const html = `
    <div class="card" style="order: ${getRandom(1, 12)}" data-pair="${
      item.id
    }" data-name="${item.name}">
      <div class="content">
        <div class="front"></div>
        <div class="back"><img src="${item.face1.content}" alt=""></div>
      </div>
    </div>
    <div class="card" style="order: ${getRandom(1, 12)}" data-pair="${
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

  setTimeout(() => {
    uiCardsContainer.classList.add("anim-appear");
  }, 300);
}

uiTryCount.addEventListener("click", () => {
  tryCount = 0;
  uiTryCount.innerText = tryCount;
  uiTryCount.classList.add("anim-morph");
  uiCardsContainer.classList.remove("anim-appear");
  fillGrid();
});

function successPopup(name) {
  const uiSuccessPopup = document.getElementById("successPopup");
  const uiPopupName = document.querySelector("#successPopup p");
  uiPopupName.innerText = name;
  uiSuccessPopup.style.opacity = 1;
  uiSuccessPopup.style.transform = "translateY(100px)";
  setTimeout(() => {
    uiSuccessPopup.style.opacity = 0;
    uiSuccessPopup.style.transform = "unset";
  }, 2000);
}
