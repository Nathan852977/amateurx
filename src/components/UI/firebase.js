import { initializeApp } from 'firebase/app';
import firebase from 'firebase/app';
import 'firebase/auth';
import 'firebase/firestore';
import { getAuth, setPersistence, browserLocalPersistence } from 'firebase/auth';
import { getFirestore, collection, addDoc } from 'firebase/firestore';
import { getStorage } from "firebase/storage";

const firebaseConfig = {
    apiKey: "AIzaSyCoMX4QtQO7LeFkkvt9rIm3-elDUYx4GqE",
    authDomain: "amateurx-244e6.firebaseapp.com",
    projectId: "amateurx-244e6",
    storageBucket: "amateurx-244e6.appspot.com",
    messagingSenderId: "1020683274663",
    appId: "1:1020683274663:web:adca28dfa2c96edbba8e82",
    measurementId: "G-VMFKSR6DVD"
};

const app = initializeApp(firebaseConfig);
const db = getFirestore(app);
const auth = getAuth(app);
const storage = getStorage(app);

export { app, db, auth, storage };
