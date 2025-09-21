// src/firebase.js
import { initializeApp } from "firebase/app";
import { getFirestore } from "firebase/firestore";
import { getStorage } from "firebase/storage";

const firebaseConfig = {
  apiKey: "AIzaSyCm9HcBb7yn3yR6rMWdgzqR5WnrhfrNjls",
  authDomain: "just-sky-things.firebaseapp.com",
  projectId: "just-sky-things",
  storageBucket: "just-sky-things.appspot.com",
  messagingSenderId: "889903723825",
  appId: "1:889903723825:web:3aa9ed7fcbb4434f9eec10",
  measurementId: "G-303P76NXWM"
};


const app = initializeApp(firebaseConfig);

// Services
export const db = getFirestore(app);    
export const storage = getStorage(app); 

export default app;
