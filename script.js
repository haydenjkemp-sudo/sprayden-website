const menuBtn = document.getElementById("menuBtn");
const navMenu = document.getElementById("navMenu");

if (menuBtn && navMenu) {
  menuBtn.addEventListener("click", () => {
    navMenu.classList.toggle("open");
  });

  navMenu.querySelectorAll("a").forEach(link => {
    link.addEventListener("click", () => {
      navMenu.classList.remove("open");
    });
  });
}

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
  range.addEventListener("touchmove", updateSlider);
}

const topbar = document.getElementById("topbar");

if (topbar) {
  window.addEventListener("scroll", () => {
    topbar.classList.toggle("scrolled", window.scrollY > 40);
  });
}

const reveals = document.querySelectorAll(".reveal");

function revealOnScroll() {
  reveals.forEach(el => {
    if (el.getBoundingClientRect().top < window.innerHeight - 100) {
      el.classList.add("active");
      el.classList.add("show");
    }
  });
}

window.addEventListener("scroll", revealOnScroll);
revealOnScroll();

const backTop = document.getElementById("backToTop");

if (backTop) {
  window.addEventListener("scroll", () => {
    backTop.classList.toggle("show", window.scrollY > 500);
  });

  backTop.addEventListener("click", () => {
    window.scrollTo({ top: 0, behavior: "smooth" });
  });
}

console.log("Sprayden fixed JS loaded");

document.querySelectorAll("#navMenu a").forEach(link => {
  link.addEventListener("click", () => {
    document.getElementById("navMenu").classList.remove("open");
  });
});
// Close menu when clicking outside it
document.addEventListener("click", (e) => {
    const menu = document.getElementById("navMenu");
    const toggle = document.querySelector(".menu-toggle");

    if (
        menu.classList.contains("open") &&
        !menu.contains(e.target) &&
        !toggle.contains(e.target)
    ) {
        menu.classList.remove("open");
    }
});