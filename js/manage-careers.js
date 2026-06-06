import { db } from "./firebase-config.js";

import {
  collection,
  addDoc,
  getDocs,
  deleteDoc,
  updateDoc,
  doc,
  query,
  orderBy,
  serverTimestamp
} from "https://www.gstatic.com/firebasejs/10.13.2/firebase-firestore.js";

document.addEventListener("DOMContentLoaded", () => {

  const careersGrid =
    document.getElementById("careersGrid");

  const loadingCard =
    document.getElementById("loadingCard");

  const emptyStateCard =
    document.getElementById("emptyStateCard");

  const searchCareer =
    document.getElementById("searchCareer");

  const filterCategory =
    document.getElementById("filterCategory");

  const clearFiltersBtn =
    document.getElementById("clearFiltersBtn");

  const totalOpeningsCount =
    document.getElementById("totalOpeningsCount");

  const activeOpeningsCount =
    document.getElementById("activeOpeningsCount");

  const applicationsCount =
    document.getElementById("applicationsCount");

  const applicationsTableBody =
    document.getElementById(
      "applicationsTableBody"
    );

  const careerModal =
    new bootstrap.Modal(
      document.getElementById("careerModal")
    );

  const applicationModal =
    new bootstrap.Modal(
      document.getElementById(
        "applicationModal"
      )
    );

  const applicationDetailsBody =
    document.getElementById(
      "applicationDetailsBody"
    );

  const openCareerModalBtn =
    document.getElementById(
      "openCareerModalBtn"
    );

  const careerForm =
    document.getElementById("careerForm");

  const careerDocId =
    document.getElementById("careerDocId");

  const careerTitle =
    document.getElementById("careerTitle");

  const careerCategory =
    document.getElementById("careerCategory");

  const careerDepartment =
    document.getElementById(
      "careerDepartment"
    );

  const careerLocation =
    document.getElementById(
      "careerLocation"
    );

  const careerMode =
    document.getElementById("careerMode");

  const careerDuration =
    document.getElementById(
      "careerDuration"
    );

  const careerStipend =
    document.getElementById(
      "careerStipend"
    );

  const careerDescription =
    document.getElementById(
      "careerDescription"
    );

  const careerRequirements =
    document.getElementById(
      "careerRequirements"
    );

  const careerOpenings =
    document.getElementById(
      "careerOpenings"
    );

  const careerActive =
    document.getElementById(
      "careerActive"
    );

  const careerModalLabel =
    document.getElementById(
      "careerModalLabel"
    );

  let allOpenings = [];
  let allApplications = [];

  function setLoading(show) {

    loadingCard?.classList.toggle(
      "d-none",
      !show
    );

  }

  function setEmpty(show) {

    emptyStateCard?.classList.toggle(
      "d-none",
      !show
    );

  }

  function resetForm() {

    careerForm.reset();

    careerDocId.value = "";

    careerActive.value = "true";

    careerOpenings.value = 1;

    careerModalLabel.textContent =
      "Add Opening";

  }

  function updateStats() {

    totalOpeningsCount.textContent =
      allOpenings.length;

    activeOpeningsCount.textContent =
      allOpenings.filter(
        item => item.active
      ).length;

    applicationsCount.textContent =
      allApplications.length;

  }

  function matchesFilters(item) {

    const search =
      searchCareer.value
        .trim()
        .toLowerCase();

    const category =
      filterCategory.value;

    const searchMatch =
      !search ||

      item.title
        ?.toLowerCase()
        .includes(search) ||

      item.category
        ?.toLowerCase()
        .includes(search);

    const categoryMatch =
      category === "all" ||
      item.category === category;

    return (
      searchMatch &&
      categoryMatch
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

            <span class="badge bg-success">

              ${item.category}

            </span>

          </div>

          <h4 class="fw-bold">

            ${item.title}

          </h4>

          <p class="text-muted">

            ${item.department || "-"}
          </p>

          <p>

            <i class="bi bi-geo-alt"></i>

            ${item.location || "-"}
          </p>

          <p>

            <i class="bi bi-laptop"></i>

            ${item.mode || "-"}
          </p>

          <p>

            <i class="bi bi-cash"></i>

            ${item.stipend || "-"}
          </p>

          <div class="mt-auto">

            <div class="d-flex gap-2">

              <button
                type="button"
                class="btn btn-outline-primary flex-fill edit-opening-btn"
                data-id="${item.id}">

                Edit

              </button>

              <button
                type="button"
                class="btn btn-outline-danger flex-fill delete-opening-btn"
                data-id="${item.id}">

                Delete

              </button>

            </div>

          </div>

        </div>

      </div>
      `;

      careersGrid.appendChild(col);

    });

    bindOpeningActions();

  }

  function bindOpeningActions() {

    document
      .querySelectorAll(
        ".edit-opening-btn"
      )
      .forEach(btn => {

        btn.addEventListener(
          "click",
          () => {

            const id =
              btn.dataset.id;

            const item =
              allOpenings.find(
                x => x.id === id
              );

            if (!item) return;

            careerModalLabel.textContent =
              "Edit Opening";

            careerDocId.value =
              item.id;

            careerTitle.value =
              item.title || "";

            careerCategory.value =
              item.category || "";

            careerDepartment.value =
              item.department || "";

            careerLocation.value =
              item.location || "";

            careerMode.value =
              item.mode || "";

            careerDuration.value =
              item.duration || "";

            careerStipend.value =
              item.stipend || "";

            careerDescription.value =
              item.description || "";

            careerRequirements.value =
              item.requirements || "";

            careerOpenings.value =
              item.openings || 1;

            careerActive.value =
              item.active
                ? "true"
                : "false";

            careerModal.show();

          }
        );

      });

    document
      .querySelectorAll(
        ".delete-opening-btn"
      )
      .forEach(btn => {

        btn.addEventListener(
          "click",
          async () => {

            if (
              !confirm(
                "Delete this opening?"
              )
            ) return;

            try {

              await deleteDoc(
                doc(
                  db,
                  "careers",
                  btn.dataset.id
                )
              );

              loadOpenings();

            } catch (error) {

              console.error(error);

            }

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

      renderOpenings();

      updateStats();

    } catch (error) {

      console.error(error);

    } finally {

      setLoading(false);

    }

  }

  async function loadApplications() {

    try {

      const q =
        query(
          collection(
            db,
            "career_applications"
          ),
          orderBy(
            "appliedAt",
            "desc"
          )
        );

      const snapshot =
        await getDocs(q);

      allApplications =
        snapshot.docs.map(
          docSnap => ({
            id: docSnap.id,
            ...docSnap.data()
          })
        );

      renderApplications();

      updateStats();

    } catch (error) {

      console.error(error);

    }

  }

  function renderApplications() {

    applicationsTableBody.innerHTML =
      "";

    allApplications.forEach(
      item => {

        const row =
          document.createElement(
            "tr"
          );

        row.innerHTML = `

        <td>${item.fullName || "-"}</td>

        <td>${item.openingTitle || "-"}</td>

        <td>${item.category || "-"}</td>

        <td>${item.email || "-"}</td>

        <td>

          <a
            href="${item.resumeLink}"
            target="_blank"
            class="btn btn-sm btn-outline-primary">

            Resume

          </a>

        </td>

        <td>

<select
class="form-select form-select-sm fw-semibold text-white application-status-select
${
item.status === "Approved"
? "bg-success border-success"

: item.status === "Rejected"
? "bg-danger border-danger"

: "bg-primary border-primary"
}"
data-id="${item.id}">

<option
value="New"
${item.status === "New" ? "selected" : ""}>

New

</option>

<option
value="Approved"
${item.status === "Approved" ? "selected" : ""}>

Approved

</option>

<option
value="Rejected"
${item.status === "Rejected" ? "selected" : ""}>

Rejected

</option>

</select>

</td>

        <td>

          <div class="d-flex gap-2">

            <button
              type="button"
              class="btn btn-sm btn-outline-info view-application-btn"
              data-id="${item.id}">

              View

            </button>

            <button
              type="button"
              class="btn btn-sm btn-outline-danger delete-application-btn"
              data-id="${item.id}">

              Delete

            </button>

          </div>

        </td>

        `;

        applicationsTableBody.appendChild(
          row
        );

      });

    bindApplicationActions();

  }

  function bindApplicationActions() {

    document
      .querySelectorAll(
        ".view-application-btn"
      )
      .forEach(btn => {

        btn.addEventListener(
          "click",
          () => {

            const item =
              allApplications.find(
                x =>
                  x.id ===
                  btn.dataset.id
              );

            if (!item) return;

            applicationDetailsBody.innerHTML = `

            <h4 class="fw-bold mb-3">

              ${item.fullName}

            </h4>

            <p><strong>Email:</strong> ${item.email}</p>

            <p><strong>Phone:</strong> ${item.phone}</p>

            <p><strong>Qualification:</strong> ${item.qualification || "-"}</p>

            <p><strong>Experience:</strong> ${item.experience || "-"}</p>

            <p><strong>LinkedIn:</strong> ${item.linkedin || "-"}</p>

            <p><strong>Portfolio:</strong> ${item.portfolio || "-"}</p>

            `;

            applicationModal.show();

          }
        );

      });

    document
      .querySelectorAll(
        ".delete-application-btn"
      )
      .forEach(btn => {

        btn.addEventListener(
          "click",
          async () => {

            if (
              !confirm(
                "Delete application?"
              )
            ) return;

            await deleteDoc(
              doc(
                db,
                "career_applications",
                btn.dataset.id
              )
            );

            loadApplications();

          }
        );

      });

      document
.querySelectorAll(
".application-status-select"
)
.forEach(select => {

select.addEventListener(
"change",
async () => {

    select.classList.remove(
"bg-primary",
"border-primary",
"bg-success",
"border-success",
"bg-danger",
"border-danger"
);

if (select.value === "Approved") {

select.classList.add(
"bg-success",
"border-success"
);

}
else if (select.value === "Rejected") {

select.classList.add(
"bg-danger",
"border-danger"
);

}
else {

select.classList.add(
"bg-primary",
"border-primary"
);

}

try {

await updateDoc(

doc(
db,
"career_applications",
select.dataset.id
),

{
status: select.value,
updatedAt: serverTimestamp()
}

);

} catch (error) {

console.error(error);

alert(
"Could not update status."
);

}

}
);

});

  }

  careerForm.addEventListener(
    "submit",
    async e => {

      e.preventDefault();

      const payload = {

        title:
          careerTitle.value.trim(),

        category:
          careerCategory.value,

        department:
          careerDepartment.value.trim(),

        location:
          careerLocation.value.trim(),

        mode:
          careerMode.value,

        duration:
          careerDuration.value.trim(),

        stipend:
          careerStipend.value.trim(),

        description:
          careerDescription.value.trim(),

        requirements:
          careerRequirements.value.trim(),

        openings:
          Number(
            careerOpenings.value
          ),

        active:
          careerActive.value ===
          "true",

        updatedAt:
          serverTimestamp()

      };

      try {

        if (
          careerDocId.value
        ) {

          await updateDoc(
            doc(
              db,
              "careers",
              careerDocId.value
            ),
            payload
          );

        } else {

          payload.createdAt =
            serverTimestamp();

          await addDoc(
            collection(
              db,
              "careers"
            ),
            payload
          );

        }

        careerModal.hide();

        resetForm();

        loadOpenings();

      } catch (error) {

        console.error(error);

        alert(
          "Could not save opening."
        );

      }

    }
  );

  openCareerModalBtn.addEventListener(
    "click",
    () => {

      resetForm();

      careerModal.show();

    }
  );

  searchCareer.addEventListener(
    "input",
    renderOpenings
  );

  filterCategory.addEventListener(
    "change",
    renderOpenings
  );

  clearFiltersBtn.addEventListener(
    "click",
    () => {

      searchCareer.value = "";

      filterCategory.value =
        "all";

      renderOpenings();

    }
  );

  loadOpenings();

  loadApplications();

});