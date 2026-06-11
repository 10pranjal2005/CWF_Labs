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
  const summaryElements = {

  tests:
    document.getElementById("summaryTests"),

  testsBar:
    document.getElementById("summaryTestsBar"),

  packages:
    document.getElementById("summaryPackages"),

  packagesBar:
    document.getElementById("summaryPackagesBar"),

  doctors:
    document.getElementById("summaryDoctors"),

  doctorsBar:
    document.getElementById("summaryDoctorsBar"),

  services:
    document.getElementById("summaryServices"),

  servicesBar:
    document.getElementById("summaryServicesBar"),

  blogs:
    document.getElementById("summaryBlogs"),

  blogsBar:
    document.getElementById("summaryBlogsBar"),

  faqs:
    document.getElementById("summaryFaqs"),

  faqsBar:
    document.getElementById("summaryFaqsBar")

};

const counts = {

  bookingsCount:
    document.getElementById(
      "bookingsCount"
    ),

  pendingRequestsCount:
    document.getElementById(
      "pendingRequestsCount"
    ),

  testsCount:
    document.getElementById(
      "testsCount"
    ),

  packagesCount:
    document.getElementById(
      "packagesCount"
    ),

  doctorsCount:
    document.getElementById(
      "doctorsCount"
    ),

  servicesCount:
    document.getElementById(
      "servicesCount"
    ),

  faqsCount:
    document.getElementById(
      "faqsCount"
    ),

  blogsCount:
    document.getElementById(
      "blogsCount"
    ),

  contactCardsCount:
    document.getElementById(
      "contactCardsCount"
    ),

  careersCount:
document.getElementById(
  "careersCount"
),

researchModuleCount:
document.getElementById(
"researchModuleCount"
),

};

  const bookingSummary = {
    total: document.getElementById("bookingSummaryTotal"),
    new: document.getElementById("bookingSummaryNew"),
    confirmed: document.getElementById("bookingSummaryConfirmed"),
    completed: document.getElementById("bookingSummaryCompleted"),
    cancelled: document.getElementById("bookingSummaryCancelled")
  };
  const summaryTestsCount =
document.getElementById("summaryTestsCount");

const summaryPackagesCount =
document.getElementById("summaryPackagesCount");

const summaryDoctorsCount =
document.getElementById("summaryDoctorsCount");

const summaryServicesCount =
document.getElementById("summaryServicesCount");

const summaryBlogsCount =
document.getElementById("summaryBlogsCount");

const summaryFaqsCount =
document.getElementById("summaryFaqsCount");


const summaryTestsBar =
document.getElementById("summaryTestsBar");

const summaryPackagesBar =
document.getElementById("summaryPackagesBar");

const summaryDoctorsBar =
document.getElementById("summaryDoctorsBar");

const summaryServicesBar =
document.getElementById("summaryServicesBar");

const summaryBlogsBar =
document.getElementById("summaryBlogsBar");

const summaryFaqsBar =
document.getElementById("summaryFaqsBar");

const internshipsCount =
document.getElementById("internshipsCount");

const volunteerCount =
document.getElementById("volunteerCount");

const researchCount =
document.getElementById("researchCount");

const consultantCount =
document.getElementById("consultantCount");

const projectCount =
document.getElementById("projectCount");

const fulltimeCount =
document.getElementById("fulltimeCount");

const careerApplicationsCount =
document.getElementById(
  "careerApplicationsCount"
);

const summaryResearchCount =
document.getElementById(
"summaryResearchCount"
);

const summaryResearchBar =
document.getElementById(
"summaryResearchBar"
);

  function setCount(element, value) {
    if (element) {
      element.textContent = String(value);
    }
  }

  function updateSummaryBar(
  valueElement,
  barElement,
  value
) {

  if (valueElement) {
    valueElement.textContent = value;
  }

  if (barElement) {

    const width =
      Math.min(
        value * 5,
        100
      );

    barElement.style.width =
      `${width}%`;

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

function watchSummaryCount(
  collectionName,
  countElement,
  barElement
) {

  onSnapshot(

    collection(
      db,
      collectionName
    ),

    (snapshot) => {

      const total =
        snapshot.size;

      if (countElement) {

        countElement.textContent =
          total;

      }

      if (barElement) {

        const width =
          Math.min(
            total * 5,
            100
          );

        barElement.style.width =
          `${width}%`;

      }

    }

  );

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
watchTotalCount(
  "faqs",
  counts.faqsCount
);

watchSummaryCount(
  "tests",
  summaryTestsCount,
  summaryTestsBar
);

watchSummaryCount(
  "packages",
  summaryPackagesCount,
  summaryPackagesBar
);

watchSummaryCount(
  "doctors",
  summaryDoctorsCount,
  summaryDoctorsBar
);

watchSummaryCount(
  "services",
  summaryServicesCount,
  summaryServicesBar
);

watchSummaryCount(
  "blogs",
  summaryBlogsCount,
  summaryBlogsBar
);

watchSummaryCount(
  "research",
  summaryResearchCount,
  summaryResearchBar
);

watchSummaryCount(
  "faqs",
  summaryFaqsCount,
  summaryFaqsBar
);

watchTotalCount(
  "blogs",
  counts.blogsCount
);

watchTotalCount(
  "research",
  counts.researchModuleCount
);

watchTotalCount(
  "careers",
  counts.careersCount
);

watchCareersSummary();

watchTotalCount(
  "contact_cards",
  counts.contactCardsCount
);

function watchCareersSummary() {

  onSnapshot(
    collection(db, "careers"),

    (snapshot) => {

      const openings =
        snapshot.docs.map(
          doc => doc.data()
        );

      setCount(
        counts.careersCount,
        openings.length
      );

      setCount(
        internshipsCount,
        openings.filter(
          item =>
            item.category ===
            "Internships"
        ).length
      );

      setCount(
        volunteerCount,
        openings.filter(
          item =>
            item.category ===
            "Volunteer Programs"
        ).length
      );

      setCount(
        researchCount,
        openings.filter(
          item =>
            item.category ===
            "Research Associates"
        ).length
      );

      setCount(
        consultantCount,
        openings.filter(
          item =>
            item.category ===
            "Healthcare Consultants"
        ).length
      );

      setCount(
        projectCount,
        openings.filter(
          item =>
            item.category ===
            "Project-Based Roles"
        ).length
      );

      setCount(
        fulltimeCount,
        openings.filter(
          item =>
            item.category ===
            "Full-Time Openings"
        ).length
      );

    }
  );

  onSnapshot(
    collection(
      db,
      "career_applications"
    ),

    (snapshot) => {

      setCount(
        careerApplicationsCount,
        snapshot.size
      );

    }
  );

}

  onAuthStateChanged(auth, async (user) => {
    if (!user) {
      if (dashboardUserName) dashboardUserName.textContent = "Welcome Admin";
      if (dashboardUserRole) dashboardUserRole.textContent = "Loading...";
      return;
    }

    await loadCurrentAdminInfo(user);
  });
});