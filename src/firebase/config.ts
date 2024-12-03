import { initializeApp } from 'firebase/app';
import { getAuth, PhoneAuthProvider } from 'firebase/auth';
import { getFirestore } from 'firebase/firestore';
import { getStorage } from 'firebase/storage';

const firebaseConfig = {
  apiKey: "AIzaSyDVJNRsLxUpsD6DfrVev9Av3-trfDygeLE",
  authDomain: "reciepts-scanner.firebaseapp.com",
  projectId: "reciepts-scanner",
  storageBucket: "reciepts-scanner.firebasestorage.app",
  messagingSenderId: "584208815336",
  appId: "1:584208815336:web:50e4b2d30f06e39a3de55d",
  measurementId: "G-CX79YGZ2P7"
};

// Initialize Firebase
const app = initializeApp(firebaseConfig);

// Initialize Firebase services
export const auth = getAuth(app);

// Ensure phone authentication is properly configured
auth.settings = {
  ...auth.settings,
  appVerificationDisabledForTesting: false // Enable real SMS verification
};

// Export providers and IDs
export const phoneAuthProvider = new PhoneAuthProvider(auth);
export const webClientId = "584208815336-8ghqkkpj7hqicjkq480hlrbasf97jjlf.apps.googleusercontent.com";
export const db = getFirestore(app);
export const storage = getStorage(app);

export default app;
