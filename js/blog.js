import { db } from "./firebase-config.js";

import {
  collection,
  getDocs,
  query,
  orderBy
}
from
"https://www.gstatic.com/firebasejs/10.13.2/firebase-firestore.js";

document.addEventListener(
  "DOMContentLoaded",
  () => {

    const blogsGrid =
      document.getElementById(
        "blogsGrid"
      );

    async function loadBlogs() {

      try {

        const q =
          query(
            collection(
              db,
              "blogs"
            ),
            orderBy(
              "createdAt",
              "desc"
            )
          );

        const snapshot =
          await getDocs(q);

        const blogs =
          snapshot.docs
            .map(
              doc => ({
                id: doc.id,
                ...doc.data()
              })
            )
            .filter(
              blog =>
                blog.active !== false
            );

        if (
          blogs.length === 0
        ) {

          blogsGrid.innerHTML = `
          <div class="col-12">

            <div class="card border-0 shadow-sm">

              <div class="card-body text-center p-5">

                <h4>
                  No Blogs Available
                </h4>

              </div>

            </div>

          </div>
          `;

          return;
        }

        blogsGrid.innerHTML =
          blogs.map(
            blog => `

<div
class="col-12 col-md-6 col-xl-4">

<div
class="card border-0 shadow-sm h-100">

<img
src="${
  blog.imageUrl ||
  'https://via.placeholder.com/800x500'
}"
class="card-img-top blog-card-image"
alt="${blog.title}">

<div class="card-body d-flex flex-column">

<span
class="badge bg-primary mb-2">

${blog.category}

</span>

${
blog.featured
?
`
<span
class="badge bg-warning text-dark mb-2">

Featured

</span>
`
:
""
}

<h4
class="fw-bold">

${blog.title}

</h4>

<p
class="text-muted flex-grow-1">

${blog.excerpt}

</p>

<div
class="small text-secondary mb-3">

By ${blog.author}

</div>

<a
href="blog-details.html?id=${blog.id}"
class="btn btn-primary">

Read Article

</a>

</div>

</div>

</div>

`
          )
          .join("");

      } catch (error) {

        console.error(error);

      }

    }

    loadBlogs();

  }
);