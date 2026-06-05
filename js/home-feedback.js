import { db } from "./firebase-config.js";

import {
  collection,
  query,
  orderBy,
  limit,
  onSnapshot
} from "https://www.gstatic.com/firebasejs/10.13.2/firebase-firestore.js";

const slider =
  document.getElementById("feedbackSlider");

const prevBtn =
  document.getElementById("feedbackPrev");

const nextBtn =
  document.getElementById("feedbackNext");

let feedbacks = [];
let currentIndex = 0;
let autoSlide = null;

function createStars(rating) {

  let stars = "";

  for (let i = 1; i <= 5; i++) {

    stars += i <= rating
      ? '<i class="bi bi-star-fill text-warning"></i>'
      : '<i class="bi bi-star text-secondary"></i>';

  }

  return stars;
}

function createCard(feedback, isActive = false) {

const displayName =
  feedback.customerName || "Customer";

const firstLetter =
  displayName.charAt(0).toUpperCase();

  return `
    <div class="testimonial-card ${
  isActive ? "active" : "inactive"
}">

      <div class="testimonial-header">

        <div class="testimonial-avatar">
          ${firstLetter}
        </div>

        <div>

          <h5 class="mb-1 fw-bold">
  ${displayName}
</h5>

          <p class="text-muted mb-1">
            ${feedback.serviceType || "General Feedback"}
          </p>

          <div>
            ${createStars(feedback.rating || 0)}
          </div>

        </div>

      </div>

      <div class="testimonial-body">

        <p class="mb-0">
          "${feedback.feedbackText || ""}"
        </p>

      </div>

    </div>
  `;
}

function renderCards() {

  if (!slider) return;

  if (feedbacks.length === 0) {

    slider.innerHTML = `
      <div class="testimonial-empty">
        No feedback available yet.
      </div>
    `;

    return;
  }

  let html = "";

  const visibleCards = 3;

  for(let i=0;i<visibleCards;i++){

    const index =
      (currentIndex + i)
      % feedbacks.length;

    html += createCard(
  feedbacks[index],
  i === 1
);
  }

  slider.innerHTML = html;
}

function showNext() {

  if (!slider) return;

  slider.classList.add(
    "testimonial-slide-out-left"
  );

  setTimeout(() => {

  slider.classList.remove(
    "testimonial-slide-in"
  );

}, 550);

  setTimeout(() => {

    currentIndex++;

    if (currentIndex >= feedbacks.length) {
      currentIndex = 0;
    }

    renderCards();

    slider.classList.remove(
      "testimonial-slide-out-left"
    );

    slider.classList.add(
      "testimonial-slide-in"
    );

  }, 500);
}

function showPrevious() {

  if (!slider) return;

  slider.classList.add(
    "testimonial-slide-out-right"
  );

  setTimeout(() => {

    currentIndex--;

    if (currentIndex < 0) {
      currentIndex =
        feedbacks.length - 1;
    }

    renderCards();

    slider.classList.remove(
      "testimonial-slide-out-right"
    );

    slider.classList.add(
      "testimonial-slide-in"
    );

    setTimeout(() => {

  slider.classList.remove(
    "testimonial-slide-in"
  );

}, 550);

  }, 300);
}

function startAutoSlide() {

  if (autoSlide) {
    clearInterval(autoSlide);
  }

  autoSlide = setInterval(() => {

    showNext();

  }, 10000);
}

function loadFeedbacks() {

  const feedbackQuery = query(
    collection(db, "feedbacks"),
    orderBy("createdAt", "desc"),
    limit(20)
  );

  onSnapshot(
    feedbackQuery,
    (snapshot) => {

      feedbacks = [];

      snapshot.forEach((doc) => {

        feedbacks.push({
          id: doc.id,
          ...doc.data()
        });

      });

      currentIndex = 0;

      renderCards();

      startAutoSlide();
    },
    (error) => {

      console.error(
        "Feedback load error:",
        error
      );

    }
  );
}

if (prevBtn) {

  prevBtn.addEventListener(
    "click",
    () => {

      showPrevious();

      startAutoSlide();
    }
  );

}

if (nextBtn) {

  nextBtn.addEventListener(
    "click",
    () => {

      showNext();

      startAutoSlide();
    }
  );

}

document.addEventListener(
  "DOMContentLoaded",
  () => {

    loadFeedbacks();

  }
);