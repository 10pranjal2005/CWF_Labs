import { auth, db } from "./firebase-config.js";
import {
  signInWithEmailAndPassword,
  signOut,
  createUserWithEmailAndPassword,
  updateProfile
} from "https://www.gstatic.com/firebasejs/10.13.2/firebase-auth.js";
import {
  collection,
  doc,
  getDocs,
  query,
  where,
  setDoc,
  serverTimestamp
} from "https://www.gstatic.com/firebasejs/10.13.2/firebase-firestore.js";

document.addEventListener("DOMContentLoaded", () => {
  const signinForm = document.getElementById("adminSigninForm");
  const requestForm = document.getElementById("adminRequestForm");

  function showMessage(type, title, message) {
    const existingAlert = document.querySelector(".auth-alert");
    if (existingAlert) {
      existingAlert.remove();
    }

    const alertBox = document.createElement("div");
    alertBox.className = `alert alert-${type} auth-alert mt-4`;
    alertBox.setAttribute("role", "alert");

    alertBox.innerHTML = `
      <strong>${title}</strong> ${message}
    `;

    const targetCard = document.querySelector(".tab-content");
    if (targetCard) {
      targetCard.prepend(alertBox);
    }
  }

  async function findApprovedAdminByEmail(email) {
    const q = query(collection(db, "admins"), where("email", "==", email));
    const snapshot = await getDocs(q);

    if (snapshot.empty) {
      return null;
    }

    let approvedRecord = null;

    snapshot.forEach((docSnap) => {
      const data = docSnap.data();
      if (data.approved === true) {
        approvedRecord = {
          id: docSnap.id,
          ...data
        };
      }
    });

    return approvedRecord;
  }

  if (signinForm) {
    signinForm.addEventListener("submit", async (e) => {
      e.preventDefault();

      const email = document.getElementById("signinEmail")?.value.trim();
      const password = document.getElementById("signinPassword")?.value.trim();

      if (!email || !password) {
        showMessage(
          "warning",
          "Missing details.",
          "Please enter both email and password."
        );
        return;
      }

      try {
        const credentials = await signInWithEmailAndPassword(auth, email, password);

        const approvedAdmin = await findApprovedAdminByEmail(credentials.user.email || email);

        if (!approvedAdmin) {
          await signOut(auth);
          showMessage(
            "warning",
            "Access pending.",
            "Your account is not approved yet. Please wait for manager approval."
          );
          return;
        }

        showMessage(
          "success",
          "Login successful.",
          "Redirecting to the admin dashboard..."
        );

        setTimeout(() => {
          window.location.href = "dashboard.html";
        }, 900);
      } catch (error) {
        let message = "Please check your login details and try again.";

        if (error.code === "auth/invalid-email") {
          message = "The email address is invalid.";
        } else if (error.code === "auth/user-not-found") {
          message = "No account found for this email.";
        } else if (error.code === "auth/wrong-password") {
          message = "The password is incorrect.";
        } else if (error.code === "auth/invalid-credential") {
          message = "Invalid login credentials.";
        }

        showMessage("danger", "Sign in failed.", message);
      }
    });
  }

  if (requestForm) {
    requestForm.addEventListener("submit", async (e) => {
      e.preventDefault();

      const name = document.getElementById("requestName")?.value.trim();
      const phone = document.getElementById("requestPhone")?.value.trim();
      const email = document.getElementById("requestEmail")?.value.trim();
      const password = document.getElementById("requestPassword")?.value.trim();
      const role = document.getElementById("requestRole")?.value.trim();
      const reason = document.getElementById("requestReason")?.value.trim();

      if (!name || !phone || !email || !password || !role) {
        showMessage(
          "warning",
          "Missing details.",
          "Please complete all required fields before submitting the request."
        );
        return;
      }

      try {
        const userCredential = await createUserWithEmailAndPassword(auth, email, password);

        await updateProfile(userCredential.user, {
          displayName: name
        });

        const requestData = {
          uid: userCredential.user.uid,
          name,
          phone,
          email,
          requestedRole: role,
          reason: reason || "",
          status: "pending",
          approved: false,
          createdAt: serverTimestamp()
        };

        await setDoc(doc(db, "admin_requests", userCredential.user.uid), requestData);

        showMessage(
          "success",
          "Request submitted.",
          "Your admin access request has been saved as pending for manager review."
        );

        requestForm.reset();

        await signOut(auth);
      } catch (error) {
        let message = "Could not submit the request. Please try again.";

        if (error.code === "auth/email-already-in-use") {
          message = "This email is already registered.";
        } else if (error.code === "auth/invalid-email") {
          message = "The email address is invalid.";
        } else if (error.code === "auth/weak-password") {
          message = "Password should be stronger.";
        } else if (error.code === "auth/operation-not-allowed") {
          message = "Email/password sign-in is not enabled in Firebase Authentication.";
        }

        showMessage("danger", "Request failed.", message);
      }
    });
  }
});