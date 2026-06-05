import { db } from "./firebase-config.js";
import {
  collection,
  query,
  orderBy,
  onSnapshot
} from "https://www.gstatic.com/firebasejs/10.13.2/firebase-firestore.js";

document.addEventListener("DOMContentLoaded", () => {
  const faqAccordion = document.getElementById("faqAccordion");

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

  function renderFaqs(items) {
    if (!faqAccordion) return;

    const publicFaqs = items.filter((item) => item.active !== false);

    if (publicFaqs.length === 0) {
      faqAccordion.innerHTML = `
        <div class="card border-0 shadow-sm">
          <div class="card-body p-4 p-md-5 text-center">
            <h4 class="fw-bold mb-2">No FAQs available right now</h4>
            <p class="text-muted mb-0">
              New FAQs will appear here once the admin adds them in the dashboard.
            </p>
          </div>
        </div>
      `;
      return;
    }

    faqAccordion.innerHTML = publicFaqs
      .map((faq, index) => {
        const itemId = `faq-${faq.id}`;
        const headingId = `heading-${faq.id}`;
        const collapseClass = index === 0 ? "accordion-collapse collapse show" : "accordion-collapse collapse";
        const buttonClass = index === 0 ? "accordion-button fw-semibold" : "accordion-button collapsed fw-semibold";
        const expanded = index === 0 ? "true" : "false";

        return `
          <div class="accordion-item border-0 shadow-sm mb-3 rounded-3 overflow-hidden">
            <h2 class="accordion-header" id="${headingId}">
              <button
                class="${buttonClass}"
                type="button"
                data-bs-toggle="collapse"
                data-bs-target="#${itemId}"
                aria-expanded="${expanded}"
                aria-controls="${itemId}">
                ${faq.question || "Untitled FAQ"}
              </button>
            </h2>
            <div
              id="${itemId}"
              class="${collapseClass}"
              data-bs-parent="#faqAccordion">
              <div class="accordion-body text-muted">
                <div class="small text-primary fw-semibold mb-2">
                  ${categoryLabel(faq.category)}
                </div>
                <div>
                  ${faq.answer || ""}
                </div>
              </div>
            </div>
          </div>
        `;
      })
      .join("");
  }

  function loadRealtimeFaqs() {
    const q = query(collection(db, "faqs"), orderBy("createdAt", "desc"));

    onSnapshot(
      q,
      (snapshot) => {
        const faqs = snapshot.docs.map((docSnap) => ({
          id: docSnap.id,
          ...docSnap.data()
        }));

        renderFaqs(faqs);
      },
      (error) => {
        console.error("Failed to load FAQs:", error);

        if (faqAccordion) {
          faqAccordion.innerHTML = `
            <div class="card border-0 shadow-sm">
              <div class="card-body p-4 p-md-5 text-center">
                <h4 class="fw-bold mb-2">Unable to load FAQs</h4>
                <p class="text-muted mb-0">
                  Please refresh the page and try again.
                </p>
              </div>
            </div>
          `;
        }
      }
    );
  }

  loadRealtimeFaqs();
});