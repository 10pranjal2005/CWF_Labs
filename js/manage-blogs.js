import { db } from "./firebase-config.js";

import {
  collection,
  addDoc,
  getDocs,
  updateDoc,
  deleteDoc,
  doc,
  query,
  orderBy,
  serverTimestamp
} from "https://www.gstatic.com/firebasejs/10.13.2/firebase-firestore.js";

document.addEventListener(
  "DOMContentLoaded",
  () => {

    const blogsGrid =
      document.getElementById(
        "blogsGrid"
      );

    const totalBlogsCount =
      document.getElementById(
        "totalBlogsCount"
      );

    const activeBlogsCount =
      document.getElementById(
        "activeBlogsCount"
      );

    const inactiveBlogsCount =
      document.getElementById(
        "inactiveBlogsCount"
      );

    const featuredBlogsCount =
      document.getElementById(
        "featuredBlogsCount"
      );

    const searchBlogs =
      document.getElementById(
        "searchBlogs"
      );

    const filterBlogCategory =
      document.getElementById(
        "filterBlogCategory"
      );

    const filterBlogStatus =
      document.getElementById(
        "filterBlogStatus"
      );

    const clearBlogFiltersBtn =
      document.getElementById(
        "clearBlogFiltersBtn"
      );

    const blogModalElement =
      document.getElementById(
        "blogModal"
      );

    const blogModal =
      new bootstrap.Modal(
        blogModalElement
      );

    const openAddBlogModal =
      document.getElementById(
        "openAddBlogModal"
      );

    const blogForm =
      document.getElementById(
        "blogForm"
      );

    const blogDocId =
      document.getElementById(
        "blogDocId"
      );

    const blogTitle =
      document.getElementById(
        "blogTitle"
      );

    const blogCategory =
      document.getElementById(
        "blogCategory"
      );

    const blogAuthor =
      document.getElementById(
        "blogAuthor"
      );

    const blogImageUrl =
      document.getElementById(
        "blogImageUrl"
      );

    const blogExcerpt =
      document.getElementById(
        "blogExcerpt"
      );

    const blogStatus =
      document.getElementById(
        "blogStatus"
      );

    const blogFeatured =
      document.getElementById(
        "blogFeatured"
      );

    const blogModalLabel =
      document.getElementById(
        "blogModalLabel"
      );

    const quill =
      new Quill(
        "#blogEditor",
        {
          theme: "snow",
          placeholder:
            "Write your blog here...",
          modules: {
            toolbar: [
              [
                {
                  header: [1,2,3,false]
                }
              ],
              [
                "bold",
                "italic",
                "underline"
              ],
              [
                {
                  list: "ordered"
                },
                {
                  list: "bullet"
                }
              ],
              [
                "link"
              ],
              [
                "clean"
              ]
            ]
          }
        }
      );

    let allBlogs = [];

    function updateStats() {

      totalBlogsCount.textContent =
        allBlogs.length;

      activeBlogsCount.textContent =
        allBlogs.filter(
          blog => blog.active
        ).length;

      inactiveBlogsCount.textContent =
        allBlogs.filter(
          blog => !blog.active
        ).length;

      featuredBlogsCount.textContent =
        allBlogs.filter(
          blog => blog.featured
        ).length;
    }

    function matchesFilters(
      blog
    ) {

      const search =
        searchBlogs.value
        .toLowerCase()
        .trim();

      const category =
        filterBlogCategory.value;

      const status =
        filterBlogStatus.value;

      const searchMatch =
        !search ||

        blog.title
          ?.toLowerCase()
          .includes(search)

        ||

        blog.excerpt
          ?.toLowerCase()
          .includes(search);

      const categoryMatch =
        category === "all"
        ||
        blog.category === category;

      const statusMatch =

        status === "all"

        ||

        (
          status === "active"
          &&
          blog.active
        )

        ||

        (
          status === "inactive"
          &&
          !blog.active
        );

      return (
        searchMatch
        &&
        categoryMatch
        &&
        statusMatch
      );
    }

    function renderBlogs() {

      const visibleBlogs =
        allBlogs.filter(
          matchesFilters
        );

      blogsGrid.innerHTML = "";

      if (
        visibleBlogs.length === 0
      ) {

        blogsGrid.innerHTML = `
          <div class="col-12">
            <div class="card shadow-sm border-0">
              <div class="card-body text-center p-5">
                <h4>No Blogs Found</h4>
              </div>
            </div>
          </div>
        `;

        return;
      }

      visibleBlogs.forEach(
        (blog) => {

          const col =
            document.createElement(
              "div"
            );

          col.className =
            "col-12 col-md-6 col-xl-4";

          col.innerHTML = `
          <div class="card border-0 shadow-sm h-100">

            ${
              blog.imageUrl
              ?
              `
              <img
                src="${blog.imageUrl}"
                class="card-img-top"
                style="
                  height:220px;
                  object-fit:cover;
                ">
              `
              :
              ""
            }

            <div class="card-body">

              <span class="badge bg-primary mb-2">
                ${blog.category}
              </span>

              ${
                blog.featured
                ?
                `
                <span class="badge bg-warning text-dark mb-2 ms-2">
                  Featured
                </span>
                `
                :
                ""
              }

              <h5 class="fw-bold">
                ${blog.title}
              </h5>

              <p class="text-muted">
                ${blog.excerpt}
              </p>

              <div class="small mb-3">
                By ${blog.author}
              </div>

              <div class="d-flex gap-2">

                <button
                  type="button"
                  class="btn btn-outline-primary flex-fill edit-blog"
                  data-id="${blog.id}">

                  Edit

                </button>

                <button
                  type="button"
                  class="btn btn-outline-danger flex-fill delete-blog"
                  data-id="${blog.id}">

                  Delete

                </button>

              </div>

            </div>

          </div>
          `;

          blogsGrid.appendChild(
            col
          );
        }
      );

      bindActions();
    }

    function bindActions() {

      document
        .querySelectorAll(
          ".edit-blog"
        )
        .forEach(
          button => {

            button.addEventListener(
              "click",
              () => {

                const id =
                  button.dataset.id;

                const blog =
                  allBlogs.find(
                    b => b.id === id
                  );

                if (!blog)
                  return;

                blogModalLabel.textContent =
                  "Edit Blog";

                blogDocId.value =
                  blog.id;

                blogTitle.value =
                  blog.title || "";

                blogCategory.value =
                  blog.category || "";

                blogAuthor.value =
                  blog.author || "";

                blogImageUrl.value =
                  blog.imageUrl || "";

                blogExcerpt.value =
                  blog.excerpt || "";

                blogStatus.value =
                  blog.active
                    ? "true"
                    : "false";

                blogFeatured.checked =
                  blog.featured || false;

                quill.root.innerHTML =
                  blog.content || "";

                blogModal.show();
              }
            );

          }
        );

      document
        .querySelectorAll(
          ".delete-blog"
        )
        .forEach(
          button => {

            button.addEventListener(
              "click",
              async () => {

                const id =
                  button.dataset.id;

                const ok =
                  confirm(
                    "Delete this blog?"
                  );

                if (!ok)
                  return;

                await deleteDoc(
                  doc(
                    db,
                    "blogs",
                    id
                  )
                );

                loadBlogs();
              }
            );

          }
        );
    }

    async function loadBlogs() {

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

      allBlogs =
        snapshot.docs.map(
          docSnap => ({
            id:
              docSnap.id,
            ...docSnap.data()
          })
        );

      updateStats();
      renderBlogs();
    }

    openAddBlogModal.addEventListener(
      "click",
      () => {

        blogModalLabel.textContent =
          "Add Blog";

        blogForm.reset();

        blogDocId.value = "";

        quill.root.innerHTML = "";

        blogFeatured.checked =
          false;

        blogStatus.value =
          "true";

        blogModal.show();
      }
    );

    blogForm.addEventListener(
      "submit",
      async (e) => {

        e.preventDefault();

        const payload = {

          title:
            blogTitle.value.trim(),

          category:
            blogCategory.value,

          author:
            blogAuthor.value.trim(),

          imageUrl:
            blogImageUrl.value.trim(),

          excerpt:
            blogExcerpt.value.trim(),

          content:
            quill.root.innerHTML,

          active:
            blogStatus.value === "true",

          featured:
            blogFeatured.checked,

          updatedAt:
            serverTimestamp()
        };

        try {

          if (
            blogDocId.value
          ) {

            await updateDoc(
              doc(
                db,
                "blogs",
                blogDocId.value
              ),
              payload
            );

          } else {

            payload.createdAt =
              serverTimestamp();

            await addDoc(
              collection(
                db,
                "blogs"
              ),
              payload
            );
          }

          blogModal.hide();

          loadBlogs();

        } catch (error) {

          console.error(
            error
          );

          alert(
            "Unable to save blog."
          );
        }

      }
    );

    searchBlogs.addEventListener(
      "input",
      renderBlogs
    );

    filterBlogCategory.addEventListener(
      "change",
      renderBlogs
    );

    filterBlogStatus.addEventListener(
      "change",
      renderBlogs
    );

    clearBlogFiltersBtn.addEventListener(
      "click",
      () => {

        searchBlogs.value = "";

        filterBlogCategory.value =
          "all";

        filterBlogStatus.value =
          "all";

        renderBlogs();
      }
    );

    loadBlogs();

  }
);