import { auth, db } from "./firebase-config.js";
import {
  onAuthStateChanged
} from "https://www.gstatic.com/firebasejs/10.13.2/firebase-auth.js";
import {
  collection,
  query,
  where,
  onSnapshot,
  getDocs
} from "https://www.gstatic.com/firebasejs/10.13.2/firebase-firestore.js";

document.addEventListener("DOMContentLoaded", () => {
  const dashboardUserName = document.getElementById("dashboardUserName");
  const dashboardUserRole = document.getElementById("dashboardUserRole");

  const counts = {
    bookingsCount: document.getElementById("bookingsCount"),
    pendingRequestsCount: document.getElementById("pendingRequestsCount"),
    testsCount: document.getElementById("testsCount"),
    packagesCount: document.getElementById("packagesCount"),
    doctorsCount: document.getElementById("doctorsCount"),
    servicesCount: document.getElementById("servicesCount"),
    faqsCount: document.getElementById("faqsCount"),
    contactCardsCount: document.getElementById("contactCardsCount")
  };

  const bookingSummary = {
    total: document.getElementById("bookingSummaryTotal"),
    new: document.getElementById("bookingSummaryNew"),
    confirmed: document.getElementById("bookingSummaryConfirmed"),
    completed: document.getElementById("bookingSummaryCompleted"),
    cancelled: document.getElementById("bookingSummaryCancelled")
  };

  function setCount(element, value) {
    if (element) {
      element.textContent = String(value);
    }
  }

  function formatRole(role) {
    if (!role) return "Admin";
    return role.charAt(0).toUpperCase() + role.slice(1).toLowerCase();
  }

  function watchTotalCount(collectionName, element, transform = (snap) => snap.size) {
    try {
      onSnapshot(
        collection(db, collectionName),
        (snapshot) => {
          setCount(element, transform(snapshot));
        },
        (error) => {
          console.error(`Live count error for ${collectionName}:`, error);
          setCount(element, 0);
        }
      );
    } catch (error) {
      console.error(`Watch setup failed for ${collectionName}:`, error);
      setCount(element, 0);
    }
  }

  function watchPendingRequests() {
    try {
      const pendingQuery = query(
        collection(db, "admin_requests"),
        where("status", "==", "pending")
      );

      onSnapshot(
        pendingQuery,
        (snapshot) => {
          setCount(counts.pendingRequestsCount, snapshot.size);
        },
        (error) => {
          console.error("Live count error for pending requests:", error);
          setCount(counts.pendingRequestsCount, 0);
        }
      );
    } catch (error) {
      console.error("Watch setup failed for pending requests:", error);
      setCount(counts.pendingRequestsCount, 0);
    }
  }

  function watchBookingsSummary() {
    try {
      onSnapshot(
        collection(db, "bookings"),
        (snapshot) => {
          const bookings = snapshot.docs.map((docSnap) => ({
            id: docSnap.id,
            ...docSnap.data()
          }));

          const total = bookings.length;
          const newCount = bookings.filter((item) => (item.status || "new") === "new").length;
          const confirmedCount = bookings.filter((item) => item.status === "confirmed").length;
          const completedCount = bookings.filter((item) => item.status === "completed").length;
          const cancelledCount = bookings.filter((item) => item.status === "cancelled").length;

          setCount(counts.bookingsCount, total);
          setCount(bookingSummary.total, total);
          setCount(bookingSummary.new, newCount);
          setCount(bookingSummary.confirmed, confirmedCount);
          setCount(bookingSummary.completed, completedCount);
          setCount(bookingSummary.cancelled, cancelledCount);
        },
        (error) => {
          console.error("Live bookings summary error:", error);
          setCount(counts.bookingsCount, 0);
          setCount(bookingSummary.total, 0);
          setCount(bookingSummary.new, 0);
          setCount(bookingSummary.confirmed, 0);
          setCount(bookingSummary.completed, 0);
          setCount(bookingSummary.cancelled, 0);
        }
      );
    } catch (error) {
      console.error("Watch setup failed for bookings:", error);
    }
  }

  async function loadCurrentAdminInfo(user) {
    if (!dashboardUserName || !dashboardUserRole) return;

    try {
      const adminQuery = query(
        collection(db, "admins"),
        where("email", "==", user.email)
      );

      const snapshot = await getDocs(adminQuery);

      if (snapshot.empty) {
        dashboardUserName.textContent = `Welcome ${user.displayName || "Admin"}`;
        dashboardUserRole.textContent = "Admin";
        return;
      }

      const adminData = snapshot.docs[0].data();

      dashboardUserName.textContent = `Welcome ${adminData.name || user.displayName || "User"}`;
      dashboardUserRole.textContent = formatRole(adminData.role || "admin");
    } catch (error) {
      console.error("Dashboard user load error:", error);
      dashboardUserName.textContent = `Welcome ${user.displayName || "User"}`;
      dashboardUserRole.textContent = "Admin";
    }
  }

  watchBookingsSummary();
  watchPendingRequests();
  watchTotalCount("tests", counts.testsCount);
  watchTotalCount("packages", counts.packagesCount);
  watchTotalCount("doctors", counts.doctorsCount);
  watchTotalCount("services", counts.servicesCount);
  watchTotalCount("faqs", counts.faqsCount);
  watchTotalCount("contact_cards", counts.contactCardsCount);

  onAuthStateChanged(auth, async (user) => {
    if (!user) {
      if (dashboardUserName) dashboardUserName.textContent = "Welcome Admin";
      if (dashboardUserRole) dashboardUserRole.textContent = "Loading...";
      return;
    }

    await loadCurrentAdminInfo(user);
  });
});