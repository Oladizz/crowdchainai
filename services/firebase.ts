// Import the functions you need from the SDKs you need
import { initializeApp } from "firebase/app";
import { getFirestore } from "firebase/firestore";
import { getStorage } from "firebase/storage";

// Your web app's Firebase configuration
const firebaseConfig = {
  apiKey: "AIzaSyBFhCm5wtVIAiwFYrd7RqEKP60rHQnQKEc",
  authDomain: "crowdchain-cbddc.firebaseapp.com",
  projectId: "crowdchain-cbddc",
  storageBucket: "crowdchain-cbddc.appspot.com",
  messagingSenderId: "992248848325",
  appId: "1:992248848325:web:9bc966f480bed1a33175ac",
  measurementId: "G-E59WSE5F46"
};

// Initialize Firebase
const app = initializeApp(firebaseConfig);
const db = getFirestore(app);
const storage = getStorage(app);

export { db, storage };