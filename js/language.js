document.addEventListener("DOMContentLoaded", () => {
  const translations = {
    en: {
      nav_home: "Home",
      nav_book_test: "Book a Test",
      nav_packages: "Health Packages",
      nav_doctors: "Consult a Doctor",
      nav_services: "Services",
      nav_contact: "Contact Us",
      nav_about: "About Us",
      nav_faq: "FAQs",

      hero_tagline: "Healthcare for Everyone",
      hero_title: "CWF Labs – Accessible Healthcare for Rural Communities",
      hero_desc:
        "Book tests, explore health packages, consult doctors, and access healthcare support from anywhere.",
      hero_btn_tests: "Book a Test",
      hero_btn_packages: "View Packages",

      who_title: "Who We Are",
      who_desc:
        "We work across disability, gender, education, and healthcare for better community impact.",

      motto_disability: "Disability",
      motto_disability_desc:
        "Supporting inclusive opportunities and accessibility.",
      motto_gender: "Gender",
      motto_gender_desc:
        "Promoting equality, dignity, and empowerment.",
      motto_education: "Education",
      motto_education_desc:
        "Enabling learning and awareness for communities.",
      motto_healthcare: "Healthcare",
      motto_healthcare_desc:
        "Making healthcare services easier to access.",

      news_title: "Latest News from CWF",
      news_desc:
        "Important updates and announcements from the organization.",
      news_badge_disability: "Disability",
      news_badge_gender: "Gender",
      news_badge_education: "Education",
      news_badge_healthcare: "Healthcare",

      contact_title: "Contact Us",
      contact_desc:
        "Reach us for support, consultation, and lab-related information.",

      quick_links_title: "Quick Links",
      quick_about: "About Us",
      quick_blogs: "Blogs",
      quick_research: "Research",
      quick_partners: "Our Partners",
      quick_contact: "Contact Us",

      footer_text: "Building accessible healthcare and community support."
    },

    bn: {
      nav_home: "হোম",
      nav_book_test: "টেস্ট বুক করুন",
      nav_packages: "হেলথ প্যাকেজ",
      nav_doctors: "ডাক্তারের পরামর্শ",
      nav_services: "সেবা",
      nav_contact: "যোগাযোগ করুন",
      nav_about: "আমাদের সম্পর্কে",
      nav_faq: "প্রশ্নোত্তর",

      hero_tagline: "সবার জন্য স্বাস্থ্যসেবা",
      hero_title: "CWF Labs – গ্রামীণ মানুষের জন্য সহজলভ্য স্বাস্থ্যসেবা",
      hero_desc:
        "টেস্ট বুক করুন, স্বাস্থ্য প্যাকেজ দেখুন, ডাক্তারের পরামর্শ নিন এবং যেকোনো জায়গা থেকে স্বাস্থ্যসেবা পান।",
      hero_btn_tests: "টেস্ট বুক করুন",
      hero_btn_packages: "প্যাকেজ দেখুন",

      who_title: "আমরা কারা",
      who_desc:
        "আমরা প্রতিবন্ধকতা, লিঙ্গ, শিক্ষা এবং স্বাস্থ্যসেবার মাধ্যমে সমাজে ইতিবাচক পরিবর্তনের কাজ করি।",

      motto_disability: "প্রতিবন্ধকতা",
      motto_disability_desc:
        "অন্তর্ভুক্তিমূলক সুযোগ এবং সহজলভ্যতা নিশ্চিত করা।",
      motto_gender: "লিঙ্গ",
      motto_gender_desc:
        "সমতা, মর্যাদা এবং ক্ষমতায়নকে উৎসাহিত করা।",
      motto_education: "শিক্ষা",
      motto_education_desc:
        "সমাজের জন্য শিক্ষা ও সচেতনতা বৃদ্ধি করা।",
      motto_healthcare: "স্বাস্থ্যসেবা",
      motto_healthcare_desc:
        "স্বাস্থ্যসেবাকে আরও সহজলভ্য করে তোলা।",

      news_title: "CWF-এর সর্বশেষ খবর",
      news_desc:
        "সংস্থার গুরুত্বপূর্ণ আপডেট এবং ঘোষণা।",
      news_badge_disability: "প্রতিবন্ধকতা",
      news_badge_gender: "লিঙ্গ",
      news_badge_education: "শিক্ষা",
      news_badge_healthcare: "স্বাস্থ্যসেবা",

      contact_title: "যোগাযোগ করুন",
      contact_desc:
        "সহায়তা, পরামর্শ এবং ল্যাব সম্পর্কিত তথ্যের জন্য আমাদের সাথে যোগাযোগ করুন।",

      quick_links_title: "দ্রুত লিঙ্ক",
      quick_about: "আমাদের সম্পর্কে",
      quick_blogs: "ব্লগ",
      quick_research: "গবেষণা",
      quick_partners: "আমাদের অংশীদার",
      quick_contact: "যোগাযোগ করুন",

      footer_text: "সহজলভ্য স্বাস্থ্যসেবা এবং সমাজসেবামূলক সহায়তা গড়ে তোলা।"
    }
  };

  const langToggleBtn = document.getElementById("langToggle");
  const elements = document.querySelectorAll("[data-i18n]");

  let currentLanguage = localStorage.getItem("cwf-language") || "en";

  function updateLanguage(lang) {
    const selected = translations[lang];

    if (!selected) return;

    elements.forEach((element) => {
      const key = element.getAttribute("data-i18n");
      if (selected[key]) {
        element.textContent = selected[key];
      }
    });

    document.documentElement.lang = lang;
    localStorage.setItem("cwf-language", lang);

    if (langToggleBtn) {
      langToggleBtn.textContent = lang === "en" ? "EN / বাংলা" : "ENG / বাংলা";
    }
  }

  if (langToggleBtn) {
    langToggleBtn.addEventListener("click", () => {
      currentLanguage = currentLanguage === "en" ? "bn" : "en";
      updateLanguage(currentLanguage);
    });
  }

  updateLanguage(currentLanguage);
});