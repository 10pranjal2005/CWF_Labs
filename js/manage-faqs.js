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
  const faqsTableBody = document.getElementById("faqsTableBody");
  const faqsMobileGrid = document.getElementById("faqsMobileGrid");

  const loadingCard = document.getElementById("loadingCard");
  const emptyStateCard = document.getElementById("emptyStateCard");

  const totalFaqsCount = document.getElementById("totalFaqsCount");
  const publicFaqsCount = document.getElementById("publicFaqsCount");
  const draftFaqsCount = document.getElementById("draftFaqsCount");
  const faqCategoriesCount = document.getElementById("faqCategoriesCount");

  const searchInput = document.getElementById("searchFaqs");
  const categoryFilter = document.getElementById("filterFaqCategory");
  const statusFilter = document.getElementById("filterFaqStatus");
  const clearFiltersBtn = document.getElementById("clearFiltersBtn");

  const openAddFaqModalBtn = document.getElementById("openAddFaqModal");
  const faqModalElement = document.getElementById("faqModal");
  const faqModal = new bootstrap.Modal(faqModalElement);
  const faqForm = document.getElementById("faqForm");

  const faqDocId = document.getElementById("faqDocId");
  const faqQuestion = document.getElementById("faqQuestion");
  const faqCategory = document.getElementById("faqCategory");
  const faqStatus = document.getElementById("faqStatus");
  const faqAnswer = document.getElementById("faqAnswer");
  const faqModalLabel = document.getElementById("faqModalLabel");

  let allFaqs = [];

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
    if (s === "account") return "Account";
    if (s === "service") return "Service";
    if (s === "support") return "Support";
    return value || "FAQ";
  }

  function statusBadgeHtml(isPublic) {
    return isPublic
      ? `<span class="badge bg-success">Public</span>`
      : `<span class="badge bg-warning text-dark">Draft</span>`;
  }

  function renderStats(items) {
    totalFaqsCount.textContent = items.length;
    publicFaqsCount.textContent = items.filter((item) => item.active).length;
    draftFaqsCount.textContent = items.filter((item) => !item.active).length;

    const categories = new Set(
      items.map((item) => normalize(item.category)).filter(Boolean)
    );
    faqCategoriesCount.textContent = categories.size;
  }

  function matchesFilters(item) {
    const search = (searchInput.value || "").trim().toLowerCase();
    const selectedCategory = (categoryFilter.value || "all").toLowerCase();
    const selectedStatus = (statusFilter.value || "all").toLowerCase();

    const question = (item.question || "").toLowerCase();
    const answer = (item.answer || "").toLowerCase();
    const category = normalize(item.category);
    const itemStatus = item.active ? "public" : "draft";

    const matchesSearch =
      !search ||
      question.includes(search) ||
      answer.includes(search) ||
      category.includes(search);

    const matchesCategory =
      selectedCategory === "all" || category === selectedCategory;

    const matchesStatus =
      selectedStatus === "all" || itemStatus === selectedStatus;

    return matchesSearch && matchesCategory && matchesStatus;
  }

  function renderFaqs(items) {
    const visibleItems = items.filter(matchesFilters);

    if (faqsTableBody) faqsTableBody.innerHTML = "";
    if (faqsMobileGrid) faqsMobileGrid.innerHTML = "";

    setEmptyState(visibleItems.length === 0);

    visibleItems.forEach((item) => {
      const row = document.createElement("tr");
      row.innerHTML = `
        <td class="px-4 py-3 fw-semibold">${item.question || "Untitled FAQ"}</td>
        <td class="px-4 py-3">${categoryLabel(item.category)}</td>
        <td class="px-4 py-3">${statusBadgeHtml(item.active)}</td>
        <td class="px-4 py-3">
          <div class="d-flex gap-2">
            <button type="button" class="btn btn-outline-primary btn-sm js-edit-faq" data-id="${item.id}">
              Edit
            </button>
            <button type="button" class="btn btn-outline-danger btn-sm js-delete-faq" data-id="${item.id}">
              Delete
            </button>
          </div>
        </td>
      `;
      faqsTableBody.appendChild(row);

      const mobileCol = document.createElement("div");
      mobileCol.className = "col-12";
      mobileCol.innerHTML = `
        <div class="card border-0 shadow-sm">
          <div class="card-body p-4">
            <div class="d-flex justify-content-between align-items-start gap-3 mb-3">
              <div>
                <h4 class="fw-bold mb-1">${item.question || "Untitled FAQ"}</h4>
                <p class="text-muted mb-0">Category: ${categoryLabel(item.category)}</p>
              </div>
              ${item.active ? `<span class="badge bg-success">Public</span>` : `<span class="badge bg-warning text-dark">Draft</span>`}
            </div>

            <p class="text-muted mb-3">
              ${item.answer || ""}
            </p>

            <div class="d-grid gap-2 d-sm-flex">
              <button type="button" class="btn btn-outline-primary flex-fill js-edit-faq" data-id="${item.id}">
                Edit
              </button>
              <button type="button" class="btn btn-outline-danger flex-fill js-delete-faq" data-id="${item.id}">
                Delete
              </button>
            </div>
          </div>
        </div>
      `;
      faqsMobileGrid.appendChild(mobileCol);
    });

    bindActionButtons();
  }

  function bindActionButtons() {
    document.querySelectorAll(".js-edit-faq").forEach((button) => {
      button.addEventListener("click", () => {
        const id = button.getAttribute("data-id");
        const item = allFaqs.find((faq) => faq.id === id);
        if (!item) return;

        faqModalLabel.textContent = "Edit FAQ";
        faqDocId.value = item.id;
        faqQuestion.value = item.question || "";
        faqCategory.value = normalize(item.category);
        faqStatus.value = item.active ? "true" : "false";
        faqAnswer.value = item.answer || "";

        faqModal.show();
      });
    });

    document.querySelectorAll(".js-delete-faq").forEach((button) => {
      button.addEventListener("click", async () => {
        const id = button.getAttribute("data-id");
        const confirmDelete = confirm("Delete this FAQ permanently?");
        if (!confirmDelete) return;

        try {
          await deleteDoc(doc(db, "faqs", id));
        } catch (error) {
          console.error("Delete FAQ error:", error);
          alert("Could not delete the FAQ.");
        }
      });
    });
  }

  function setupRealtimeListener() {
    setLoading(true);

    const q = query(collection(db, "faqs"), orderBy("createdAt", "desc"));

    onSnapshot(
      q,
      (snapshot) => {
        allFaqs = snapshot.docs.map((docSnap) => ({
          id: docSnap.id,
          ...docSnap.data()
        }));

        renderStats(allFaqs);
        renderFaqs(allFaqs);
        setLoading(false);
      },
      (error) => {
        console.error("Realtime FAQs listener error:", error);
        setLoading(false);
        setEmptyState(true);
      }
    );
  }

  if (openAddFaqModalBtn) {
    openAddFaqModalBtn.addEventListener("click", () => {
      faqModalLabel.textContent = "Add New FAQ";
      faqForm.reset();
      faqDocId.value = "";
      faqStatus.value = "true";
      faqModal.show();
    });
  }

  if (faqForm) {
    faqForm.addEventListener("submit", async (e) => {
      e.preventDefault();

      const payload = {
        question: faqQuestion.value.trim(),
        category: faqCategory.value.trim(),
        active: faqStatus.value === "true",
        answer: faqAnswer.value.trim(),
        updatedAt: serverTimestamp()
      };

      try {
        if (faqDocId.value) {
          await updateDoc(doc(db, "faqs", faqDocId.value), payload);
        } else {
          payload.createdAt = serverTimestamp();
          await addDoc(collection(db, "faqs"), payload);
        }

        faqForm.reset();
        faqDocId.value = "";
        faqStatus.value = "true";
        faqModal.hide();
      } catch (error) {
        console.error("Save FAQ error:", error);
        alert("Could not save the FAQ.");
      }
    });
  }

  if (searchInput) searchInput.addEventListener("input", () => renderFaqs(allFaqs));
  if (categoryFilter) categoryFilter.addEventListener("change", () => renderFaqs(allFaqs));
  if (statusFilter) statusFilter.addEventListener("change", () => renderFaqs(allFaqs));

  if (clearFiltersBtn) {
    clearFiltersBtn.addEventListener("click", () => {
      searchInput.value = "";
      categoryFilter.value = "all";
      statusFilter.value = "all";
      renderFaqs(allFaqs);
    });
  }

  setupRealtimeListener();
});