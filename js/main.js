// Mobile nav toggle
const navToggle = document.getElementById("navToggle");
const navList = document.getElementById("navList");

if (navToggle && navList) {
  navToggle.addEventListener("click", () => {
    navList.classList.toggle("show");
  });

  navList.addEventListener("click", (e) => {
    if (e.target.tagName === "A") {
      navList.classList.remove("show");
    }
  });
}

// Dynamic year in footer
const yearSpan = document.getElementById("year");
if (yearSpan) {
  yearSpan.textContent = new Date().getFullYear();
}
