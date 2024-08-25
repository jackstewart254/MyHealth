// Import the functions you need from the SDKs you need
import {initializeApp} from 'firebase/app';
import {getAnalytics} from 'firebase/analytics';
// TODO: Add SDKs for Firebase products that you want to use
// https://firebase.google.com/docs/web/setup#available-libraries

// Your web app's Firebase configuration
// For Firebase JS SDK v7.20.0 and later, measurementId is optional
const firebaseConfig = {
  apiKey: 'AIzaSyDvnjACJRSWsOYEGSLwH_3R7-HYa6D74HU',
  authDomain: 'mclean-aafda.firebaseapp.com',
  projectId: 'mclean-aafda',
  storageBucket: 'mclean-aafda.appspot.com',
  messagingSenderId: '98471504266',
  appId: '1:98471504266:web:f772598f0deb5221460073',
  measurementId: 'G-7W6P4MXYBC',
};

// Initialize Firebase
const app = initializeApp(firebaseConfig);
const analytics = getAnalytics(app);
