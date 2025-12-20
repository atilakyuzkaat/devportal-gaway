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
// Note: For compat SDK, we try to get the named instance.
// If this fails, we might need to use the default database.
let db;
try {
    // Attempt to access the named database
    // This syntax is specific to how compat libraries bridge to modular SDKs
    // If this doesn't work, we fall back to default but user needs to create default DB.
    db = app.firestore('gamesdbs');
} catch (e) {
    console.warn("Could not connect to named database 'gamesdbs', falling back to default.", e);
    db = firebase.firestore();
}

const storage = firebase.storage();

console.log("Firebase initialized");
