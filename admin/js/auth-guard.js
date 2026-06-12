import { auth, db } from "../../js/firebase-config.js";

import {
  onAuthStateChanged,
  signOut
} from "https://www.gstatic.com/firebasejs/10.13.2/firebase-auth.js";

import {
  collection,
  query,
  where,
  getDocs
} from "https://www.gstatic.com/firebasejs/10.13.2/firebase-firestore.js";

onAuthStateChanged(auth, async (user) => {

  if (!user) {

    window.location.replace(
      "/admin/login.html"
    );

    return;

  }

  try {

    const adminQuery = query(
      collection(db, "admins"),
      where("email", "==", user.email)
    );

    const snapshot =
      await getDocs(adminQuery);

    if (snapshot.empty) {

      await signOut(auth);

      window.location.replace(
        "/admin/login.html"
      );

      return;

    }

    document.body.style.display =
      "block";

  }

  catch (error) {

    console.error(
      "Admin verification failed:",
      error
    );

    await signOut(auth);

    window.location.replace(
      "/admin/login.html"
    );

  }

});