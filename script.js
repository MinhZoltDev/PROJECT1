const themeToggle = document.getElementById("themeToggle");
const featureSlider = document.getElementById("featureSlider");
const featureCards = featureSlider ? [...featureSlider.querySelectorAll(".feature-card")] : [];
const revealItems = [...document.querySelectorAll(".reveal")];
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

function highlightCard(index) {
  if (!featureSlider || !featureCards.length) {
    return;
  }

  activeIndex = (index + featureCards.length) % featureCards.length;
  featureCards.forEach((card, i) => {
    card.classList.toggle("is-active", i === activeIndex);
  });

  const activeCard = featureCards[activeIndex];
  const nextLeft = activeCard.offsetLeft - (featureSlider.clientWidth - activeCard.clientWidth) / 2;
  featureSlider.scrollTo({ left: Math.max(nextLeft, 0), behavior: "smooth" });
}

function startAutoSlide() {
  if (!featureCards.length) {
    return;
  }
  clearInterval(autoTimer);
  autoTimer = setInterval(() => {
    highlightCard(activeIndex + 1);
  }, 2600);
}

if (featureCards.length) {
  highlightCard(0);
  startAutoSlide();

  featureSlider.addEventListener("mouseenter", () => clearInterval(autoTimer));
  featureSlider.addEventListener("mouseleave", startAutoSlide);

  featureCards.forEach((card, index) => {
    card.addEventListener("mouseenter", () => highlightCard(index));
  });
}

if ("IntersectionObserver" in window && revealItems.length) {
  const observer = new IntersectionObserver(
    (entries) => {
      entries.forEach((entry) => {
        if (entry.isIntersecting) {
          entry.target.classList.add("in-view");
          observer.unobserve(entry.target);
        }
      });
    },
    { threshold: 0.15, rootMargin: "0px 0px -40px 0px" }
  );

  revealItems.forEach((item) => observer.observe(item));
} else {
  revealItems.forEach((item) => item.classList.add("in-view"));
}
