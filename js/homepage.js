import { db } from "./firebase-config.js";
import {
  doc,
  getDoc,
  collection,
  query,
  orderBy,
  onSnapshot
} from "https://www.gstatic.com/firebasejs/10.13.2/firebase-firestore.js";

const DEFAULT_HERO = {
  tagline: "Healthcare for Everyone",
  title: "CWF Labs – Accessible Healthcare for Rural Communities",
  description: "Book tests, explore health packages, consult doctors, and access healthcare support from anywhere.",
  primaryButtonText: "Book a Test",
  primaryButtonLink: "tests.html",
  secondaryButtonText: "View Packages",
  secondaryButtonLink: "packages.html",
  backgroundImage: "https://images.unsplash.com/photo-1584515933487-779824d29309?q=80&w=1400&auto=format&fit=crop",
  active: true
};

const DEFAULT_FEATURES = [
  {
    id: "disability",
    title: "Disability",
    description: "Supporting inclusive opportunities and accessibility.",
    icon: "bi-universal-access-circle",
    displayOrder: 1,
    active: true
  },
  {
    id: "gender",
    title: "Gender",
    description: "Promoting equality, dignity, and empowerment.",
    icon: "bi-people",
    displayOrder: 2,
    active: true
  },
  {
    id: "education",
    title: "Education",
    description: "Enabling learning and awareness for communities.",
    icon: "bi-book",
    displayOrder: 3,
    active: true
  },
  {
    id: "healthcare",
    title: "Healthcare",
    description: "Making healthcare services easier to access.",
    icon: "bi-heart-pulse",
    displayOrder: 4,
    active: true
  }
];

const DEFAULT_WHY_CHOOSE_US = [
  {
    title: "Affordable Healthcare",
    description:
      "Quality healthcare services at community-friendly prices.",
    icon: "bi-cash-coin",
    displayOrder: 1,
    active: true
  },
  {
    title: "Expert Professionals",
    description:
      "Experienced doctors and healthcare specialists.",
    icon: "bi-person-badge",
    displayOrder: 2,
    active: true
  },
  {
    title: "Fast Reports",
    description:
      "Timely diagnostics and report delivery.",
    icon: "bi-lightning",
    displayOrder: 3,
    active: true
  },
  {
    title: "Trusted Service",
    description:
      "Serving communities with reliability and care.",
    icon: "bi-shield-check",
    displayOrder: 4,
    active: true
  }
];

const DEFAULT_NEWS = [
  {
    id: "news_disability",
    category: "Disability",
    title: "News Heading 1",
    description: "Placeholder content for disability-related updates.",
    badgeClass: "bg-primary",
    displayOrder: 1,
    active: true
  },
  {
    id: "news_gender",
    category: "Gender",
    title: "News Heading 2",
    description: "Placeholder content for gender-related updates.",
    badgeClass: "bg-success",
    displayOrder: 2,
    active: true
  },
  {
    id: "news_education",
    category: "Education",
    title: "News Heading 3",
    description: "Placeholder content for education-related updates.",
    badgeClass: "bg-warning text-dark",
    displayOrder: 3,
    active: true
  },
  {
    id: "news_healthcare",
    category: "Healthcare",
    title: "News Heading 4",
    description: "Placeholder content for healthcare-related updates.",
    badgeClass: "bg-danger",
    displayOrder: 4,
    active: true
  }
];

const DEFAULT_CONTACT = {
  cardTitle: "Contact Us",
  cardDescription: "Reach us for customer support, consultation requests, lab location details, and sample collection information.",
  address: "Address goes here",
  phone: "Phone number goes here",
  email: "Email address goes here",
  active: true
};

const DEFAULT_LINKS = [
  {
    id: "about_us",
    title: "About Us",
    url: "about.html",
    icon: "bi-building",
    displayOrder: 1,
    active: true
  },
  {
    id: "blogs",
    title: "Blogs",
    url: "#",
    icon: "bi-journal-text",
    displayOrder: 2,
    active: true
  },
  {
    id: "research",
    title: "Research",
    url: "#",
    icon: "bi-search",
    displayOrder: 3,
    active: true
  },
  {
    id: "partners",
    title: "Our Partners",
    url: "#",
    icon: "bi-people-fill",
    displayOrder: 4,
    active: true
  },
  {
    id: "contact_us",
    title: "Contact Us",
    url: "contact.html",
    icon: "bi-chat-dots",
    displayOrder: 5,
    active: true
  }
];

document.addEventListener("DOMContentLoaded", () => {
  const heroSection = document.getElementById("homepageHeroSection");
  const heroTagline = document.getElementById("heroTagline");
  const heroTitle = document.getElementById("heroTitle");
  const heroDescription = document.getElementById("heroDescription");
  const heroPrimaryBtn = document.getElementById("heroPrimaryBtn");
  const heroSecondaryBtn = document.getElementById("heroSecondaryBtn");

  const featuresGrid = document.getElementById("homepageFeaturesGrid");
  const whyChooseGrid =
document.getElementById("homepageWhyChooseGrid");
  const newsGrid = document.getElementById("homepageNewsGrid");
  const contactCardTitle = document.getElementById("homeContactCardTitle");
  const contactCardDescription = document.getElementById("homeContactCardDescription");
  const contactAddress = document.getElementById("homeContactAddress");
  const contactPhone = document.getElementById("homeContactPhone");
  const contactEmail = document.getElementById("homeContactEmail");
  const linksGrid = document.getElementById("homepageLinksGrid");

  function normalize(value = "") {
    return value.toLowerCase().trim();
  }

  function setHeroBackground(url) {
    if (!heroSection) return;

    const bg = url || DEFAULT_HERO.backgroundImage;
    heroSection.style.background = `linear-gradient(rgba(0, 0, 0, 0.65), rgba(0, 0, 0, 0.65)), url("${bg}") center/cover no-repeat`;
  }

  function renderHero(data) {
    const hero = { ...DEFAULT_HERO, ...(data || {}) };

    if (heroSection) {
      setHeroBackground(hero.backgroundImage);
    }

    if (heroTagline) heroTagline.textContent = hero.tagline || DEFAULT_HERO.tagline;
    if (heroTitle) heroTitle.textContent = hero.title || DEFAULT_HERO.title;
    if (heroDescription) heroDescription.textContent = hero.description || DEFAULT_HERO.description;

    if (heroPrimaryBtn) {
      heroPrimaryBtn.textContent = hero.primaryButtonText || DEFAULT_HERO.primaryButtonText;
      heroPrimaryBtn.href = hero.primaryButtonLink || DEFAULT_HERO.primaryButtonLink;
      heroPrimaryBtn.classList.toggle("d-none", hero.active === false);
    }

    if (heroSecondaryBtn) {
      heroSecondaryBtn.textContent = hero.secondaryButtonText || DEFAULT_HERO.secondaryButtonText;
      heroSecondaryBtn.href = hero.secondaryButtonLink || DEFAULT_HERO.secondaryButtonLink;
      heroSecondaryBtn.classList.toggle("d-none", hero.active === false);
    }
  }

  function renderFeatures(items) {
    if (!featuresGrid) return;

    const activeItems = items.filter((item) => item.active !== false);
    const list = activeItems.length ? activeItems : DEFAULT_FEATURES;
    const DEFAULT_WHY_CHOOSE_US = [
  {
    title: "Affordable Healthcare",
    description: "Quality healthcare services at community-friendly prices.",
    icon: "bi-cash-coin",
    displayOrder: 1,
    active: true
  },
  {
    title: "Expert Professionals",
    description: "Experienced doctors and healthcare specialists.",
    icon: "bi-person-badge",
    displayOrder: 2,
    active: true
  },
  {
    title: "Fast Reports",
    description: "Timely diagnostics and report delivery.",
    icon: "bi-lightning-charge",
    displayOrder: 3,
    active: true
  },
  {
    title: "Trusted Service",
    description: "Serving communities with reliability and care.",
    icon: "bi-shield-check",
    displayOrder: 4,
    active: true
  }
];

    featuresGrid.innerHTML = list
      .sort((a, b) => Number(a.displayOrder || 999) - Number(b.displayOrder || 999))
      .map((item) => `
        <div class="col-12 col-md-6 col-lg-3">
          <div class="card feature-card h-100 border-0 shadow-sm">
            <div class="card-body text-center p-4">
              <div class="feature-icon mb-3">
                <i class="bi ${item.icon || "bi-heart-pulse"}"></i>
              </div>
              <h5 class="fw-bold">${item.title || ""}</h5>
              <p class="text-muted mb-0">${item.description || ""}</p>
            </div>
          </div>
        </div>
      `)
      .join("");
  }

  function renderWhyChooseCards(items) {
  if (!whyChooseGrid) return;

  const activeItems = items.filter((item) => item.active !== false);

  whyChooseGrid.innerHTML = activeItems
    .sort(
      (a, b) =>
        Number(a.displayOrder || 999) -
        Number(b.displayOrder || 999)
    )
    .map(
      (item) => `
      <div class="col-12 col-md-6 col-lg-3">
        <div class="card feature-card h-100 border-0 shadow-sm">
          <div class="card-body text-center p-4">

            <div class="feature-icon mb-3">
              <i class="bi ${item.icon || "bi-star"}"></i>
            </div>

            <h5 class="fw-bold">
              ${item.title || ""}
            </h5>

            <p class="text-muted mb-0">
              ${item.description || ""}
            </p>

          </div>
        </div>
      </div>
    `
    )
    .join("");
}

  function renderWhyChooseUs(items) {

  if (!whyChooseGrid) return;

  const activeItems =
    items.filter((item) => item.active !== false);

  const list =
    activeItems.length
      ? activeItems
      : DEFAULT_WHY_CHOOSE_US;

  whyChooseGrid.innerHTML = list
    .sort(
      (a, b) =>
        Number(a.displayOrder || 999) -
        Number(b.displayOrder || 999)
    )
    .map(
      (item) => `
      <div class="col-12 col-md-6 col-lg-3">

        <div class="card feature-card h-100 border-0 shadow-sm">

          <div class="card-body text-center p-4">

            <div class="feature-icon mb-3">
              <i class="bi ${item.icon || "bi-star"}"></i>
            </div>

            <h5 class="fw-bold">
              ${item.title || ""}
            </h5>

            <p class="text-muted mb-0">
              ${item.description || ""}
            </p>

          </div>

        </div>

      </div>
    `
    )
    .join("");
}

  function badgeClassForCategory(category = "") {
    const value = normalize(category);
    if (value === "disability") return "bg-primary";
    if (value === "gender") return "bg-success";
    if (value === "education") return "bg-warning text-dark";
    if (value === "healthcare") return "bg-danger";
    return "bg-secondary";
  }

  function renderNews(items) {
    if (!newsGrid) return;

    const activeItems = items.filter((item) => item.active !== false);

    const categories = ["Disability", "Gender", "Education", "Healthcare"];
    const selectedItems = categories.map((category) => {
      const matches = activeItems
        .filter((item) => normalize(item.category) === normalize(category))
        .sort((a, b) => Number(a.displayOrder || 999) - Number(b.displayOrder || 999));

      return matches[0] || DEFAULT_NEWS.find((item) => normalize(item.category) === normalize(category));
    });

    newsGrid.innerHTML = selectedItems
      .filter(Boolean)
      .map((item) => `
        <div class="col-12 col-md-6 col-xl-3">
          <div class="card news-card border-0 shadow-sm h-100">
            <div class="card-body">
              <span class="badge ${item.badgeClass || badgeClassForCategory(item.category)} mb-3">
                ${item.category || "News"}
              </span>
              <h5 class="fw-bold">${item.title || ""}</h5>
              <p class="text-muted mb-0">${item.description || ""}</p>
            </div>
          </div>
        </div>
      `)
      .join("");
  }

  function renderContact(data) {
    const contact = { ...DEFAULT_CONTACT, ...(data || {}) };

    if (contactCardTitle) contactCardTitle.textContent = contact.cardTitle || DEFAULT_CONTACT.cardTitle;
    if (contactCardDescription) contactCardDescription.textContent = contact.cardDescription || DEFAULT_CONTACT.cardDescription;
    if (contactAddress) contactAddress.textContent = contact.address || DEFAULT_CONTACT.address;
    if (contactPhone) contactPhone.textContent = contact.phone || DEFAULT_CONTACT.phone;
    if (contactEmail) contactEmail.textContent = contact.email || DEFAULT_CONTACT.email;
  }

  function linkTarget(url = "") {
    return url.startsWith("http") ? "_blank" : "_self";
  }

  function renderLinks(items) {
    if (!linksGrid) return;

    const activeItems = items.filter((item) => item.active !== false);
    const list = activeItems.length ? activeItems : DEFAULT_LINKS;

    linksGrid.innerHTML = list
      .sort((a, b) => Number(a.displayOrder || 999) - Number(b.displayOrder || 999))
      .map((item) => `
        <div class="col-12 col-sm-6">
          <a href="${item.url || "#"}" target="${linkTarget(item.url || "#")}" class="quick-link-card">
            <i class="bi ${item.icon || "bi-link-45deg"}"></i>
            <span>${item.title || ""}</span>
          </a>
        </div>
      `)
      .join("");
  }

  function watchDoc(collectionName, docId, renderFn, fallback) {
    const ref = doc(db, collectionName, docId);
    onSnapshot(ref, (snapshot) => {
      if (snapshot.exists()) {
        renderFn(snapshot.data());
      } else {
        renderFn(fallback);
      }
    }, () => renderFn(fallback));
  }

  function watchCollection(collectionName, renderFn, fallback) {
    const q = query(collection(db, collectionName), orderBy("displayOrder", "asc"));
    onSnapshot(q, (snapshot) => {
      const items = snapshot.docs.map((docSnap) => ({
        id: docSnap.id,
        ...docSnap.data()
      }));
      renderFn(items.length ? items : fallback);
    }, () => renderFn(fallback));
  }

  renderHero(DEFAULT_HERO);
  renderFeatures(DEFAULT_FEATURES);
  renderWhyChooseUs(DEFAULT_WHY_CHOOSE_US);
  renderNews(DEFAULT_NEWS);
  renderContact(DEFAULT_CONTACT);
  renderLinks(DEFAULT_LINKS);

  watchDoc("homepage_hero", "main", renderHero, DEFAULT_HERO);
  watchCollection("homepage_features", renderFeatures, DEFAULT_FEATURES);
  watchCollection("homepage_why_choose_us", renderWhyChooseUs, DEFAULT_WHY_CHOOSE_US);
  watchCollection("news", renderNews, DEFAULT_NEWS);
  watchDoc("homepage_contact", "main", renderContact, DEFAULT_CONTACT);
  watchCollection("homepage_links", renderLinks, DEFAULT_LINKS);
});