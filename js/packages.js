import { db } from "./firebase-config.js";
import {
  collection,
  query,
  orderBy,
  onSnapshot
} from "https://www.gstatic.com/firebasejs/10.13.2/firebase-firestore.js";

document.addEventListener("DOMContentLoaded", () => {
  const popularGrid = document.getElementById("popularPackagesGrid");
  const mostBoughtGrid = document.getElementById("mostBoughtPackagesGrid");
  const onSaleGrid = document.getElementById("onSalePackagesGrid");

  const whatsappNumber = "918961772773";
  const phoneNumber = "+918961772773";

  function normalizeType(value = "") {
    return value.toLowerCase().trim();
  }

  function badgeClass(type = "") {
    const value = normalizeType(type);

    if (value === "popular") return "bg-primary";
    if (value === "most bought") return "bg-success";
    if (value === "on sale") return "bg-danger";

    return "bg-secondary";
  }

  function cardMarkup(item) {
    const type = item.packageType || "Package";

    return `
      <div class="col-12 col-md-6 col-xl-4">
        <div class="card border-0 shadow-sm h-100">
        ${
item.imageUrl
?
`
<img
 src="${item.imageUrl}"
 style="
 height:220px;
 object-fit:cover;
 object-position:
 ${item.imageFocusX || 50}%
 ${item.imageFocusY || 50}%;
 ">
`
:
`
<img
  src="assets/images/default-package.jpg"
  class="card-img-top"
  alt="Package"
  style="
    height:220px;
    object-fit:cover;
  ">
`
}
          <div class="card-body p-4 d-flex flex-column">
            <div class="mb-3">
              <span class="badge ${badgeClass(type)} mb-2">
                ${type}
              </span>
              <h4 class="fw-bold">${item.packageName || "Untitled Package"}</h4>
            </div>

            <p class="text-muted flex-grow-1">
              ${item.description || ""}
            </p>

            <div class="mb-4">

  <div class="mb-1">

    <span class="fw-semibold text-dark">
      Market Price:
    </span>

    <span
      class="text-muted text-decoration-line-through">

      ₹${Number(item.marketPrice || 0)}

    </span>

  </div>

  <div class="mb-1">

    <span class="fw-bold text-success">
      Our Price:
    </span>

    <span
      class="fw-bold text-success fs-4">

      ₹${Number(item.ourPrice || 0)}

    </span>

  </div>

  <div class="small text-danger fw-semibold">

    You Save ₹${
      Number(item.marketPrice || 0)
      -
      Number(item.ourPrice || 0)
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
  }

  function emptyMarkup(message) {
    return `
      <div class="col-12">
        <div class="card border-0 shadow-sm">
          <div class="card-body p-4 p-md-5 text-center">
            <h4 class="fw-bold mb-2">${message}</h4>
            <p class="text-muted mb-0">
              New packages will appear here once the admin adds them in the dashboard.
            </p>
          </div>
        </div>
      </div>
    `;
  }

  function renderSections(items) {
    const activeItems = items.filter((item) => item.active !== false);

    const popular = activeItems.filter(
      (item) => normalizeType(item.packageType) === "popular"
    );

    const mostBought = activeItems.filter(
      (item) => normalizeType(item.packageType) === "most bought"
    );

    const onSale = activeItems.filter(
      (item) => normalizeType(item.packageType) === "on sale"
    );

    if (popularGrid) {
      popularGrid.innerHTML = popular.length
        ? popular.map(cardMarkup).join("")
        : emptyMarkup("No popular packages available right now");
    }

    if (mostBoughtGrid) {
      mostBoughtGrid.innerHTML = mostBought.length
        ? mostBought.map(cardMarkup).join("")
        : emptyMarkup("No most bought packages available right now");
    }

    if (onSaleGrid) {
      onSaleGrid.innerHTML = onSale.length
        ? onSale.map(cardMarkup).join("")
        : emptyMarkup("No on sale packages available right now");
    }
  }

  function loadRealtimePackages() {
    const q = query(collection(db, "packages"), orderBy("createdAt", "desc"));

    onSnapshot(
      q,
      (snapshot) => {
        const packages = snapshot.docs.map((docSnap) => ({
          id: docSnap.id,
          ...docSnap.data()
        }));

        renderSections(packages);
      },
      (error) => {
        console.error("Failed to load packages:", error);

        if (popularGrid) popularGrid.innerHTML = emptyMarkup("Unable to load packages");
        if (mostBoughtGrid) mostBoughtGrid.innerHTML = emptyMarkup("Unable to load packages");
        if (onSaleGrid) onSaleGrid.innerHTML = emptyMarkup("Unable to load packages");
      }
    );
  }

  loadRealtimePackages();
});