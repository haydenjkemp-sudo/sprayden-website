// Before / After Slider
const slider = document.getElementById("compare");
const afterWrap = document.querySelector(".after-wrap");
const line = document.querySelector(".line");

if (slider && afterWrap && line) {
  function updateSlider() {
    afterWrap.style.width = slider.value + "%";
    line.style.left = slider.value + "%";
  }

  updateSlider();
  slider.addEventListener("input", updateSlider);
}

// Scroll animations
const revealElements = document.querySelectorAll(".reveal");

const observer = new IntersectionObserver((entries) => {
  entries.forEach((entry) => {
    if (entry.isIntersecting) {
      entry.target.classList.add("visible");
    }
  });
}, {
  threshold: 0.2
});

revealElements.forEach((el) => observer.observe(el));

// Smooth logo animation
const logo = document.querySelector(".main-logo");

if (logo) {
  let direction = 1;

  setInterval(() => {
    const current = parseFloat(logo.dataset.offset || "0");

    let next = current + direction;

    if (next > 8) direction = -1;
    if (next < -8) direction = 1;

    logo.dataset.offset = next;
    logo.style.transform = `translateY(${next}px)`;
  }, 60);
}

console.log("🚀 Sprayden Premium Loaded");