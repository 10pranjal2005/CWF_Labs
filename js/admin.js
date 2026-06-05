document.addEventListener("DOMContentLoaded", () => {
  // =====================================================
  // Set active state for admin navigation links
  // =====================================================
  const currentPage = window.location.pathname.split("/").pop();

  const adminLinks = document.querySelectorAll('a[href$=".html"]');

  adminLinks.forEach((link) => {
    const href = link.getAttribute("href") || "";
    const linkPage = href.split("/").pop();

    if (linkPage === currentPage) {
      link.classList.add("active");
      link.setAttribute("aria-current", "page");
    }
  });

  // =====================================================
  // Search inputs: keep them ready for future Firebase use
  // =====================================================
  const searchInputs = document.querySelectorAll('input[type="search"]');

  searchInputs.forEach((input) => {
    input.addEventListener("input", () => {
      const value = input.value.trim().toLowerCase();
      input.setAttribute("data-search-term", value);
    });
  });

  // =====================================================
  // Filter dropdowns: store selected values for future use
  // =====================================================
  const filterSelects = document.querySelectorAll("select");

  filterSelects.forEach((select) => {
    select.addEventListener("change", () => {
      select.setAttribute("data-selected-value", select.value);
    });
  });

  // =====================================================
  // Placeholder action buttons
  // These keep the admin pages interactive for now.
  // Real Firebase actions will replace these later.
  // =====================================================
  const actionButtons = document.querySelectorAll(
    'button[type="button"], .btn:not(a.btn)'
  );

  actionButtons.forEach((button) => {
    const label = button.textContent.trim().toLowerCase();

    if (
      label.includes("approve") ||
      label.includes("reject") ||
      label.includes("edit") ||
      label.includes("delete") ||
      label.includes("view") ||
      label.includes("confirm") ||
      label.includes("complete") ||
      label.includes("reopen") ||
      label.includes("rebook")
    ) {
      button.addEventListener("click", () => {
        // Intentionally left as a lightweight placeholder.
        // Firebase-connected actions will be added later.
        console.log(`Action clicked: ${button.textContent.trim()}`);
      });
    }
  });

  // =====================================================
  // Simple card hover support for admin pages
  // =====================================================
  const cards = document.querySelectorAll(".card");

  cards.forEach((card) => {
    card.addEventListener("mouseenter", () => {
      card.classList.add("shadow");
    });

    card.addEventListener("mouseleave", () => {
      card.classList.remove("shadow");
    });
  });

  // =====================================================
  // Bootstrap tab fallback safety
  // =====================================================
  const tabButtons = document.querySelectorAll('[data-bs-toggle="pill"]');

  tabButtons.forEach((tabButton) => {
    tabButton.addEventListener("click", () => {
      const targetSelector = tabButton.getAttribute("data-bs-target");
      if (!targetSelector) return;

      const targetPane = document.querySelector(targetSelector);
      if (!targetPane) return;

      const activeTabs = document.querySelectorAll(".tab-pane");
      activeTabs.forEach((pane) => {
        pane.classList.remove("show", "active");
      });

      targetPane.classList.add("show", "active");
    });
  });
});