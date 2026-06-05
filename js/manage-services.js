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
  const servicesTableBody = document.getElementById("servicesTableBody");
  const servicesMobileGrid = document.getElementById("servicesMobileGrid");

  const loadingCard = document.getElementById("loadingCard");
  const emptyStateCard = document.getElementById("emptyStateCard");

  const totalServicesCount = document.getElementById("totalServicesCount");
  const activeServicesCount = document.getElementById("activeServicesCount");
  const sampleCollectionCount = document.getElementById("sampleCollectionCount");
  const communityServicesCount = document.getElementById("communityServicesCount");

  const searchInput = document.getElementById("searchServices");
  const categoryFilter = document.getElementById("filterServiceCategory");
  const statusFilter = document.getElementById("filterServiceStatus");
  const clearFiltersBtn = document.getElementById("clearFiltersBtn");

  const openAddServiceModalBtn = document.getElementById("openAddServiceModal");
  const serviceModalElement = document.getElementById("serviceModal");
  const serviceModal = new bootstrap.Modal(serviceModalElement);
  const serviceForm = document.getElementById("serviceForm");

  const serviceDocId = document.getElementById("serviceDocId");
  const serviceName = document.getElementById("serviceName");
  const serviceCategory = document.getElementById("serviceCategory");
  const serviceIcon = document.getElementById("serviceIcon");
  const serviceStatus = document.getElementById("serviceStatus");
  const serviceDescription = document.getElementById("serviceDescription");
  const serviceModalLabel = document.getElementById("serviceModalLabel");

  let allServices = [];

  function setLoading(isLoading) {
    if (loadingCard) loadingCard.classList.toggle("d-none", !isLoading);
  }

  function setEmptyState(isEmpty) {
    if (emptyStateCard) emptyStateCard.classList.toggle("d-none", !isEmpty);
  }

  function normalize(value = "") {
    return value.toLowerCase().trim();
  }

  function categoryLabel(value = "") {
    const s = normalize(value);
    if (s === "booking") return "Booking";
    if (s === "support") return "Support";
    if (s === "collection") return "Collection";
    if (s === "awareness") return "Awareness";
    return value || "Service";
  }

  function statusBadgeHtml(isActive) {
    return isActive
      ? `<span class="badge bg-success">Active</span>`
      : `<span class="badge bg-warning text-dark">Inactive</span>`;
  }

  function renderStats(items) {
    totalServicesCount.textContent = items.length;
    activeServicesCount.textContent = items.filter((item) => item.active).length;
    sampleCollectionCount.textContent = items.filter(
      (item) => normalize(item.serviceCategory) === "collection"
    ).length;
    communityServicesCount.textContent = items.filter(
      (item) => normalize(item.serviceCategory) === "awareness"
    ).length;
  }

  function matchesFilters(item) {
    const search = (searchInput.value || "").trim().toLowerCase();
    const selectedCategory = (categoryFilter.value || "all").toLowerCase();
    const selectedStatus = (statusFilter.value || "all").toLowerCase();

    const name = (item.serviceName || "").toLowerCase();
    const category = normalize(item.serviceCategory);
    const description = (item.description || "").toLowerCase();
    const itemStatus = item.active ? "active" : "inactive";

    const matchesSearch =
      !search ||
      name.includes(search) ||
      category.includes(search) ||
      description.includes(search);

    const matchesCategory =
      selectedCategory === "all" || category === selectedCategory;

    const matchesStatus =
      selectedStatus === "all" || itemStatus === selectedStatus;

    return matchesSearch && matchesCategory && matchesStatus;
  }

  function renderServices(items) {
    const visibleItems = items.filter(matchesFilters);

    if (servicesTableBody) servicesTableBody.innerHTML = "";
    if (servicesMobileGrid) servicesMobileGrid.innerHTML = "";

    setEmptyState(visibleItems.length === 0);

    visibleItems.forEach((item) => {
      const iconClass = item.serviceIcon || "bi-grid-1x2";
      const row = document.createElement("tr");
      row.innerHTML = `
        <td class="px-4 py-3 fw-semibold">${item.serviceName || "Untitled Service"}</td>
        <td class="px-4 py-3">${categoryLabel(item.serviceCategory)}</td>
        <td class="px-4 py-3">${statusBadgeHtml(item.active)}</td>
        <td class="px-4 py-3">
          <div class="d-flex gap-2">
            <button type="button" class="btn btn-outline-primary btn-sm js-edit-service" data-id="${item.id}">
              Edit
            </button>
            <button type="button" class="btn btn-outline-danger btn-sm js-delete-service" data-id="${item.id}">
              Delete
            </button>
          </div>
        </td>
      `;
      servicesTableBody.appendChild(row);

      const mobileCol = document.createElement("div");
      mobileCol.className = "col-12";
      mobileCol.innerHTML = `
        <div class="card border-0 shadow-sm">
          <div class="card-body p-4">
            <div class="d-flex justify-content-between align-items-start gap-3 mb-3">
              <div class="d-flex align-items-center gap-3">
                <div class="feature-icon flex-shrink-0">
                  <i class="bi ${iconClass}"></i>
                </div>
                <div>
                  <h4 class="fw-bold mb-1">${item.serviceName || "Untitled Service"}</h4>
                  <p class="text-muted mb-0">Category: ${categoryLabel(item.serviceCategory)}</p>
                </div>
              </div>
              ${item.active ? `<span class="badge bg-success">Active</span>` : `<span class="badge bg-warning text-dark">Inactive</span>`}
            </div>

            <p class="text-muted mb-3">
              ${item.description || ""}
            </p>

            <div class="d-grid gap-2 d-sm-flex">
              <button type="button" class="btn btn-outline-primary flex-fill js-edit-service" data-id="${item.id}">
                Edit
              </button>
              <button type="button" class="btn btn-outline-danger flex-fill js-delete-service" data-id="${item.id}">
                Delete
              </button>
            </div>
          </div>
        </div>
      `;
      servicesMobileGrid.appendChild(mobileCol);
    });

    bindActionButtons();
  }

  function bindActionButtons() {
    document.querySelectorAll(".js-edit-service").forEach((button) => {
      button.addEventListener("click", () => {
        const id = button.getAttribute("data-id");
        const item = allServices.find((service) => service.id === id);
        if (!item) return;

        serviceModalLabel.textContent = "Edit Service";
        serviceDocId.value = item.id;
        serviceName.value = item.serviceName || "";
        serviceCategory.value = categoryLabel(item.serviceCategory);
        serviceIcon.value = item.serviceIcon || "";
        serviceStatus.value = item.active ? "true" : "false";
        serviceDescription.value = item.description || "";

        serviceModal.show();
      });
    });

    document.querySelectorAll(".js-delete-service").forEach((button) => {
      button.addEventListener("click", async () => {
        const id = button.getAttribute("data-id");
        const confirmDelete = confirm("Delete this service permanently?");
        if (!confirmDelete) return;

        try {
          await deleteDoc(doc(db, "services", id));
        } catch (error) {
          console.error("Delete service error:", error);
          alert("Could not delete the service.");
        }
      });
    });
  }

  function setupRealtimeListener() {
    setLoading(true);

    const q = query(collection(db, "services"), orderBy("createdAt", "desc"));

    onSnapshot(
      q,
      (snapshot) => {
        allServices = snapshot.docs.map((docSnap) => ({
          id: docSnap.id,
          ...docSnap.data()
        }));

        renderStats(allServices);
        renderServices(allServices);
        setLoading(false);
      },
      (error) => {
        console.error("Realtime services listener error:", error);
        setLoading(false);
        setEmptyState(true);
      }
    );
  }

  if (openAddServiceModalBtn) {
    openAddServiceModalBtn.addEventListener("click", () => {
      serviceModalLabel.textContent = "Add New Service";
      serviceForm.reset();
      serviceDocId.value = "";
      serviceStatus.value = "true";
      serviceIcon.value = "bi-grid-1x2";
      serviceModal.show();
    });
  }

  if (serviceForm) {
    serviceForm.addEventListener("submit", async (e) => {
      e.preventDefault();

      const payload = {
        serviceName: serviceName.value.trim(),
        serviceCategory: serviceCategory.value.trim(),
        serviceIcon: serviceIcon.value.trim(),
        active: serviceStatus.value === "true",
        description: serviceDescription.value.trim(),
        updatedAt: serverTimestamp()
      };

      try {
        if (serviceDocId.value) {
          await updateDoc(doc(db, "services", serviceDocId.value), payload);
        } else {
          payload.createdAt = serverTimestamp();
          await addDoc(collection(db, "services"), payload);
        }

        serviceForm.reset();
        serviceDocId.value = "";
        serviceStatus.value = "true";
        serviceIcon.value = "bi-grid-1x2";
        serviceModal.hide();
      } catch (error) {
        console.error("Save service error:", error);
        alert("Could not save the service.");
      }
    });
  }

  if (searchInput) searchInput.addEventListener("input", () => renderServices(allServices));
  if (categoryFilter) categoryFilter.addEventListener("change", () => renderServices(allServices));
  if (statusFilter) statusFilter.addEventListener("change", () => renderServices(allServices));

  if (clearFiltersBtn) {
    clearFiltersBtn.addEventListener("click", () => {
      searchInput.value = "";
      categoryFilter.value = "all";
      statusFilter.value = "all";
      renderServices(allServices);
    });
  }

  setupRealtimeListener();
});