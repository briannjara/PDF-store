import { initializeApp } from 'firebase/app';
import { initializeAuth, getReactNativePersistence } from 'firebase/auth';
import ReactNativeAsyncStorage from '@react-native-async-storage/async-storage';
import { getFirestore } from 'firebase/firestore';

const firebaseConfig = {
    apiKey: "AIzaSyCpt1iXRDVCkavRhavCeKxWansiJqT0XFY",
  authDomain: "pdf-store-53776.firebaseapp.com",
  projectId: "pdf-store-53776",
  storageBucket: "pdf-store-53776.appspot.com",
  messagingSenderId: "849288637357",
  appId: "1:849288637357:web:e3bb815c10c718a195cf24",
  measurementId: "G-VCKW0Y2LWS"
};

// Initialize Firebase
const app = initializeApp(firebaseConfig);
const auth = initializeAuth(app, {
  persistence: getReactNativePersistence(ReactNativeAsyncStorage)
});
const db = getFirestore(app);

export { auth, db };