import { db } from "./firebase-config.js";
import {
  collection,
  doc,
  setDoc,
  updateDoc,
  deleteDoc,
  onSnapshot,
  serverTimestamp
} from "https://www.gstatic.com/firebasejs/10.13.2/firebase-firestore.js";

document.addEventListener("DOMContentLoaded", () => {
  const requestsContainer = document.getElementById("requestsContainer");

  const searchInput = document.getElementById("searchRequests");
  const roleFilter = document.getElementById("filterRole");
  const statusFilter = document.getElementById("filterStatus");
  const applyFiltersBtn = document.getElementById("applyFiltersBtn");

  const totalRequestsCount = document.getElementById("totalRequestsCount");
  const pendingRequestsCount = document.getElementById("pendingRequestsCount");
  const approvedRequestsCount = document.getElementById("approvedRequestsCount");
  const rejectedRequestsCount = document.getElementById("rejectedRequestsCount");
  const revokedRequestsCount = document.getElementById("revokedRequestsCount");

  const loadingCard = document.getElementById("loadingCard");
  const emptyStateCard = document.getElementById("emptyStateCard");

  let allRequests = [];

  function setLoading(isLoading) {
    if (loadingCard) loadingCard.classList.toggle("d-none", !isLoading);
  }

  function setEmptyState(isEmpty) {
    if (emptyStateCard) emptyStateCard.classList.toggle("d-none", !isEmpty);
  }

  function normalize(value = "") {
    return String(value).toLowerCase().trim();
  }

  function formatDateLabel(createdAt) {
    if (!createdAt) return "Requested Recently";

    const date =
      typeof createdAt?.toDate === "function"
        ? createdAt.toDate()
        : new Date(createdAt);

    if (Number.isNaN(date.getTime())) {
      return "Requested Recently";
    }

    const now = new Date();
    const startOfToday = new Date(
      now.getFullYear(),
      now.getMonth(),
      now.getDate()
    );
    const startOfRequest = new Date(
      date.getFullYear(),
      date.getMonth(),
      date.getDate()
    );

    const diffDays = Math.round(
      (startOfToday - startOfRequest) / 86400000
    );

    if (diffDays === 0) return "Requested Today";
    if (diffDays === 1) return "Requested Yesterday";

    return date.toLocaleDateString("en-IN", {
      day: "numeric",
      month: "short",
      year: "numeric"
    });
  }

  function roleBadgeClass(role = "") {
    const r = normalize(role);
    if (r === "manager") return "bg-success";
    return "bg-primary";
  }

  function statusBadgeClass(status = "") {
    const s = normalize(status);

    if (s === "approved") {
      return "bg-success";
    }

    if (s === "rejected") {
      return "bg-danger";
    }

    if (s === "revoked") {
      return "bg-dark";
    }

    return "bg-warning text-dark";
  }

  function renderStats() {
    totalRequestsCount.textContent = allRequests.length;
    pendingRequestsCount.textContent = allRequests.filter(
      (item) => normalize(item.status) === "pending"
    ).length;
    approvedRequestsCount.textContent = allRequests.filter(
      (item) => normalize(item.status) === "approved"
    ).length;
    rejectedRequestsCount.textContent = allRequests.filter(
      (item) => normalize(item.status) === "rejected"
    ).length;
    revokedRequestsCount.textContent = allRequests.filter(
      (item) => normalize(item.status) === "revoked"
    ).length;
  }

  function matchesFilters(request) {
    const search = normalize(searchInput.value);
    const role = normalize(roleFilter.value);
    const status = normalize(statusFilter.value);

    const name = normalize(request.name);
    const email = normalize(request.email);
    const reqRole = normalize(request.role);
    const reqStatus = normalize(request.status);
    const reason = normalize(request.reason);

    const searchMatch =
      !search ||
      name.includes(search) ||
      email.includes(search) ||
      reqRole.includes(search) ||
      reason.includes(search);

    const roleMatch = role === "all" || reqRole === role;
    const statusMatch = status === "all" || reqStatus === status;

    return searchMatch && roleMatch && statusMatch;
  }

  function renderRequests() {
    const visible = allRequests.filter(matchesFilters);

    if (!requestsContainer) return;

    requestsContainer.innerHTML = "";

    setEmptyState(visible.length === 0);

    visible.forEach((request) => {
      const status = normalize(request.status);
      const card = document.createElement("div");
      card.className = "col-12";

      card.innerHTML = `
        <div class="card border-0 shadow-sm">
          <div class="card-body p-4">
            <div class="row align-items-start g-3">
              <div class="col-12 col-lg-7">
                <div class="d-flex align-items-start gap-3">
                  <div class="feature-icon flex-shrink-0">
                    <i class="bi bi-person-check"></i>
                  </div>

                  <div>
                    <h4 class="fw-bold mb-1">${request.name || "Unnamed Request"}</h4>
                    <p class="text-muted mb-2">Email: ${request.email || "-"}</p>
                    <p class="text-muted mb-2">Phone: ${request.phone || "-"}</p>
                    <p class="text-muted mb-0">
                      Requested Role:
                      <span class="badge ${roleBadgeClass(request.role)} ms-1">
                        ${request.role || "-"}
                      </span>
                    </p>
                  </div>
                </div>
              </div>

              <div class="col-12 col-lg-5">
                <div class="d-flex flex-column gap-2">
                  <div class="d-flex flex-wrap gap-2">
                    <span class="badge ${statusBadgeClass(request.status)}">${request.status || "pending"}</span>
                    <span class="badge bg-light text-dark border">
                      ${formatDateLabel(request.createdAt)}
                    </span>
                  </div>

                  <p class="text-muted mb-2">
                    Reason: ${request.reason || "No reason provided."}
                  </p>

                  ${
                    status === "pending"
                      ? `
                        <div class="d-grid gap-2 d-sm-flex">
                          <button
                            type="button"
                            class="btn btn-success flex-fill approve-btn"
                            data-id="${request.id}">
                            <i class="bi bi-check-circle me-2"></i>
                            Approve
                          </button>

                          <button
                            type="button"
                            class="btn btn-outline-danger flex-fill reject-btn"
                            data-id="${request.id}">
                            <i class="bi bi-x-circle me-2"></i>
                            Reject
                          </button>
                        </div>
                      `
                      : status === "approved"
                      ? `
                        <div class="d-grid">
                          <button
                            type="button"
                            class="btn btn-outline-dark revoke-btn"
                            data-id="${request.id}">
                            <i class="bi bi-arrow-counterclockwise me-2"></i>
                            Revoke Approval
                          </button>
                        </div>
                      `
                      : `
                        <div class="alert alert-light border mb-0">
                          This request has already been ${status}.
                        </div>
                      `
                  }
                </div>
              </div>
            </div>
          </div>
        </div>
      `;

      requestsContainer.appendChild(card);
    });

    attachActions();
  }

  async function approveRequest(id) {
    const request = allRequests.find((item) => item.id === id);
    if (!request) return;

    try {
      await setDoc(
        doc(db, "admins", request.email),
        {
          name: request.name || "",
          email: request.email || "",
          phone: request.phone || "",
          role: request.role || "admin",
          approved: true,
          status: "approved",
          approvedAt: serverTimestamp()
        },
        { merge: true }
      );

      await updateDoc(
        doc(db, "admin_requests", id),
        {
          status: "approved",
          approved: true,
          reviewedAt: serverTimestamp()
        }
      );
    } catch (error) {
      console.error("Approve request error:", error);
      alert("Could not approve this request.");
    }
  }

  async function rejectRequest(id) {
    try {
      await updateDoc(
        doc(db, "admin_requests", id),
        {
          status: "rejected",
          approved: false,
          reviewedAt: serverTimestamp()
        }
      );
    } catch (error) {
      console.error("Reject request error:", error);
      alert("Could not reject this request.");
    }
  }

  async function revokeApproval(id) {
    const request = allRequests.find((item) => item.id === id);
    if (!request) return;

    const confirmRevoke = confirm("Remove this user's admin access?");
    if (!confirmRevoke) return;

    try {
      await deleteDoc(doc(db, "admins", request.email));

      await updateDoc(
        doc(db, "admin_requests", id),
        {
          status: "revoked",
          approved: false,
          revokedAt: serverTimestamp()
        }
      );
    } catch (error) {
      console.error("Revoke approval error:", error);
      alert("Could not revoke approval.");
    }
  }

  function attachActions() {
    document.querySelectorAll(".approve-btn").forEach((btn) => {
      btn.addEventListener("click", () => {
        approveRequest(btn.getAttribute("data-id"));
      });
    });

    document.querySelectorAll(".reject-btn").forEach((btn) => {
      btn.addEventListener("click", () => {
        rejectRequest(btn.getAttribute("data-id"));
      });
    });

    document.querySelectorAll(".revoke-btn").forEach((btn) => {
      btn.addEventListener("click", () => {
        revokeApproval(btn.getAttribute("data-id"));
      });
    });
  }

  function applyFilters() {
    renderRequests();
  }

  applyFiltersBtn.addEventListener("click", applyFilters);
  searchInput.addEventListener("input", applyFilters);
  roleFilter.addEventListener("change", applyFilters);
  statusFilter.addEventListener("change", applyFilters);

  setLoading(true);

  onSnapshot(
    collection(db, "admin_requests"),
    (snapshot) => {
      allRequests = snapshot.docs
        .map((docSnap) => ({
          id: docSnap.id,
          ...docSnap.data()
        }))
        .sort((a, b) => {
          const aTime = a.createdAt?.toMillis ? a.createdAt.toMillis() : 0;
          const bTime = b.createdAt?.toMillis ? b.createdAt.toMillis() : 0;
          return bTime - aTime;
        });

      renderStats();
      renderRequests();
      setLoading(false);
    },
    (error) => {
      console.error("Live requests listener error:", error);
      setLoading(false);
      setEmptyState(true);
    }
  );
});