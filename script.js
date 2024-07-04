const cards = [
  { front: "mother", back: "мать", example: "My mother is a doctor." },
  { front: "river", back: "река", example: "The river flows through our city." },
  { front: "cat", back: "кот", example: "The cat sleeps on the sofa." },
  { front: "street", back: "улица", example: "They live on the same street." },
  { front: "school", back: "школа", example: "The school is closed today." },
];

let currentCardIndex = 0;
let isExamMode = false;
let correctAnswers = 0;
let startTime;
let timerInterval;
let selectedCards = [];
let attempts = {};

function updateCardDisplay() {
  const card = cards[currentCardIndex];
  document.querySelector("#card-front h1").textContent = card.front;
  document.querySelector("#card-back h1").textContent = card.back;
  document.querySelector("#card-back p span").textContent = card.example;
  document.querySelector("#current-word").textContent = currentCardIndex + 1;
  document.querySelector("#total-word").textContent = cards.length;
  document.querySelector("#words-progress").value = (currentCardIndex + 1) / cards.length * 100;
  document.querySelector("#back").disabled = currentCardIndex === 0;
  document.querySelector("#next").disabled = currentCardIndex === cards.length - 1;
}

function flipCard() {
  document.querySelector(".flip-card").classList.toggle("active");
}

function shuffleCards() {
  for (let i = cards.length - 1; i > 0; i--) {
    const j = Math.floor(Math.random() * (i + 1));
    [cards[i], cards[j]] = [cards[j], cards[i]];
  }
  currentCardIndex = 0;
  updateCardDisplay();
}

function startExam() {
  isExamMode = true;
  shuffleCards();
  correctAnswers = 0;
  startTime = new Date();
  timerInterval = setInterval(updateTimer, 1000);
  createExamCards();

  document.querySelector(".flip-card").style.display = 'none'; 
  document.querySelector("#exam").style.display = 'none';
  document.querySelector("#back").style.display = 'none'; 
  document.querySelector("#next").style.display = 'none';
}
function createExamCards() {
  const examCardsContainer = document.querySelector("#exam-cards");
  examCardsContainer.innerHTML = ''; 

  const examCards = [...cards, ...cards.map(card => ({ front: card.back, back: card.front, example: card.example }))];

  shuffleArray(examCards);

  examCards.forEach((card, index) => {
    const cardElement = document.createElement("div");
    cardElement.classList.add("card");
    cardElement.textContent = card.front;
    cardElement.dataset.index = index;
    cardElement.dataset.matched = 'false';
    examCardsContainer.appendChild(cardElement);
  });

  document.querySelector("#study-mode").classList.add("hidden");
  document.querySelector("#exam-mode").classList.remove("hidden");
}

function shuffleArray(array) {
  for (let i = array.length - 1; i > 0; i--) {
    const j = Math.floor(Math.random() * (i + 1));
    [array[i], array[j]] = [array[j], array[i]];
  }
}

function updateTimer() {
  const currentTime = new Date();
  const timeElapsed = new Date(currentTime - startTime);
  const minutes = timeElapsed.getUTCMinutes().toString().padStart(2, '0');
  const seconds = timeElapsed.getUTCSeconds().toString().padStart(2, '0');
  document.querySelector("#time").textContent = `${minutes}:${seconds}`;
}

function handleCardClick(event) {
  const clickedCard = event.target;
  if (!clickedCard.classList.contains("card") || clickedCard.dataset.matched === 'true') return;

  const cardText = clickedCard.textContent;
  attempts[cardText] = (attempts[cardText] || 0) + 1;

  if (selectedCards.length === 0) {
    selectedCards.push(clickedCard);
    clickedCard.classList.add("selected", "correct");
  } else if (selectedCards.length === 1 && !selectedCards.includes(clickedCard)) {
    selectedCards.push(clickedCard);
    clickedCard.classList.add("selected");

    const isMatch = cards.some(card => 
      (card.front === selectedCards[0].textContent && card.back === clickedCard.textContent) ||
      (card.back === selectedCards[0].textContent && card.front === clickedCard.textContent)
    );

    if (isMatch) {
      selectedCards.forEach(card => {
        card.classList.add("correct", "fade-out");
        card.dataset.matched = 'true';
      });
      correctAnswers++;
    } else {
      selectedCards[0].classList.remove("correct");
      selectedCards[0].classList.add("wrong");
      clickedCard.classList.add("wrong");
    }

    setTimeout(() => {
      selectedCards.forEach(card => {
        card.classList.remove("selected", "wrong");
        card.style.opacity = card.dataset.matched === 'true' ? '0' : '1';
      });
      selectedCards = [];
    }, 1000);
  }

  updateExamProgress();

  if (correctAnswers === cards.length) {
    finishExam();
  }
}

function finishExam() {
  clearInterval(timerInterval);
  showResults();
}

function showResults() {
  const resultsModal = document.querySelector('.results-modal');
  const resultsContent = document.querySelector('.results-content');
  const wordStatsTemplate = document.querySelector('#word-stats');

  resultsContent.innerHTML = '';

  cards.forEach((card, index) => {
    const wordStat = wordStatsTemplate.content.cloneNode(true);
    wordStat.querySelector('.word span').textContent = card.front;
    wordStat.querySelector('.attempts span').textContent = attempts[card.front] || 0;
    resultsContent.appendChild(wordStat);
  });

  document.querySelector('.time').textContent = document.querySelector('#time').textContent;

  resultsModal.classList.remove('hidden');
}

function updateExamProgress() {
  const percentCorrect = (correctAnswers === cards.length / 2) * 100;
  document.querySelector("#correct-percent").textContent = `${percentCorrect}%`;
  document.querySelector("#exam-progress").value = percentCorrect;
}

document.querySelector("#back").addEventListener("click", () => {
  if (currentCardIndex > 0) {
    currentCardIndex--;
    updateCardDisplay();
  }
});
document.querySelector("#next").addEventListener("click", () => {
  if (currentCardIndex < cards.length - 1) {
    currentCardIndex++;
    updateCardDisplay();
  }
});
document.querySelector(".flip-card").addEventListener("click", flipCard);
document.querySelector("#shuffle-words").addEventListener("click", shuffleCards);
document.querySelector("#exam").addEventListener("click", startExam);

document.querySelector("#exam-cards").addEventListener("click", handleCardClick);
updateCardDisplay();
