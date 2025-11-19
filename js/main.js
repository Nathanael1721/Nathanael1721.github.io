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

async function loadProjects() {
  const container = document.getElementById("projectsGrid");
  if (!container) return;

  try {
    const res = await fetch("content/projects.json", { cache: "no-store" });
    if (!res.ok) throw new Error("Failed to load projects.json");
    const data = await res.json();
    const items = data.items || [];

    container.innerHTML = "";

    items.forEach((item) => {
      const card = document.createElement("article");
      card.className = "card";

      const bulletsHtml = (item.bullets || [])
        .map((b) => `<li>${b}</li>`)
        .join("");

      card.innerHTML = `
        <h3>${item.title || ""}</h3>
        ${item.kicker ? `<p class="card-kicker">${item.kicker}</p>` : ""}
        ${item.summary ? `<p>${item.summary}</p>` : ""}
        ${
          bulletsHtml
            ? `<ul class="card-list">
                 ${bulletsHtml}
               </ul>`
            : ""
        }
      `;

      container.appendChild(card);
    });
  } catch (err) {
    console.error(err);
    container.innerHTML =
      '<p style="color:#f87171;font-size:0.9rem;">Failed to load projects.</p>';
  }
}

document.addEventListener("DOMContentLoaded", () => {
  // kode nav toggle + year sebelumnya
  loadProjects();
});
