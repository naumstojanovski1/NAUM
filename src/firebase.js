import { initializeApp } from "firebase/app";
import { getFirestore } from "firebase/firestore";
import { getFunctions } from "firebase/functions";

const firebaseConfig = {
  apiKey: "AIzaSyDh5whYPFN1p59JIZifx5tVu1pBPwBf2OM",
  authDomain: "hotel-react-app.firebaseapp.com",
  projectId: "hotel-react-app",
  storageBucket: "hotel-react-app.firebasestorage.app",
  messagingSenderId: "179117906052",
  appId: "1:179117906052:web:fa730f95e76b6995d0cad1"
};

const app = initializeApp(firebaseConfig);
export const db = getFirestore(app);
export const functions = getFunctions(app);
