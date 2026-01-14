// Firebase Configuration for BLACKWELL
// ========================================

const firebaseConfig = {
    apiKey: "AIzaSyCHzlVoWG1WqTb1llACxqcBEmMfHtUehY0",
    authDomain: "blackwell-45fb8.firebaseapp.com",
    databaseURL: "https://blackwell-45fb8-default-rtdb.firebaseio.com",
    projectId: "blackwell-45fb8",
    storageBucket: "blackwell-45fb8.firebasestorage.app",
    messagingSenderId: "863206331351",
    appId: "1:863206331351:web:c7efc55bc179a1b97a7192",
    measurementId: "G-XP1ZHPMM10"
};

// Initialize Firebase
let app, auth, db, rtdb;

async function initFirebase() {
    try {
        // Dynamic import of Firebase modules
        const { initializeApp } = await import('https://www.gstatic.com/firebasejs/10.7.1/firebase-app.js');
        const { getAuth, GoogleAuthProvider, signInWithPopup, signOut, onAuthStateChanged } = await import('https://www.gstatic.com/firebasejs/10.7.1/firebase-auth.js');
        const { getFirestore, doc, getDoc, setDoc, updateDoc, collection, addDoc, query, where, getDocs, serverTimestamp, orderBy } = await import('https://www.gstatic.com/firebasejs/10.7.1/firebase-firestore.js');
        const { getDatabase, ref, push, set, onValue, onChildAdded, onChildRemoved, remove, get } = await import('https://www.gstatic.com/firebasejs/10.7.1/firebase-database.js');
        
        app = initializeApp(firebaseConfig);
        auth = getAuth(app);
        db = getFirestore(app);
        rtdb = getDatabase(app);
        
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
        
        window.firebaseRTDB = {
            rtdb,
            ref,
            push,
            set,
            onValue,
            onChildAdded,
            onChildRemoved,
            remove,
            get
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
