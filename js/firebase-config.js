// Firebase Configuration for BLACKWELL
// ========================================
// SETUP INSTRUCTIONS:
// 1. Go to https://console.firebase.google.com/
// 2. Create a new project called "BLACKWELL" (or any name you like)
// 3. Enable Authentication > Sign-in method > Google
// 4. Enable Firestore Database (start in test mode for now)
// 5. Go to Project Settings > General > Your apps > Add web app
// 6. Copy your config values and replace the placeholders below
// ========================================

const firebaseConfig = {
    apiKey: "YOUR_API_KEY",
    authDomain: "YOUR_PROJECT_ID.firebaseapp.com",
    projectId: "YOUR_PROJECT_ID",
    storageBucket: "YOUR_PROJECT_ID.appspot.com",
    messagingSenderId: "YOUR_SENDER_ID",
    appId: "YOUR_APP_ID"
};

// Initialize Firebase
let app, auth, db;

async function initFirebase() {
    try {
        // Dynamic import of Firebase modules
        const { initializeApp } = await import('https://www.gstatic.com/firebasejs/10.7.1/firebase-app.js');
        const { getAuth, GoogleAuthProvider, signInWithPopup, signOut, onAuthStateChanged } = await import('https://www.gstatic.com/firebasejs/10.7.1/firebase-auth.js');
        const { getFirestore, doc, getDoc, setDoc, updateDoc, collection, addDoc, query, where, getDocs, serverTimestamp, orderBy } = await import('https://www.gstatic.com/firebasejs/10.7.1/firebase-firestore.js');
        
        app = initializeApp(firebaseConfig);
        auth = getAuth(app);
        db = getFirestore(app);
        
        // Expose Firebase functions globally
        window.firebaseAuth = {
            auth,
            GoogleAuthProvider,
            signInWithPopup,
            signOut,
            onAuthStateChanged
        };
        
        window.firebaseDB = {
            db,
            doc,
            getDoc,
            setDoc,
            updateDoc,
            collection,
            addDoc,
            query,
            where,
            getDocs,
            serverTimestamp,
            orderBy
        };
        
        console.log('Firebase initialized successfully');
        return true;
    } catch (error) {
        console.error('Firebase initialization error:', error);
        return false;
    }
}

// Initialize on load
initFirebase();
