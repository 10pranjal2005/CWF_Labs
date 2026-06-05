// CWF Labs Firebase configuration
// Browser-friendly modular SDK imports

import { initializeApp } from "https://www.gstatic.com/firebasejs/10.13.2/firebase-app.js";
import {
  getAuth,
  setPersistence,
  browserLocalPersistence
} from "https://www.gstatic.com/firebasejs/10.13.2/firebase-auth.js";
import {
  getFirestore
} from "https://www.gstatic.com/firebasejs/10.13.2/firebase-firestore.js";

const firebaseConfig = {
  apiKey: "AIzaSyBQ6YKWdsc_HHMyIlrwU8r9Mg6vO3jTmq0",
  authDomain: "cwf-labs.firebaseapp.com",
  projectId: "cwf-labs",
  storageBucket: "cwf-labs.firebasestorage.app",
  messagingSenderId: "884580606905",
  appId: "1:884580606905:web:70c54c54c609ea1cb90c68"
};

const app = initializeApp(firebaseConfig);
const auth = getAuth(app);
const db = getFirestore(app);

setPersistence(auth, browserLocalPersistence).catch((error) => {
  console.error("Firebase auth persistence error:", error);
});

window.cwfFirebase = {
  app,
  auth,
  db
};

export { app, auth, db };