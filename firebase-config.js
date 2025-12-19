// Firebase Configuration
// IMPORTANT: Replace these with your actual Firebase project credentials
// You can get these from the Firebase Console -> Project Settings
const firebaseConfig = {
    apiKey: "YOUR_API_KEY_HERE",
    authDomain: "your-project-id.firebaseapp.com",
    projectId: "your-project-id",
    storageBucket: "your-project-id.firebasestorage.app",
    messagingSenderId: "1234567890",
    appId: "1:1234567890:web:abcdef123456"
};

// Initialize Firebase
if (!firebase.apps.length) {
    firebase.initializeApp(firebaseConfig);
}

const auth = firebase.auth();
const db = firebase.firestore();
const storage = firebase.storage();

console.log("Firebase initialized");
