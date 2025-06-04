import { initializeApp } from 'firebase/app';
import { getAuth } from 'firebase/auth';

const firebaseConfig = {
  apiKey: "AIzaSyBmAf3WPH8wCnE6K0OPUZRxo8crilLGrhY",
  authDomain: "database-manager-471f3.firebaseapp.com",
  projectId: "database-manager-471f3",
  storageBucket: "database-manager-471f3.firebasestorage.app",
  messagingSenderId: "948306285325",
  appId: "1:948306285325:web:95cd58b1ae0d61c5a35644",
  measurementId: "G-573VR1W0ZD"
};

const app = initializeApp(firebaseConfig);
export const auth = getAuth(app);
