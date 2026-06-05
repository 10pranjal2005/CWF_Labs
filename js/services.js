import { db } from "./firebase-config.js";
import {
  collection,
  query,
  orderBy,
  onSnapshot
} from "https://www.gstatic.com/firebasejs/10.13.2/firebase-firestore.js";

document.addEventListener("DOMContentLoaded", () => {
  const servicesGrid = document.getElementById("servicesGrid");

  function normalize(value = "") {
    return value.toLowerCase().trim();
  }

  function iconClass(value = "") {
    const s = normalize(value);

    if (s.includes("clipboard")) return "bi-clipboard2-pulse";
    if (s.includes("bag")) return "bi-bag-heart";
    if (s.includes("person")) return "bi-person-badge";
    if (s.includes("geo")) return "bi-geo-alt";
    if (s.includes("telephone") || s.includes("call")) return "bi-telephone-forward";
    if (s.includes("whatsapp")) return "bi-whatsapp";
    if (s.includes("mega")) return "bi-megaphone";
    if (s.includes("file")) return "bi-file-earmark-medical";
    if (s.includes("heart")) return "bi-heart-pulse";

    return "bi-grid-1x2";
  }

  function renderServices(items) {
    if (!servicesGrid) return;

    const activeServices = items.filter((item) => item.active !== false);

    if (activeServices.length === 0) {
      servicesGrid.innerHTML = `
        <div class="col-12">
          <div class="card border-0 shadow-sm">
            <div class="card-body p-4 p-md-5 text-center">
              <h4 class="fw-bold mb-2">No services available right now</h4>
              <p class="text-muted mb-0">
                New services will appear here once the admin adds them in the dashboard.
              </p>
            </div>
          </div>
        </div>
      `;
      return;
    }

    servicesGrid.innerHTML = activeServices
      .map((service) => {
        return `
          <div class="col-12 col-md-6 col-xl-4">
            <div class="card h-100 border-0 shadow-sm feature-card">
              <div class="card-body text-center p-4 d-flex flex-column">
                <div class="feature-icon mb-3">
                  <i class="bi ${iconClass(service.serviceIcon)}"></i>
                </div>
                <h4 class="fw-bold mb-3">${service.serviceName || "Untitled Service"}</h4>
                <p class="text-muted flex-grow-1 mb-0">
                  ${service.description || ""}
                </p>
              </div>
            </div>
          </div>
        `;
      })
      .join("");
  }

  function loadRealtimeServices() {
    const q = query(collection(db, "services"), orderBy("createdAt", "desc"));

    onSnapshot(
      q,
      (snapshot) => {
        const services = snapshot.docs.map((docSnap) => ({
          id: docSnap.id,
          ...docSnap.data()
        }));

        renderServices(services);
      },
      (error) => {
        console.error("Failed to load services:", error);

        if (servicesGrid) {
          servicesGrid.innerHTML = `
            <div class="col-12">
              <div class="card border-0 shadow-sm">
                <div class="card-body p-4 p-md-5 text-center">
                  <h4 class="fw-bold mb-2">Unable to load services</h4>
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

  loadRealtimeServices();
});