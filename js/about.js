import { db } from "./firebase-config.js";
import {
  doc,
  collection,
  query,
  orderBy,
  onSnapshot
} from "https://www.gstatic.com/firebasejs/10.13.2/firebase-firestore.js";

const FALLBACK_HERO = {
  tagline: "About CWF Labs",
  title: "Who we are and what we do",
  description:
    "CWF Labs is a community-focused healthcare platform created to make lab services, doctor access, and health support easier for rural and underserved communities.",
  heroImageUrl:
    "https://images.unsplash.com/photo-1584515933487-779824d29309?q=80&w=1200&auto=format&fit=crop"
};

const FALLBACK_CONTENT = {
  missionTitle: "Our Mission",
  missionText:
    "To provide accessible, affordable, and community-driven healthcare services while supporting social inclusion, awareness, and development across our focus areas.",
  visionTitle: "Our Vision",
  visionText:
    "To become a trusted digital healthcare and community support platform that improves quality of life for people in rural and underserved regions."
};

const FALLBACK_FOCUS_AREAS = [
  {
    title: "Disability",
    description: "Supporting inclusive opportunities and accessibility.",
    icon: "bi-universal-access-circle",
    badgeColor: "bg-primary"
  },
  {
    title: "Gender",
    description: "Promoting equality, dignity, and empowerment.",
    icon: "bi-people",
    badgeColor: "bg-success"
  },
  {
    title: "Education",
    description: "Enabling learning and awareness for communities.",
    icon: "bi-book",
    badgeColor: "bg-warning text-dark"
  },
  {
    title: "Healthcare",
    description: "Making healthcare services easier to access.",
    icon: "bi-heart-pulse",
    badgeColor: "bg-danger"
  }
];

const FALLBACK_SERVICES = [
  {
    title: "Lab Test Booking",
    description: "Easy booking for healthcare tests through WhatsApp or call.",
    icon: "bi-clipboard2-pulse"
  },
  {
    title: "Health Packages",
    description: "Affordable packages with clear pricing and booking access.",
    icon: "bi-bag-heart"
  },
  {
    title: "Doctor Consultations",
    description: "Connect users with doctors based on speciality and need.",
    icon: "bi-person-badge"
  },
  {
    title: "Community Updates",
    description: "News, FAQs, services, and support information in one place.",
    icon: "bi-megaphone"
  }
];

const FALLBACK_TEAM = [
  {
    name: "Name Here",
    designation: "Designation Here",
    bio: "This team card can be edited from the admin panel with an uploaded image.",
    imageUrl: "https://via.placeholder.com/600x400?text=Team+Member"
  },
  {
    name: "Name Here",
    designation: "Designation Here",
    bio: "This team card can be edited from the admin panel with an uploaded image.",
    imageUrl: "https://via.placeholder.com/600x400?text=Team+Member"
  },
  {
    name: "Name Here",
    designation: "Designation Here",
    bio: "This team card can be edited from the admin panel with an uploaded image.",
    imageUrl: "https://via.placeholder.com/600x400?text=Team+Member"
  }
];

document.addEventListener("DOMContentLoaded", () => {
  const heroTagline = document.getElementById("heroTagline");
  const heroTitle = document.getElementById("heroTitle");
  const heroDescription = document.getElementById("heroDescription");
  const heroImage = document.getElementById("heroImage");
  const heroFocusAreas = document.getElementById("heroFocusAreas");

  const focusAreasGrid = document.getElementById("focusAreasGrid");
  const missionTitle = document.getElementById("missionTitle");
  const missionText = document.getElementById("missionText");
  const visionTitle = document.getElementById("visionTitle");
  const visionText = document.getElementById("visionText");
  const servicesGrid = document.getElementById("servicesGrid");
  const teamGrid = document.getElementById("teamGrid");

  let focusAreasState = [...FALLBACK_FOCUS_AREAS];
  let servicesState = [...FALLBACK_SERVICES];
  let teamState = [...FALLBACK_TEAM];

  function normalize(value = "") {
    return String(value).toLowerCase().trim();
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

  function renderHero(data) {
    if (heroTagline) heroTagline.textContent = data.tagline || FALLBACK_HERO.tagline;
    if (heroTitle) heroTitle.textContent = data.title || FALLBACK_HERO.title;
    if (heroDescription) heroDescription.textContent = data.description || FALLBACK_HERO.description;
    if (heroImage) {
      heroImage.src = data.heroImageUrl || FALLBACK_HERO.heroImageUrl;
      heroImage.alt = data.title || "About CWF Labs";
    }
  }

  function renderHeroChips(items) {
    if (!heroFocusAreas) return;

    const chips = (items.length ? items : FALLBACK_FOCUS_AREAS)
      .slice(0, 4)
      .map((item) => {
        const color = item.badgeColor || "bg-primary";
        return `
          <span class="badge ${color} about-chip">
            ${item.title || "Focus Area"}
          </span>
        `;
      })
      .join("");

    heroFocusAreas.innerHTML = chips;
  }

  function renderFocusAreas(items) {
    if (!focusAreasGrid) return;

    const visible = items.length ? items.filter((item) => item.active !== false) : FALLBACK_FOCUS_AREAS;

    focusAreasGrid.innerHTML = visible
      .map((item) => {
        return `
          <div class="col-12 col-md-6 col-lg-3">
            <div class="card h-100 border-0 shadow-sm about-elevated-card">
              <div class="card-body text-center p-4">
                <div class="feature-icon mb-3">
                  ${iconMarkup(item.icon || "bi-heart-pulse")}
                </div>
                <h5 class="fw-bold">${item.title || "Focus Area"}</h5>
                <p class="text-muted mb-0">
                  ${item.description || ""}
                </p>
              </div>
            </div>
          </div>
        `;
      })
      .join("");

    renderHeroChips(visible);
  }

  function renderMissionVision(data) {
    if (missionTitle) missionTitle.textContent = data.missionTitle || FALLBACK_CONTENT.missionTitle;
    if (missionText) missionText.textContent = data.missionText || FALLBACK_CONTENT.missionText;
    if (visionTitle) visionTitle.textContent = data.visionTitle || FALLBACK_CONTENT.visionTitle;
    if (visionText) visionText.textContent = data.visionText || FALLBACK_CONTENT.visionText;
  }

  function renderServices(items) {
    if (!servicesGrid) return;

    const visible = items.length ? items.filter((item) => item.active !== false) : FALLBACK_SERVICES;

    servicesGrid.innerHTML = visible
      .map((item) => {
        return `
          <div class="col-12 col-md-6 col-lg-3">
            <div class="card h-100 border-0 shadow-sm about-elevated-card">
              <div class="card-body text-center p-4">
                <div class="feature-icon mb-3">
                  ${iconMarkup(item.icon || "bi-grid-1x2")}
                </div>
                <h5 class="fw-bold">${item.title || "Service"}</h5>
                <p class="text-muted mb-0">
                  ${item.description || ""}
                </p>
              </div>
            </div>
          </div>
        `;
      })
      .join("");
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
      <div class="team-avatar">
        <img
          src="${imageUrl}"
          alt="${name}"
          onerror="this.closest('.team-avatar').innerHTML='<span class=&quot;team-avatar-fallback&quot;>${initial}</span>';">
      </div>
    `;
  }

  return `
    <div class="team-avatar team-avatar-fallback" aria-label="${name}">
      <span>${initial}</span>
    </div>
  `;
}

function renderTeam(items) {
  if (!teamGrid) return;

  const visible = items.length
    ? items.filter((item) => item.active !== false)
    : FALLBACK_TEAM;

  teamGrid.innerHTML = visible
    .map((item) => {
      const linkedin = (item.linkedin || "").trim();

      return `
        <div class="col-12 col-md-6 col-lg-4">
          <div class="card border-0 shadow-sm about-team-card h-100">
            <div class="card-body p-4">
              ${renderTeamAvatar(item)}

              <div class="text-center">
                <div class="d-flex justify-content-between align-items-start gap-2 mb-2">
                  <div class="text-start flex-grow-1">
                    <h5 class="fw-bold mb-1">${item.name || "Name Here"}</h5>
                    <p class="text-muted mb-0">${item.designation || "Designation Here"}</p>
                  </div>
                  <span class="badge bg-primary">Order ${item.displayOrder ?? "-"}</span>
                </div>

                <p class="text-muted mb-3 about-bio">
                  ${item.bio || ""}
                </p>

                ${
                  linkedin
                    ? `
                      <a
                        href="${linkedin}"
                        target="_blank"
                        rel="noopener noreferrer"
                        class="btn btn-outline-primary btn-sm">
                        <i class="bi bi-linkedin me-1"></i>
                        View Profile
                      </a>
                    `
                    : ""
                }
              </div>
            </div>
          </div>
        </div>
      `;
    })
    .join("");
}

  function watchHero() {
    onSnapshot(doc(db, "about_hero", "main"), (snap) => {
      const data = snap.exists() ? { ...FALLBACK_HERO, ...snap.data() } : FALLBACK_HERO;
      renderHero(data);
    });
  }

  function watchContent() {
    onSnapshot(doc(db, "about_content", "main"), (snap) => {
      const data = snap.exists() ? { ...FALLBACK_CONTENT, ...snap.data() } : FALLBACK_CONTENT;
      renderMissionVision(data);
    });
  }

  function watchFocusAreas() {
    const q = query(collection(db, "about_focus_areas"), orderBy("displayOrder", "asc"));
    onSnapshot(q, (snapshot) => {
      focusAreasState = snapshot.docs.map((docSnap) => ({
        id: docSnap.id,
        ...docSnap.data()
      }));
      renderFocusAreas(focusAreasState);
    });
  }

  function watchServices() {
    const q = query(collection(db, "about_services"), orderBy("displayOrder", "asc"));
    onSnapshot(q, (snapshot) => {
      servicesState = snapshot.docs.map((docSnap) => ({
        id: docSnap.id,
        ...docSnap.data()
      }));
      renderServices(servicesState);
    });
  }

  function watchTeam() {
    const q = query(collection(db, "about_team"), orderBy("displayOrder", "asc"));
    onSnapshot(q, (snapshot) => {
      teamState = snapshot.docs.map((docSnap) => ({
        id: docSnap.id,
        ...docSnap.data()
      }));
      renderTeam(teamState);
    });
  }

  watchHero();
  watchContent();
  watchFocusAreas();
  watchServices();
  watchTeam();
});