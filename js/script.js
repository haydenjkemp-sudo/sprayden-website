const slider = document.getElementById("compare");
const afterWrapper = document.querySelector(".after-wrapper");

if (slider && afterWrapper) {
  slider.addEventListener("input", function () {
    afterWrapper.style.width = slider.value + "%";
  });
}