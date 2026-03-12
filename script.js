const themeToggle = document.getElementById("themeToggle");
const featureSlider = document.getElementById("featureSlider");
const featureCards = featureSlider ? [...featureSlider.querySelectorAll(".feature-card")] : [];
let activeIndex = 0;
let autoTimer;

if (themeToggle) {
  themeToggle.addEventListener("click", () => {
    document.body.classList.toggle("dark");
    themeToggle.innerHTML = document.body.classList.contains("dark")
      ? '<i class="bi bi-sun"></i>'
      : '<i class="bi bi-moon-stars"></i>';
  });
}

function setActiveCard(index) {
  if (!featureSlider || !featureCards.length) {
    return;
  }

  activeIndex = (index + featureCards.length) % featureCards.length;
  featureCards.forEach((card, i) => {
    card.classList.toggle("is-active", i === activeIndex);
  });

  featureCards[activeIndex].scrollIntoView({ behavior: "smooth", inline: "center", block: "nearest" });
}

function startAutoSlide() {
  if (!featureCards.length) {
    return;
  }

  clearInterval(autoTimer);
  autoTimer = setInterval(() => {
    setActiveCard(activeIndex + 1);
  }, 2600);
}

if (featureCards.length) {
  setActiveCard(0);
  startAutoSlide();

  featureSlider.addEventListener("mouseenter", () => clearInterval(autoTimer));
  featureSlider.addEventListener("mouseleave", startAutoSlide);
}
