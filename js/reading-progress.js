// Reading Progress Tracker for BLACKWELL
// Saves user's reading position and allows marking their place

class ReadingProgress {
    constructor() {
        this.currentBook = null;
        this.currentChapter = null;
        this.scrollPosition = 0;
        this.init();
    }
    
    async init() {
        // Wait for auth to be ready
        authManager.onReady(() => {
            this.loadProgress();
            this.setupScrollTracking();
            this.createProgressUI();
        });
    }
    
    async loadProgress() {
        if (!authManager.isLoggedIn()) return;
        
        const params = this.getParams();
        if (!params.book || !params.chapter) return;
        
        this.currentBook = params.book;
        this.currentChapter = params.chapter;
        
        try {
            const { db, doc, getDoc } = window.firebaseDB;
            const user = authManager.getUser();
            
            const progressRef = doc(db, 'users', user.uid, 'progress', `${params.book}-${params.chapter}`);
            const progressDoc = await getDoc(progressRef);
            
            if (progressDoc.exists()) {
                const data = progressDoc.data();
                this.scrollPosition = data.scrollPosition || 0;
                
                // Ask user if they want to resume
                if (this.scrollPosition > 200) {
                    this.showResumePrompt(this.scrollPosition);
                }
            }
        } catch (error) {
            console.error('Error loading progress:', error);
        }
    }
    
    showResumePrompt(position) {
        const prompt = document.createElement('div');
        prompt.className = 'resume-prompt';
        prompt.innerHTML = `
            <div class="resume-content">
                <p>📚 Welcome back! Would you like to continue where you left off?</p>
                <div class="resume-buttons">
                    <button class="resume-yes">Yes, continue reading</button>
                    <button class="resume-no">Start from beginning</button>
                </div>
            </div>
        `;
        
        document.body.appendChild(prompt);
        
        prompt.querySelector('.resume-yes').onclick = () => {
            window.scrollTo({ top: position, behavior: 'smooth' });
            prompt.remove();
        };
        
        prompt.querySelector('.resume-no').onclick = () => {
            prompt.remove();
        };
        
        // Auto-dismiss after 10 seconds
        setTimeout(() => {
            if (prompt.parentNode) prompt.remove();
        }, 10000);
    }
    
    setupScrollTracking() {
        let saveTimeout;
        
        window.addEventListener('scroll', () => {
            clearTimeout(saveTimeout);
            saveTimeout = setTimeout(() => {
                this.saveProgress();
            }, 1000);
        });
    }
    
    async saveProgress() {
        if (!authManager.isLoggedIn()) return;
        if (!this.currentBook || !this.currentChapter) return;
        
        try {
            const { db, doc, setDoc, serverTimestamp } = window.firebaseDB;
            const user = authManager.getUser();
            
            const progressRef = doc(db, 'users', user.uid, 'progress', `${this.currentBook}-${this.currentChapter}`);
            await setDoc(progressRef, {
                book: this.currentBook,
                chapter: this.currentChapter,
                scrollPosition: window.scrollY,
                scrollPercentage: this.getScrollPercentage(),
                lastRead: serverTimestamp()
            });
            
            this.updateProgressIndicator();
        } catch (error) {
            console.error('Error saving progress:', error);
        }
    }
    
    getScrollPercentage() {
        const scrollTop = window.scrollY;
        const docHeight = document.documentElement.scrollHeight - window.innerHeight;
        return Math.round((scrollTop / docHeight) * 100);
    }
    
    createProgressUI() {
        // Progress bar at top
        const progressBar = document.createElement('div');
        progressBar.className = 'reading-progress-bar';
        progressBar.innerHTML = '<div class="progress-fill"></div>';
        document.body.appendChild(progressBar);
        
        // Bookmark button
        const bookmarkBtn = document.createElement('button');
        bookmarkBtn.className = 'bookmark-button';
        bookmarkBtn.innerHTML = '🔖';
        bookmarkBtn.title = 'Mark your place';
        bookmarkBtn.onclick = () => this.markPlace();
        
        if (authManager.isLoggedIn()) {
            document.body.appendChild(bookmarkBtn);
        }
        
        // Update on scroll
        window.addEventListener('scroll', () => this.updateProgressIndicator());
    }
    
    updateProgressIndicator() {
        const fill = document.querySelector('.progress-fill');
        if (fill) {
            fill.style.width = `${this.getScrollPercentage()}%`;
        }
    }
    
    async markPlace() {
        if (!authManager.isLoggedIn()) {
            alert('Please sign in to bookmark your place!');
            return;
        }
        
        await this.saveProgress();
        
        // Show confirmation
        const toast = document.createElement('div');
        toast.className = 'toast-message';
        toast.textContent = '🔖 Place marked! You can resume reading anytime.';
        document.body.appendChild(toast);
        
        setTimeout(() => toast.remove(), 3000);
    }
    
    getParams() {
        const params = new URLSearchParams(window.location.search);
        return {
            book: params.get('book'),
            chapter: params.get('chapter')
        };
    }
}

// Initialize reading progress
const readingProgress = new ReadingProgress();
