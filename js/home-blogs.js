import { db } from "./firebase-config.js";

import {
  collection,
  query,
  where,
  orderBy,
  limit,
  getDocs
}
from
"https://www.gstatic.com/firebasejs/10.13.2/firebase-firestore.js";

document.addEventListener(
  "DOMContentLoaded",
  async () => {

    const grid =
      document.getElementById(
        "homepageBlogsGrid"
      );

    if (!grid) return;

    try {

      const q =
  query(
    collection(db, "blogs"),
    orderBy(
      "createdAt",
      "desc"
    ),
    limit(3)
  );

      const snapshot =
        await getDocs(q);

      if (
        snapshot.empty
      ) {

        grid.innerHTML = `

        <div class="col-12">

          <div
          class="card border-0 shadow-sm">

            <div
            class="card-body text-center p-5">

              No blogs available.

            </div>

          </div>

        </div>

        `;

        return;
      }

      const blogs =
        snapshot.docs.map(
          doc => ({
            id: doc.id,
            ...doc.data()
          })
        );

grid.innerHTML =
  blogs.map(
    blog => {

      const dateText =
        blog.createdAt?.toDate
        ?
        blog.createdAt
          .toDate()
          .toLocaleDateString()
        :
        "";

      return `

      <div
      class="col-12 col-md-6 col-lg-4">

        <div
        class="card border-0 shadow-sm h-100">

          <img
          src="${
            blog.imageUrl ||
            "https://via.placeholder.com/600x400"
          }"

          alt="${blog.title}"

          class="blog-home-image">

          <div
          class="card-body d-flex flex-column">

            <div
            class="small text-muted mb-2">

              ${dateText}

            </div>

            <h5 class="fw-bold">

              ${blog.title}

            </h5>

            <p
            class="text-muted flex-grow-1">

              ${
                (
                  blog.excerpt ||
                  blog.content ||
                  ""
                )
                .replace(/<[^>]+>/g,"")
                .substring(0,100)
              }...

            </p>

            <a
            href="blog-details.html?id=${blog.id}"

            class="btn btn-outline-primary">

              Read Article

            </a>

          </div>

        </div>

      </div>

      `;
    }
  ).join("")

+

`

<div
class="col-12 col-md-6 col-lg-4">

  <a
  href="blog.html"

  class="
  blog-view-all-card
  text-decoration-none">

    <div
    class="
    blog-view-all-inner">

      <i
      class="
      bi bi-journal-richtext
      blog-view-icon">

      </i>

      <h4
      class="fw-bold">

        View All Blogs

      </h4>

      <p
      class="mb-0">

        Explore our complete
        healthcare knowledge center.

      </p>

    </div>

  </a>

</div>

`;

    }

    catch(error){

      console.error(error);

    }

  }
);