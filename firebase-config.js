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
let app;
if (!firebase.apps.length) {
    app = firebase.initializeApp(firebaseConfig);
} else {
    app = firebase.app();
}

const auth = firebase.auth();

// Connect to the named database "gamesdbs"
let db;
try {
    // verified syntax for compat mode named database
    db = firebase.firestore(app, 'gamesdbs');
    console.log("Connected to named database: gamesdbs");
} catch (e) {
    console.warn("Could not connect to named database 'gamesdbs', falling back to default.", e);
    db = firebase.firestore();
}

const storage = firebase.storage();

console.log("Firebase initialized");
