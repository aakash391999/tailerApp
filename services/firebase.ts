import { initializeApp } from "firebase/app";
import { getAuth } from "firebase/auth";
import { getFirestore } from "firebase/firestore";
import { getStorage } from "firebase/storage";
import { getAnalytics } from "firebase/analytics";

// Your web app's Firebase configuration
const firebaseConfig = {
  apiKey: "AIzaSyBC0kVG-42FQpqDz8ufxQSNDqwRBp48_4g",
  authDomain: "tailer-d01e8.firebaseapp.com",
  databaseURL: "https://tailer-d01e8-default-rtdb.firebaseio.com",
  projectId: "tailer-d01e8",
  storageBucket: "tailer-d01e8.firebasestorage.app",
  messagingSenderId: "959871855432",
  appId: "1:959871855432:web:40e53ecf4f03ef8769e17d",
  measurementId: "G-ZWSPW1YX3C"
};

// Initialize Firebase
const app = initializeApp(firebaseConfig);
export const auth = getAuth(app);
export const db = getFirestore(app);
export const storage = getStorage(app);
export const analytics = getAnalytics(app);