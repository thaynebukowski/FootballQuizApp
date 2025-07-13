// firebase/config.js

// Import the necessary functions from the Firebase SDKs
import { initializeApp } from 'firebase/app';
import {
  initializeAuth,
  getReactNativePersistence
} from 'firebase/auth';
import AsyncStorage from '@react-native-async-storage/async-storage';
import { getFirestore } from 'firebase/firestore';
import { getStorage } from 'firebase/storage';

// Your web app's Firebase configuration
// This object contains all the keys to connect your app to your Firebase project
const firebaseConfig = {
  apiKey: "AIzaSyDtE0d1zWfEe40DIY9b2xhh2fvFzPl8w7o",
  authDomain: "footballquizapp-18c41.firebaseapp.com",
  projectId: "footballquizapp-18c41",
  storageBucket: "footballquizapp-18c41.appspot.com", // Essential for file uploads
  messagingSenderId: "604537178376",
  appId: "1:604537178376:web:eaa0c8314d15ac5b3244bd"
};

// Initialize Firebase app with the configuration
const app = initializeApp(firebaseConfig);

// Set up authentication with persistence using AsyncStorage
// This keeps the user logged in even after they close the app
const auth = initializeAuth(app, {
  persistence: getReactNativePersistence(AsyncStorage)
});

// Initialize Cloud Firestore and Cloud Storage
const db = getFirestore(app);
const storage = getStorage(app);

// Export the initialized services so you can use them in other files
export { auth, db, storage };
