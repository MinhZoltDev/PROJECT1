const setTitle = document.getElementById("setTitle");
const setDescription = document.getElementById("setDescription");
const reviewCard = document.getElementById("reviewCard");
const cardContent = document.getElementById("cardContent");
const prevBtn = document.getElementById("prevBtn");
const nextBtn = document.getElementById("nextBtn");

const data = JSON.parse(localStorage.getItem("minhzolt_flashcard_set") || "{}");
const cards = Array.isArray(data.cards) ? data.cards : [];
let index = 0;
let showBack = false;

if (setTitle) setTitle.textContent = data.title || "Flashcard Set";
if (setDescription) setDescription.textContent = data.description || "";

function renderCard() {
  if (!cards.length) {
    if (cardContent) cardContent.textContent = "Không có dữ liệu flashcard. Hãy quay lại trang tạo list.";
    return;
  }

  const card = cards[index];
  cardContent.textContent = showBack ? card.definition : card.term;
}

reviewCard?.addEventListener("click", () => {
  if (!cards.length) return;
  showBack = !showBack;
  renderCard();
});

prevBtn?.addEventListener("click", () => {
  if (!cards.length) return;
  index = (index - 1 + cards.length) % cards.length;
  showBack = false;
  renderCard();
});

nextBtn?.addEventListener("click", () => {
  if (!cards.length) return;
  index = (index + 1) % cards.length;
  showBack = false;
  renderCard();
});

renderCard();
