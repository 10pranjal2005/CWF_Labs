import { db } from "./firebase-config.js";

import {
  doc,
  getDoc
}
from
"https://www.gstatic.com/firebasejs/10.13.2/firebase-firestore.js";

document.addEventListener(
  "DOMContentLoaded",
  async () => {

    const container =
      document.getElementById(
        "blogDetailsContainer"
      );

    const params =
      new URLSearchParams(
        window.location.search
      );

    const blogId =
      params.get("id");

    if (!blogId) {

      container.innerHTML = `

      <div
      class="alert alert-danger">

      Blog not found.

      </div>

      `;

      return;
    }

    try {

      const blogRef =
        doc(
          db,
          "blogs",
          blogId
        );

      const snapshot =
        await getDoc(
          blogRef
        );

      if (
        !snapshot.exists()
      ) {

        container.innerHTML = `

        <div
        class="alert alert-danger">

        Blog does not exist.

        </div>

        `;

        return;
      }

      const blog =
        snapshot.data();

      const dateText =
        blog.createdAt?.toDate
          ?
          blog.createdAt
            .toDate()
            .toLocaleDateString()
          :
          "";

      container.innerHTML = `

      <div
      class="blog-article-container">

        <img
        src="${
          blog.imageUrl
          ||
          "https://via.placeholder.com/1200x600"
        }"
        alt="${
          blog.title
        }"
        class="blog-hero-image">

        <div
        class="mt-4">

          <span
          class="badge bg-primary mb-3">

          ${blog.category}

          </span>

          ${
            blog.featured
            ?
            `
            <span
            class="badge bg-warning text-dark mb-3 ms-2">

            Featured

            </span>
            `
            :
            ""
          }

          <h1
          class="blog-title">

          ${blog.title}

          </h1>

          <div
          class="blog-meta">

            By
            ${blog.author}

            ·

            ${dateText}

          </div>

          <hr>

          <div
          class="blog-content">

          ${blog.content}

          </div>

        </div>

      </div>

      `;
    }

    catch(error) {

      console.error(
        error
      );

      container.innerHTML = `

      <div
      class="alert alert-danger">

      Failed to load blog.

      </div>

      `;
    }

  }
);