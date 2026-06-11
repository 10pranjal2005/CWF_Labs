import { db } from "./firebase-config.js";

import {
  collection,
  query,
  where,
  orderBy,
  onSnapshot
} from "https://www.gstatic.com/firebasejs/10.13.2/firebase-firestore.js";

document.addEventListener("DOMContentLoaded", () => {

  const researchGrid =
    document.getElementById("researchGrid");

  const loadingResearch =
    document.getElementById("loadingResearch");

  const emptyResearchState =
    document.getElementById("emptyResearchState");

  const researchSearch =
    document.getElementById("researchSearch");

  const researchCategoryFilter =
    document.getElementById("researchCategoryFilter");

  let allResearch = [];

  /* =========================
     HELPERS
  ========================= */

  function normalize(value = "") {

    return value
      .toString()
      .trim()
      .toLowerCase();

  }

  function showLoading(show) {

    if (!loadingResearch) return;

    loadingResearch.classList.toggle(
      "d-none",
      !show
    );

  }

  function showEmpty(show) {

    if (!emptyResearchState) return;

    emptyResearchState.classList.toggle(
      "d-none",
      !show
    );

  }

  function formatDate(dateString) {

    if (!dateString)
      return "Not Specified";

    try {

      return new Date(
        dateString
      ).toLocaleDateString(
        "en-IN",
        {
          day: "2-digit",
          month: "short",
          year: "numeric"
        }
      );

    } catch {

      return dateString;

    }

  }

  function getAbstractPreview(text = "") {

    if (text.length <= 180)
      return text;

    return text.substring(
      0,
      180
    ) + "...";

  }

  function matchesFilters(item) {

    const search =
      normalize(
        researchSearch?.value
      );

    const category =
      normalize(
        researchCategoryFilter?.value
      );

    const title =
      normalize(item.title);

    const authors =
      normalize(item.authors);

    const abstract =
      normalize(item.abstract);

    const itemCategory =
      normalize(item.category);

    const matchesSearch =

      !search ||

      title.includes(search) ||

      authors.includes(search) ||

      abstract.includes(search) ||

      itemCategory.includes(search);

    const matchesCategory =

      category === "all" ||

      itemCategory === category;

    return (
      matchesSearch &&
      matchesCategory
    );

  }

  /* =========================
     CARD RENDER
  ========================= */

  function renderResearch() {

    if (!researchGrid) return;

    researchGrid.innerHTML = "";

    const visibleItems =
      allResearch.filter(
        matchesFilters
      );

    showEmpty(
      visibleItems.length === 0
    );

    visibleItems.forEach(item => {

      const image =
  item.image ||
  "https://via.placeholder.com/600x400?text=Research";

      const card =
        document.createElement("div");

      card.className =
        "col-12 col-md-6 col-xl-4";

      card.innerHTML = `

        <div class="card border-0 shadow-sm h-100">

          <img
            src="${image}"
            class="card-img-top blog-card-image"
            alt="${item.title}">

          <div class="card-body d-flex flex-column">

            <div class="mb-2">

              <span class="badge bg-primary">

                ${item.category || "Research"}

              </span>

            </div>

            <h4 class="fw-bold mb-2">

              ${item.title || "Untitled Research"}

            </h4>

            <p class="text-muted small mb-2">

              <i class="bi bi-people-fill me-1"></i>

              ${item.authors || "Unknown Authors"}

            </p>

            <p class="text-muted small mb-3">

              <i class="bi bi-calendar-event me-1"></i>

              ${formatDate(
  item.publishDate
)}

            </p>

            <p class="text-muted flex-grow-1">

              ${getAbstractPreview(
                item.abstract
              )}

            </p>

            <div class="mt-3">

              <a
                href="${item.pdfUrl || "#"}"
                target="_blank"
                rel="noopener noreferrer"
                class="btn btn-primary w-100">

                <i class="bi bi-file-earmark-pdf me-2"></i>

                Read Research

              </a>

            </div>

          </div>

        </div>

      `;

      researchGrid.appendChild(
        card
      );

    });

  }

  /* =========================
     REALTIME FIRESTORE
  ========================= */

  function startRealtimeListener() {

    showLoading(true);

    const researchQuery = query(
  collection(
    db,
    "research"
  ),
  where(
    "status",
    "==",
    "active"
  ),
  orderBy(
    "createdAt",
    "desc"
  )
);

    onSnapshot(

      researchQuery,

      (snapshot) => {
        console.log(
  "Research Docs:",
  snapshot.docs.map(
    doc => ({
      id: doc.id,
      ...doc.data()
    })
  )
);

        allResearch =
          snapshot.docs.map(
            doc => ({
              id: doc.id,
              ...doc.data()
            })
          );

        renderResearch();

        showLoading(false);

      },

      (error) => {

        console.error(
          "Research Listener Error:",
          error
        );

        showLoading(false);

        showEmpty(true);

      }

    );

  }

  /* =========================
     SEARCH
  ========================= */

  if (researchSearch) {

    researchSearch.addEventListener(
      "input",
      renderResearch
    );

  }

  /* =========================
     FILTER
  ========================= */

  if (researchCategoryFilter) {

    researchCategoryFilter.addEventListener(
      "change",
      renderResearch
    );

  }

  /* =========================
     INIT
  ========================= */

  startRealtimeListener();

});