import { db } from "./firebase-config.js";
import {
  doc,
  getDoc,
  getDocs,
  setDoc,
  addDoc,
  updateDoc,
  deleteDoc,
  collection,
  query,
  orderBy,
  onSnapshot,
  serverTimestamp
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

const DEFAULT_CONTACT = {
  cardTitle: "Contact Us",
  cardDescription: "Reach us for customer support, consultation requests, lab location details, and sample collection information.",
  address: "Address goes here",
  phone: "Phone number goes here",
  email: "Email address goes here",
  whatsapp: "918961772773",
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
    icon: "bi-lightning-charge",
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

const DEFAULT_NEWS = [
  {
    id: "news_disability",
    title: "News Heading 1",
    category: "Disability",
    description: "Placeholder content for disability-related updates.",
    displayOrder: 1,
    active: true
  },
  {
    id: "news_gender",
    title: "News Heading 2",
    category: "Gender",
    description: "Placeholder content for gender-related updates.",
    displayOrder: 2,
    active: true
  },
  {
    id: "news_education",
    title: "News Heading 3",
    category: "Education",
    description: "Placeholder content for education-related updates.",
    displayOrder: 3,
    active: true
  },
  {
    id: "news_healthcare",
    title: "News Heading 4",
    category: "Healthcare",
    description: "Placeholder content for healthcare-related updates.",
    displayOrder: 4,
    active: true
  }
];

const DEFAULT_ADS = [

  {
    imageUrl:
      "https://images.unsplash.com/photo-1576091160550-2173dba999ef?w=1200",

    targetUrl:
      "https://cwflabs.org",

    title:
      "Free Health Camp",

    displayOrder: 1,

    active: true
  },

  {
    imageUrl:
      "https://images.unsplash.com/photo-1584515933487-779824d29309?w=1200",

    targetUrl:
      "https://cwflabs.org",

    title:
      "Healthcare Awareness",

    displayOrder: 2,

    active: true
  }

];

document.addEventListener("DOMContentLoaded", async () => {
  const heroForm = document.getElementById("heroForm");
  const heroTagline = document.getElementById("heroTagline");
  const heroTitle = document.getElementById("heroTitle");
  const heroDescription = document.getElementById("heroDescription");
  const heroBackgroundImage = document.getElementById("heroBackgroundImage");
  const heroPrimaryButtonText = document.getElementById("heroPrimaryButtonText");
  const heroPrimaryButtonLink = document.getElementById("heroPrimaryButtonLink");
  const heroSecondaryButtonText = document.getElementById("heroSecondaryButtonText");
  const heroSecondaryButtonLink = document.getElementById("heroSecondaryButtonLink");
  const heroStatus = document.getElementById("heroStatus");

  const contactForm = document.getElementById("contactForm");
  const contactCardTitle = document.getElementById("contactCardTitle");
  const contactCardDescription = document.getElementById("contactCardDescription");
  const contactAddress = document.getElementById("contactAddress");
  const contactPhone = document.getElementById("contactPhone");
  const contactEmail = document.getElementById("contactEmail");
  const contactWhatsapp = document.getElementById("contactWhatsapp");
  const contactStatus = document.getElementById("contactStatus");

  const featuresGrid = document.getElementById("featuresGrid");
  const linksGrid = document.getElementById("linksGrid");
  const newsGrid = document.getElementById("newsGrid");
  const adsGrid =
  document.getElementById("adsGrid");

const openAddAdModal =
  document.getElementById("openAddAdModal");

const adModal =
  new bootstrap.Modal(
    document.getElementById("adModal")
  );

const adForm =
  document.getElementById("adForm");

const adModalLabel =
  document.getElementById("adModalLabel");

const adDocId =
  document.getElementById("adDocId");

const adTitle =
  document.getElementById("adTitle");

const adImageUrl =
  document.getElementById("adImageUrl");

const adTargetUrl =
  document.getElementById("adTargetUrl");

const adDisplayOrder =
  document.getElementById("adDisplayOrder");

const adStatus =
  document.getElementById("adStatus");

const adPreview =
  document.getElementById("adPreview");

  adImageUrl?.addEventListener(
  "input",
  () => {

    if (!adImageUrl.value.trim()) {

      adPreview.style.display = "none";
      return;

    }

    adPreview.src =
      adImageUrl.value.trim();

    adPreview.style.display =
      "block";

  }
);

  const whyChooseGrid =
  document.getElementById("whyChooseGrid");

const openAddWhyChooseModal =
  document.getElementById("openAddWhyChooseModal");

const whyChooseModal =
  new bootstrap.Modal(
    document.getElementById("whyChooseModal")
  );

const whyChooseForm =
  document.getElementById("whyChooseForm");

const whyChooseModalLabel =
  document.getElementById("whyChooseModalLabel");

const whyChooseDocId =
  document.getElementById("whyChooseDocId");

const whyChooseTitle =
  document.getElementById("whyChooseTitle");

const whyChooseDescription =
  document.getElementById("whyChooseDescription");

const whyChooseIcon =
  document.getElementById("whyChooseIcon");

const whyChooseDisplayOrder =
  document.getElementById("whyChooseDisplayOrder");

const whyChooseStatus =
  document.getElementById("whyChooseStatus");

  const openAddFeatureModal = document.getElementById("openAddFeatureModal");
  const featureModal = new bootstrap.Modal(document.getElementById("featureModal"));
  const featureForm = document.getElementById("featureForm");
  const featureModalLabel = document.getElementById("featureModalLabel");
  const featureDocId = document.getElementById("featureDocId");
  const featureTitle = document.getElementById("featureTitle");
  const featureDescription = document.getElementById("featureDescription");
  const featureIcon = document.getElementById("featureIcon");
  const featureDisplayOrder = document.getElementById("featureDisplayOrder");
  const featureStatus = document.getElementById("featureStatus");

  const openAddLinkModal = document.getElementById("openAddLinkModal");
  const linkModal = new bootstrap.Modal(document.getElementById("linkModal"));
  const linkForm = document.getElementById("linkForm");
  const linkModalLabel = document.getElementById("linkModalLabel");
  const linkDocId = document.getElementById("linkDocId");
  const linkTitle = document.getElementById("linkTitle");
  const linkUrl = document.getElementById("linkUrl");
  const linkIcon = document.getElementById("linkIcon");
  const linkDisplayOrder = document.getElementById("linkDisplayOrder");
  const linkStatus = document.getElementById("linkStatus");

  const openAddNewsModal = document.getElementById("openAddNewsModal");
  const newsModal = new bootstrap.Modal(document.getElementById("newsModal"));
  const newsForm = document.getElementById("newsForm");
  const newsModalLabel = document.getElementById("newsModalLabel");
  const newsDocId = document.getElementById("newsDocId");
  const newsTitle = document.getElementById("newsTitle");
  const newsCategory = document.getElementById("newsCategory");
  const newsDescription = document.getElementById("newsDescription");
  const newsDisplayOrder = document.getElementById("newsDisplayOrder");
  const newsStatus = document.getElementById("newsStatus");

let allFeatures = [];
let allWhyChooseCards = [];
let allLinks = [];
let allNews = [];
let allAds = [];
  

  function normalize(value = "") {
    return value.toLowerCase().trim();
  }

  function isActive(value) {
    return value !== false;
  }

  function setHeroBackground(url) {
    const heroSection = document.getElementById("homepageHeroSection");
    if (!heroSection) return;

    const bg = url || DEFAULT_HERO.backgroundImage;
    heroSection.style.background = `linear-gradient(rgba(0, 0, 0, 0.65), rgba(0, 0, 0, 0.65)), url("${bg}") center/cover no-repeat`;
  }

  function fillHeroForm(data) {
    const hero = { ...DEFAULT_HERO, ...(data || {}) };

    heroTagline.value = hero.tagline || "";
    heroTitle.value = hero.title || "";
    heroDescription.value = hero.description || "";
    heroBackgroundImage.value = hero.backgroundImage || "";
    heroPrimaryButtonText.value = hero.primaryButtonText || "";
    heroPrimaryButtonLink.value = hero.primaryButtonLink || "";
    heroSecondaryButtonText.value = hero.secondaryButtonText || "";
    heroSecondaryButtonLink.value = hero.secondaryButtonLink || "";
    heroStatus.value = hero.active === false ? "false" : "true";
  }

  function fillContactForm(data) {
    const contact = { ...DEFAULT_CONTACT, ...(data || {}) };

    contactCardTitle.value = contact.cardTitle || "";
    contactCardDescription.value = contact.cardDescription || "";
    contactAddress.value = contact.address || "";
    contactPhone.value = contact.phone || "";
    contactEmail.value = contact.email || "";
    contactWhatsapp.value = contact.whatsapp || "";
    contactStatus.value = contact.active === false ? "false" : "true";
  }

  function cardButtons(id, editClass, deleteClass) {
    return `
      <div class="d-flex gap-2">
        <button type="button" class="btn btn-outline-primary btn-sm ${editClass}" data-id="${id}">Edit</button>
        <button type="button" class="btn btn-outline-danger btn-sm ${deleteClass}" data-id="${id}">Delete</button>
      </div>
    `;
  }

  function renderFeatureCards(items) {
    const list = items.length ? items : DEFAULT_FEATURES;

    featuresGrid.innerHTML = list
      .sort((a, b) => Number(a.displayOrder || 999) - Number(b.displayOrder || 999))
      .map((item) => `
        <div class="col-12 col-md-6 col-xl-3">
          <div class="card border-0 shadow-sm h-100">
            <div class="card-body p-4 text-center d-flex flex-column">
              <div class="feature-icon mb-3 mx-auto">
                <i class="bi ${item.icon || "bi-heart-pulse"}"></i>
              </div>
              <h5 class="fw-bold mb-2">${item.title || "Untitled Card"}</h5>
              <p class="text-muted flex-grow-1 mb-3">${item.description || ""}</p>
              <div class="mb-3">
                <span class="badge ${item.active ? "bg-success" : "bg-warning text-dark"}">
                  ${item.active ? "Active" : "Inactive"}
                </span>
              </div>
              ${cardButtons(item.id, "js-edit-feature", "js-delete-feature")}
            </div>
          </div>
        </div>
      `)
      .join("");

    bindFeatureButtons();
  }

  function renderWhyChooseCards(items) {

  const list =
    items.length
      ? items
      : DEFAULT_WHY_CHOOSE_US;

  whyChooseGrid.innerHTML = list
    .sort(
      (a, b) =>
        Number(a.displayOrder || 999) -
        Number(b.displayOrder || 999)
    )
    .map(
      (item) => `
      <div class="col-12 col-md-6 col-xl-3">

        <div class="card border-0 shadow-sm h-100">

          <div class="card-body p-4 text-center d-flex flex-column">

            <div class="feature-icon mb-3 mx-auto">
              <i class="bi ${item.icon}"></i>
            </div>

            <h5 class="fw-bold mb-2">
              ${item.title}
            </h5>

            <p class="text-muted flex-grow-1 mb-3">
              ${item.description}
            </p>

            <div class="mb-3">
              <span class="badge ${
                item.active
                  ? "bg-success"
                  : "bg-warning text-dark"
              }">
                ${
                  item.active
                    ? "Active"
                    : "Inactive"
                }
              </span>
            </div>

            ${cardButtons(
              item.id,
              "js-edit-why",
              "js-delete-why"
            )}

          </div>

        </div>

      </div>
    `
    )
    .join("");

  bindWhyChooseButtons();
}

function renderAds(items){

  adsGrid.innerHTML = items
    .sort(
      (a,b)=>
      a.displayOrder-b.displayOrder
    )
    .map(
      (item)=>`

      <div class="col-md-6 col-xl-4">

        <div class="card border-0 shadow-sm h-100">

          <img
            src="${item.imageUrl}"
            class="package-card-image">

          <div class="card-body">

            <h5 class="fw-bold">
              ${item.title}
            </h5>

            <p class="small text-muted mb-3">
              Order:
              ${item.displayOrder}
            </p>

            <div class="mb-3">

              <span
                class="badge ${
                  item.active
                  ? "bg-success"
                  : "bg-warning text-dark"
                }">

                ${
                  item.active
                  ? "Active"
                  : "Inactive"
                }

              </span>

            </div>

            ${cardButtons(
              item.id,
              "js-edit-ad",
              "js-delete-ad"
            )}

          </div>

        </div>

      </div>

    `
    )
    .join("");

  bindAdButtons();
}

  function renderLinkCards(items) {
    const list = items.length ? items : DEFAULT_LINKS;

    linksGrid.innerHTML = list
      .sort((a, b) => Number(a.displayOrder || 999) - Number(b.displayOrder || 999))
      .map((item) => `
        <div class="col-12 col-md-6 col-xl-4">
          <div class="card border-0 shadow-sm h-100">
            <div class="card-body p-4 d-flex flex-column">
              <div class="d-flex align-items-center gap-3 mb-3">
                <div class="feature-icon flex-shrink-0">
                  <i class="bi ${item.icon || "bi-link-45deg"}"></i>
                </div>
                <div>
                  <h5 class="fw-bold mb-1">${item.title || "Untitled Link"}</h5>
                  <p class="text-muted mb-0 small">${item.url || ""}</p>
                </div>
              </div>

              <div class="mb-3">
                <span class="badge ${item.active ? "bg-success" : "bg-warning text-dark"}">
                  ${item.active ? "Active" : "Inactive"}
                </span>
              </div>

              ${cardButtons(item.id, "js-edit-link", "js-delete-link")}
            </div>
          </div>
        </div>
      `)
      .join("");

    bindLinkButtons();
  }

  function badgeClass(category = "") {
    const value = normalize(category);
    if (value === "disability") return "bg-primary";
    if (value === "gender") return "bg-success";
    if (value === "education") return "bg-warning text-dark";
    if (value === "healthcare") return "bg-danger";
    return "bg-secondary";
  }

  function renderNewsCards(items) {
    const list = items.length ? items : DEFAULT_NEWS;

    newsGrid.innerHTML = list
      .sort((a, b) => Number(a.displayOrder || 999) - Number(b.displayOrder || 999))
      .map((item) => `
        <div class="col-12 col-md-6 col-xl-3">
          <div class="card border-0 shadow-sm h-100">
            <div class="card-body p-4 d-flex flex-column">
              <span class="badge ${badgeClass(item.category)} mb-3">
                ${item.category || "News"}
              </span>
              <h5 class="fw-bold">${item.title || "Untitled News"}</h5>
              <p class="text-muted flex-grow-1">${item.description || ""}</p>
              <div class="mb-3">
                <span class="badge ${item.active ? "bg-success" : "bg-warning text-dark"}">
                  ${item.active ? "Active" : "Inactive"}
                </span>
              </div>
              ${cardButtons(item.id, "js-edit-news", "js-delete-news")}
            </div>
          </div>
        </div>
      `)
      .join("");

    bindNewsButtons();
  }

  function bindFeatureButtons() {
    document.querySelectorAll(".js-edit-feature").forEach((button) => {
      button.addEventListener("click", () => {
        const item = allFeatures.find((feature) => feature.id === button.dataset.id);
        if (!item) return;

        featureModalLabel.textContent = "Edit Card";
        featureDocId.value = item.id;
        featureTitle.value = item.title || "";
        featureDescription.value = item.description || "";
        featureIcon.value = item.icon || "bi-heart-pulse";
        featureDisplayOrder.value = item.displayOrder ?? 1;
        featureStatus.value = item.active === false ? "false" : "true";
        featureModal.show();
      });
    });

    document.querySelectorAll(".js-delete-feature").forEach((button) => {
      button.addEventListener("click", async () => {
        if (!confirm("Delete this card permanently?")) return;
        await deleteDoc(doc(db, "homepage_features", button.dataset.id));
      });
    });
  }

  function bindWhyChooseButtons() {

  document
    .querySelectorAll(".js-edit-why")
    .forEach((button) => {

      button.addEventListener("click", () => {

        const item =
          allWhyChooseCards.find(
            (card) =>
              card.id === button.dataset.id
          );

        if (!item) return;

        whyChooseModalLabel.textContent =
          "Edit Card";

        whyChooseDocId.value = item.id;

        whyChooseTitle.value =
          item.title || "";

        whyChooseDescription.value =
          item.description || "";

        whyChooseIcon.value =
          item.icon || "bi-star";

        whyChooseDisplayOrder.value =
          item.displayOrder || 1;

        whyChooseStatus.value =
          item.active === false
            ? "false"
            : "true";

        whyChooseModal.show();

      });

    });

  document
    .querySelectorAll(".js-delete-why")
    .forEach((button) => {

      button.addEventListener(
        "click",
        async () => {

          if (
            !confirm(
              "Delete this card permanently?"
            )
          )
            return;

          await deleteDoc(
            doc(
              db,
              "homepage_why_choose_us",
              button.dataset.id
            )
          );
        }
      );

    });

}

function bindAdButtons(){

  document
    .querySelectorAll(".js-edit-ad")
    .forEach((btn)=>{

      btn.addEventListener(
        "click",
        ()=>{

          const item =
            allAds.find(
              ad =>
              ad.id === btn.dataset.id
            );

          if(!item) return;

          adModalLabel.textContent =
            "Edit Advertisement";

          adDocId.value =
            item.id;

          adTitle.value =
            item.title;

          adImageUrl.value =
            item.imageUrl;

          adTargetUrl.value =
            item.targetUrl || "";

          adDisplayOrder.value =
            item.displayOrder;

          adStatus.value =
            item.active
            ? "true"
            : "false";

          adPreview.src =
            item.imageUrl;

          adPreview.style.display =
            "block";

          adModal.show();

        }
      );

    });

  document
    .querySelectorAll(".js-delete-ad")
    .forEach((btn)=>{

      btn.addEventListener(
        "click",
        async()=>{

          if(
            !confirm(
              "Delete Advertisement?"
            )
          ) return;

          await deleteDoc(
            doc(
              db,
              "homepage_ads",
              btn.dataset.id
            )
          );

        }
      );

    });
}

  function bindLinkButtons() {
    document.querySelectorAll(".js-edit-link").forEach((button) => {
      button.addEventListener("click", () => {
        const item = allLinks.find((link) => link.id === button.dataset.id);
        if (!item) return;

        linkModalLabel.textContent = "Edit Link";
        linkDocId.value = item.id;
        linkTitle.value = item.title || "";
        linkUrl.value = item.url || "";
        linkIcon.value = item.icon || "bi-link-45deg";
        linkDisplayOrder.value = item.displayOrder ?? 1;
        linkStatus.value = item.active === false ? "false" : "true";
        linkModal.show();
      });
    });

    document.querySelectorAll(".js-delete-link").forEach((button) => {
      button.addEventListener("click", async () => {
        if (!confirm("Delete this link permanently?")) return;
        await deleteDoc(doc(db, "homepage_links", button.dataset.id));
      });
    });
  }

  function bindNewsButtons() {
    document.querySelectorAll(".js-edit-news").forEach((button) => {
      button.addEventListener("click", () => {
        const item = allNews.find((newsItem) => newsItem.id === button.dataset.id);
        if (!item) return;

        newsModalLabel.textContent = "Edit News";
        newsDocId.value = item.id;
        newsTitle.value = item.title || "";
        newsCategory.value = item.category || "";
        newsDescription.value = item.description || "";
        newsDisplayOrder.value = item.displayOrder ?? 1;
        newsStatus.value = item.active === false ? "false" : "true";
        newsModal.show();
      });
    });

    document.querySelectorAll(".js-delete-news").forEach((button) => {
      button.addEventListener("click", async () => {
        if (!confirm("Delete this news item permanently?")) return;
        await deleteDoc(doc(db, "news", button.dataset.id));
      });
    });
  }

  async function seedMissingDefaults() {
    const heroRef = doc(db, "homepage_hero", "main");
    const heroSnap = await getDoc(heroRef);
    if (!heroSnap.exists()) {
      await setDoc(heroRef, DEFAULT_HERO);
    }

    const contactRef = doc(db, "homepage_contact", "main");
    const contactSnap = await getDoc(contactRef);
    if (!contactSnap.exists()) {
      await setDoc(contactRef, DEFAULT_CONTACT);
    }

    const featureSnapshot = await getDocs(collection(db, "homepage_features"));
    const featureIds = new Set(featureSnapshot.docs.map((d) => d.id));
    await Promise.all(
      DEFAULT_FEATURES.filter((item) => !featureIds.has(item.id))
        .map((item) => setDoc(doc(db, "homepage_features", item.id), item))
    );

    const whyChooseSnapshot =
  await getDocs(
    collection(
      db,
      "homepage_why_choose_us"
    )
  );

if (whyChooseSnapshot.empty) {

  await Promise.all(

    DEFAULT_WHY_CHOOSE_US.map(
      (item) =>
        addDoc(
          collection(
            db,
            "homepage_why_choose_us"
          ),
          item
        )
    )

  );

}

    const linkSnapshot = await getDocs(collection(db, "homepage_links"));
    const linkIds = new Set(linkSnapshot.docs.map((d) => d.id));
    await Promise.all(
      DEFAULT_LINKS.filter((item) => !linkIds.has(item.id))
        .map((item) => setDoc(doc(db, "homepage_links", item.id), item))
    );

    const newsSnapshot = await getDocs(collection(db, "news"));
    const newsIds = new Set(newsSnapshot.docs.map((d) => d.id));
    await Promise.all(
      DEFAULT_NEWS.filter((item) => !newsIds.has(item.id))
        .map((item) => setDoc(doc(db, "news", item.id), item))
    );

    const adsSnapshot =
  await getDocs(
    collection(
      db,
      "homepage_ads"
    )
  );

if (adsSnapshot.empty) {

  await Promise.all(

    DEFAULT_ADS.map(
      (item) =>
        addDoc(
          collection(
            db,
            "homepage_ads"
          ),
          {
            ...item,
            createdAt:
              serverTimestamp()
          }
        )
    )

  );

}
  }

  function watchHero() {
    onSnapshot(doc(db, "homepage_hero", "main"), (snapshot) => {
      fillHeroForm(snapshot.exists() ? snapshot.data() : DEFAULT_HERO);
    });
  }

  function watchContact() {
    onSnapshot(doc(db, "homepage_contact", "main"), (snapshot) => {
      fillContactForm(snapshot.exists() ? snapshot.data() : DEFAULT_CONTACT);
    });
  }

  function watchFeatures() {
    const q = query(collection(db, "homepage_features"), orderBy("displayOrder", "asc"));
    onSnapshot(q, (snapshot) => {
      allFeatures = snapshot.docs.map((d) => ({ id: d.id, ...d.data() }));
      renderFeatureCards(allFeatures);
    });
  }

  function watchWhyChoose() {

  const q = query(
    collection(
      db,
      "homepage_why_choose_us"
    ),
    orderBy(
      "displayOrder",
      "asc"
    )
  );

  onSnapshot(
    q,
    (snapshot) => {

      allWhyChooseCards =
        snapshot.docs.map(
          (d) => ({
            id: d.id,
            ...d.data()
          })
        );

      renderWhyChooseCards(
        allWhyChooseCards
      );

    }
  );
}

function watchAds(){

  const q = query(
    collection(
      db,
      "homepage_ads"
    ),
    orderBy(
      "displayOrder",
      "asc"
    )
  );

  onSnapshot(
    q,
    (snapshot)=>{

      allAds =
        snapshot.docs.map(
          d => ({
            id:d.id,
            ...d.data()
          })
        );

      renderAds(allAds);

    }
  );
}

  function watchLinks() {
    const q = query(collection(db, "homepage_links"), orderBy("displayOrder", "asc"));
    onSnapshot(q, (snapshot) => {
      allLinks = snapshot.docs.map((d) => ({ id: d.id, ...d.data() }));
      renderLinkCards(allLinks);
    });
  }

  function watchNews() {
    const q = query(collection(db, "news"), orderBy("displayOrder", "asc"));
    onSnapshot(q, (snapshot) => {
      allNews = snapshot.docs.map((d) => ({ id: d.id, ...d.data() }));
      renderNewsCards(allNews);
    });
  }

  function openNewFeatureModal() {
    featureModalLabel.textContent = "Add New Card";
    featureForm.reset();
    featureDocId.value = "";
    featureStatus.value = "true";
    featureDisplayOrder.value = "1";
    featureIcon.value = "bi-heart-pulse";
    featureModal.show();
  }

  function openNewLinkModal() {
    linkModalLabel.textContent = "Add New Link";
    linkForm.reset();
    linkDocId.value = "";
    linkStatus.value = "true";
    linkDisplayOrder.value = "1";
    linkIcon.value = "bi-link-45deg";
    linkModal.show();
  }

  function openNewNewsModal() {
    newsModalLabel.textContent = "Add News";
    newsForm.reset();
    newsDocId.value = "";
    newsStatus.value = "true";
    newsDisplayOrder.value = "1";
    newsModal.show();
  }

  if (openAddFeatureModal) openAddFeatureModal.addEventListener("click", openNewFeatureModal);
  if (openAddWhyChooseModal) {

  openAddWhyChooseModal
    .addEventListener(
      "click",
      () => {

        whyChooseForm.reset();

        whyChooseDocId.value = "";

        whyChooseStatus.value =
          "true";

        whyChooseDisplayOrder.value =
          "1";

        whyChooseModalLabel.textContent =
          "Add New Card";

        whyChooseModal.show();

      }
    );

}
if(openAddAdModal){

  openAddAdModal
    .addEventListener(
      "click",
      ()=>{

        adForm.reset();

        adDocId.value = "";

        adDisplayOrder.value = "1";

        adStatus.value = "true";

        adPreview.style.display =
          "none";

        adModalLabel.textContent =
          "Add Advertisement";

        adModal.show();

      }
    );

}

  if (openAddLinkModal) openAddLinkModal.addEventListener("click", openNewLinkModal);
  if (openAddNewsModal) openAddNewsModal.addEventListener("click", openNewNewsModal);

  if (heroForm) {
    heroForm.addEventListener("submit", async (e) => {
      e.preventDefault();

      await setDoc(doc(db, "homepage_hero", "main"), {
        tagline: heroTagline.value.trim(),
        title: heroTitle.value.trim(),
        description: heroDescription.value.trim(),
        backgroundImage: heroBackgroundImage.value.trim(),
        primaryButtonText: heroPrimaryButtonText.value.trim(),
        primaryButtonLink: heroPrimaryButtonLink.value.trim(),
        secondaryButtonText: heroSecondaryButtonText.value.trim(),
        secondaryButtonLink: heroSecondaryButtonLink.value.trim(),
        active: heroStatus.value === "true",
        updatedAt: serverTimestamp()
      }, { merge: true });

      alert("Hero settings saved.");
    });
  }

  if (contactForm) {
    contactForm.addEventListener("submit", async (e) => {
      e.preventDefault();

      await setDoc(doc(db, "homepage_contact", "main"), {
        cardTitle: contactCardTitle.value.trim(),
        cardDescription: contactCardDescription.value.trim(),
        address: contactAddress.value.trim(),
        phone: contactPhone.value.trim(),
        email: contactEmail.value.trim(),
        whatsapp: contactWhatsapp.value.trim(),
        active: contactStatus.value === "true",
        updatedAt: serverTimestamp()
      }, { merge: true });

      alert("Contact block saved.");
    });
  }

  if (featureForm) {
    featureForm.addEventListener("submit", async (e) => {
      e.preventDefault();

      const payload = {
        title: featureTitle.value.trim(),
        description: featureDescription.value.trim(),
        icon: featureIcon.value.trim(),
        displayOrder: Number(featureDisplayOrder.value),
        active: featureStatus.value === "true",
        updatedAt: serverTimestamp()
      };

      if (featureDocId.value) {
        await updateDoc(doc(db, "homepage_features", featureDocId.value), payload);
      } else {
        payload.createdAt = serverTimestamp();
        await addDoc(collection(db, "homepage_features"), payload);
      }

      featureModal.hide();
    });
  }

  if (whyChooseForm) {

  whyChooseForm.addEventListener(
    "submit",
    async (e) => {

      e.preventDefault();

      const payload = {
        title:
          whyChooseTitle.value.trim(),

        description:
          whyChooseDescription.value.trim(),

        icon:
          whyChooseIcon.value,

        displayOrder:
          Number(
            whyChooseDisplayOrder.value
          ),

        active:
          whyChooseStatus.value ===
          "true",

        updatedAt:
          serverTimestamp()
      };

      if (whyChooseDocId.value) {

        await updateDoc(
          doc(
            db,
            "homepage_why_choose_us",
            whyChooseDocId.value
          ),
          payload
        );

      } else {

        payload.createdAt =
          serverTimestamp();

        await addDoc(
          collection(
            db,
            "homepage_why_choose_us"
          ),
          payload
        );

      }

      whyChooseModal.hide();

    }
  );

}

if(adForm){

  adForm.addEventListener(
    "submit",
    async(e)=>{

      e.preventDefault();

      const payload = {

        title:
          adTitle.value.trim(),

        imageUrl:
          adImageUrl.value.trim(),

        targetUrl:
          adTargetUrl.value.trim(),

        displayOrder:
          Number(
            adDisplayOrder.value
          ),

        active:
          adStatus.value === "true",

        updatedAt:
          serverTimestamp()

      };

      if(adDocId.value){

        await updateDoc(
          doc(
            db,
            "homepage_ads",
            adDocId.value
          ),
          payload
        );

      }
      else{

        payload.createdAt =
          serverTimestamp();

        await addDoc(
          collection(
            db,
            "homepage_ads"
          ),
          payload
        );

      }

      adModal.hide();

    }
  );

}

  if (linkForm) {
    linkForm.addEventListener("submit", async (e) => {
      e.preventDefault();

      const payload = {
        title: linkTitle.value.trim(),
        url: linkUrl.value.trim(),
        icon: linkIcon.value.trim(),
        displayOrder: Number(linkDisplayOrder.value),
        active: linkStatus.value === "true",
        updatedAt: serverTimestamp()
      };

      if (linkDocId.value) {
        await updateDoc(doc(db, "homepage_links", linkDocId.value), payload);
      } else {
        payload.createdAt = serverTimestamp
                payload.createdAt = serverTimestamp();
        await addDoc(collection(db, "homepage_links"), payload);
      }

      linkModal.hide();
    });
  }

  if (newsForm) {
    newsForm.addEventListener("submit", async (e) => {
      e.preventDefault();

      const payload = {
        title: newsTitle.value.trim(),
        category: newsCategory.value.trim(),
        description: newsDescription.value.trim(),
        displayOrder: Number(newsDisplayOrder.value),
        active: newsStatus.value === "true",
        updatedAt: serverTimestamp()
      };

      if (newsDocId.value) {
        await updateDoc(doc(db, "news", newsDocId.value), payload);
      } else {
        payload.createdAt = serverTimestamp();
        await addDoc(collection(db, "news"), payload);
      }

      newsModal.hide();
    });
  }

  await seedMissingDefaults();
watchHero();
watchContact();
watchFeatures();
watchWhyChoose();
watchAds();
watchLinks();
watchNews();
});