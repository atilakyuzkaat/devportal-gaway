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
const storage = firebase.storage();

// Connect to the named database "gamesdbs"
let db;
try {
    // Explicitly connect to the named database
    db = firebase.firestore(app, 'gamesdbs');
    console.log("SUCCESS: Initialized Firestore with named database: gamesdbs");
} catch (e) {
    console.error("CRITICAL ERROR: Failed to initialize named database 'gamesdbs'.", e);
    // Do NOT fall back to default, as it doesn't exist.
    // Let the app crash or show the real error.
    alert("Database Connection Error: " + e.message);
}

console.log("Firebase initialized");
