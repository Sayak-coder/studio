
import { initializeApp, getApps, getApp } from 'firebase/app';

export const firebaseConfig = {
  "projectId": "studio-8031147147-a5125",
  "appId": "1:158263526374:web:00afabd8edca6c7a9a0c27",
  "storageBucket": "studio-8031147147-a5125.appspot.com",
  "apiKey": "AIzaSyCaLn1jCECDvSrmIcPRphfbrsBSWiLUKfk",
  "authDomain": "studio-8031147147-a5125.firebaseapp.com",
  "measurementId": "",
  "messagingSenderId": "158263526374"
};

// Initialize Firebase
const firebaseApp = !getApps().length ? initializeApp(firebaseConfig) : getApp();

export { firebaseApp };
