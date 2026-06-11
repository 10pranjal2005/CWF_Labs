import { db } from "./firebase-config.js";

import {
  collection,
  addDoc,
  updateDoc,
  deleteDoc,
  doc,
  query,
  orderBy,
  onSnapshot,
  serverTimestamp
} from "https://www.gstatic.com/firebasejs/10.13.2/firebase-firestore.js";

document.addEventListener("DOMContentLoaded", () => {

  const researchTableBody =
    document.getElementById(
      "researchTableBody"
    );

  const researchMobileGrid =
    document.getElementById(
      "researchMobileGrid"
    );

  const totalResearchCount =
    document.getElementById(
      "totalResearchCount"
    );

  const publishedResearchCount =
    document.getElementById(
      "publishedResearchCount"
    );

  const draftResearchCount =
    document.getElementById(
      "draftResearchCount"
    );

    const healthcareResearchCount =
  document.getElementById(
    "healthcareResearchCount"
  );

const publicHealthResearchCount =
  document.getElementById(
    "publicHealthResearchCount"
  );

  const loadingCard =
    document.getElementById(
      "loadingCard"
    );

  const emptyStateCard =
    document.getElementById(
      "emptyStateCard"
    );

  const searchInput =
    document.getElementById(
      "searchResearch"
    );

  const categoryFilter =
    document.getElementById(
      "filterResearchCategory"
    );

  const statusFilter =
    document.getElementById(
      "filterResearchStatus"
    );

  const clearFiltersBtn =
    document.getElementById(
      "clearFiltersBtn"
    );

  const openAddResearchModal =
    document.getElementById(
      "openAddResearchModal"
    );

  const researchModal =
    new bootstrap.Modal(
      document.getElementById(
        "researchModal"
      )
    );

  const researchForm =
    document.getElementById(
      "researchForm"
    );

  const researchModalTitle =
    document.getElementById(
      "researchModalTitle"
    );

  const researchId =
    document.getElementById(
      "researchId"
    );

  const researchTitle =
    document.getElementById(
      "researchTitle"
    );

  const researchAuthors =
    document.getElementById(
      "researchAuthors"
    );

  const researchCategory =
    document.getElementById(
      "researchCategory"
    );

  const researchDate =
    document.getElementById(
      "researchDate"
    );

  const researchStatus =
    document.getElementById(
      "researchStatus"
    );

  const researchImage =
    document.getElementById(
      "researchImage"
    );

  const researchPdfUrl =
    document.getElementById(
      "researchPdfUrl"
    );

  const researchAbstract =
    document.getElementById(
      "researchAbstract"
    );

  const researchKeywords =
    document.getElementById(
      "researchKeywords"
    );

    

  let allResearch = [];

  function setLoading(
    isLoading
  ) {

    if (!loadingCard) return;

    loadingCard.classList.toggle(
      "d-none",
      !isLoading
    );

  }

  function setEmptyState(
    isEmpty
  ) {

    if (!emptyStateCard) return;

    emptyStateCard.classList.toggle(
      "d-none",
      !isEmpty
    );

  }

function updateStats(items) {

  totalResearchCount.textContent =
    items.length;

  publishedResearchCount.textContent =
    items.filter(
      item =>
        item.status === "active"
    ).length;

  healthcareResearchCount.textContent =
    items.filter(
      item =>
        (item.category || "")
          .toLowerCase()
          .includes("healthcare")
    ).length;

  publicHealthResearchCount.textContent =
    items.filter(
      item =>
        (item.category || "")
          .toLowerCase()
          .includes("public health")
    ).length;

}

  function matchesFilters(
    item
  ) {

    const search =
      searchInput.value
      .toLowerCase()
      .trim();

    const category =
      categoryFilter.value;

    const status =
      statusFilter.value;

    const matchesSearch =
      !search ||

      item.title
        ?.toLowerCase()
        .includes(search) ||

      item.authors
        ?.toLowerCase()
        .includes(search) ||

      item.category
        ?.toLowerCase()
        .includes(search);

    const matchesCategory =
      category === "all" ||
      item.category === category;

    const matchesStatus =
      status === "all" ||
      item.status === status;

    return (
      matchesSearch &&
      matchesCategory &&
      matchesStatus
    );

  }

  function getStatusBadge(
    status
  ) {

    if (
      status === "active"
    ) {

      return `
        <span class="badge bg-success">
          Published
        </span>
      `;

    }

    return `
      <span class="badge bg-warning text-dark">
        Draft
      </span>
    `;

  }

  function renderResearch(
    items
  ) {

    const filtered =
      items.filter(
        matchesFilters
      );

    researchTableBody.innerHTML =
      "";

    researchMobileGrid.innerHTML =
      "";

    setEmptyState(
      filtered.length === 0
    );

    filtered.forEach(
      (item) => {

        const row =
          document.createElement(
            "tr"
          );

        row.innerHTML = `
          <td class="px-4 py-3">
            ${item.title || ""}
          </td>

          <td class="px-4 py-3">
            ${item.authors || ""}
          </td>

          <td class="px-4 py-3">
            ${item.category || ""}
          </td>

          <td class="px-4 py-3">
            ${getStatusBadge(
              item.status
            )}
          </td>

          <td class="px-4 py-3">

            <div class="d-flex gap-2">

              <button
                class="btn btn-outline-primary btn-sm editResearchBtn"
                data-id="${item.id}">

                Edit

              </button>

              <button
                class="btn btn-outline-danger btn-sm deleteResearchBtn"
                data-id="${item.id}">

                Delete

              </button>

            </div>

          </td>
        `;

        researchTableBody.appendChild(
          row
        );

        const mobileCard =
          document.createElement(
            "div"
          );

        mobileCard.className =
          "col-12";

        mobileCard.innerHTML = `
          <div class="card border-0 shadow-sm">

            <div class="card-body">

              <h5 class="fw-bold">
                ${item.title}
              </h5>

              <p class="mb-2 text-muted">
                ${item.authors}
              </p>

              <div class="mb-3">

                ${getStatusBadge(
                  item.status
                )}

              </div>

              <div
                class="d-flex gap-2">

                <button
                  class="btn btn-outline-primary flex-fill editResearchBtn"
                  data-id="${item.id}">

                  Edit

                </button>

                <button
                  class="btn btn-outline-danger flex-fill deleteResearchBtn"
                  data-id="${item.id}">

                  Delete

                </button>

              </div>

            </div>

          </div>
        `;

        researchMobileGrid.appendChild(
          mobileCard
        );

      }
    );

    bindActionButtons();

  }

    function bindActionButtons() {

    document
      .querySelectorAll(
        ".editResearchBtn"
      )
      .forEach(
        (button) => {

          button.addEventListener(
            "click",
            () => {

              const id =
                button.getAttribute(
                  "data-id"
                );

              const item =
                allResearch.find(
                  research =>
                    research.id === id
                );

              if (!item) return;

              researchModalTitle.textContent =
                "Edit Research";

              researchId.value =
                item.id || "";

              researchTitle.value =
                item.title || "";

              researchAuthors.value =
                item.authors || "";

              researchCategory.value =
                item.category || "";

              researchDate.value =
                item.publishDate || "";

              researchStatus.value =
                item.status || "active";

              researchImage.value =
                item.image || "";

              researchPdfUrl.value =
                item.pdfUrl || "";

              researchAbstract.value =
                item.abstract || "";

              researchKeywords.value =
                item.keywords || "";

              researchModal.show();

            }
          );

        }
      );

    document
      .querySelectorAll(
        ".deleteResearchBtn"
      )
      .forEach(
        (button) => {

          button.addEventListener(
            "click",
            async () => {

              const id =
                button.getAttribute(
                  "data-id"
                );

              const confirmed =
                confirm(
                  "Delete this research permanently?"
                );

              if (!confirmed) return;

              try {

                await deleteDoc(
                  doc(
                    db,
                    "research",
                    id
                  )
                );

              } catch (error) {

                console.error(
                  error
                );

                alert(
                  "Failed to delete research."
                );

              }

            }
          );

        }
      );

  }

  function setupRealtimeListener() {

    setLoading(true);

    const q =
      query(
        collection(
          db,
          "research"
        ),
        orderBy(
          "createdAt",
          "desc"
        )
      );

    onSnapshot(

      q,

      (snapshot) => {

        allResearch =
          snapshot.docs.map(
            docSnap => ({
              id:
                docSnap.id,

              ...docSnap.data()
            })
          );

        updateStats(
          allResearch
        );

        renderResearch(
          allResearch
        );

        setLoading(
          false
        );

      },

      (error) => {

        console.error(
          error
        );

        setLoading(
          false
        );

        setEmptyState(
          true
        );

      }

    );

  }

  if (
    openAddResearchModal
  ) {

    openAddResearchModal
      .addEventListener(
        "click",
        () => {

          researchForm.reset();

          researchId.value =
            "";

          researchStatus.value =
            "active";

          researchModalTitle.textContent =
            "Add Research";

          researchModal.show();

        }
      );

  }

  researchForm.addEventListener(

    "submit",

    async (
      event
    ) => {

      event.preventDefault();

      const payload = {

        title:
          researchTitle.value.trim(),

        authors:
          researchAuthors.value.trim(),

        category:
          researchCategory.value,

        publishDate:
          researchDate.value,

        status:
          researchStatus.value,

        image:
          researchImage.value.trim(),

        pdfUrl:
          researchPdfUrl.value.trim(),

        abstract:
          researchAbstract.value.trim(),

        keywords:
          researchKeywords.value.trim(),

        updatedAt:
          serverTimestamp()

      };

      try {

        if (
          researchId.value
        ) {

          await updateDoc(

            doc(
              db,
              "research",
              researchId.value
            ),

            payload

          );

        } else {

          payload.createdAt =
            serverTimestamp();

          await addDoc(

            collection(
              db,
              "research"
            ),

            payload

          );

        }

        researchModal.hide();

        researchForm.reset();

        researchId.value =
          "";

      } catch (
        error
      ) {

        console.error(
          error
        );

        alert(
          "Failed to save research."
        );

      }

    }

  );

  searchInput?.addEventListener(

    "input",

    () =>
      renderResearch(
        allResearch
      )

  );

  categoryFilter?.addEventListener(

    "change",

    () =>
      renderResearch(
        allResearch
      )

  );

  statusFilter?.addEventListener(

    "change",

    () =>
      renderResearch(
        allResearch
      )

  );

  clearFiltersBtn?.addEventListener(

    "click",

    () => {

      searchInput.value = "";

      categoryFilter.value =
        "all";

      statusFilter.value =
        "all";

      renderResearch(
        allResearch
      );

    }

  );

  setupRealtimeListener();

});