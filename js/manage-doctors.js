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
  const doctorsTableBody = document.getElementById("doctorsTableBody");
  const doctorsMobileGrid = document.getElementById("doctorsMobileGrid");

  const loadingCard = document.getElementById("loadingCard");
  const emptyStateCard = document.getElementById("emptyStateCard");

  const totalDoctorsCount = document.getElementById("totalDoctorsCount");
  const activeDoctorsCount = document.getElementById("activeDoctorsCount");
  const freeAppointmentsCount = document.getElementById("freeAppointmentsCount");
  const uniqueSpecialitiesCount = document.getElementById("uniqueSpecialitiesCount");

  const searchInput = document.getElementById("searchDoctors");
  const specialityFilter = document.getElementById("filterDoctorSpeciality");
  const statusFilter = document.getElementById("filterDoctorStatus");
  const clearFiltersBtn = document.getElementById("clearFiltersBtn");

  const openAddDoctorModalBtn = document.getElementById("openAddDoctorModal");
  const doctorModalElement = document.getElementById("doctorModal");
  const doctorModal = new bootstrap.Modal(doctorModalElement);
  const doctorForm = document.getElementById("doctorForm");

  const doctorDocId = document.getElementById("doctorDocId");
  const doctorName = document.getElementById("doctorName");
  const doctorSpeciality = document.getElementById("doctorSpeciality");
  const doctorAppointmentType = document.getElementById("doctorAppointmentType");
  const doctorStatus = document.getElementById("doctorStatus");
const doctorDescription =
  document.getElementById("doctorDescription");

const doctorModalLabel =
  document.getElementById("doctorModalLabel");

const doctorImage =
  document.getElementById("doctorImage");

const imageFocusX =
  document.getElementById("imageFocusX");

const imageFocusY =
  document.getElementById("imageFocusY");

const preview =
  document.getElementById("doctorImagePreview");

  let allDoctors = [];

  let doctorImageData = "";

function updateImagePreview() {

  if (!preview) return;

  preview.src =
    doctorImageData ||
    "https://via.placeholder.com/300";

  preview.style.objectPosition =
    `${imageFocusX.value}% ${imageFocusY.value}%`;
}

doctorImage?.addEventListener(
  "change",
  (e) => {

    const file =
      e.target.files[0];

    if (!file) return;

    const reader =
      new FileReader();

    reader.onload = () => {

      doctorImageData =
        reader.result;

      updateImagePreview();
    };

    reader.readAsDataURL(file);
  }
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

  function normalize(value = "") {
    return value.toLowerCase().trim();
  }

  function specialityBadgeClass(value = "") {
    const s = normalize(value);

    if (s.includes("general")) return "bg-primary";
    if (s.includes("cardio")) return "bg-danger";
    if (s.includes("diabet")) return "bg-warning text-dark";
    if (s.includes("gynec")) return "bg-success";
    if (s === "ent") return "bg-info text-dark";
    if (s.includes("pediatric")) return "bg-secondary";

    return "bg-primary";
  }

  function appointmentBadgeClass(value = "") {
    const s = normalize(value);

    if (s.includes("free")) return "bg-success";
    return "bg-primary";
  }

  function statusBadgeHtml(isActive) {
    return isActive
      ? `<span class="badge bg-success">Active</span>`
      : `<span class="badge bg-warning text-dark">Inactive</span>`;
  }

  function renderStats(items) {
    totalDoctorsCount.textContent = items.length;
    activeDoctorsCount.textContent = items.filter((item) => item.active).length;
    freeAppointmentsCount.textContent = items.filter((item) =>
      normalize(item.appointmentType).includes("free")
    ).length;

    const uniqueSpecialities = new Set(
      items.map((item) => normalize(item.speciality || item.specialization || ""))
          .filter(Boolean)
    );
    uniqueSpecialitiesCount.textContent = uniqueSpecialities.size;
  }

  function matchesFilters(item) {
    const search = (searchInput.value || "").trim().toLowerCase();
    const selectedSpeciality = (specialityFilter.value || "all").toLowerCase();
    const selectedStatus = (statusFilter.value || "all").toLowerCase();

    const name = (item.doctorName || "").toLowerCase();
    const speciality = normalize(item.speciality || item.specialization || "");
    const appointment = (item.appointmentType || "").toLowerCase();
    const description = (item.description || "").toLowerCase();
    const itemStatus = item.active ? "active" : "inactive";

    const matchesSearch =
      !search ||
      name.includes(search) ||
      speciality.includes(search) ||
      appointment.includes(search) ||
      description.includes(search);

    const matchesSpeciality =
      selectedSpeciality === "all" || speciality === selectedSpeciality;

    const matchesStatus =
      selectedStatus === "all" || itemStatus === selectedStatus;

    return matchesSearch && matchesSpeciality && matchesStatus;
  }

  function renderDoctors(items) {
    const visibleItems = items.filter(matchesFilters);

    if (doctorsTableBody) doctorsTableBody.innerHTML = "";
    if (doctorsMobileGrid) doctorsMobileGrid.innerHTML = "";

    setEmptyState(visibleItems.length === 0);

    visibleItems.forEach((item) => {
      const speciality = item.speciality || item.specialization || "Doctor";
      const appointmentType = item.appointmentType || "Free Appointment";

      const row = document.createElement("tr");
      row.innerHTML = `
        <td class="px-4 py-3 fw-semibold">${item.doctorName || "Untitled Doctor"}</td>
        <td class="px-4 py-3">${speciality}</td>
        <td class="px-4 py-3">${appointmentType}</td>
        <td class="px-4 py-3">${statusBadgeHtml(item.active)}</td>
        <td class="px-4 py-3">
          <div class="d-flex gap-2">
            <button type="button" class="btn btn-outline-primary btn-sm js-edit-doctor" data-id="${item.id}">
              Edit
            </button>
            <button type="button" class="btn btn-outline-danger btn-sm js-delete-doctor" data-id="${item.id}">
              Delete
            </button>
          </div>
        </td>
      `;
      doctorsTableBody.appendChild(row);

      const mobileCol = document.createElement("div");
      mobileCol.className = "col-12";
      mobileCol.innerHTML = `
        <div class="card border-0 shadow-sm">
          <div class="card-body p-4">
            <div class="d-flex justify-content-between align-items-start gap-3 mb-3">
              <div>
                <h4 class="fw-bold mb-1">${item.doctorName || "Untitled Doctor"}</h4>
                <p class="text-muted mb-0">${speciality}</p>
              </div>
              ${item.active ? `<span class="badge bg-success">Active</span>` : `<span class="badge bg-warning text-dark">Inactive</span>`}
            </div>

            <p class="mb-3">
              <span class="fw-semibold">Appointment:</span> ${appointmentType}
            </p>

            <div class="mb-3 text-muted small">
              ${item.description || ""}
            </div>

            <div class="d-grid gap-2 d-sm-flex">
              <button type="button" class="btn btn-outline-primary flex-fill js-edit-doctor" data-id="${item.id}">
                Edit
              </button>
              <button type="button" class="btn btn-outline-danger flex-fill js-delete-doctor" data-id="${item.id}">
                Delete
              </button>
            </div>
          </div>
        </div>
      `;
      doctorsMobileGrid.appendChild(mobileCol);
    });

    bindActionButtons();
  }

  function bindActionButtons() {
    document.querySelectorAll(".js-edit-doctor").forEach((button) => {
      button.addEventListener("click", () => {
        const id = button.getAttribute("data-id");
        const item = allDoctors.find((doctor) => doctor.id === id);
        if (!item) return;

        doctorModalLabel.textContent = "Edit Doctor";
        doctorDocId.value = item.id;
        doctorName.value = item.doctorName || "";
        doctorSpeciality.value = item.speciality || item.specialization || "";
        doctorAppointmentType.value = item.appointmentType || "Free Appointment";
        doctorStatus.value = item.active ? "true" : "false";
        doctorDescription.value = item.description || "";
        doctorImageData =
  item.doctorImage || "";

imageFocusX.value =
  item.imageFocusX ?? 50;

imageFocusY.value =
  item.imageFocusY ?? 50;

updateImagePreview();

        doctorModal.show();
      });
    });

    document.querySelectorAll(".js-delete-doctor").forEach((button) => {
      button.addEventListener("click", async () => {
        const id = button.getAttribute("data-id");
        const confirmDelete = confirm("Delete this doctor permanently?");
        if (!confirmDelete) return;

        try {
          await deleteDoc(doc(db, "doctors", id));
        } catch (error) {
          console.error("Delete doctor error:", error);
          alert("Could not delete the doctor.");
        }
      });
    });
  }

  function setupRealtimeListener() {
    setLoading(true);

    const q = query(collection(db, "doctors"), orderBy("createdAt", "desc"));

    onSnapshot(
      q,
      (snapshot) => {
        allDoctors = snapshot.docs.map((docSnap) => ({
          id: docSnap.id,
          ...docSnap.data()
        }));

        renderStats(allDoctors);
        renderDoctors(allDoctors);
        setLoading(false);
      },
      (error) => {
        console.error("Realtime doctors listener error:", error);
        setLoading(false);
        setEmptyState(true);
      }
    );
  }

  if (openAddDoctorModalBtn) {
    openAddDoctorModalBtn.addEventListener("click", () => {
      doctorModalLabel.textContent = "Add New Doctor";
      doctorForm.reset();
      doctorDocId.value = "";
      doctorStatus.value = "true";

doctorAppointmentType.value =
  "Free Appointment";

doctorImageData = "";

imageFocusX.value = 50;
imageFocusY.value = 50;

updateImagePreview();
      doctorModal.show();
    });
  }

  if (doctorForm) {
    doctorForm.addEventListener("submit", async (e) => {
      e.preventDefault();

      const payload = {
        doctorName: doctorName.value.trim(),
        speciality: doctorSpeciality.value.trim(),
        appointmentType: doctorAppointmentType.value.trim(),
        doctorImage:
  doctorImageData,

imageFocusX:
  Number(imageFocusX.value),

imageFocusY:
  Number(imageFocusY.value),
        active: doctorStatus.value === "true",
        description: doctorDescription.value.trim(),
        updatedAt: serverTimestamp()
      };

      try {
        if (doctorDocId.value) {
          await updateDoc(doc(db, "doctors", doctorDocId.value), payload);
        } else {
          payload.createdAt = serverTimestamp();
          await addDoc(collection(db, "doctors"), payload);
        }

        doctorForm.reset();
        doctorDocId.value = "";
        doctorStatus.value = "true";
        doctorAppointmentType.value = "Free Appointment";
        doctorModal.hide();
      } catch (error) {
        console.error("Save doctor error:", error);
        alert("Could not save the doctor.");
      }
    });
  }

  if (searchInput) searchInput.addEventListener("input", () => renderDoctors(allDoctors));
  if (specialityFilter) specialityFilter.addEventListener("change", () => renderDoctors(allDoctors));
  if (statusFilter) statusFilter.addEventListener("change", () => renderDoctors(allDoctors));

  if (clearFiltersBtn) {
    clearFiltersBtn.addEventListener("click", () => {
      searchInput.value = "";
      specialityFilter.value = "all";
      statusFilter.value = "all";
      renderDoctors(allDoctors);
    });
  }

  setupRealtimeListener();
});