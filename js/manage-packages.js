import { db } from "./firebase-config.js";
import {
  collection,
  addDoc,
  doc,
  updateDoc,
  deleteDoc,
  serverTimestamp,
  query,
  orderBy,
  onSnapshot
} from "https://www.gstatic.com/firebasejs/10.13.2/firebase-firestore.js";

document.addEventListener("DOMContentLoaded", () => {
  const packagesTableBody = document.getElementById("packagesTableBody");
  const packagesMobileGrid = document.getElementById("packagesMobileGrid");

  const loadingCard = document.getElementById("loadingCard");
  const emptyStateCard = document.getElementById("emptyStateCard");

  const totalPackagesCount = document.getElementById("totalPackagesCount");
  const popularPackagesCount = document.getElementById("popularPackagesCount");
  const salePackagesCount = document.getElementById("salePackagesCount");
  const mostBoughtPackagesCount = document.getElementById("mostBoughtPackagesCount");

  const searchInput = document.getElementById("searchPackages");
  const typeFilter = document.getElementById("filterPackageType");
  const statusFilter = document.getElementById("filterPackageStatus");
  const clearFiltersBtn = document.getElementById("clearFiltersBtn");

  const openAddPackageModalBtn = document.getElementById("openAddPackageModal");
  const packageModalElement = document.getElementById("packageModal");
  const packageModal = new bootstrap.Modal(packageModalElement);
  const packageForm = document.getElementById("packageForm");

  const packageDocId = document.getElementById("packageDocId");
  const packageName = document.getElementById("packageName");
  const packageType = document.getElementById("packageType");
  const marketPrice = document.getElementById("marketPrice");
  const ourPrice = document.getElementById("ourPrice");
  const imageUrl = document.getElementById("imageUrl");
  const packageStatus = document.getElementById("packageStatus");
  const packageDescription = document.getElementById("packageDescription");
  const packageModalLabel = document.getElementById("packageModalLabel");
const imageFocusX =
  document.getElementById("imageFocusX");

const imageFocusY =
  document.getElementById("imageFocusY");

const preview =
  document.getElementById("packageImagePreview");

  let allPackages = [];

  function updateImagePreview() {

  if (!preview) return;

  preview.src =
    imageUrl.value.trim() ||
    "https://via.placeholder.com/600x300?text=Package+Preview";

  preview.style.objectPosition =
    `${imageFocusX.value}% ${imageFocusY.value}%`;
}

if (imageUrl) {

  imageUrl.addEventListener(
    "input",
    updateImagePreview
  );

}

if (imageFocusX) {

  imageFocusX.addEventListener(
    "input",
    updateImagePreview
  );

}

if (imageFocusY) {

  imageFocusY.addEventListener(
    "input",
    updateImagePreview
  );

}
  function setLoading(isLoading) {
    if (loadingCard) loadingCard.classList.toggle("d-none", !isLoading);
  }

  function setEmptyState(isEmpty) {
    if (emptyStateCard) emptyStateCard.classList.toggle("d-none", !isEmpty);
  }

  function normalizeType(value = "") {
    return value.toLowerCase().trim();
  }

  function typeBadgeClass(type = "") {
    const value = normalizeType(type);

    if (value === "popular") return "bg-primary";
    if (value === "most bought") return "bg-success";
    if (value === "on sale") return "bg-danger";

    return "bg-secondary";
  }

  function statusBadgeHtml(isActive) {
    return isActive
      ? `<span class="badge bg-success">Active</span>`
      : `<span class="badge bg-warning text-dark">Inactive</span>`;
  }

  function renderStats(items) {
    totalPackagesCount.textContent = items.length;

    popularPackagesCount.textContent = items.filter(
      (item) => normalizeType(item.packageType) === "popular"
    ).length;

    salePackagesCount.textContent = items.filter(
      (item) => normalizeType(item.packageType) === "on sale"
    ).length;

    mostBoughtPackagesCount.textContent = items.filter(
      (item) => normalizeType(item.packageType) === "most bought"
    ).length;
  }

  function matchesFilters(item) {
    const search = (searchInput.value || "").trim().toLowerCase();
    const selectedType = (typeFilter.value || "all").toLowerCase();
    const selectedStatus = (statusFilter.value || "all").toLowerCase();

    const name = (item.packageName || "").toLowerCase();
    const type = normalizeType(item.packageType);
    const price = String(item.price || "");
    const description = (item.description || "").toLowerCase();
    const itemStatus = item.active ? "active" : "inactive";

    const matchesSearch =
      !search ||
      name.includes(search) ||
      type.includes(search) ||
      price.includes(search) ||
      description.includes(search);

    const matchesType =
      selectedType === "all" ||
      type === selectedType;

    const matchesStatus =
      selectedStatus === "all" ||
      itemStatus === selectedStatus;

    return matchesSearch && matchesType && matchesStatus;
  }

  function renderPackages(items) {
    const visibleItems = items.filter(matchesFilters);

    const packagesByType = {
      popular: visibleItems.filter((item) => normalizeType(item.packageType) === "popular"),
      mostBought: visibleItems.filter((item) => normalizeType(item.packageType) === "most bought"),
      sale: visibleItems.filter((item) => normalizeType(item.packageType) === "on sale")
    };

    setEmptyState(visibleItems.length === 0);

    if (packagesTableBody) packagesTableBody.innerHTML = "";
    if (packagesMobileGrid) packagesMobileGrid.innerHTML = "";

    visibleItems.forEach((item) => {
      const tr = document.createElement("tr");
      tr.innerHTML = `
        <td class="px-4 py-3 fw-semibold">${item.packageName || "Untitled Package"}</td>
        <td class="px-4 py-3">${item.packageType || "Package"}</td>
        <td class="px-4 py-3">

  <div>

    <del class="text-muted">

      ₹${Number(item.marketPrice || 0)}

    </del>

  </div>

  <div class="fw-bold text-success">

    ₹${Number(item.ourPrice || 0)}

  </div>

</td>
        <td class="px-4 py-3">
          ${statusBadgeHtml(item.active)}
        </td>
        <td class="px-4 py-3">
          <div class="d-flex gap-2">
            <button type="button" class="btn btn-outline-primary btn-sm js-edit-package" data-id="${item.id}">
              Edit
            </button>
            <button type="button" class="btn btn-outline-danger btn-sm js-delete-package" data-id="${item.id}">
              Delete
            </button>
          </div>
        </td>
      `;
      packagesTableBody.appendChild(tr);

      const mobileCol = document.createElement("div");
      mobileCol.className = "col-12";
      mobileCol.innerHTML = `
        <div class="card border-0 shadow-sm">
          <div class="card-body p-4">
            <div class="d-flex justify-content-between align-items-start gap-3 mb-3">
              <div>
                <h4 class="fw-bold mb-1">${item.packageName || "Untitled Package"}</h4>
                <p class="text-muted mb-0">Type: ${item.packageType || "Package"}</p>
              </div>
              ${item.active ? `<span class="badge bg-success">Active</span>` : `<span class="badge bg-warning text-dark">Inactive</span>`}
            </div>

            <p class="mb-3">
              <div>

  <del class="text-muted">

    ₹${Number(item.marketPrice || 0)}

  </del>

</div>

<div
  class="fw-bold text-success fs-5">

  ₹${Number(item.ourPrice || 0)}

</div>
            </p>

            <div class="mb-3 text-muted small">
              ${item.description || ""}
            </div>

            <div class="d-grid gap-2 d-sm-flex">
              <button type="button" class="btn btn-outline-primary flex-fill js-edit-package" data-id="${item.id}">
                Edit
              </button>
              <button type="button" class="btn btn-outline-danger flex-fill js-delete-package" data-id="${item.id}">
                Delete
              </button>
            </div>
          </div>
        </div>
      `;
      packagesMobileGrid.appendChild(mobileCol);
    });

    if (visibleItems.length === 0) {
      if (packagesTableBody) {
        packagesTableBody.innerHTML = "";
      }
      if (packagesMobileGrid) {
        packagesMobileGrid.innerHTML = "";
      }
    }

    bindActionButtons();
  }

  function bindActionButtons() {
    document.querySelectorAll(".js-edit-package").forEach((button) => {
      button.addEventListener("click", () => {
        const id = button.getAttribute("data-id");
        const item = allPackages.find((pkg) => pkg.id === id);
        if (!item) return;

        packageModalLabel.textContent = "Edit Package";
        packageDocId.value = item.id;
        packageName.value = item.packageName || "";
        packageType.value = item.packageType || "";
        marketPrice.value =
item.marketPrice ?? "";

ourPrice.value =
item.ourPrice ?? "";

imageUrl.value =
  item.imageUrl || "";

imageFocusX.value =
  item.imageFocusX ?? 50;

imageFocusY.value =
  item.imageFocusY ?? 50;

updateImagePreview();

        packageStatus.value = item.active ? "true" : "false";
        packageDescription.value = item.description || "";

        packageModal.show();
      });
    });

    document.querySelectorAll(".js-delete-package").forEach((button) => {
      button.addEventListener("click", async () => {
        const id = button.getAttribute("data-id");
        const confirmDelete = confirm("Delete this package permanently?");
        if (!confirmDelete) return;

        try {
          await deleteDoc(doc(db, "packages", id));
        } catch (error) {
          console.error("Delete package error:", error);
          alert("Could not delete the package.");
        }
      });
    });
  }

  function setupRealtimeListener() {
    setLoading(true);

    const q = query(collection(db, "packages"), orderBy("createdAt", "desc"));

    onSnapshot(
      q,
      (snapshot) => {
        allPackages = snapshot.docs.map((docSnap) => ({
          id: docSnap.id,
          ...docSnap.data()
        }));

        renderStats(allPackages);
        renderPackages(allPackages);
        setLoading(false);
      },
      (error) => {
        console.error("Realtime packages listener error:", error);
        setLoading(false);
        setEmptyState(true);
      }
    );
  }

  if (openAddPackageModalBtn) {
    openAddPackageModalBtn.addEventListener("click", () => {
      packageModalLabel.textContent = "Add New Package";
      packageForm.reset();

packageDocId.value = "";

packageStatus.value = "true";

imageFocusX.value = 50;
imageFocusY.value = 50;

updateImagePreview();

packageModal.show();
    });
  }

  if (packageForm) {
    packageForm.addEventListener("submit", async (e) => {
      e.preventDefault();

      const payload = {

  packageName:
    packageName.value.trim(),

  packageType:
    packageType.value.trim(),

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

  active:
    packageStatus.value === "true",

  description:
    packageDescription.value.trim(),

  updatedAt:
    serverTimestamp()
};

      try {
        if (packageDocId.value) {
          await updateDoc(doc(db, "packages", packageDocId.value), payload);
        } else {
          payload.createdAt = serverTimestamp();
          await addDoc(collection(db, "packages"), payload);
        }

        packageForm.reset();
        packageDocId.value = "";
        packageStatus.value = "true";
        packageModal.hide();
      } catch (error) {
        console.error("Save package error:", error);
        alert("Could not save the package.");
      }
    });
  }

  if (searchInput) searchInput.addEventListener("input", () => renderPackages(allPackages));
  if (typeFilter) typeFilter.addEventListener("change", () => renderPackages(allPackages));
  if (statusFilter) statusFilter.addEventListener("change", () => renderPackages(allPackages));

  if (clearFiltersBtn) {
    clearFiltersBtn.addEventListener("click", () => {
      searchInput.value = "";
      typeFilter.value = "all";
      statusFilter.value = "all";
      renderPackages(allPackages);
    });
  }

  setupRealtimeListener();
});