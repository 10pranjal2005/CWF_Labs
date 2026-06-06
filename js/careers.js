import { db } from "./firebase-config.js";

import {
  collection,
  getDocs,
  addDoc,
  query,
  where,
  orderBy,
  serverTimestamp
} from "https://www.gstatic.com/firebasejs/10.13.2/firebase-firestore.js";

document.addEventListener("DOMContentLoaded", () => {

  const careersGrid =
    document.getElementById("careersGrid");

  const careersLoading =
    document.getElementById("careersLoading");

  const careersEmpty =
    document.getElementById("careersEmpty");

  const searchOpening =
    document.getElementById("searchOpening");

  const categoryFilter =
    document.getElementById("categoryFilter");

  const modeFilter =
    document.getElementById("modeFilter");

  const clearCareerFilters =
    document.getElementById(
      "clearCareerFilters"
    );

  const totalJobsCount =
    document.getElementById(
      "totalJobsCount"
    );

  const totalDepartmentsCount =
    document.getElementById(
      "totalDepartmentsCount"
    );

  const totalCategoriesCount =
    document.getElementById(
      "totalCategoriesCount"
    );

  const totalLocationsCount =
    document.getElementById(
      "totalLocationsCount"
    );

  const careerDetailsBody =
    document.getElementById(
      "careerDetailsBody"
    );

  const selectedOpeningTitle =
    document.getElementById(
      "selectedOpeningTitle"
    );

  const selectedOpeningCategory =
    document.getElementById(
      "selectedOpeningCategory"
    );

  const applicationForm =
    document.getElementById(
      "careerApplicationForm"
    );

  const detailsModal =
    new bootstrap.Modal(
      document.getElementById(
        "careerDetailsModal"
      )
    );

  const applicationModal =
    new bootstrap.Modal(
      document.getElementById(
        "applicationModal"
      )
    );

  let allOpenings = [];

  function setLoading(show) {

    careersLoading?.classList.toggle(
      "d-none",
      !show
    );

  }

  function setEmpty(show) {

    careersEmpty?.classList.toggle(
      "d-none",
      !show
    );

  }

  function updateStats(items) {

    totalJobsCount.textContent =
      items.length;

    totalDepartmentsCount.textContent =
      new Set(
        items.map(
          item => item.department
        )
      ).size;

    totalCategoriesCount.textContent =
      new Set(
        items.map(
          item => item.category
        )
      ).size;

    totalLocationsCount.textContent =
      new Set(
        items.map(
          item => item.location
        )
      ).size;

  }

  function populateCategories(items) {

    const categories =
      [...new Set(
        items.map(
          item => item.category
        )
      )];

    categoryFilter.innerHTML =
      `
      <option value="all">
      All Categories
      </option>
      `;

    categories.forEach(category => {

      const option =
        document.createElement(
          "option"
        );

      option.value =
        category;

      option.textContent =
        category;

      categoryFilter.appendChild(
        option
      );

    });

  }

  function matchesFilters(item) {

    const search =
      searchOpening.value
      .trim()
      .toLowerCase();

    const category =
      categoryFilter.value;

    const mode =
      modeFilter.value;

    const searchMatch =
      !search ||

      item.title
      ?.toLowerCase()
      .includes(search) ||

      item.department
      ?.toLowerCase()
      .includes(search);

    const categoryMatch =
      category === "all" ||
      item.category === category;

    const modeMatch =
      mode === "all" ||
      item.mode === mode;

    return (
      searchMatch &&
      categoryMatch &&
      modeMatch
    );

  }

  function renderOpenings() {

    careersGrid.innerHTML = "";

    const visible =
      allOpenings.filter(
        matchesFilters
      );

    setEmpty(
      visible.length === 0
    );

    visible.forEach(item => {

      const col =
        document.createElement("div");

      col.className =
        "col-12 col-md-6 col-xl-4";

      col.innerHTML = `

      <div class="card border-0 shadow-sm h-100">

        <div class="card-body d-flex flex-column">

          <div class="mb-3">

            <span class="badge bg-primary">

              ${item.category}

            </span>

          </div>

          <h4 class="fw-bold mb-2">

            ${item.title}

          </h4>

          <p class="text-muted mb-2">

            ${item.department || "-"}

          </p>

          <div class="small text-muted mb-3">

            <div>
              <i class="bi bi-geo-alt me-2"></i>
              ${item.location || "-"}
            </div>

            <div>
              <i class="bi bi-laptop me-2"></i>
              ${item.mode || "-"}
            </div>

            <div>
              <i class="bi bi-clock me-2"></i>
              ${item.duration || "-"}
            </div>

          </div>

          <p class="text-muted flex-grow-1">

            ${(item.description || "")
              .substring(0, 120)}

            ...

          </p>

          <div class="d-grid gap-2">

            <button
              type="button"
              class="btn btn-outline-primary view-opening-btn"
              data-id="${item.id}">

              View Details

            </button>

            <button
              type="button"
              class="btn btn-success apply-opening-btn"
              data-id="${item.id}">

              Apply Now

            </button>

          </div>

        </div>

      </div>

      `;

      careersGrid.appendChild(
        col
      );

    });

    bindActions();

  }

  function bindActions() {

    document
      .querySelectorAll(
        ".view-opening-btn"
      )
      .forEach(btn => {

        btn.addEventListener(
          "click",
          () => {

            const item =
              allOpenings.find(
                x =>
                  x.id ===
                  btn.dataset.id
              );

            if (!item) return;

            careerDetailsBody.innerHTML = `

            <h3 class="fw-bold mb-3">

              ${item.title}

            </h3>

            <div class="mb-3">

              <span class="badge bg-primary">

                ${item.category}

              </span>

            </div>

            <p>

              <strong>
              Department:
              </strong>

              ${item.department || "-"}

            </p>

            <p>

              <strong>
              Location:
              </strong>

              ${item.location || "-"}

            </p>

            <p>

              <strong>
              Mode:
              </strong>

              ${item.mode || "-"}

            </p>

            <p>

              <strong>
              Duration:
              </strong>

              ${item.duration || "-"}

            </p>

            <p>

              <strong>
              Salary/Stipend:
              </strong>

              ${item.stipend || "-"}

            </p>

            <hr>

            <h5>Description</h5>

            <p>

              ${item.description || "-"}

            </p>

            <h5>Requirements</h5>

            <p>

              ${item.requirements || "-"}

            </p>

            `;

            detailsModal.show();

          }
        );

      });

    document
      .querySelectorAll(
        ".apply-opening-btn"
      )
      .forEach(btn => {

        btn.addEventListener(
          "click",
          () => {

            const item =
              allOpenings.find(
                x =>
                  x.id ===
                  btn.dataset.id
              );

            if (!item) return;

            selectedOpeningTitle.value =
              item.title;

            selectedOpeningCategory.value =
              item.category;

            applicationModal.show();

          }
        );

      });

  }

  async function loadOpenings() {

    try {

      setLoading(true);

      const q =
        query(
          collection(
            db,
            "careers"
          ),
          where(
            "active",
            "==",
            true
          ),
          orderBy(
            "createdAt",
            "desc"
          )
        );

      const snapshot =
        await getDocs(q);

      allOpenings =
        snapshot.docs.map(
          docSnap => ({
            id: docSnap.id,
            ...docSnap.data()
          })
        );

      updateStats(
        allOpenings
      );

      populateCategories(
        allOpenings
      );

      renderOpenings();

    } catch (error) {

      console.error(
        "Career load error:",
        error
      );

    } finally {

      setLoading(false);

    }

  }

  applicationForm?.addEventListener(
    "submit",
    async event => {

      event.preventDefault();

      try {

        await addDoc(
          collection(
            db,
            "career_applications"
          ),
          {

            fullName:
              document
              .getElementById(
                "fullName"
              )
              .value
              .trim(),

            email:
              document
              .getElementById(
                "email"
              )
              .value
              .trim(),

            phone:
              document
              .getElementById(
                "phone"
              )
              .value
              .trim(),

            qualification:
              document
              .getElementById(
                "qualification"
              )
              .value
              .trim(),

            experience:
              document
              .getElementById(
                "experience"
              )
              .value
              .trim(),

            linkedin:
              document
              .getElementById(
                "linkedin"
              )
              .value
              .trim(),

            portfolio:
              document
              .getElementById(
                "portfolio"
              )
              .value
              .trim(),

            resumeLink:
              document
              .getElementById(
                "resumeLink"
              )
              .value
              .trim(),

            whyJoin:
              document
              .getElementById(
                "whyJoin"
              )
              .value
              .trim(),

            openingTitle:
              selectedOpeningTitle.value,

            category:
              selectedOpeningCategory.value,

            status: "New",

            appliedAt:
              serverTimestamp()

          }
        );

        alert(
          "Application submitted successfully."
        );

        applicationForm.reset();

        applicationModal.hide();

      } catch (error) {

        console.error(error);

        alert(
          "Could not submit application."
        );

      }

    }
  );

  searchOpening?.addEventListener(
    "input",
    renderOpenings
  );

  categoryFilter?.addEventListener(
    "change",
    renderOpenings
  );

  modeFilter?.addEventListener(
    "change",
    renderOpenings
  );

  clearCareerFilters?.addEventListener(
    "click",
    () => {

      searchOpening.value = "";

      categoryFilter.value =
        "all";

      modeFilter.value =
        "all";

      renderOpenings();

    }
  );

  loadOpenings();

});