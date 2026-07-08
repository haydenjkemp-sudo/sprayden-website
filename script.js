const menuBtn = document.getElementById("menuBtn");
const navMenu = document.getElementById("navMenu");
const topbar = document.getElementById("topbar");
const backTop = document.getElementById("backToTop");
const loader = document.getElementById("loader");

menuBtn?.addEventListener("click", () => {
  navMenu?.classList.toggle("open");
});

document.querySelectorAll("#navMenu a").forEach(link => {
  link.addEventListener("click", () => {
    navMenu?.classList.remove("open");
  });
});

window.addEventListener("scroll", () => {
  topbar?.classList.toggle("scrolled", window.scrollY > 40);
  backTop?.classList.toggle("show", window.scrollY > 500);

  document.querySelectorAll(".reveal").forEach(el => {
    if (el.getBoundingClientRect().top < window.innerHeight - 100) {
      el.classList.add("active", "show");
    }
  });
});

backTop?.addEventListener("click", () => {
  window.scrollTo({ top: 0, behavior: "smooth" });
});

window.onload = function () {
    const loader = document.getElementById("loader");

    if (loader) {
        setTimeout(function () {
            loader.style.opacity = "0";
            loader.style.visibility = "hidden";
        }, 1200);
    }
};
// Animated statistics
const counters = document.querySelectorAll("[data-count]");

const startCounters = () => {
    counters.forEach(counter => {
        const target = parseInt(counter.dataset.count);
        let current = 0;
        const increment = Math.max(1, Math.ceil(target / 50));

        const update = () => {
            current += increment;

            if (current >= target) {
                counter.textContent = target;
            } else {
                counter.textContent = current;
                requestAnimationFrame(update);
            }
        };

        update();
    });
};

const statsSection = document.querySelector(".stats-section");

if (statsSection) {
    const observer = new IntersectionObserver(entries => {
        if (entries[0].isIntersecting) {
            startCounters();
            observer.disconnect();
        }
    }, { threshold: 0.4 });

    observer.observe(statsSection);
}