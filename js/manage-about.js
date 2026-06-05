import { db } from "./firebase-config.js";
import {
  doc,
  collection,
  getDoc,
  getDocs,
  setDoc,
  addDoc,
  updateDoc,
  deleteDoc,
  serverTimestamp,
  onSnapshot,
  query,
  orderBy
} from "https://www.gstatic.com/firebasejs/10.13.2/firebase-firestore.js";

const DEFAULT_HERO = {
  tagline: "About CWF Labs",
  title: "Who we are and what we do",
  description:
    "CWF Labs is a community-focused healthcare platform created to make lab services, doctor access, and health support easier for rural and underserved communities.",
  heroImageUrl:
    "https://images.unsplash.com/photo-1584515933487-779824d29309?q=80&w=1200&auto=format&fit=crop",
  updatedAt: serverTimestamp()
};

const DEFAULT_CONTENT = {
  missionTitle: "Our Mission",
  missionText:
    "To provide accessible, affordable, and community-driven healthcare services while supporting social inclusion, awareness, and development across our focus areas.",
  visionTitle: "Our Vision",
  visionText:
    "To become a trusted digital healthcare and community support platform that improves quality of life for people in rural and underserved regions.",
  updatedAt: serverTimestamp()
};

const DEFAULT_FOCUS_AREAS = [
  {
    id: "disability",
    title: "Disability",
    description: "Supporting inclusive opportunities and accessibility.",
    icon: "bi-universal-access-circle",
    badgeColor: "bg-primary",
    displayOrder: 1,
    active: true
  },
  {
    id: "gender",
    title: "Gender",
    description: "Promoting equality, dignity, and empowerment.",
    icon: "bi-people",
    badgeColor: "bg-success",
    displayOrder: 2,
    active: true
  },
  {
    id: "education",
    title: "Education",
    description: "Enabling learning and awareness for communities.",
    icon: "bi-book",
    badgeColor: "bg-warning text-dark",
    displayOrder: 3,
    active: true
  },
  {
    id: "healthcare",
    title: "Healthcare",
    description: "Making healthcare services easier to access.",
    icon: "bi-heart-pulse",
    badgeColor: "bg-danger",
    displayOrder: 4,
    active: true
  }
];

const DEFAULT_SERVICES = [
  {
    id: "lab_test_booking",
    title: "Lab Test Booking",
    description: "Easy booking for healthcare tests through WhatsApp or call.",
    icon: "bi-clipboard2-pulse",
    displayOrder: 1,
    active: true
  },
  {
    id: "health_packages",
    title: "Health Packages",
    description: "Affordable packages with clear pricing and booking access.",
    icon: "bi-bag-heart",
    displayOrder: 2,
    active: true
  },
  {
    id: "doctor_consultations",
    title: "Doctor Consultations",
    description: "Connect users with doctors based on speciality and need.",
    icon: "bi-person-badge",
    displayOrder: 3,
    active: true
  },
  {
    id: "community_updates",
    title: "Community Updates",
    description: "News, FAQs, services, and support information in one place.",
    icon: "bi-megaphone",
    displayOrder: 4,
    active: true
  }
];

const DEFAULT_TEAM = [
  {
    id: "member_1",
    name: "Name Here",
    designation: "Designation Here",
    bio: "This team card can be edited from the admin panel with an uploaded image.",
    imageUrl: "https://via.placeholder.com/600x400?text=Team+Member",
    displayOrder: 1,
    active: true
  },
  {
    id: "member_2",
    name: "Name Here",
    designation: "Designation Here",
    bio: "This team card can be edited from the admin panel with an uploaded image.",
    imageUrl: "https://via.placeholder.com/600x400?text=Team+Member",
    displayOrder: 2,
    active: true
  },
  {
    id: "member_3",
    name: "Name Here",
    designation: "Designation Here",
    bio: "This team card can be edited from the admin panel with an uploaded image.",
    imageUrl: "https://via.placeholder.com/600x400?text=Team+Member",
    displayOrder: 3,
    active: true
  }
];

document.addEventListener("DOMContentLoaded", async () => {
  const heroStatusText = document.getElementById("heroStatusText");
  const focusAreasCount = document.getElementById("focusAreasCount");
  const servicesCount = document.getElementById("servicesCount");
  const teamCount = document.getElementById("teamCount");

  const heroTaglineInput = document.getElementById("heroTaglineInput");
  const heroTitleInput = document.getElementById("heroTitleInput");
  const heroDescriptionInput = document.getElementById("heroDescriptionInput");
  const heroImageInput = document.getElementById("heroImageInput");
  const heroForm = document.getElementById("heroForm");

  const missionTitleInput = document.getElementById("missionTitleInput");
  const missionTextInput = document.getElementById("missionTextInput");
  const visionTitleInput = document.getElementById("visionTitleInput");
  const visionTextInput = document.getElementById("visionTextInput");
  const contentForm = document.getElementById("contentForm");

  const focusAreasGrid = document.getElementById("focusAreasGrid");
  const servicesGrid = document.getElementById("servicesGrid");
  const teamGrid = document.getElementById("teamGrid");

  const openAddFocusAreaModal = document.getElementById("openAddFocusAreaModal");
  const openAddServiceModal = document.getElementById("openAddServiceModal");
  const openAddTeamModal = document.getElementById("openAddTeamModal");

  const focusAreaModal = new bootstrap.Modal(document.getElementById("focusAreaModal"));
  const serviceModal = new bootstrap.Modal(document.getElementById("serviceModal"));
  const teamModal = new bootstrap.Modal(document.getElementById("teamModal"));

  const focusAreaForm = document.getElementById("focusAreaForm");
  const serviceForm = document.getElementById("serviceForm");
  const teamForm = document.getElementById("teamForm");

  const focusAreaDocId = document.getElementById("focusAreaDocId");
  const focusAreaTitleInput = document.getElementById("focusAreaTitleInput");
  const focusAreaDescriptionInput = document.getElementById("focusAreaDescriptionInput");
  const focusAreaIconInput = document.getElementById("focusAreaIconInput");
  const focusAreaBadgeColorInput = document.getElementById("focusAreaBadgeColorInput");
  const focusAreaOrderInput = document.getElementById("focusAreaOrderInput");
  const focusAreaStatusInput = document.getElementById("focusAreaStatusInput");
  const focusAreaModalLabel = document.getElementById("focusAreaModalLabel");

  const serviceDocId = document.getElementById("serviceDocId");
  const serviceTitleInput = document.getElementById("serviceTitleInput");
  const serviceDescriptionInput = document.getElementById("serviceDescriptionInput");
  const serviceIconInput = document.getElementById("serviceIconInput");
  const serviceOrderInput = document.getElementById("serviceOrderInput");
  const serviceStatusInput = document.getElementById("serviceStatusInput");
  const serviceModalLabel = document.getElementById("serviceModalLabel");

  const teamDocId = document.getElementById("teamDocId");
  const teamExistingImageUrl = document.getElementById("teamExistingImageUrl");
  const teamNameInput = document.getElementById("teamNameInput");
  const teamDesignationInput = document.getElementById("teamDesignationInput");
  const teamImageInput = document.getElementById("teamImageInput");
  const teamImagePreview = document.getElementById("teamImagePreview");
  const teamBioInput = document.getElementById("teamBioInput");
  const teamLinkedInInput = document.getElementById("teamLinkedInInput");
  const teamOrderInput = document.getElementById("teamOrderInput");
  const teamStatusInput = document.getElementById("teamStatusInput");
  const teamModalLabel = document.getElementById("teamModalLabel");

  let heroLoaded = false;
  let contentLoaded = false;
  let focusAreasState = [];
  let servicesState = [];
  let teamState = [];
  let selectedTeamImageData = "";
  const PLACEHOLDER_IMAGE = "https://via.placeholder.com/600x400?text=Team+Member";

  function normalize(value = "") {
    return String(value).toLowerCase().trim();
  }

  function setHeroStatus() {
    if (!heroStatusText) return;
    heroStatusText.textContent = heroLoaded ? "Live" : "Missing";
  }

  function iconMarkup(icon = "bi-grid-1x2") {
    return `<i class="bi ${icon}"></i>`;
  }

  function badgeClass(value = "") {
    const v = normalize(value);
    if (v.includes("success")) return "bg-success";
    if (v.includes("warning")) return "bg-warning text-dark";
    if (v.includes("danger")) return "bg-danger";
    if (v.includes("info")) return "bg-info text-dark";
    if (v.includes("secondary")) return "bg-secondary";
    if (v.includes("dark")) return "bg-dark";
    return "bg-primary";
  }

  function renderStats() {
    if (focusAreasCount) focusAreasCount.textContent = String(focusAreasState.filter((item) => item.active !== false).length);
    if (servicesCount) servicesCount.textContent = String(servicesState.filter((item) => item.active !== false).length);
    if (teamCount) teamCount.textContent = String(teamState.filter((item) => item.active !== false).length);
  }

  function renderEmptyCard(title, message) {
    return `
      <div class="col-12">
        <div class="card border-0 shadow-sm">
          <div class="card-body p-4 p-md-5 text-center">
            <h4 class="fw-bold mb-2">${title}</h4>
            <p class="text-muted mb-0">${message}</p>
          </div>
        </div>
      </div>
    `;
  }

  function renderFocusAreas() {
    if (!focusAreasGrid) return;

    const visible = focusAreasState.filter((item) => item.active !== false);

    if (visible.length === 0) {
      focusAreasGrid.innerHTML = renderEmptyCard(
        "No focus areas yet",
        "Add the first focus area to start building the public About page."
      );
      return;
    }

    focusAreasGrid.innerHTML = visible
      .map((item) => `
        <div class="col-12 col-md-6 col-xl-3">
          <div class="card border-0 shadow-sm h-100">
            <div class="card-body p-4">
              <div class="d-flex align-items-start justify-content-between mb-3">
                <div class="feature-icon flex-shrink-0">
                  ${iconMarkup(item.icon || "bi-heart-pulse")}
                </div>
                <span class="badge ${item.badgeColor || "bg-primary"}">${item.title || "Focus Area"}</span>
              </div>

              <p class="text-muted small mb-2">Order: ${item.displayOrder ?? "-"}</p>
              <p class="mb-3">${item.description || ""}</p>

              <div class="d-flex gap-2">
                <button type="button" class="btn btn-outline-primary btn-sm js-edit-focus" data-id="${item.id}">Edit</button>
                <button type="button" class="btn btn-outline-danger btn-sm js-delete-focus" data-id="${item.id}">Delete</button>
              </div>
            </div>
          </div>
        </div>
      `)
      .join("");

    bindFocusActions();
  }

  function renderServices() {
    if (!servicesGrid) return;

    const visible = servicesState.filter((item) => item.active !== false);

    if (visible.length === 0) {
      servicesGrid.innerHTML = renderEmptyCard(
        "No service cards yet",
        "Add the first service card to start building the What We Do section."
      );
      return;
    }

    servicesGrid.innerHTML = visible
      .map((item) => `
        <div class="col-12 col-md-6 col-xl-3">
          <div class="card border-0 shadow-sm h-100">
            <div class="card-body p-4 text-center">
              <div class="feature-icon mb-3">
                ${iconMarkup(item.icon || "bi-grid-1x2")}
              </div>
              <h5 class="fw-bold mb-2">${item.title || "Service"}</h5>
              <p class="text-muted small mb-2">Order: ${item.displayOrder ?? "-"}</p>
              <p class="text-muted mb-3">${item.description || ""}</p>

              <div class="d-flex gap-2 justify-content-center">
                <button type="button" class="btn btn-outline-primary btn-sm js-edit-service" data-id="${item.id}">Edit</button>
                <button type="button" class="btn btn-outline-danger btn-sm js-delete-service" data-id="${item.id}">Delete</button>
              </div>
            </div>
          </div>
        </div>
      `)
      .join("");

    bindServiceActions();
  }

function getInitial(name = "") {
  const clean = String(name).trim();
  return clean ? clean.charAt(0).toUpperCase() : "?";
}

function hasUsableImage(url = "") {
  const u = String(url).trim();
  return (
    u.startsWith("data:image/") ||
    /^https?:\/\//i.test(u) ||
    u.startsWith("blob:")
  );
}

function renderTeamAvatar(item) {
  const name = item.name || "Team Member";
  const imageUrl = String(item.imageUrl || "").trim();
  const initial = getInitial(name);

  if (hasUsableImage(imageUrl)) {
    return `
      <div class="team-avatar" style="width: 120px; height: 120px; margin: 0 auto 1rem;">
        <img
          src="${imageUrl}"
          alt="${name}"
          onerror="this.closest('.team-avatar').innerHTML='<span class=&quot;team-avatar-fallback&quot; style=&quot;font-size: 2.6rem;&quot;>${initial}</span>';">
      </div>
    `;
  }

  return `
    <div class="team-avatar team-avatar-fallback" style="width: 120px; height: 120px; margin: 0 auto 1rem;" aria-label="${name}">
      <span style="font-size: 2.6rem;">${initial}</span>
    </div>
  `;
}

function renderTeam() {
  if (!teamGrid) return;

  const visible = teamState.filter((item) => item.active !== false);

  if (visible.length === 0) {
    teamGrid.innerHTML = renderEmptyCard(
      "No team members yet",
      "Add the first person involved and upload their photo from the admin panel."
    );
    return;
  }

  teamGrid.innerHTML = visible
    .map((item) => `
      <div class="col-12 col-md-6 col-lg-4">
        <div class="card border-0 shadow-sm h-100 about-team-card">
          <div class="card-body p-4 text-center">
            ${renderTeamAvatar(item)}

            <h5 class="fw-bold mb-1">${item.name || "Name Here"}</h5>
            <p class="text-muted mb-0">${item.designation || "Designation Here"}</p>

            <p class="text-muted small mt-3 mb-3">${item.bio || ""}</p>

            <div class="d-flex gap-2 justify-content-center">
              <button type="button" class="btn btn-outline-primary btn-sm js-edit-team" data-id="${item.id}">Edit</button>
              <button type="button" class="btn btn-outline-danger btn-sm js-delete-team" data-id="${item.id}">Delete</button>
            </div>
          </div>
        </div>
      </div>
    `)
    .join("");

  bindTeamActions();
}

  function populateHeroForm(data) {
    heroTaglineInput.value = data.tagline || "";
    heroTitleInput.value = data.title || "";
    heroDescriptionInput.value = data.description || "";
    heroImageInput.value = data.heroImageUrl || "";
  }

  function populateContentForm(data) {
    missionTitleInput.value = data.missionTitle || "";
    missionTextInput.value = data.missionText || "";
    visionTitleInput.value = data.visionTitle || "";
    visionTextInput.value = data.visionText || "";
  }

  async function seedDefaultsIfNeeded() {
    const heroSnap = await getDoc(doc(db, "about_hero", "main"));
    if (!heroSnap.exists()) {
      await setDoc(doc(db, "about_hero", "main"), DEFAULT_HERO);
    }

    const contentSnap = await getDoc(doc(db, "about_content", "main"));
    if (!contentSnap.exists()) {
      await setDoc(doc(db, "about_content", "main"), DEFAULT_CONTENT);
    }

    const focusSnap = await getDocs(collection(db, "about_focus_areas"));
    if (focusSnap.empty) {
      await Promise.all(DEFAULT_FOCUS_AREAS.map((item) => {
        const { id, ...data } = item;
        return setDoc(doc(db, "about_focus_areas", id), { ...data, createdAt: serverTimestamp(), updatedAt: serverTimestamp() });
      }));
    }

    const servicesSnap = await getDocs(collection(db, "about_services"));
    if (servicesSnap.empty) {
      await Promise.all(DEFAULT_SERVICES.map((item) => {
        const { id, ...data } = item;
        return setDoc(doc(db, "about_services", id), { ...data, createdAt: serverTimestamp(), updatedAt: serverTimestamp() });
      }));
    }

    const teamSnap = await getDocs(collection(db, "about_team"));
    if (teamSnap.empty) {
      await Promise.all(DEFAULT_TEAM.map((item) => {
        const { id, ...data } = item;
        return setDoc(doc(db, "about_team", id), { ...data, createdAt: serverTimestamp(), updatedAt: serverTimestamp() });
      }));
    }
  }

  function resetFocusForm() {
    focusAreaDocId.value = "";
    focusAreaForm.reset();
    focusAreaStatusInput.value = "true";
    focusAreaBadgeColorInput.value = "bg-primary";
    focusAreaOrderInput.value = "1";
  }

  function resetServiceForm() {
    serviceDocId.value = "";
    serviceForm.reset();
    serviceStatusInput.value = "true";
    serviceOrderInput.value = "1";
  }

  function resetTeamForm() {
    teamDocId.value = "";
    teamExistingImageUrl.value = "";
    teamForm.reset();
    teamStatusInput.value = "true";
    teamOrderInput.value = "1";
    selectedTeamImageData = "";
    if (teamImagePreview) {
      teamImagePreview.src = PLACEHOLDER_IMAGE;
    }
  }

  function openFocusModal(item = null) {
    resetFocusForm();

    if (item) {
      focusAreaModalLabel.textContent = "Edit Focus Area";
      focusAreaDocId.value = item.id;
      focusAreaTitleInput.value = item.title || "";
      focusAreaDescriptionInput.value = item.description || "";
      focusAreaIconInput.value = item.icon || "bi-heart-pulse";
      focusAreaBadgeColorInput.value = item.badgeColor || "bg-primary";
      focusAreaOrderInput.value = item.displayOrder ?? 1;
      focusAreaStatusInput.value = item.active === false ? "false" : "true";
    } else {
      focusAreaModalLabel.textContent = "Add Focus Area";
    }

    focusAreaModal.show();
  }

  function openServiceModal(item = null) {
    resetServiceForm();

    if (item) {
      serviceModalLabel.textContent = "Edit Service Card";
      serviceDocId.value = item.id;
      serviceTitleInput.value = item.title || "";
      serviceDescriptionInput.value = item.description || "";
      serviceIconInput.value = item.icon || "bi-grid-1x2";
      serviceOrderInput.value = item.displayOrder ?? 1;
      serviceStatusInput.value = item.active === false ? "false" : "true";
    } else {
      serviceModalLabel.textContent = "Add Service Card";
    }

    serviceModal.show();
  }

  function openTeamModal(item = null) {
    resetTeamForm();

    if (item) {
      teamModalLabel.textContent = "Edit Team Member";
      teamDocId.value = item.id;
      teamNameInput.value = item.name || "";
      teamDesignationInput.value = item.designation || "";
      teamBioInput.value = item.bio || "";
      teamLinkedInInput.value = item.linkedin || "";
      teamOrderInput.value = item.displayOrder ?? 1;
      teamStatusInput.value = item.active === false ? "false" : "true";
      teamExistingImageUrl.value = item.imageUrl || "";
      const imageSrc =
        item?.imageUrl?.trim()
            ? item.imageUrl
            : PLACEHOLDER_IMAGE;

    if (teamImagePreview) {
    teamImagePreview.src = imageSrc;
    }
    } else {
      teamModalLabel.textContent = "Add Team Member";
      if (teamImagePreview) {
        teamImagePreview.src = PLACEHOLDER_IMAGE;
      }
    }

    teamModal.show();
  }

  function bindFocusActions() {
    document.querySelectorAll(".js-edit-focus").forEach((btn) => {
      btn.addEventListener("click", () => {
        const item = focusAreasState.find((x) => x.id === btn.getAttribute("data-id"));
        if (item) openFocusModal(item);
      });
    });

    document.querySelectorAll(".js-delete-focus").forEach((btn) => {
      btn.addEventListener("click", async () => {
        const id = btn.getAttribute("data-id");
        if (!confirm("Delete this focus area?")) return;
        try {
          await deleteDoc(doc(db, "about_focus_areas", id));
        } catch (error) {
          console.error("Delete focus area error:", error);
          alert("Could not delete the focus area.");
        }
      });
    });
  }

  function bindServiceActions() {
    document.querySelectorAll(".js-edit-service").forEach((btn) => {
      btn.addEventListener("click", () => {
        const item = servicesState.find((x) => x.id === btn.getAttribute("data-id"));
        if (item) openServiceModal(item);
      });
    });

    document.querySelectorAll(".js-delete-service").forEach((btn) => {
      btn.addEventListener("click", async () => {
        const id = btn.getAttribute("data-id");
        if (!confirm("Delete this service card?")) return;
        try {
          await deleteDoc(doc(db, "about_services", id));
        } catch (error) {
          console.error("Delete service error:", error);
          alert("Could not delete the service card.");
        }
      });
    });
  }

  function bindTeamActions() {
    document.querySelectorAll(".js-edit-team").forEach((btn) => {
      btn.addEventListener("click", () => {
        const item = teamState.find((x) => x.id === btn.getAttribute("data-id"));
        if (item) openTeamModal(item);
      });
    });

    document.querySelectorAll(".js-delete-team").forEach((btn) => {
      btn.addEventListener("click", async () => {
        const id = btn.getAttribute("data-id");
        if (!confirm("Delete this team member?")) return;
        try {
          await deleteDoc(doc(db, "about_team", id));
        } catch (error) {
          console.error("Delete team member error:", error);
          alert("Could not delete the team member.");
        }
      });
    });
  }

  async function readFileAsDataUrl(file) {
    return new Promise((resolve, reject) => {
      const reader = new FileReader();
      reader.onload = () => resolve(String(reader.result));
      reader.onerror = reject;
      reader.readAsDataURL(file);
    });
  }

  heroForm.addEventListener("submit", async (e) => {
    e.preventDefault();

    const payload = {
      tagline: heroTaglineInput.value.trim(),
      title: heroTitleInput.value.trim(),
      description: heroDescriptionInput.value.trim(),
      heroImageUrl: heroImageInput.value.trim(),
      updatedAt: serverTimestamp()
    };

    try {
      await setDoc(doc(db, "about_hero", "main"), payload, { merge: true });
      heroLoaded = true;
      setHeroStatus();
      alert("Hero content saved.");
    } catch (error) {
      console.error("Save hero error:", error);
      alert("Could not save hero content.");
    }
  });

  contentForm.addEventListener("submit", async (e) => {
    e.preventDefault();

    const payload = {
      missionTitle: missionTitleInput.value.trim(),
      missionText: missionTextInput.value.trim(),
      visionTitle: visionTitleInput.value.trim(),
      visionText: visionTextInput.value.trim(),
      updatedAt: serverTimestamp()
    };

    try {
      await setDoc(doc(db, "about_content", "main"), payload, { merge: true });
      contentLoaded = true;
      alert("Mission and vision saved.");
    } catch (error) {
      console.error("Save content error:", error);
      alert("Could not save mission and vision.");
    }
  });

  focusAreaForm.addEventListener("submit", async (e) => {
    e.preventDefault();

    const payload = {
      title: focusAreaTitleInput.value.trim(),
      description: focusAreaDescriptionInput.value.trim(),
      icon: focusAreaIconInput.value.trim(),
      badgeColor: focusAreaBadgeColorInput.value.trim(),
      displayOrder: Number(focusAreaOrderInput.value),
      active: focusAreaStatusInput.value === "true",
      updatedAt: serverTimestamp()
    };

    try {
      if (focusAreaDocId.value) {
        await updateDoc(doc(db, "about_focus_areas", focusAreaDocId.value), payload);
      } else {
        payload.createdAt = serverTimestamp();
        await addDoc(collection(db, "about_focus_areas"), payload);
      }
      focusAreaModal.hide();
    } catch (error) {
      console.error("Save focus area error:", error);
      alert("Could not save the focus area.");
    }
  });

  serviceForm.addEventListener("submit", async (e) => {
    e.preventDefault();

    const payload = {
      title: serviceTitleInput.value.trim(),
      description: serviceDescriptionInput.value.trim(),
      icon: serviceIconInput.value.trim(),
      displayOrder: Number(serviceOrderInput.value),
      active: serviceStatusInput.value === "true",
      updatedAt: serverTimestamp()
    };

    try {
      if (serviceDocId.value) {
        await updateDoc(doc(db, "about_services", serviceDocId.value), payload);
      } else {
        payload.createdAt = serverTimestamp();
        await addDoc(collection(db, "about_services"), payload);
      }
      serviceModal.hide();
    } catch (error) {
      console.error("Save service error:", error);
      alert("Could not save the service card.");
    }
  });

  teamImageInput.addEventListener("change", async () => {
    const file = teamImageInput.files && teamImageInput.files[0];
    if (!file) return;

    if (file.size > 800 * 1024) {
      alert("Please choose an image smaller than 800 KB.");
      teamImageInput.value = "";
      selectedTeamImageData = "";
      if (teamImagePreview) teamImagePreview.src = teamExistingImageUrl.value || PLACEHOLDER_IMAGE;
      return;
    }

    try {
      const dataUrl = await readFileAsDataUrl(file);
      selectedTeamImageData = dataUrl;
      if (teamImagePreview) teamImagePreview.src = dataUrl;
    } catch (error) {
      console.error("Image read error:", error);
      alert("Could not read the image file.");
    }
  });

  teamForm.addEventListener("submit", async (e) => {
    e.preventDefault();

    const imageUrl =
      selectedTeamImageData ||
      teamExistingImageUrl.value.trim() ||
      PLACEHOLDER_IMAGE;

    const payload = {
      name: teamNameInput.value.trim(),
      designation: teamDesignationInput.value.trim(),
      bio: teamBioInput.value.trim(),
      linkedin: teamLinkedInInput.value.trim(),
      imageUrl,
      displayOrder: Number(teamOrderInput.value),
      active: teamStatusInput.value === "true",
      updatedAt: serverTimestamp()
    };

    try {
      if (teamDocId.value) {
        await updateDoc(doc(db, "about_team", teamDocId.value), payload);
      } else {
        payload.createdAt = serverTimestamp();
        await addDoc(collection(db, "about_team"), payload);
      }
      teamModal.hide();
    } catch (error) {
      console.error("Save team error:", error);
      alert("Could not save the team member.");
    }
  });

  openAddFocusAreaModal.addEventListener("click", () => openFocusModal());
  openAddServiceModal.addEventListener("click", () => openServiceModal());
  openAddTeamModal.addEventListener("click", () => openTeamModal());

  document.getElementById("focusAreaModal").addEventListener("hidden.bs.modal", resetFocusForm);
  document.getElementById("serviceModal").addEventListener("hidden.bs.modal", resetServiceForm);
  document.getElementById("teamModal").addEventListener("hidden.bs.modal", resetTeamForm);

  await seedDefaultsIfNeeded();

  onSnapshot(doc(db, "about_hero", "main"), (snap) => {
    const data = snap.exists() ? { ...DEFAULT_HERO, ...snap.data() } : DEFAULT_HERO;
    heroLoaded = snap.exists();
    setHeroStatus();
    populateHeroForm(data);
  });

  onSnapshot(doc(db, "about_content", "main"), (snap) => {
    const data = snap.exists() ? { ...DEFAULT_CONTENT, ...snap.data() } : DEFAULT_CONTENT;
    contentLoaded = snap.exists();
    populateContentForm(data);
  });

  onSnapshot(query(collection(db, "about_focus_areas"), orderBy("displayOrder", "asc")), (snapshot) => {
    focusAreasState = snapshot.docs.map((docSnap) => ({ id: docSnap.id, ...docSnap.data() }));
    renderFocusAreas();
    renderStats();
  });

  onSnapshot(query(collection(db, "about_services"), orderBy("displayOrder", "asc")), (snapshot) => {
    servicesState = snapshot.docs.map((docSnap) => ({ id: docSnap.id, ...docSnap.data() }));
    renderServices();
    renderStats();
  });

  onSnapshot(query(collection(db, "about_team"), orderBy("displayOrder", "asc")), (snapshot) => {
    teamState = snapshot.docs.map((docSnap) => ({ id: docSnap.id, ...docSnap.data() }));
    renderTeam();
    renderStats();
  });
});