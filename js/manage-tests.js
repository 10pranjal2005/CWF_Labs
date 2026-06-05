import { db } from "./firebase-config.js";
import {
  collection,
  addDoc,
  getDocs,
  doc,
  updateDoc,
  deleteDoc,
  serverTimestamp,
  query,
  orderBy
} from "https://www.gstatic.com/firebasejs/10.13.2/firebase-firestore.js";

document.addEventListener("DOMContentLoaded", () => {
  const testsGrid = document.getElementById("testsGrid");
  const loadingCard = document.getElementById("loadingCard");
  const emptyStateCard = document.getElementById("emptyStateCard");

  const totalTestsCount = document.getElementById("totalTestsCount");
  const activeTestsCount = document.getElementById("activeTestsCount");
  const inactiveTestsCount = document.getElementById("inactiveTestsCount");
  const lowPriorityTestsCount = document.getElementById("lowPriorityTestsCount");

  const searchInput = document.getElementById("searchTests");
  const categoryFilter = document.getElementById("filterTestCategory");
  const statusFilter = document.getElementById("filterTestStatus");
  const clearFiltersBtn = document.getElementById("clearFiltersBtn");

  const openAddTestModalBtn = document.getElementById("openAddTestModal");
  const testModalElement = document.getElementById("testModal");
  const testModal = new bootstrap.Modal(testModalElement);
  const testForm = document.getElementById("testForm");

  const testDocId = document.getElementById("testDocId");
  const testName = document.getElementById("testName");
  const testCategory = document.getElementById("testCategory");
  const marketPrice =
  document.getElementById("marketPrice");

const ourPrice =
  document.getElementById("ourPrice");
  const testStatus = document.getElementById("testStatus");
  const testDescription = document.getElementById("testDescription");
  const testPreparation =
    document.getElementById("testPreparation");

  const imageUrl =
    document.getElementById("imageUrl");

  const imageFocusX =
    document.getElementById("imageFocusX");

  const imageFocusY =
    document.getElementById("imageFocusY");

  const preview =
    document.getElementById("testImagePreview");

  const testModalLabel =
    document.getElementById("testModalLabel");

  let allTests = [];

  function updateImagePreview() {

  if (!preview) return;

  preview.src =
    imageUrl.value.trim() ||
    "https://via.placeholder.com/600x300?text=Test+Preview";

  preview.style.objectPosition =
    `${imageFocusX.value}% ${imageFocusY.value}%`;
}

imageUrl?.addEventListener(
  "input",
  updateImagePreview
);

imageFocusX?.addEventListener(
  "input",
  updateImagePreview
);

imageFocusY?.addEventListener(
  "input",
  updateImagePreview
);

  function setLoading(isLoading) {
    if (loadingCard) loadingCard.classList.toggle("d-none", !isLoading);
  }

  function setEmptyState(isEmpty) {
    if (emptyStateCard) emptyStateCard.classList.toggle("d-none", !isEmpty);
  }

  function getStatusBadge(isActive) {
    return isActive
      ? `<span class="badge bg-success">Active</span>`
      : `<span class="badge bg-warning text-dark">Inactive</span>`;
  }

  function renderStats(items) {
    const total = items.length;
    const active = items.filter((item) => item.active).length;
    const inactive = total - active;
    const lowPriority =
  items.filter(
    (item) => Number(item.ourPrice || 0) <= 500
  ).length;

    totalTestsCount.textContent = total;
    activeTestsCount.textContent = active;
    inactiveTestsCount.textContent = inactive;
    lowPriorityTestsCount.textContent = lowPriority;
  }

  function matchesFilters(item) {
    const search = (searchInput.value || "").trim().toLowerCase();
    const category = (categoryFilter.value || "all").toLowerCase();
    const status = (statusFilter.value || "all").toLowerCase();

    const itemName = (item.testName || "").toLowerCase();
    const itemCategory = (item.category || "").toLowerCase();
    const itemDescription = (item.description || "").toLowerCase();
    const itemPrice = String(item.price || "").toLowerCase();
    const itemStatus = item.active ? "active" : "inactive";

    const matchesSearch =
      !search ||
      itemName.includes(search) ||
      itemCategory.includes(search) ||
      itemDescription.includes(search) ||
      itemPrice.includes(search);

    const matchesCategory =
      category === "all" || itemCategory === category;

    const matchesStatus =
      status === "all" || itemStatus === status;

    return matchesSearch && matchesCategory && matchesStatus;
  }

  function renderTests(items) {
    if (!testsGrid) return;

    const visibleItems = items.filter(matchesFilters);

    testsGrid.innerHTML = "";

    setEmptyState(visibleItems.length === 0);

    visibleItems.forEach((item) => {
      const col = document.createElement("div");
      col.className = "col-12 col-md-6 col-xl-4";

      col.innerHTML = `
        <div class="card border-0 shadow-sm h-100">
          <div class="card-body p-4 d-flex flex-column">
            <div class="d-flex justify-content-between align-items-start gap-3 mb-3">
              <div>
                <span class="badge bg-primary mb-2">${item.category || "Test"}</span>
                <h4 class="fw-bold mb-1">${item.testName || "Untitled Test"}</h4>
              </div>
              ${getStatusBadge(item.active)}
            </div>

            <p class="text-muted flex-grow-1 mb-3">
              ${item.description || ""}
            </p>

            <div class="mb-3">
              <div>

  <span class="text-muted text-decoration-line-through">

    ₹${Number(item.marketPrice || 0)}

  </span>

</div>

<div class="fw-bold text-success fs-5">

  ₹${Number(item.ourPrice || 0)}

</div>

<div class="small text-danger fw-semibold">

  Save ₹${
    Number(item.marketPrice || 0)
    -
    Number(item.ourPrice || 0)
  }

</div>
              ${item.preparation ? `<div class="text-muted small mt-2">${item.preparation}</div>` : ""}
            </div>

            <div class="d-grid gap-2 d-sm-flex">
              <button type="button" class="btn btn-outline-primary flex-fill js-edit-test" data-id="${item.id}">
                Edit
              </button>
              <button type="button" class="btn btn-outline-danger flex-fill js-delete-test" data-id="${item.id}">
                Delete
              </button>
            </div>
          </div>
        </div>
      `;

      testsGrid.appendChild(col);
    });

    bindActionButtons();
  }

  function bindActionButtons() {
    document.querySelectorAll(".js-edit-test").forEach((btn) => {
      btn.addEventListener("click", async () => {
        const id = btn.getAttribute("data-id");
        const item = allTests.find((x) => x.id === id);
        if (!item) return;

        testModalLabel.textContent = "Edit Test";
        testDocId.value = item.id;
        testName.value = item.testName || "";
        testCategory.value = item.category || "";
        marketPrice.value =
  item.marketPrice ?? "";

ourPrice.value =
  item.ourPrice ?? "";
        testStatus.value = item.active ? "true" : "false";
        testDescription.value = item.description || "";
        testPreparation.value = item.preparation || "";
        imageUrl.value =
  item.imageUrl || "";

imageFocusX.value =
  item.imageFocusX ?? 50;

imageFocusY.value =
  item.imageFocusY ?? 50;

updateImagePreview();

        testModal.show();
      });
    });

    document.querySelectorAll(".js-delete-test").forEach((btn) => {
      btn.addEventListener("click", async () => {
        const id = btn.getAttribute("data-id");
        const confirmDelete = confirm("Delete this test permanently?");
        if (!confirmDelete) return;

        try {
          await deleteDoc(doc(db, "tests", id));
          await loadTests();
        } catch (error) {
          console.error("Delete test error:", error);
          alert("Could not delete the test.");
        }
      });
    });
  }

  async function loadTests() {
    try {
      setLoading(true);

      const q = query(collection(db, "tests"), orderBy("createdAt", "desc"));
      const snapshot = await getDocs(q);

      allTests = snapshot.docs.map((docSnap) => ({
        id: docSnap.id,
        ...docSnap.data()
      }));

      renderStats(allTests);
      renderTests(allTests);
    } catch (error) {
      console.error("Load tests error:", error);
      testsGrid.innerHTML = "";
      setEmptyState(true);
    } finally {
      setLoading(false);
    }
  }

  if (openAddTestModalBtn) {
    openAddTestModalBtn.addEventListener("click", () => {
      testModalLabel.textContent = "Add New Test";
      testForm.reset();
      testDocId.value = "";
      testStatus.value = "true";

imageFocusX.value = 50;
imageFocusY.value = 50;

updateImagePreview();

testModal.show();
    });
  }

  if (testForm) {
    testForm.addEventListener("submit", async (e) => {
      e.preventDefault();

      const payload = {
        testName: testName.value.trim(),
        category: testCategory.value.trim(),
        marketPrice:
  Number(marketPrice.value),

ourPrice:
  Number(ourPrice.value),
        imageUrl:
  imageUrl.value.trim(),

imageFocusX:
  Number(imageFocusX.value),

imageFocusY:
  Number(imageFocusY.value),
        active: testStatus.value === "true",
        
        description: testDescription.value.trim(),
        preparation: testPreparation.value.trim(),
        updatedAt: serverTimestamp()
      };

      try {
        if (testDocId.value) {
          await updateDoc(doc(db, "tests", testDocId.value), payload);
        } else {
          payload.createdAt = serverTimestamp();
          await addDoc(collection(db, "tests"), payload);
        }

        testModal.hide();
        testForm.reset();
        testDocId.value = "";
        testStatus.value = "true";

        await loadTests();
      } catch (error) {
        console.error("Save test error:", error);
        alert("Could not save the test.");
      }
    });
  }

  if (searchInput) searchInput.addEventListener("input", () => renderTests(allTests));
  if (categoryFilter) categoryFilter.addEventListener("change", () => renderTests(allTests));
  if (statusFilter) statusFilter.addEventListener("change", () => renderTests(allTests));

  if (clearFiltersBtn) {
    clearFiltersBtn.addEventListener("click", () => {
      searchInput.value = "";
      categoryFilter.value = "all";
      statusFilter.value = "all";
      renderTests(allTests);
    });
  }

  loadTests();
});