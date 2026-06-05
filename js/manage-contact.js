import { db } from "./firebase-config.js";
import {
  collection,
  addDoc,
  doc,
  updateDoc,
  deleteDoc,
  getDocs,
  setDoc,
  serverTimestamp,
  query,
  orderBy,
  onSnapshot
} from "https://www.gstatic.com/firebasejs/10.13.2/firebase-firestore.js";

const DEFAULT_CONTACT_DOCS = [
  {
    id: "customer_support",
    slot: "customer_support",
    title: "Customer Support",
    icon: "bi-headset",
    description: "For booking help, general information, and any support related to CWF Labs services.",
    whatsapp: "918961772773",
    phone: "+918961772773",
    active: true,
    displayOrder: 1,
    createdAt: serverTimestamp(),
    updatedAt: serverTimestamp()
  },
  {
    id: "request_consultation",
    slot: "request_consultation",
    title: "Request a Consultation",
    icon: "bi-calendar-check",
    description: "Contact us to request doctor consultation, appointment support, or guidance for the right service.",
    whatsapp: "918961772773",
    phone: "+918961772773",
    active: true,
    displayOrder: 2,
    createdAt: serverTimestamp(),
    updatedAt: serverTimestamp()
  },
  {
    id: "lab_location",
    slot: "lab_location",
    title: "Lab Location",
    icon: "bi-geo-alt",
    description: "Find our lab address, operating area, and location details for in-person visits.",
    address: "Lab address goes here",
    mapUrl: "",
    active: true,
    displayOrder: 3,
    createdAt: serverTimestamp(),
    updatedAt: serverTimestamp()
  },
  {
    id: "sample_center_1",
    slot: "sample_center_1",
    title: "Sample Collection Center",
    icon: "bi-house-heart",
    description: "Information about available sample collection centers for easy service access.",
    badgeText: "Center 1",
    badgeClass: "bg-primary",
    details: "Sample collection area details go here.",
    active: true,
    displayOrder: 4,
    createdAt: serverTimestamp(),
    updatedAt: serverTimestamp()
  },
  {
    id: "sample_center_2",
    slot: "sample_center_2",
    title: "Sample Collection Center",
    icon: "bi-building",
    description: "Information about another sample collection center can be shown here.",
    badgeText: "Center 2",
    badgeClass: "bg-success",
    details: "Sample collection area details go here.",
    active: true,
    displayOrder: 5,
    createdAt: serverTimestamp(),
    updatedAt: serverTimestamp()
  },
  {
    id: "email_phone",
    slot: "email_phone",
    title: "Email and Phone",
    icon: "bi-envelope",
    description: "Use the email and phone details below to connect with CWF Labs directly.",
    email: "email@cwflabs.org",
    phone: "+918961772773",
    active: true,
    displayOrder: 6,
    createdAt: serverTimestamp(),
    updatedAt: serverTimestamp()
  }
];

document.addEventListener("DOMContentLoaded", async () => {
  const contactTableBody = document.getElementById("contactTableBody");
  const contactMobileGrid = document.getElementById("contactMobileGrid");

  const loadingCard = document.getElementById("loadingCard");
  const emptyStateCard = document.getElementById("emptyStateCard");

  const totalCardsCount = document.getElementById("totalCardsCount");
  const activeCardsCount = document.getElementById("activeCardsCount");
  const builtinCardsCount = document.getElementById("builtinCardsCount");
  const customCardsCount = document.getElementById("customCardsCount");

  const searchInput = document.getElementById("searchContactCards");
  const slotFilter = document.getElementById("filterContactSlot");
  const statusFilter = document.getElementById("filterContactStatus");
  const clearFiltersBtn = document.getElementById("clearFiltersBtn");

  const openAddContactModalBtn = document.getElementById("openAddContactModal");
  const contactModalElement = document.getElementById("contactModal");
  const contactModal = new bootstrap.Modal(contactModalElement);
  const contactForm = document.getElementById("contactForm");

  const contactDocId = document.getElementById("contactDocId");
  const contactSlot = document.getElementById("contactSlot");
  const contactTitle = document.getElementById("contactTitle");
  const contactIcon = document.getElementById("contactIcon");
  const contactDisplayOrder = document.getElementById("contactDisplayOrder");
  const contactDescription = document.getElementById("contactDescription");
  const contactBadgeText = document.getElementById("contactBadgeText");
  const contactBadgeClass = document.getElementById("contactBadgeClass");
  const contactWhatsapp = document.getElementById("contactWhatsapp");
  const contactPhone = document.getElementById("contactPhone");
  const contactEmail = document.getElementById("contactEmail");
  const contactAddress = document.getElementById("contactAddress");
  const contactMapUrl = document.getElementById("contactMapUrl");
  const contactDetails = document.getElementById("contactDetails");
  const primaryActionLabel = document.getElementById("primaryActionLabel");
  const primaryActionUrl = document.getElementById("primaryActionUrl");
  const secondaryActionLabel = document.getElementById("secondaryActionLabel");
  const secondaryActionUrl = document.getElementById("secondaryActionUrl");
  const contactStatus = document.getElementById("contactStatus");
  const contactModalLabel = document.getElementById("contactModalLabel");

  let allContacts = [];

  const builtinSlots = new Set(DEFAULT_CONTACT_DOCS.map((item) => item.slot));

  function setLoading(isLoading) {
    if (loadingCard) loadingCard.classList.toggle("d-none", !isLoading);
  }

  function setEmptyState(isEmpty) {
    if (emptyStateCard) emptyStateCard.classList.toggle("d-none", !isEmpty);
  }

  function normalize(value = "") {
    return value.toLowerCase().trim();
  }

  function slotLabel(slot = "") {
    const s = normalize(slot);
    if (s === "customer_support") return "Customer Support";
    if (s === "request_consultation") return "Request Consultation";
    if (s === "lab_location") return "Lab Location";
    if (s === "sample_center_1") return "Sample Center 1";
    if (s === "sample_center_2") return "Sample Center 2";
    if (s === "email_phone") return "Email and Phone";
    if (s === "custom") return "Custom";
    return "Custom";
  }

  function isBuiltinSlot(slot = "") {
    return builtinSlots.has(normalize(slot));
  }

  function iconHtml(icon = "bi-grid-1x2") {
    return `<i class="bi ${icon}"></i>`;
  }

  function statusBadgeHtml(isActive) {
    return isActive
      ? `<span class="badge bg-success">Active</span>`
      : `<span class="badge bg-warning text-dark">Inactive</span>`;
  }

  function mergeCards(firestoreCards) {
    const defaultsBySlot = Object.fromEntries(
      DEFAULT_CONTACT_DOCS.map((item) => [item.slot, { ...item }])
    );

    const customCards = [];

    firestoreCards.forEach((item) => {
      const slot = normalize(item.slot);
      if (defaultsBySlot[slot]) {
        defaultsBySlot[slot] = {
          ...defaultsBySlot[slot],
          ...item,
          slot
        };
      } else {
        customCards.push({
          ...item,
          slot: slot || "custom"
        });
      }
    });

    const mergedDefaults = DEFAULT_CONTACT_DOCS.map((item) => defaultsBySlot[item.slot]);
    const all = [...mergedDefaults, ...customCards];

    return all.sort((a, b) => {
      const ao = Number(a.displayOrder || 999);
      const bo = Number(b.displayOrder || 999);
      return ao - bo;
    });
  }

  function renderStats(items) {
    totalCardsCount.textContent = items.length;
    activeCardsCount.textContent = items.filter((item) => item.active).length;
    builtinCardsCount.textContent = items.filter((item) => isBuiltinSlot(item.slot)).length;
    customCardsCount.textContent = items.filter((item) => !isBuiltinSlot(item.slot)).length;
  }

  function matchesFilters(item) {
    const search = (searchInput.value || "").trim().toLowerCase();
    const selectedSlot = (slotFilter.value || "all").toLowerCase();
    const selectedStatus = (statusFilter.value || "all").toLowerCase();

    const title = (item.title || "").toLowerCase();
    const description = (item.description || "").toLowerCase();
    const slot = normalize(item.slot);
    const itemStatus = item.active ? "active" : "inactive";

    const matchesSearch =
      !search ||
      title.includes(search) ||
      description.includes(search) ||
      slot.includes(search);

    const matchesSlot =
      selectedSlot === "all" || slot === selectedSlot;

    const matchesStatus =
      selectedStatus === "all" || itemStatus === selectedStatus;

    return matchesSearch && matchesSlot && matchesStatus;
  }

  function renderContactCards(items) {
    const visibleItems = items.filter(matchesFilters);

    if (contactTableBody) contactTableBody.innerHTML = "";
    if (contactMobileGrid) contactMobileGrid.innerHTML = "";

    setEmptyState(visibleItems.length === 0);

    visibleItems.forEach((item) => {
      const row = document.createElement("tr");
      row.innerHTML = `
        <td class="px-4 py-3 fw-semibold">${item.title || "Untitled Card"}</td>
        <td class="px-4 py-3">${slotLabel(item.slot)}</td>
        <td class="px-4 py-3">${statusBadgeHtml(item.active)}</td>
        <td class="px-4 py-3">
          <div class="d-flex gap-2">
            <button type="button" class="btn btn-outline-primary btn-sm js-edit-contact" data-id="${item.id}">
              Edit
            </button>
            <button type="button" class="btn btn-outline-danger btn-sm js-delete-contact" data-id="${item.id}">
              Delete
            </button>
          </div>
        </td>
      `;
      contactTableBody.appendChild(row);

      const mobileCol = document.createElement("div");
      mobileCol.className = "col-12";
      mobileCol.innerHTML = `
        <div class="card border-0 shadow-sm">
          <div class="card-body p-4">
            <div class="d-flex justify-content-between align-items-start gap-3 mb-3">
              <div class="d-flex align-items-center gap-3">
                <div class="feature-icon flex-shrink-0">
                  ${iconHtml(item.icon || "bi-grid-1x2")}
                </div>
                <div>
                  <h4 class="fw-bold mb-1">${item.title || "Untitled Card"}</h4>
                  <p class="text-muted mb-0">${slotLabel(item.slot)}</p>
                </div>
              </div>
              ${statusBadgeHtml(item.active)}
            </div>

            <p class="text-muted mb-3">${item.description || ""}</p>

            <div class="d-grid gap-2 d-sm-flex">
              <button type="button" class="btn btn-outline-primary flex-fill js-edit-contact" data-id="${item.id}">
                Edit
              </button>
              <button type="button" class="btn btn-outline-danger flex-fill js-delete-contact" data-id="${item.id}">
                Delete
              </button>
            </div>
          </div>
        </div>
      `;
      contactMobileGrid.appendChild(mobileCol);
    });

    bindActionButtons();
  }

  function bindActionButtons() {
    document.querySelectorAll(".js-edit-contact").forEach((button) => {
      button.addEventListener("click", () => {
        const id = button.getAttribute("data-id");
        const item = allContacts.find((contact) => contact.id === id);
        if (!item) return;

        contactModalLabel.textContent = "Edit Contact Card";
        contactDocId.value = item.id;
        contactSlot.value = normalize(item.slot || "custom");
        contactTitle.value = item.title || "";
        contactIcon.value = item.icon || "bi-grid-1x2";
        contactDisplayOrder.value = item.displayOrder ?? 1;
        contactDescription.value = item.description || "";
        contactBadgeText.value = item.badgeText || "";
        contactBadgeClass.value = item.badgeClass || "";
        contactWhatsapp.value = item.whatsapp || "";
        contactPhone.value = item.phone || "";
        contactEmail.value = item.email || "";
        contactAddress.value = item.address || "";
        contactMapUrl.value = item.mapUrl || "";
        contactDetails.value = item.details || "";
        primaryActionLabel.value = item.primaryActionLabel || "";
        primaryActionUrl.value = item.primaryActionUrl || "";
        secondaryActionLabel.value = item.secondaryActionLabel || "";
        secondaryActionUrl.value = item.secondaryActionUrl || "";
        contactStatus.value = item.active ? "true" : "false";

        contactModal.show();
      });
    });

    document.querySelectorAll(".js-delete-contact").forEach((button) => {
      button.addEventListener("click", async () => {
        const id = button.getAttribute("data-id");
        const confirmDelete = confirm("Delete this contact card permanently?");
        if (!confirmDelete) return;

        try {
          await deleteDoc(doc(db, "contact_cards", id));
        } catch (error) {
          console.error("Delete contact card error:", error);
          alert("Could not delete the contact card.");
        }
      });
    });
  }

  async function ensureBuiltInCardsExist() {
    const snapshot = await getDocs(collection(db, "contact_cards"));
    const existingIds = new Set(snapshot.docs.map((docSnap) => docSnap.id));

    const missingDefaults = DEFAULT_CONTACT_DOCS.filter((item) => !existingIds.has(item.id));

    if (missingDefaults.length === 0) return;

    await Promise.all(
      missingDefaults.map((item) =>
        setDoc(doc(db, "contact_cards", item.id), item)
      )
    );
  }

  function setupRealtimeListener() {
    setLoading(true);

    const q = query(collection(db, "contact_cards"), orderBy("displayOrder", "asc"));

    onSnapshot(
      q,
      (snapshot) => {
        const firestoreItems = snapshot.docs.map((docSnap) => ({
          id: docSnap.id,
          ...docSnap.data()
        }));

        allContacts = mergeCards(firestoreItems);

        renderStats(allContacts);
        renderContactCards(allContacts);
        setLoading(false);
      },
      (error) => {
        console.error("Realtime contact cards listener error:", error);
        setLoading(false);
        setEmptyState(true);
      }
    );
  }

  if (openAddContactModalBtn) {
    openAddContactModalBtn.addEventListener("click", () => {
      contactModalLabel.textContent = "Add New Contact Card";
      contactForm.reset();
      contactDocId.value = "";
      contactStatus.value = "true";
      contactDisplayOrder.value = "1";
      contactIcon.value = "bi-grid-1x2";
      contactSlot.value = "custom";
      contactModal.show();
    });
  }

  if (contactForm) {
    contactForm.addEventListener("submit", async (e) => {
      e.preventDefault();

      const payload = {
        slot: contactSlot.value.trim(),
        title: contactTitle.value.trim(),
        icon: contactIcon.value.trim(),
        displayOrder: Number(contactDisplayOrder.value),
        description: contactDescription.value.trim(),
        badgeText: contactBadgeText.value.trim(),
        badgeClass: contactBadgeClass.value.trim(),
        whatsapp: contactWhatsapp.value.trim(),
        phone: contactPhone.value.trim(),
        email: contactEmail.value.trim(),
        address: contactAddress.value.trim(),
        mapUrl: contactMapUrl.value.trim(),
        details: contactDetails.value.trim(),
        primaryActionLabel: primaryActionLabel.value.trim(),
        primaryActionUrl: primaryActionUrl.value.trim(),
        secondaryActionLabel: secondaryActionLabel.value.trim(),
        secondaryActionUrl: secondaryActionUrl.value.trim(),
        active: contactStatus.value === "true",
        updatedAt: serverTimestamp()
      };

      try {
        if (contactDocId.value) {
          await updateDoc(doc(db, "contact_cards", contactDocId.value), payload);
        } else {
          payload.createdAt = serverTimestamp();
          await addDoc(collection(db, "contact_cards"), payload);
        }

        contactForm.reset();
        contactDocId.value = "";
        contactStatus.value = "true";
        contactDisplayOrder.value = "1";
        contactIcon.value = "bi-grid-1x2";
        contactSlot.value = "custom";
        contactModal.hide();
      } catch (error) {
        console.error("Save contact card error:", error);
        alert("Could not save the contact card.");
      }
    });
  }

  if (searchInput) searchInput.addEventListener("input", () => renderContactCards(allContacts));
  if (slotFilter) slotFilter.addEventListener("change", () => renderContactCards(allContacts));
  if (statusFilter) statusFilter.addEventListener("change", () => renderContactCards(allContacts));

  if (clearFiltersBtn) {
    clearFiltersBtn.addEventListener("click", () => {
      searchInput.value = "";
      slotFilter.value = "all";
      statusFilter.value = "all";
      renderContactCards(allContacts);
    });
  }

  await ensureBuiltInCardsExist();
  setupRealtimeListener();
});