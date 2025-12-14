import { initializeApp, getApp, getApps, type FirebaseOptions } from 'firebase/app';

const getFirebaseConfig = (): FirebaseOptions => {
  const firebaseConfig = {
    apiKey: process.env.NEXT_PUBLIC_FIREBASE_API_KEY,
    authDomain: process.env.NEXT_PUBLIC_FIREBASE_AUTH_DOMAIN,
    projectId: process.env.NEXT_PUBLIC_FIREBASE_PROJECT_ID,
    storageBucket: process.env.NEXT_PUBLIC_FIREBASE_STORAGE_BUCKET,
    messagingSenderId: process.env.NEXT_PUBLIC_FIREBASE_MESSAGING_SENDER_ID,
    appId: process.env.NEXT_PUBLIC_FIREBASE_APP_ID,
  };

  // Basic validation to ensure all required fields are present
  if (Object.values(firebaseConfig).some(value => !value)) {
    console.error('Firebase config is missing one or more required values.');
    // You might want to throw an error here or handle it differently
  }

  return firebaseConfig;
};


// Initialize Firebase
// The expression `!getApps().length` is used to ensure that Firebase is
// initialized only once.
export const firebaseApp = !getApps().length
  ? initializeApp(getFirebaseConfig())
  : getApp();