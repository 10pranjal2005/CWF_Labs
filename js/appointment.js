import { db } from "./firebase-config.js";
import {
  collection,
  addDoc,
  doc,
  updateDoc,
  deleteDoc,
  query,
  orderBy,
  onSnapshot,
  serverTimestamp
} from "https://www.gstatic.com/firebasejs/10.13.2/firebase-firestore.js";

document.addEventListener("DOMContentLoaded", () => {
  const bookingsTableBody = document.getElementById("bookingsTableBody");
  const bookingsMobileGrid = document.getElementById("bookingsMobileGrid");

  const loadingCard = document.getElementById("loadingCard");
  const emptyStateCard = document.getElementById("emptyStateCard");

  const searchInput = document.getElementById("searchBookings");
  const filterBookingType = document.getElementById("filterBookingType");
  const filterBookingStatus = document.getElementById("filterBookingStatus");
  const applyFiltersBtn = document.getElementById("applyFiltersBtn");

  const totalBookingsCount = document.getElementById("totalBookingsCount");
  const testBookingsCount = document.getElementById("testBookingsCount");
  const packageBookingsCount = document.getElementById("packageBookingsCount");
  const doctorBookingsCount = document.getElementById("doctorBookingsCount");

  const bookingModalEl = document.getElementById("bookingModal");
  const bookingModal = new bootstrap.Modal(bookingModalEl);
  const bookingModalLabel = document.getElementById("bookingModalLabel");
  const bookingForm = document.getElementById("bookingForm");
  const bookingDocId = document.getElementById("bookingDocId");
  const customerName = document.getElementById("customerName");
  const customerPhone = document.getElementById("customerPhone");
  const customerEmail = document.getElementById("customerEmail");
  const serviceType = document.getElementById("serviceType");
  const serviceName = document.getElementById("serviceName");
  const bookingDate = document.getElementById("bookingDate");
  const bookingTime = document.getElementById("bookingTime");
  const bookingNotes = document.getElementById("bookingNotes");
  const bookingStatus = document.getElementById("bookingStatus");

  const statusModalEl = document.getElementById("statusModal");
  const statusModal = new bootstrap.Modal(statusModalEl);
  const statusForm = document.getElementById("statusForm");
  const statusBookingDocId = document.getElementById("statusBookingDocId");
  const statusValue = document.getElementById("statusValue");

  const openAddBookingBtn = document.getElementById("openAddBookingBtn");

  let allBookings = [];

  function setLoading(isLoading) {
    if (loadingCard) loadingCard.classList.toggle("d-none", !isLoading);
  }

  function setEmptyState(isEmpty) {
    if (emptyStateCard) emptyStateCard.classList.toggle("d-none", !isEmpty);
  }

  function normalize(value = "") {
    return String(value).toLowerCase().trim();
  }

  function bookingTypeLabel(type = "") {
    const t = normalize(type);
    if (t === "test") return "Test";
    if (t === "package") return "Package";
    if (t === "doctor") return "Doctor Consultation";
    return "Booking";
  }

  function statusLabel(status = "") {
    const s = normalize(status);
    if (s === "new") return "New";
    if (s === "confirmed") return "Confirmed";
    if (s === "completed") return "Completed";
    if (s === "cancelled") return "Cancelled";
    return "New";
  }

  function typeBadgeClass(type = "") {
    const t = normalize(type);
    if (t === "test") return "bg-primary";
    if (t === "package") return "bg-success";
    if (t === "doctor") return "bg-warning text-dark";
    return "bg-secondary";
  }

  function statusBadgeClass(status = "") {
    const s = normalize(status);
    if (s === "new") return "bg-warning text-dark";
    if (s === "confirmed") return "bg-success";
    if (s === "completed") return "bg-primary";
    if (s === "cancelled") return "bg-danger";
    return "bg-warning text-dark";
  }

  function formatBookingDate(dateValue, timeValue) {
    const dateString = dateValue
      ? new Date(dateValue).toLocaleDateString("en-IN", {
          day: "numeric",
          month: "short",
          year: "numeric"
        })
      : "-";

    if (!timeValue) return dateString;
    return `${dateString} • ${timeValue}`;
  }

  function updateStats() {
    totalBookingsCount.textContent = String(allBookings.length);
    testBookingsCount.textContent = String(
      allBookings.filter((item) => normalize(item.serviceType) === "test").length
    );
    packageBookingsCount.textContent = String(
      allBookings.filter((item) => normalize(item.serviceType) === "package").length
    );
    doctorBookingsCount.textContent = String(
      allBookings.filter((item) => normalize(item.serviceType) === "doctor").length
    );
  }

  function matchesFilters(item) {
    const search = normalize(searchInput.value);
    const selectedType = normalize(filterBookingType.value);
    const selectedStatus = normalize(filterBookingStatus.value);

    const name = normalize(item.customerName);
    const phone = normalize(item.customerPhone);
    const svc = normalize(item.serviceName);
    const type = normalize(item.serviceType);
    const status = normalize(item.status);

    const searchMatch =
      !search ||
      name.includes(search) ||
      phone.includes(search) ||
      svc.includes(search);

    const typeMatch = selectedType === "all" || type === selectedType;
    const statusMatch = selectedStatus === "all" || status === selectedStatus;

    return searchMatch && typeMatch && statusMatch;
  }

  function renderBookings() {
    const visible = allBookings.filter(matchesFilters);

    if (bookingsTableBody) bookingsTableBody.innerHTML = "";
    if (bookingsMobileGrid) bookingsMobileGrid.innerHTML = "";

    setEmptyState(visible.length === 0);

    visible.forEach((item) => {
      const row = document.createElement("tr");
      row.innerHTML = `
        <td class="px-4 py-3">
          <div class="fw-semibold">${item.customerName || "Unnamed Customer"}</div>
          <div class="text-muted small">${item.customerPhone || "-"}</div>
          ${item.customerEmail ? `<div class="text-muted small">${item.customerEmail}</div>` : ""}
        </td>
        <td class="px-4 py-3">
          <span class="badge ${typeBadgeClass(item.serviceType)}">${bookingTypeLabel(item.serviceType)}</span>
        </td>
        <td class="px-4 py-3">${item.serviceName || "-"}</td>
        <td class="px-4 py-3">${formatBookingDate(item.bookingDate, item.bookingTime)}</td>
        <td class="px-4 py-3">
          <span class="badge ${statusBadgeClass(item.status)}">${statusLabel(item.status)}</span>
        </td>
        <td class="px-4 py-3">
          <div class="d-flex gap-2 flex-wrap">
            <button type="button" class="btn btn-outline-primary btn-sm js-edit-booking" data-id="${item.id}">Edit</button>
            <button type="button" class="btn btn-outline-success btn-sm js-status-booking" data-id="${item.id}">Status</button>
            <button type="button" class="btn btn-outline-danger btn-sm js-delete-booking" data-id="${item.id}">Delete</button>
          </div>
        </td>
      `;
      bookingsTableBody.appendChild(row);

      const mobileCol = document.createElement("div");
      mobileCol.className = "col-12";
      mobileCol.innerHTML = `
        <div class="card border-0 shadow-sm">
          <div class="card-body p-4">
            <div class="d-flex justify-content-between align-items-start gap-3 mb-3">
              <div>
                <h4 class="fw-bold mb-1">${item.customerName || "Unnamed Customer"}</h4>
                <p class="text-muted mb-0">${item.customerPhone || "-"}</p>
              </div>
              <span class="badge ${statusBadgeClass(item.status)}">${statusLabel(item.status)}</span>
            </div>

            <p class="mb-2"><span class="fw-semibold">Type:</span> ${bookingTypeLabel(item.serviceType)}</p>
            <p class="mb-2"><span class="fw-semibold">Service:</span> ${item.serviceName || "-"}</p>
            <p class="mb-2"><span class="fw-semibold">Date:</span> ${formatBookingDate(item.bookingDate, item.bookingTime)}</p>
            ${item.customerEmail ? `<p class="mb-2"><span class="fw-semibold">Email:</span> ${item.customerEmail}</p>` : ""}
            ${item.bookingNotes ? `<p class="text-muted mb-3">${item.bookingNotes}</p>` : ""}

            <div class="d-grid gap-2 d-sm-flex">
              <button type="button" class="btn btn-outline-primary flex-fill js-edit-booking" data-id="${item.id}">Edit</button>
              <button type="button" class="btn btn-outline-success flex-fill js-status-booking" data-id="${item.id}">Status</button>
              <button type="button" class="btn btn-outline-danger flex-fill js-delete-booking" data-id="${item.id}">Delete</button>
            </div>
          </div>
        </div>
      `;
      bookingsMobileGrid.appendChild(mobileCol);
    });

    bindActions();
  }

  function bindActions() {
    document.querySelectorAll(".js-edit-booking").forEach((btn) => {
      btn.addEventListener("click", () => {
        const item = allBookings.find((b) => b.id === btn.getAttribute("data-id"));
        if (!item) return;
        openBookingModal(item);
      });
    });

    document.querySelectorAll(".js-status-booking").forEach((btn) => {
      btn.addEventListener("click", () => {
        const item = allBookings.find((b) => b.id === btn.getAttribute("data-id"));
        if (!item) return;
        openStatusModal(item);
      });
    });

    document.querySelectorAll(".js-delete-booking").forEach((btn) => {
      btn.addEventListener("click", async () => {
        const id = btn.getAttribute("data-id");
        const confirmDelete = confirm("Delete this booking entry?");
        if (!confirmDelete) return;

        try {
          await deleteDoc(doc(db, "bookings", id));
        } catch (error) {
          console.error("Delete booking error:", error);
          alert("Could not delete the booking.");
        }
      });
    });
  }

  function resetBookingForm() {
    bookingDocId.value = "";
    bookingForm.reset();
    bookingStatus.value = "new";
    bookingModalLabel.textContent = "Add Booking";
  }

  function openBookingModal(item = null) {
    resetBookingForm();

    if (item) {
      bookingModalLabel.textContent = "Edit Booking";
      bookingDocId.value = item.id;
      customerName.value = item.customerName || "";
      customerPhone.value = item.customerPhone || "";
      customerEmail.value = item.customerEmail || "";
      serviceType.value = item.serviceType || "test";
      serviceName.value = item.serviceName || "";
      bookingDate.value = item.bookingDate || "";
      bookingTime.value = item.bookingTime || "";
      bookingNotes.value = item.bookingNotes || "";
      bookingStatus.value = item.status || "new";
    }

    bookingModal.show();
  }

  function openStatusModal(item) {
    statusBookingDocId.value = item.id;
    statusValue.value = item.status || "new";
    statusModal.show();
  }

bookingForm.addEventListener("submit", async (e) => {
  e.preventDefault();

  const payload = {
    customerName: customerName.value.trim(),
    customerPhone: customerPhone.value.trim(),
    customerEmail: customerEmail.value.trim(),
    serviceType: serviceType.value.trim(),
    serviceName: serviceName.value.trim(),
    bookingDate: bookingDate.value || "",
    bookingTime: bookingTime.value.trim(),
    bookingNotes: bookingNotes.value.trim(),
    status: bookingStatus.value || "new",
    updatedAt: serverTimestamp()
  };

  try {
    if (!payload.customerName || !payload.customerPhone || !payload.serviceType || !payload.serviceName) {
      alert("Please fill all required fields.");
      return;
    }

    console.log("Saving booking payload:", payload);

    if (bookingDocId.value) {
      await updateDoc(doc(db, "bookings", bookingDocId.value), payload);
    } else {
      payload.createdAt = serverTimestamp();
      await addDoc(collection(db, "bookings"), payload);
    }

    bookingModal.hide();
    resetBookingForm();
    alert("Booking saved successfully.");
  } catch (error) {
    console.error("Save booking error:", error);
    alert(`Could not save the booking: ${error.message}`);
  }
});

  statusForm.addEventListener("submit", async (e) => {
    e.preventDefault();

    try {
      await updateDoc(doc(db, "bookings", statusBookingDocId.value), {
        status: statusValue.value,
        updatedAt: serverTimestamp()
      });

      statusModal.hide();
      statusForm.reset();
    } catch (error) {
      console.error("Update booking status error:", error);
      alert("Could not update the booking status.");
    }
  });

  function applyFilters() {
    renderBookings();
  }

  applyFiltersBtn.addEventListener("click", applyFilters);
  searchInput.addEventListener("input", applyFilters);
  filterBookingType.addEventListener("change", applyFilters);
  filterBookingStatus.addEventListener("change", applyFilters);

  if (openAddBookingBtn) {
    openAddBookingBtn.addEventListener("click", () => {
      resetBookingForm();
      bookingModal.show();
    });
  }

  setLoading(true);

  const bookingsQuery = query(
    collection(db, "bookings"),
    orderBy("createdAt", "desc")
  );

  onSnapshot(
    bookingsQuery,
    (snapshot) => {
      allBookings = snapshot.docs.map((docSnap) => ({
        id: docSnap.id,
        ...docSnap.data()
      }));

      updateStats();
      renderBookings();
      setLoading(false);
    },
    (error) => {
      console.error("Bookings listener error:", error);
      setLoading(false);
      setEmptyState(true);
    }
  );
});