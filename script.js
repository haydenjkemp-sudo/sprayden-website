// Mobile menu
const menuBtn = document.getElementById("menuBtn");
const navMenu = document.getElementById("navMenu");

if (menuBtn && navMenu) {
  menuBtn.addEventListener("click", () => {
    navMenu.classList.toggle("open");
  });
}

// Before / after slider
const range = document.getElementById("compareRange");
const afterLayer = document.getElementById("afterLayer");
const sliderLine = document.getElementById("sliderLine");

function updateSlider() {
  if (!range || !afterLayer || !sliderLine) return;
  afterLayer.style.width = range.value + "%";
  sliderLine.style.left = range.value + "%";
}

if (range) {
  updateSlider();
  range.addEventListener("input", updateSlider);
  range.addEventListener("change", updateSlider);
}

// Reveal animations
const items = document.querySelectorAll(".reveal, .service-card, .glass-card, .process-grid article, .stats-grid article, .faq-list details");

const observer = new IntersectionObserver((entries) => {
  entries.forEach(entry => {
    if (entry.isIntersecting) {
      entry.target.classList.add("show");
    }
  });
}, { threshold: 0.15 });

items.forEach(item => {
  item.classList.add("hide");
  observer.observe(item);
});

// Counters
const counters = document.querySelectorAll("[data-count]");
let counted = false;

function runCounters() {
  if (counted) return;
  counted = true;

  counters.forEach(counter => {
    const target = Number(counter.dataset.count);
    let current = 0;
    const step = Math.max(1, Math.ceil(target / 60));

    const timer = setInterval(() => {
      current += step;
      if (current >= target) {
        current = target;
        clearInterval(timer);
      }
      counter.textContent = current;
    }, 24);
  });
}

const statsSection = document.querySelector(".stats-section");

if (statsSection) {
  const statsObserver = new IntersectionObserver((entries) => {
    if (entries[0].isIntersecting) runCounters();
  }, { threshold: 0.3 });

  statsObserver.observe(statsSection);
}

// Back to top
const backTop = document.getElementById("backToTop");

if (backTop) {
  window.addEventListener("scroll", () => {
    if (window.scrollY > 500) {
      backTop.classList.add("show");
    } else {
      backTop.classList.remove("show");
    }
  });

  backTop.addEventListener("click", () => {
    window.scrollTo({ top: 0, behavior: "smooth" });
  });
}

console.log("Sprayden JS working");

const topbar = document.getElementById("topbar");

if (topbar) {
  window.addEventListener("scroll", () => {
    if (window.scrollY > 40) {
      topbar.classList.add("scrolled");
    } else {
      topbar.classList.remove("scrolled");
    }
  });
}