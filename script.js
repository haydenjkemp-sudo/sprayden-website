const animatedSections = document.querySelectorAll(".section, .card, .review, .steps div");

const observer = new IntersectionObserver((entries) => {
  entries.forEach(entry => {
    if (entry.isIntersecting) {
      entry.target.classList.add("show");
    }
  });
}, { threshold: 0.15 });

animatedSections.forEach(el => {
  el.classList.add("hide");
  observer.observe(el);
});

console.log("Sprayden premium animations loaded");