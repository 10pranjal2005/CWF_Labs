import { db } from "./firebase-config.js";
import {
  collection,
  query,
  orderBy,
  onSnapshot
} from "https://www.gstatic.com/firebasejs/10.13.2/firebase-firestore.js";

document.addEventListener("DOMContentLoaded", () => {
  const doctorsGrid = document.getElementById("doctorsGrid");

  const whatsappNumber = "918961772773";
  const phoneNumber = "+918961772773";

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

  function iconClass(value = "") {
    const s = normalize(value);

    if (s.includes("general")) return "bi-person-heart";
    if (s.includes("cardio")) return "bi-heart-pulse";
    if (s.includes("diabet")) return "bi-activity";
    if (s.includes("gynec")) return "bi-gender-female";
    if (s === "ent") return "bi-ear";
    if (s.includes("pediatric")) return "bi-bandaid";

    return "bi-person-heart";
  }

  function appointmentBadgeClass(value = "") {
    const s = normalize(value);
    if (s.includes("free")) return "bg-success";
    return "bg-primary";
  }

  function renderDoctors(items) {
    if (!doctorsGrid) return;

    const activeDoctors = items.filter((item) => item.active !== false);

    if (activeDoctors.length === 0) {
      doctorsGrid.innerHTML = `
        <div class="col-12">
          <div class="card border-0 shadow-sm">
            <div class="card-body p-4 p-md-5 text-center">
              <h4 class="fw-bold mb-2">No doctors available right now</h4>
              <p class="text-muted mb-0">
                New doctors will appear here once the admin adds them in the dashboard.
              </p>
            </div>
          </div>
        </div>
      `;
      return;
    }

    doctorsGrid.innerHTML = activeDoctors
      .map((doctor) => {
        const speciality = doctor.speciality || doctor.specialization || "Doctor";
        const appointmentType = doctor.appointmentType || "Free Appointment";

        return `
          <div class="col-12 col-md-6 col-xl-4">
            <div class="card border-0 shadow-sm h-100">
              <div class="card-body p-4 d-flex flex-column">
                <div class="d-flex align-items-center gap-3 mb-3">
                  <div class="team-avatar">

${
doctor.doctorImage
?
`
<img
  src="${doctor.doctorImage}"
  style="
    object-position:
    ${doctor.imageFocusX || 50}%
    ${doctor.imageFocusY || 50}%;
  ">
`
:
`
<div class="team-avatar-fallback">
  ${
    (doctor.doctorName || "Doctor")
.split(" ")
.map(word => word[0])
.join("")
.substring(0,2)
.toUpperCase()
  }
</div>
`
}

</div>
                  <div>
                    <h4 class="fw-bold mb-1">${doctor.doctorName || "Untitled Doctor"}</h4>
                    <p class="text-muted mb-0">${speciality}</p>
                  </div>
                </div>

                <p class="text-muted flex-grow-1">
                  ${doctor.description || ""}
                </p>

                <div class="mb-4">
                  <span class="badge ${appointmentBadgeClass(appointmentType)}">
                    ${appointmentType}
                  </span>
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
      })
      .join("");
  }

  function loadRealtimeDoctors() {
    const q = query(collection(db, "doctors"), orderBy("createdAt", "desc"));

    onSnapshot(
      q,
      (snapshot) => {
        const doctors = snapshot.docs.map((docSnap) => ({
          id: docSnap.id,
          ...docSnap.data()
        }));

        renderDoctors(doctors);
      },
      (error) => {
        console.error("Failed to load doctors:", error);

        if (doctorsGrid) {
          doctorsGrid.innerHTML = `
            <div class="col-12">
              <div class="card border-0 shadow-sm">
                <div class="card-body p-4 p-md-5 text-center">
                  <h4 class="fw-bold mb-2">Unable to load doctors</h4>
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

  loadRealtimeDoctors();
});