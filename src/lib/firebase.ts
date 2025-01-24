import { initializeApp } from 'firebase/app';
import { getAuth } from 'firebase/auth';
import { getFirestore } from 'firebase/firestore';

const firebaseConfig = {
  apiKey: "AIzaSyCMHiFlYrBDA1EqMYn0P6NFoDRB_eIytiI",
  authDomain: "pluria-leads.firebaseapp.com",
  databaseURL: "https://pluria-leads-default-rtdb.firebaseio.com",
  projectId: "pluria-leads",
  storageBucket: "pluria-leads.firebasestorage.app",
  messagingSenderId: "570279132094",
  appId: "1:570279132094:web:55fd8cd993c2539fd6d7ef",
  measurementId: "G-Y5M0ZMX47R"
};

const app = initializeApp(firebaseConfig);
export const auth = getAuth(app);
export const db = getFirestore(app);