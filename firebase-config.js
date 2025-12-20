// Firebase Configuration
// IMPORTANT: Replace these with your actual Firebase project credentials
// You can get these from the Firebase Console -> Project Settings
const firebaseConfig = {
    apiKey: "AIzaSyCSk-kkgRLYqWcMSf19djXaG43KC0rXdsM",
    authDomain: "games-away-nanhome.firebaseapp.com",
    projectId: "games-away-nanhome",
    storageBucket: "games-away-nanhome.firebasestorage.app",
    messagingSenderId: "19009835648",
    appId: "1:19009835648:web:f8adc8c86b654d36b7cc65",
    measurementId: "G-MXVCMGM4JL"
};

// Initialize Firebase
if (!firebase.apps.length) {
    firebase.initializeApp(firebaseConfig);
}

const auth = firebase.auth();
const db = firebase.firestore(); // Connects to (default) database automatically
const storage = firebase.storage();

console.log("Firebase initialized (Standard Mode)");
