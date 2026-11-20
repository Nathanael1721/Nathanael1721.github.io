const navToggle = document.getElementById("navToggle");
const navList = document.getElementById("navList");

function setNavOpen(open) {
  navList.classList.toggle("show", open);
  navToggle.setAttribute("aria-expanded", String(open));
  navToggle.setAttribute("aria-label", open ? "Close navigation menu" : "Open navigation menu");
}

if (navToggle && navList) {
  navToggle.addEventListener("click", (e) => {
    e.stopPropagation();
    setNavOpen(!navList.classList.contains("show"));
  });

  navList.addEventListener("click", (e) => {
    if (e.target.closest("a")) setNavOpen(false);
  });

  document.addEventListener("click", (e) => {
    if (
      navList.classList.contains("show") &&
      !navList.contains(e.target) &&
      !navToggle.contains(e.target)
    ) {
      setNavOpen(false);
    }
  });

  document.addEventListener("keydown", (e) => {
    if (e.key === "Escape" && navList.classList.contains("show")) {
      setNavOpen(false);
      navToggle.focus();
    }
  });
}

const rootEl = document.documentElement;
const themeToggleBtn = document.getElementById("themeToggle");
const THEME_STORAGE_KEY = "theme";
const LEGACY_THEME_KEY = "preferred-theme";

function applyTheme(theme, persist) {
  const value = theme === "dark" ? "dark" : "light";
  rootEl.setAttribute("data-theme", value);
  if (themeToggleBtn) {
    themeToggleBtn.setAttribute(
      "aria-label",
      value === "dark" ? "Switch to light theme" : "Switch to dark theme"
    );
  }
  if (!persist) return;
  try {
    localStorage.setItem(THEME_STORAGE_KEY, value);
    localStorage.removeItem(LEGACY_THEME_KEY);
  } catch (_) {}
}

// The inline head script already resolved the theme; only sync the label here.
applyTheme(rootEl.getAttribute("data-theme"), false);

if (themeToggleBtn) {
  themeToggleBtn.addEventListener("click", () => {
    const next = rootEl.getAttribute("data-theme") === "dark" ? "light" : "dark";
    applyTheme(next, true);
  });
}

const yearSpan = document.getElementById("year");
if (yearSpan) {
  yearSpan.textContent = new Date().getFullYear();
}

// Content comes from the CMS, so escape it before it goes into innerHTML.
function esc(value) {
  return String(value ?? "")
    .replace(/&/g, "&amp;")
    .replace(/</g, "&lt;")
    .replace(/>/g, "&gt;")
    .replace(/"/g, "&quot;")
    .replace(/'/g, "&#39;");
}

function normalizeBullets(list) {
  if (!Array.isArray(list)) return [];
  return list
    .map((item) => {
      if (typeof item === "string") return item;
      if (!item) return "";
      return item.item || item.value || item.text || item.tag || "";
    })
    .filter(Boolean);
}

function normalizeImages(item) {
  const imgs = [];
  if (item.image) imgs.push(item.image);
  if (Array.isArray(item.images)) {
    item.images.forEach((img) => {
      const src = typeof img === "string" ? img : img && (img.src || img.path || img.url);
      if (src && !imgs.includes(src)) imgs.push(src);
    });
  }
  return imgs;
}

function setCount(id, count) {
  const el = document.getElementById(id);
  if (el) el.textContent = ` (${count})`;
}

function renderLoading(container, label) {
  container.innerHTML = `
    <div class="state-notice" aria-live="polite">
      <p class="state-notice-title">Loading ${esc(label)}…</p>
    </div>
  `;
}

function renderEmpty(container, title, desc, action) {
  container.innerHTML = `
    <div class="state-notice">
      <p class="state-notice-title">${esc(title)}</p>
      <p class="state-notice-desc">${esc(desc)}</p>
      ${action ? `<button type="button" class="btn ghost-btn state-action-btn">${esc(action.label)}</button>` : ""}
    </div>
  `;
  if (action) {
    container.querySelector(".state-action-btn").addEventListener("click", action.onClick);
  }
}

function renderError(container, label, retryFn) {
  container.innerHTML = `
    <div class="state-notice state-error" role="alert">
      <p class="state-notice-title">Couldn't load ${esc(label)}.</p>
      <p class="state-notice-desc">Check your connection, then try again.</p>
      <button type="button" class="btn ghost-btn state-action-btn">Try again</button>
    </div>
  `;
  container.querySelector(".state-action-btn").addEventListener("click", retryFn);
}

async function fetchItems(file) {
  const res = await fetch(file, { cache: "no-store" });
  if (!res.ok) throw new Error(`Failed to load ${file}`);
  const data = await res.json();
  return Array.isArray(data.items) ? data.items : [];
}

const projectModal = document.getElementById("projectModal");
const projectModalBackdrop = document.getElementById("projectModalBackdrop");
const projectModalClose = document.getElementById("projectModalClose");
const modalDialog = projectModal ? projectModal.querySelector(".modal-dialog") : null;
const modalTitle = document.getElementById("projectModalTitle");
const modalKicker = document.getElementById("projectModalKicker");
const modalSummary = document.getElementById("projectModalSummary");
const modalDetails = document.getElementById("projectModalDetails");
const modalBullets = document.getElementById("projectModalBullets");
const modalTags = document.getElementById("projectModalTags");
const modalImage = document.getElementById("projectModalImage");
const modalMedia = document.getElementById("projectModalMedia");
const modalCount = document.getElementById("projectModalCount");
const modalPrev = document.getElementById("projectModalPrev");
const modalNext = document.getElementById("projectModalNext");
const modalActions = document.getElementById("projectModalActions");
const modalFigmaLink = document.getElementById("projectModalFigma");
const modalSiteLink = document.getElementById("projectModalSite");

let currentImages = [];
let currentImageIndex = 0;
let lastFocusedTrigger = null;

function setText(el, text) {
  el.textContent = text || "";
  el.style.display = text ? "" : "none";
}

function renderProjectModalImage() {
  if (!currentImages.length) {
    modalMedia.style.display = "none";
    return;
  }
  modalMedia.style.display = "";
  modalImage.src = currentImages[currentImageIndex];
  modalImage.alt = `${modalTitle.textContent || "Project"}, image ${currentImageIndex + 1}`;

  const multiple = currentImages.length > 1;
  modalCount.textContent = multiple ? `${currentImageIndex + 1} / ${currentImages.length}` : "";
  modalPrev.style.display = multiple ? "" : "none";
  modalNext.style.display = multiple ? "" : "none";
}

function stepImage(delta) {
  if (currentImages.length < 2) return;
  currentImageIndex = (currentImageIndex + delta + currentImages.length) % currentImages.length;
  renderProjectModalImage();
}

function setModalLink(el, href, label) {
  if (href) {
    el.href = href;
    el.textContent = label;
    el.style.display = "";
  } else {
    el.removeAttribute("href");
    el.style.display = "none";
  }
}

function openProjectModal(item, triggerEl) {
  if (!projectModal) return;
  lastFocusedTrigger = triggerEl || document.activeElement;

  modalTitle.textContent = item.title || "";
  setText(modalKicker, item.kicker);
  setText(modalSummary, item.summary);
  setText(modalDetails, item.details);

  const tags = normalizeBullets(item.tags);
  modalTags.innerHTML = tags.map((t) => `<span class="tag-chip">${esc(t)}</span>`).join("");
  modalTags.style.display = tags.length ? "" : "none";

  const bullets = normalizeBullets(item.bullets);
  modalBullets.innerHTML = bullets.map((b) => `<li>${esc(b)}</li>`).join("");
  modalBullets.style.display = bullets.length ? "" : "none";

  setModalLink(modalFigmaLink, item.figmaLink, item.figmaLabel || "View Figma Case Study");
  setModalLink(modalSiteLink, item.link, item.linkLabel || "Visit Website");
  modalActions.style.display = item.figmaLink || item.link ? "" : "none";

  currentImages = normalizeImages(item);
  currentImageIndex = 0;
  renderProjectModalImage();

  projectModal.classList.add("show");
  projectModal.setAttribute("aria-hidden", "false");
  document.body.style.overflow = "hidden";
  projectModalClose.focus();
}

function closeProjectModal() {
  if (!projectModal || !projectModal.classList.contains("show")) return;
  projectModal.classList.remove("show");
  projectModal.setAttribute("aria-hidden", "true");
  document.body.style.overflow = "";
  if (lastFocusedTrigger && typeof lastFocusedTrigger.focus === "function") {
    lastFocusedTrigger.focus();
  }
}

// Keep Tab inside the dialog while it is open (aria-modal).
function trapFocus(e) {
  const focusable = Array.from(
    modalDialog.querySelectorAll("button, a[href]")
  ).filter((el) => el.offsetParent !== null);
  if (!focusable.length) return;
  const first = focusable[0];
  const last = focusable[focusable.length - 1];
  if (e.shiftKey && document.activeElement === first) {
    e.preventDefault();
    last.focus();
  } else if (!e.shiftKey && document.activeElement === last) {
    e.preventDefault();
    first.focus();
  }
}

if (projectModal) {
  projectModalBackdrop.addEventListener("click", closeProjectModal);
  projectModalClose.addEventListener("click", closeProjectModal);
  modalPrev.addEventListener("click", () => stepImage(-1));
  modalNext.addEventListener("click", () => stepImage(1));

  document.addEventListener("keydown", (e) => {
    if (!projectModal.classList.contains("show")) return;
    if (e.key === "Escape") closeProjectModal();
    else if (e.key === "ArrowLeft") stepImage(-1);
    else if (e.key === "ArrowRight") stepImage(1);
    else if (e.key === "Tab") trapFocus(e);
  });
}

function projectCardHtml(item, index, isFlagship) {
  const title = item.title || "";
  const bullets = normalizeBullets(item.bullets);
  const tags = normalizeBullets(item.tags);
  const thumb = normalizeImages(item)[0];
  const imgAttrs = index === 0 ? 'fetchpriority="high"' : 'loading="lazy" decoding="async"';

  // The image button duplicates "View details", so it stays out of the tab order.
  const media = thumb
    ? `<button type="button" class="card-image-wrapper" data-open="${index}" tabindex="-1" aria-hidden="true">
         <img src="${esc(thumb)}" alt="" width="800" height="500" ${imgAttrs} />
       </button>`
    : "";

  return `
    <article class="project-card${isFlagship ? " project-card--flagship" : ""}">
      ${media}
      <div class="project-body">
        ${item.kicker ? `<p class="project-kicker">${esc(item.kicker)}</p>` : ""}
        <h3>${esc(title)}</h3>
        ${item.summary ? `<p class="project-summary">${esc(item.summary)}</p>` : ""}
        ${isFlagship && bullets.length ? `<ul class="card-list">${bullets.map((b) => `<li>${esc(b)}</li>`).join("")}</ul>` : ""}
        <div class="project-footer">
          ${tags.length ? `<div class="tag-row">${tags.map((t) => `<span class="tag-chip">${esc(t)}</span>`).join("")}</div>` : ""}
          <button type="button" class="project-card-trigger" data-open="${index}" aria-label="View details: ${esc(title)}">View details</button>
        </div>
      </div>
    </article>
  `;
}

async function loadProjects() {
  const container = document.getElementById("projectsGrid");
  if (!container) return;
  renderLoading(container, "projects");

  let items;
  try {
    items = await fetchItems("content/projects.json");
  } catch (err) {
    console.error(err);
    renderError(container, "projects", loadProjects);
    return;
  }

  setCount("projectsCount", items.length);
  const filtersEl = document.getElementById("projectsFilters");
  const isArchive = !!filtersEl;

  function renderCards(list, resetFn) {
    if (!list.length) {
      renderEmpty(
        container,
        resetFn ? "No projects with this tag." : "No projects yet.",
        resetFn ? "Pick another tag or show everything." : "Projects added in the CMS will appear here.",
        resetFn ? { label: "Show all projects", onClick: resetFn } : null
      );
      return;
    }
    container.innerHTML = list
      .map((item, i) => projectCardHtml(item, i, !isArchive && i === 0))
      .join("");
    container.querySelectorAll("[data-open]").forEach((el) => {
      el.addEventListener("click", () => {
        const item = list[Number(el.getAttribute("data-open"))];
        const trigger = container.querySelector(
          `.project-card-trigger[data-open="${el.getAttribute("data-open")}"]`
        );
        if (item) openProjectModal(item, trigger);
      });
    });
  }

  if (!isArchive) {
    renderCards(items.slice(0, 3));
    return;
  }

  const tagCounts = new Map();
  items.forEach((item) => {
    normalizeBullets(item.tags).forEach((tag) => {
      tagCounts.set(tag, (tagCounts.get(tag) || 0) + 1);
    });
  });
  const tags = ["All", ...tagCounts.keys()];
  let activeTag = "All";

  function applyFilter(tag) {
    activeTag = tag;
    filtersEl.querySelectorAll(".tag-filter").forEach((btn) => {
      const isActive = btn.getAttribute("data-tag") === tag;
      btn.classList.toggle("active", isActive);
      btn.setAttribute("aria-pressed", String(isActive));
    });
    const filtered =
      tag === "All" ? items : items.filter((i) => normalizeBullets(i.tags).includes(tag));
    renderCards(filtered, () => applyFilter("All"));
  }

  filtersEl.innerHTML = tags
    .map((tag) => {
      const count = tag === "All" ? items.length : tagCounts.get(tag);
      return `<button class="tag-filter" type="button" data-tag="${esc(tag)}" aria-pressed="false">${esc(tag)} (${count})</button>`;
    })
    .join("");
  filtersEl.querySelectorAll(".tag-filter").forEach((btn) => {
    btn.addEventListener("click", () => {
      const tag = btn.getAttribute("data-tag");
      if (tag !== activeTag) applyFilter(tag);
    });
  });
  applyFilter("All");
}

async function loadResearch() {
  const container = document.getElementById("researchList");
  if (!container) return;
  renderLoading(container, "publications");

  try {
    const items = await fetchItems("content/research.json");
    if (!items.length) {
      renderEmpty(container, "No publications yet.", "Papers added in the CMS will appear here.");
      return;
    }
    container.innerHTML = items
      .map((item) => {
        const tags = normalizeBullets(item.tags);
        return `
          <article class="research-entry">
            <div class="research-meta">
              <span class="research-year">${esc(item.year)}</span>
              <span class="research-venue">${esc(item.venue)}</span>
            </div>
            <div class="research-main">
              <h3>${esc(item.title)}</h3>
              ${item.summary ? `<p>${esc(item.summary)}</p>` : ""}
              ${tags.length ? `<div class="tag-row">${tags.map((t) => `<span class="tag-chip">${esc(t)}</span>`).join("")}</div>` : ""}
            </div>
            <div class="research-action">
              ${item.link ? `<a href="${esc(item.link)}" class="btn ghost-btn" target="_blank" rel="noopener noreferrer">Read Paper</a>` : ""}
            </div>
          </article>
        `;
      })
      .join("");
  } catch (err) {
    console.error(err);
    renderError(container, "publications", loadResearch);
  }
}

function timelineItemHtml(title, period, org, bullets) {
  return `
    <article class="timeline-item">
      <div class="timeline-header">
        <h3>${esc(title)}</h3>
        <span class="timeline-period">${esc(period)}</span>
      </div>
      ${org ? `<p class="timeline-org">${esc(org)}</p>` : ""}
      ${bullets.length ? `<ul>${bullets.map((b) => `<li>${esc(b)}</li>`).join("")}</ul>` : ""}
    </article>
  `;
}

async function loadExperience() {
  const container = document.getElementById("experienceTimeline");
  if (!container) return;
  renderLoading(container, "experience");

  try {
    const items = await fetchItems("content/experience.json");
    if (!items.length) {
      renderEmpty(container, "No experience entries yet.", "Roles added in the CMS will appear here.");
      return;
    }
    container.innerHTML = items
      .map((item) =>
        timelineItemHtml(
          item.role,
          item.period,
          [item.org, item.location].filter(Boolean).join(" · "),
          normalizeBullets(item.bullets)
        )
      )
      .join("");
  } catch (err) {
    console.error(err);
    renderError(container, "experience", loadExperience);
  }
}

async function loadEducation() {
  const container = document.getElementById("educationTimeline");
  if (!container) return;
  renderLoading(container, "education");

  try {
    const items = await fetchItems("content/education.json");
    if (!items.length) {
      renderEmpty(container, "No education entries yet.", "Degrees added in the CMS will appear here.");
      return;
    }
    container.innerHTML = items
      .map((item) =>
        timelineItemHtml(
          item.degree,
          item.period,
          [item.school, item.location].filter(Boolean).join(" · "),
          normalizeBullets(item.details)
        )
      )
      .join("");
  } catch (err) {
    console.error(err);
    renderError(container, "education", loadEducation);
  }
}

async function loadHonors() {
  const container = document.getElementById("honorsGrid");
  if (!container) return;
  renderLoading(container, "honors");

  try {
    const items = await fetchItems("content/honors.json");
    setCount("honorsCount", items.length);

    const isHonorsPage = document.body.getAttribute("data-page") === "honors";
    const displayItems = isHonorsPage ? items : items.slice(0, 4);

    if (!displayItems.length) {
      renderEmpty(container, "No honors yet.", "Awards added in the CMS will appear here.");
      return;
    }
    container.innerHTML = displayItems
      .map(
        (item) => `
          <article class="honor-row">
            <div class="honor-period">${esc(item.period)}</div>
            <div>
              <h3 class="honor-title">${esc(item.title)}</h3>
              ${item.summary ? `<p class="honor-summary">${esc(item.summary)}</p>` : ""}
            </div>
            <div class="honor-issuer">${esc([item.issuer, item.association].filter(Boolean).join(" · "))}</div>
          </article>
        `
      )
      .join("");
  } catch (err) {
    console.error(err);
    renderError(container, "honors", loadHonors);
  }
}

document.addEventListener("DOMContentLoaded", () => {
  loadProjects();
  loadResearch();
  loadExperience();
  loadEducation();
  loadHonors();
});
