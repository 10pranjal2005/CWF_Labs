import { db } from "./firebase-config.js";
import {
  collection,
  query,
  orderBy,
  onSnapshot
} from "https://www.gstatic.com/firebasejs/10.13.2/firebase-firestore.js";

const DEFAULT_CONTACT_CARDS = [
  {
    slot: "customer_support",
    title: "Customer Support",
    icon: "bi-headset",
    description: "For booking help, general information, and any support related to CWF Labs services.",
    whatsapp: "918961772773",
    phone: "+918961772773",
    active: true,
    displayOrder: 1
  },
  {
    slot: "request_consultation",
    title: "Request a Consultation",
    icon: "bi-calendar-check",
    description: "Contact us to request doctor consultation, appointment support, or guidance for the right service.",
    whatsapp: "918961772773",
    phone: "+918961772773",
    active: true,
    displayOrder: 2
  },
  {
    slot: "lab_location",
    title: "Lab Location",
    icon: "bi-geo-alt",
    description: "Find our lab address, operating area, and location details for in-person visits.",
    address: "Lab address goes here",
    mapUrl: "",
    active: true,
    displayOrder: 3
  },
  {
    slot: "sample_center_1",
    title: "Sample Collection Center",
    icon: "bi-house-heart",
    description: "Information about available sample collection centers for easy service access.",
    badgeText: "Center 1",
    badgeClass: "bg-primary",
    details: "Sample collection area details go here.",
    active: true,
    displayOrder: 4
  },
  {
    slot: "sample_center_2",
    title: "Sample Collection Center",
    icon: "bi-building",
    description: "Information about another sample collection center can be shown here.",
    badgeText: "Center 2",
    badgeClass: "bg-success",
    details: "Sample collection area details go here.",
    active: true,
    displayOrder: 5
  },
  {
    slot: "email_phone",
    title: "Email and Phone",
    icon: "bi-envelope",
    description: "Use the email and phone details below to connect with CWF Labs directly.",
    email: "email@cwflabs.org",
    phone: "+918961772773",
    active: true,
    displayOrder: 6
  }
];

document.addEventListener("DOMContentLoaded", () => {
  const contactCardsGrid = document.getElementById("contactCardsGrid");
  const quickWhatsappBtn = document.getElementById("quickWhatsappBtn");
  const quickCallBtn = document.getElementById("quickCallBtn");

  function normalize(value = "") {
    return value.toLowerCase().trim();
  }

  function iconHtml(icon = "bi-grid-1x2") {
    return `<i class="bi ${icon}"></i>`;
  }

  function slotLabel(slot = "") {
    const s = normalize(slot);
    if (s === "customer_support") return "Customer Support";
    if (s === "request_consultation") return "Request Consultation";
    if (s === "lab_location") return "Lab Location";
    if (s === "sample_center_1") return "Sample Center 1";
    if (s === "sample_center_2") return "Sample Center 2";
    if (s === "email_phone") return "Email and Phone";
    return "Custom";
  }

  function mergeCards(firestoreCards) {
    const defaultsBySlot = Object.fromEntries(
      DEFAULT_CONTACT_CARDS.map((item) => [item.slot, { ...item }])
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

    const mergedDefaults = DEFAULT_CONTACT_CARDS.map((item) => defaultsBySlot[item.slot]);
    return [...mergedDefaults, ...customCards].sort((a, b) => {
      const ao = Number(a.displayOrder || 999);
      const bo = Number(b.displayOrder || 999);
      return ao - bo;
    });
  }

  function renderSupportButtons(card) {
    const whatsapp = card.whatsapp || "918961772773";
    const phone = card.phone || "+918961772773";
    const buttons = [];

    if (whatsapp) {
      buttons.push(`
        <a
          href="https://wa.me/${whatsapp.replace(/[^\d]/g, "")}"
          target="_blank"
          rel="noopener noreferrer"
          class="btn btn-success">
          <i class="bi bi-whatsapp me-2"></i>
          ${card.primaryActionLabel || "Message on WhatsApp"}
        </a>
      `);
    }

    if (phone) {
      buttons.push(`
        <button
          type="button"
          class="btn btn-outline-primary"
          onclick="window.location.href='tel:${phone}'">
          <i class="bi bi-telephone-fill me-2"></i>
          ${card.secondaryActionLabel || "Call Support"}
        </button>
      `);
    }

    return buttons.join("");
  }

  function renderLocationButton(card) {
    const mapUrl = card.mapUrl || "#";
    return `
      <a
        href="${mapUrl}"
        target="_blank"
        rel="noopener noreferrer"
        class="btn btn-outline-primary">
        <i class="bi bi-map me-2"></i>
        ${card.primaryActionLabel || "View Location"}
      </a>
    `;
  }

  function renderGenericButtons(card) {
    const primary = card.primaryActionUrl
      ? `
        <a
          href="${card.primaryActionUrl}"
          target="_blank"
          rel="noopener noreferrer"
          class="btn btn-success">
          <i class="bi bi-box-arrow-up-right me-2"></i>
          ${card.primaryActionLabel || "Open Link"}
        </a>
      `
      : "";

    const secondary = card.secondaryActionUrl
      ? `
        <a
          href="${card.secondaryActionUrl}"
          target="_blank"
          rel="noopener noreferrer"
          class="btn btn-outline-primary">
          <i class="bi bi-box-arrow-up-right me-2"></i>
          ${card.secondaryActionLabel || "Open Link"}
        </a>
      `
      : "";

    return `${primary}${secondary}`;
  }

  function renderCard(card) {
    const slot = normalize(card.slot);

    if (slot === "customer_support" || slot === "request_consultation") {
      return `
        <div class="col-12 col-md-6 col-xl-4">
          <div class="card border-0 shadow-sm h-100 feature-card">
            <div class="card-body p-4 d-flex flex-column text-center">
              <div class="feature-icon mb-3">
                ${iconHtml(card.icon)}
              </div>
              <h4 class="fw-bold mb-3">${card.title || "Contact Card"}</h4>
              <p class="text-muted flex-grow-1">
                ${card.description || ""}
              </p>

              <div class="d-grid gap-2">
                ${renderSupportButtons(card)}
              </div>
            </div>
          </div>
        </div>
      `;
    }

    if (slot === "lab_location") {
      return `
        <div class="col-12 col-md-6 col-xl-4">
          <div class="card border-0 shadow-sm h-100 feature-card">
            <div class="card-body p-4 d-flex flex-column text-center">
              <div class="feature-icon mb-3">
                ${iconHtml(card.icon)}
              </div>
              <h4 class="fw-bold mb-3">${card.title || "Lab Location"}</h4>
              <p class="text-muted flex-grow-1">
                ${card.description || ""}
              </p>

              <div class="mb-3">
                <div class="d-flex align-items-start gap-2 justify-content-center">
                  <i class="bi bi-building text-primary"></i>
                  <span>${card.address || "Lab address goes here"}</span>
                </div>
              </div>

              <div class="d-grid gap-2">
                ${renderLocationButton(card)}
              </div>
            </div>
          </div>
        </div>
      `;
    }

    if (slot === "sample_center_1" || slot === "sample_center_2") {
      return `
        <div class="col-12 col-md-6 col-xl-4">
          <div class="card border-0 shadow-sm h-100 feature-card">
            <div class="card-body p-4 d-flex flex-column text-center">
              <div class="feature-icon mb-3">
                ${iconHtml(card.icon)}
              </div>
              <h4 class="fw-bold mb-3">${card.title || "Sample Collection Center"}</h4>
              <p class="text-muted flex-grow-1">
                ${card.description || ""}
              </p>
              <div class="mb-3">
                <span class="badge ${card.badgeClass || "bg-primary"}">${card.badgeText || "Center"}</span>
              </div>
              <p class="mb-0 text-muted">
                ${card.details || ""}
              </p>
            </div>
          </div>
        </div>
      `;
    }

    if (slot === "email_phone") {
      return `
        <div class="col-12 col-md-6 col-xl-4">
          <div class="card border-0 shadow-sm h-100 feature-card">
            <div class="card-body p-4 d-flex flex-column text-center">
              <div class="feature-icon mb-3">
                ${iconHtml(card.icon)}
              </div>
              <h4 class="fw-bold mb-3">${card.title || "Email and Phone"}</h4>
              <p class="text-muted flex-grow-1">
                ${card.description || ""}
              </p>

              <div class="text-start mx-auto">
                ${card.email ? `<p class="mb-2"><i class="bi bi-envelope-fill text-primary me-2"></i>${card.email}</p>` : ""}
                ${card.phone ? `<p class="mb-0"><i class="bi bi-telephone-fill text-primary me-2"></i>${card.phone}</p>` : ""}
              </div>
            </div>
          </div>
        </div>
      `;
    }

    return `
      <div class="col-12 col-md-6 col-xl-4">
        <div class="card border-0 shadow-sm h-100 feature-card">
          <div class="card-body p-4 d-flex flex-column text-center">
            <div class="feature-icon mb-3">
              ${iconHtml(card.icon)}
            </div>
            <h4 class="fw-bold mb-3">${card.title || "Contact Card"}</h4>
            <p class="text-muted flex-grow-1">
              ${card.description || ""}
            </p>

            <div class="d-grid gap-2">
              ${renderGenericButtons(card)}
            </div>
          </div>
        </div>
      </div>
    `;
  }

  function updateQuickStrip(cards) {
    const supportCard =
      cards.find((card) => normalize(card.slot) === "customer_support") ||
      cards.find((card) => normalize(card.slot) === "request_consultation") ||
      cards.find((card) => normalize(card.slot) === "email_phone");

    const whatsapp = supportCard?.whatsapp || "918961772773";
    const phone = supportCard?.phone || "+918961772773";

    if (quickWhatsappBtn) {
      quickWhatsappBtn.href = `https://wa.me/${whatsapp.replace(/[^\d]/g, "")}`;
    }

    if (quickCallBtn) {
      quickCallBtn.onclick = () => {
        window.location.href = `tel:${phone}`;
      };
    }
  }

  function renderContactCards(items) {
    const activeItems = items.filter((item) => item.active !== false);

    if (!contactCardsGrid) return;

    if (activeItems.length === 0) {
      contactCardsGrid.innerHTML = `
        <div class="col-12">
          <div class="card border-0 shadow-sm">
            <div class="card-body p-4 p-md-5 text-center">
              <h4 class="fw-bold mb-2">No contact cards available right now</h4>
              <p class="text-muted mb-0">
                New contact cards will appear here once the admin adds them in the dashboard.
              </p>
            </div>
          </div>
        </div>
      `;
      updateQuickStrip([]);
      return;
    }

    contactCardsGrid.innerHTML = activeItems.map(renderCard).join("");
    updateQuickStrip(activeItems);
  }

  function loadRealtimeContactCards() {
    const q = query(collection(db, "contact_cards"), orderBy("displayOrder", "asc"));

    onSnapshot(
      q,
      (snapshot) => {
        const firestoreCards = snapshot.docs.map((docSnap) => ({
          id: docSnap.id,
          ...docSnap.data()
        }));

        const mergedCards = mergeCards(firestoreCards);
        renderContactCards(mergedCards);
      },
      (error) => {
        console.error("Failed to load contact cards:", error);

        if (contactCardsGrid) {
          contactCardsGrid.innerHTML = `
            <div class="col-12">
              <div class="card border-0 shadow-sm">
                <div class="card-body p-4 p-md-5 text-center">
                  <h4 class="fw-bold mb-2">Unable to load contact cards</h4>
                  <p class="text-muted mb-0">
                    Please refresh the page and try again.
                  </p>
                </div>
              </div>
            </div>
          `;
        }
      }
    );
  }

  loadRealtimeContactCards();
});