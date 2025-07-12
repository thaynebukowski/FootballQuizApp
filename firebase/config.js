// firebase/config.js
import { initializeApp } from 'firebase/app';
import {
  initializeAuth,
  getReactNativePersistence
} from 'firebase/auth';
import AsyncStorage from '@react-native-async-storage/async-storage';
import { getFirestore } from 'firebase/firestore';
import { getStorage } from 'firebase/storage';

const firebaseConfig = {
  apiKey: "AIzaSyDtE0d1zWfEe40DIY9b2xhh2fvFzPl8w7o",
  authDomain: "footballquizapp-18c41.firebaseapp.com",
  projectId: "footballquizapp-18c41",
  storageBucket: "footballquizapp-18c41.appspot.com",
  messagingSenderId: "604537178376",
  appId: "1:604537178376:web:eaa0c8314d15ac5b3244bd"
};

// Initialize Firebase app
const app = initializeApp(firebaseConfig);

// Set up authentication with persistence
const auth = initializeAuth(app, {
  persistence: getReactNativePersistence(AsyncStorage)
});

// Initialize Firestore and Storage
const db = getFirestore(app);
const storage = getStorage(app);

export { auth, db, storage };
