// Authentication System for BLACKWELL
// Handles Google Sign-In and user state

class AuthManager {
    constructor() {
        this.currentUser = null;
        this.isReady = false;
        this.readyCallbacks = [];
        this.init();
    }
    
    async init() {
        // Wait for Firebase to be ready
        await this.waitForFirebase();
        
        const { auth, onAuthStateChanged } = window.firebaseAuth;
        
        onAuthStateChanged(auth, (user) => {
            this.currentUser = user;
            this.updateUI();
            this.triggerReadyCallbacks();
        });
        
        this.isReady = true;
    }
    
    waitForFirebase() {
        return new Promise((resolve) => {
            const check = () => {
                if (window.firebaseAuth && window.firebaseDB) {
                    resolve();
                } else {
                    setTimeout(check, 100);
                }
            };
            check();
        });
    }
    
    onReady(callback) {
        if (this.isReady) {
            callback(this.currentUser);
        } else {
            this.readyCallbacks.push(callback);
        }
    }
    
    triggerReadyCallbacks() {
        this.readyCallbacks.forEach(cb => cb(this.currentUser));
        this.readyCallbacks = [];
    }
    
    async signIn() {
        try {
            const { auth, GoogleAuthProvider, signInWithPopup } = window.firebaseAuth;
            const provider = new GoogleAuthProvider();
            const result = await signInWithPopup(auth, provider);
            
            // Create/update user document
            await this.createUserDocument(result.user);
            
            return result.user;
        } catch (error) {
            console.error('Sign in error:', error);
            throw error;
        }
    }
    
    async signOut() {
        try {
            const { auth, signOut } = window.firebaseAuth;
            await signOut(auth);
        } catch (error) {
            console.error('Sign out error:', error);
            throw error;
        }
    }
    
    async createUserDocument(user) {
        const { db, doc, getDoc, setDoc, serverTimestamp } = window.firebaseDB;
        
        const userRef = doc(db, 'users', user.uid);
        const userDoc = await getDoc(userRef);
        
        if (!userDoc.exists()) {
            await setDoc(userRef, {
                email: user.email,
                displayName: user.displayName,
                photoURL: user.photoURL,
                createdAt: serverTimestamp(),
                lastLogin: serverTimestamp()
            });
        } else {
            await setDoc(userRef, { lastLogin: serverTimestamp() }, { merge: true });
        }
    }
    
    updateUI() {
        const authButton = document.getElementById('auth-button');
        const userInfo = document.getElementById('user-info');
        const userAvatar = document.getElementById('user-avatar');
        const userName = document.getElementById('user-name');
        
        if (!authButton) return;
        
        if (this.currentUser) {
            authButton.textContent = 'Sign Out';
            authButton.onclick = () => this.signOut();
            
            if (userInfo) {
                userInfo.style.display = 'flex';
                if (userAvatar) userAvatar.src = this.currentUser.photoURL || '';
                if (userName) userName.textContent = this.currentUser.displayName || 'Reader';
            }
        } else {
            authButton.textContent = 'Sign In';
            authButton.onclick = () => this.signIn();
            
            if (userInfo) {
                userInfo.style.display = 'none';
            }
        }
    }
    
    getUser() {
        return this.currentUser;
    }
    
    isLoggedIn() {
        return !!this.currentUser;
    }
}

// Global auth manager instance
const authManager = new AuthManager();
