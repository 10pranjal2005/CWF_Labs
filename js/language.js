document.addEventListener(
  "DOMContentLoaded",
  () => {

    const langBtn =
      document.getElementById(
        "langToggle"
      );

    function googleTranslateElementInit() {

      new google.translate.TranslateElement(
        {
          pageLanguage: "en",
          includedLanguages: "bn,en",
          autoDisplay: false
        },
        "google_translate_element"
      );

    }

    window.googleTranslateElementInit =
      googleTranslateElementInit;

    const script =
      document.createElement(
        "script"
      );

    script.src =
      "https://translate.google.com/translate_a/element.js?cb=googleTranslateElementInit";

    document.body.appendChild(
      script
    );

    function setCookie(name, value) {

      document.cookie =
        `${name}=${value};path=/`;

    }

    function translateTo(lang) {

      const combo =
        document.querySelector(
          ".goog-te-combo"
        );

      if (!combo) return;

      combo.value = lang;

      combo.dispatchEvent(
        new Event("change")
      );

      localStorage.setItem(
        "cwfLanguage",
        lang
      );

      updateButton(lang);

    }

    function updateButton(lang) {

      if (!langBtn) return;

      langBtn.textContent =
        lang === "bn"
          ? "বাংলা"
          : "English";

    }

    setTimeout(() => {

      const saved =
        localStorage.getItem(
          "cwfLanguage"
        ) || "en";

      translateTo(saved);

    }, 2000);

    langBtn?.addEventListener(
      "click",
      () => {

        const current =
          localStorage.getItem(
            "cwfLanguage"
          ) || "en";

        const next =
          current === "en"
            ? "bn"
            : "en";

        translateTo(next);

      }
    );

  }
);