import { initializeApp } from 'firebase/app';
import { getAuth, initializeAuth, getReactNativePersistence } from 'firebase/auth';
import { getFirestore } from 'firebase/firestore';
import { getStorage } from 'firebase/storage';
import AsyncStorage from '@react-native-async-storage/async-storage';

const firebaseConfig = {
    apiKey: "AIzaSyCpt1iXRDVCkavRhavCeKxWansiJqT0XFY",
    authDomain: "pdf-store-53776.firebaseapp.com",
    projectId: "pdf-store-53776",
    storageBucket: "pdf-store-53776.appspot.com",
    messagingSenderId: "849288637357",
    appId: "1:849288637357:web:e3bb815c10c718a195cf24",
    measurementId: "G-VCKW0Y2LWS"
};

const app = initializeApp(firebaseConfig);

export const auth = initializeAuth(app, {
    persistence: getReactNativePersistence(AsyncStorage)
});

export const db = getFirestore(app);
export const storage = getStorage(app);

export default app;