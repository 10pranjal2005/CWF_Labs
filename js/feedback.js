import { db } from "./firebase-config.js";

import {
  collection,
  addDoc,
  serverTimestamp
} from "https://www.gstatic.com/firebasejs/10.13.2/firebase-firestore.js";

const form =
  document.getElementById("feedbackForm");

const message =
  document.getElementById("feedbackMessage");

const stars =
  document.querySelectorAll(
    "#ratingStars i"
  );

let rating = 0;

stars.forEach((star) => {

  star.addEventListener(
    "click",
    () => {

      rating =
        Number(
          star.dataset.value
        );

      stars.forEach((s) => {

        if (
          Number(s.dataset.value)
          <= rating
        ) {

          s.classList.add(
            "active"
          );

        } else {

          s.classList.remove(
            "active"
          );

        }

      });

    }
  );

});

form.addEventListener(
  "submit",
  async (e) => {

    e.preventDefault();

    if (rating === 0) {

      message.innerHTML =
        `
        <div class="alert alert-warning">
          Please select a rating.
        </div>
      `;

      return;

    }

    try {

      await addDoc(
        collection(
          db,
          "feedbacks"
        ),
        {

          customerName:
            document.getElementById(
              "customerName"
            ).value.trim(),

          phone:
            document.getElementById(
              "phone"
            ).value.trim(),

          serviceType:
            document.getElementById(
              "serviceType"
            ).value,

          feedbackText:
            document.getElementById(
              "feedbackText"
            ).value.trim(),

          rating,

          createdAt:
            serverTimestamp()

        }
      );

      form.reset();

      rating = 0;

      stars.forEach((s) =>
        s.classList.remove("active")
      );

      message.innerHTML =
        `
        <div class="alert alert-success">
          Thank you for your feedback.
        </div>
      `;

    } catch (error) {

      console.error(error);

      message.innerHTML =
        `
        <div class="alert alert-danger">
          Failed to submit feedback.
        </div>
      `;

    }

  }
);