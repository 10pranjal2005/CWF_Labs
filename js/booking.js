import { db } from "./firebase-config.js";
import {
  collection,
  getDocs
} from "https://www.gstatic.com/firebasejs/10.13.2/firebase-firestore.js";

document.addEventListener("DOMContentLoaded", () => {
  const testsGrid = document.getElementById("testsGrid");

  const whatsappNumber = "918961772773";
  const phoneNumber = "+918961772773";

  function getBadgeClass(category = "") {
    const value = category.toLowerCase();

    if (value.includes("blood")) return "bg-primary";
    if (value.includes("diabetes")) return "bg-danger";
    if (value.includes("heart")) return "bg-warning text-dark";
    if (value.includes("vitamin")) return "bg-success";
    if (value.includes("thyroid")) return "bg-info text-dark";
    if (value.includes("full body")) return "bg-secondary";

    return "bg-primary";
  }

  function renderTests(tests) {
    if (!testsGrid) return;

    const visibleTests = tests.filter((test) => test.active !== false);

    if (visibleTests.length === 0) {
      testsGrid.innerHTML = `
        <div class="col-12">
          <div class="card border-0 shadow-sm">
            <div class="card-body p-4 p-md-5 text-center">
              <h4 class="fw-bold mb-2">No tests available right now</h4>
              <p class="text-muted mb-0">
                New tests will appear here once the admin adds them in the dashboard.
              </p>
            </div>
          </div>
        </div>
      `;
      return;
    }

    testsGrid.innerHTML = visibleTests
      .map((test) => {
        return `
          <div class="col-12 col-md-6 col-xl-4">
            <div class="card border-0 shadow-sm h-100">

${
test.imageUrl
?
`
<img
  src="${test.imageUrl}"
  class="card-img-top"
  style="
    height:220px;
    object-fit:cover;
    object-position:
    ${test.imageFocusX || 50}%
    ${test.imageFocusY || 50}%;
  ">
`
:
`
<img
  src="assets/images/default-test.jpg"
  class="card-img-top"
  style="
    height:220px;
    object-fit:cover;
  ">
`
}

<div class="card-body p-4 d-flex flex-column">
                <div class="mb-3">
                  <span class="badge ${getBadgeClass(test.category)} mb-2">
                    ${test.category || "Test"}
                  </span>
                  <h4 class="fw-bold">${test.testName || "Untitled Test"}</h4>
                </div>

                <p class="text-muted flex-grow-1">
                  ${test.description || ""}
                </p>

                <div class="mb-4">

  <div class="mb-1">

    <span class="fw-semibold text-dark">
      Market Price:
    </span>

    <span
      class="text-muted text-decoration-line-through">

      ₹${Number(test.marketPrice || 0)}

    </span>

  </div>

  <div class="mb-1">

    <span class="fw-bold text-success">
      Our Price:
    </span>

    <span
      class="fw-bold text-success fs-4">

      ₹${Number(test.ourPrice || 0)}

    </span>

  </div>

  <div class="small text-danger fw-semibold">

    You Save ₹${
      Number(test.marketPrice || 0)
      -
      Number(test.ourPrice || 0)
    }

  </div>

</div>

                <div class="d-grid gap-2">
                  <a
                    href="https://wa.me/${whatsappNumber}"
                    target="_blank"
                    rel="noopener noreferrer"
                    class="btn btn-success">
                    <i class="bi bi-whatsapp me-2"></i>
                    Book via WhatsApp
                  </a>

                  <button
                    type="button"
                    class="btn btn-outline-primary"
                    onclick="window.location.href='tel:${phoneNumber}'">
                    <i class="bi bi-telephone-fill me-2"></i>
                    Call to Book
                  </button>
                </div>
              </div>
            </div>
          </div>
        `;
      })
      .join("");
  }

  async function loadTests() {
    try {
      const snapshot = await getDocs(collection(db, "tests"));

      const tests = snapshot.docs.map((docSnap) => ({
        id: docSnap.id,
        ...docSnap.data()
      }));

      tests.sort((a, b) => {
        const aTime = a.createdAt?.toMillis ? a.createdAt.toMillis() : 0;
        const bTime = b.createdAt?.toMillis ? b.createdAt.toMillis() : 0;
        return bTime - aTime;
      });

      renderTests(tests);
    } catch (error) {
      console.error("Failed to load tests:", error);
      if (testsGrid) {
        testsGrid.innerHTML = `
          <div class="col-12">
            <div class="card border-0 shadow-sm">
              <div class="card-body p-4 p-md-5 text-center">
                <h4 class="fw-bold mb-2">Unable to load tests</h4>
                <p class="text-muted mb-0">
                  Please refresh the page and try again.
                </p>
              </div>
            </div>
          </div>
        `;
      }
    }
  }

  loadTests();
});