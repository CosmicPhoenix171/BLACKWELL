// Text Highlighting & Notes System for BLACKWELL
// Allows readers to highlight text and leave notes/feedback

class NotesHighlight {
    constructor() {
        this.selectedText = '';
        this.selectionRange = null;
        this.init();
    }
    
    async init() {
        authManager.onReady(() => {
            this.createNoteUI();
            this.setupTextSelection();
            this.loadExistingNotes();
        });
    }
    
    createNoteUI() {
        // Floating note button that appears on text selection
        const noteButton = document.createElement('div');
        noteButton.className = 'note-popup-button';
        noteButton.innerHTML = '📝 Add Note';
        noteButton.style.display = 'none';
        document.body.appendChild(noteButton);
        this.noteButton = noteButton;
        
        // Note modal
        const noteModal = document.createElement('div');
        noteModal.className = 'note-modal';
        noteModal.innerHTML = `
            <div class="note-modal-content">
                <div class="note-modal-header">
                    <h3>📝 Leave Feedback</h3>
                    <button class="note-close">&times;</button>
                </div>
                <div class="note-modal-body">
                    <div class="selected-text-preview">
                        <label>Selected text:</label>
                        <p class="quoted-text"></p>
                    </div>
                    <div class="note-type-select">
                        <label>Feedback type:</label>
                        <select id="note-type">
                            <option value="typo">🔤 Typo / Grammar</option>
                            <option value="confusion">❓ Confusing / Unclear</option>
                            <option value="plothole">🕳️ Plot Hole</option>
                            <option value="suggestion">💡 Suggestion</option>
                            <option value="love">❤️ Love this part!</option>
                            <option value="other">📌 Other</option>
                        </select>
                    </div>
                    <div class="note-textarea">
                        <label>Your note (optional):</label>
                        <textarea id="note-text" placeholder="Add details about your feedback..."></textarea>
                    </div>
                </div>
                <div class="note-modal-footer">
                    <button class="note-cancel">Cancel</button>
                    <button class="note-submit">Submit Feedback</button>
                </div>
            </div>
        `;
        document.body.appendChild(noteModal);
        this.noteModal = noteModal;
        
        // Event listeners
        noteButton.onclick = () => this.openNoteModal();
        noteModal.querySelector('.note-close').onclick = () => this.closeNoteModal();
        noteModal.querySelector('.note-cancel').onclick = () => this.closeNoteModal();
        noteModal.querySelector('.note-submit').onclick = () => this.submitNote();
        
        // Close on outside click
        noteModal.onclick = (e) => {
            if (e.target === noteModal) this.closeNoteModal();
        };
    }
    
    setupTextSelection() {
        const contentArea = document.getElementById('chapter-content');
        if (!contentArea) return;
        
        document.addEventListener('mouseup', (e) => {
            const selection = window.getSelection();
            const selectedText = selection.toString().trim();
            
            if (selectedText.length > 3 && contentArea.contains(selection.anchorNode)) {
                this.selectedText = selectedText;
                this.selectionRange = selection.getRangeAt(0).cloneRange();
                this.showNoteButton(e.pageX, e.pageY);
            } else {
                this.hideNoteButton();
            }
        });
        
        // Hide button when clicking elsewhere
        document.addEventListener('mousedown', (e) => {
            if (!this.noteButton.contains(e.target) && !this.noteModal.contains(e.target)) {
                this.hideNoteButton();
            }
        });
    }
    
    showNoteButton(x, y) {
        if (!authManager.isLoggedIn()) {
            // Show sign-in prompt instead
            this.noteButton.innerHTML = '🔐 Sign in to add notes';
            this.noteButton.onclick = () => authManager.signIn();
        } else {
            this.noteButton.innerHTML = '📝 Add Note';
            this.noteButton.onclick = () => this.openNoteModal();
        }
        
        this.noteButton.style.left = `${x}px`;
        this.noteButton.style.top = `${y - 50}px`;
        this.noteButton.style.display = 'block';
    }
    
    hideNoteButton() {
        this.noteButton.style.display = 'none';
    }
    
    openNoteModal() {
        if (!authManager.isLoggedIn()) {
            authManager.signIn();
            return;
        }
        
        this.noteModal.querySelector('.quoted-text').textContent = `"${this.selectedText}"`;
        this.noteModal.querySelector('#note-type').value = 'suggestion';
        this.noteModal.querySelector('#note-text').value = '';
        this.noteModal.classList.add('show');
        this.hideNoteButton();
    }
    
    closeNoteModal() {
        this.noteModal.classList.remove('show');
        this.selectedText = '';
    }
    
    async submitNote() {
        if (!authManager.isLoggedIn()) return;
        
        const noteType = this.noteModal.querySelector('#note-type').value;
        const noteText = this.noteModal.querySelector('#note-text').value;
        
        const params = new URLSearchParams(window.location.search);
        
        try {
            const { db, collection, addDoc, serverTimestamp } = window.firebaseDB;
            const user = authManager.getUser();
            
            await addDoc(collection(db, 'feedback'), {
                userId: user.uid,
                userEmail: user.email,
                userName: user.displayName,
                book: params.get('book') || 'unknown',
                chapter: params.get('chapter') || 'unknown',
                pageUrl: window.location.href,
                selectedText: this.selectedText,
                noteType: noteType,
                noteText: noteText,
                timestamp: serverTimestamp(),
                status: 'new' // new, reviewed, resolved
            });
            
            // Highlight the text
            this.highlightText();
            
            // Show success
            this.closeNoteModal();
            this.showToast('✅ Feedback submitted! Thank you for helping improve the story.');
            
        } catch (error) {
            console.error('Error submitting note:', error);
            this.showToast('❌ Error submitting feedback. Please try again.');
        }
    }
    
    highlightText() {
        if (!this.selectionRange) return;
        
        try {
            const span = document.createElement('span');
            span.className = 'user-highlight';
            this.selectionRange.surroundContents(span);
        } catch (e) {
            // Selection spans multiple elements, can't highlight
            console.log('Could not highlight text:', e);
        }
    }
    
    async loadExistingNotes() {
        // This could load user's previous highlights if desired
        // For now, highlights are session-only
    }
    
    showToast(message) {
        const toast = document.createElement('div');
        toast.className = 'toast-message';
        toast.textContent = message;
        document.body.appendChild(toast);
        setTimeout(() => toast.remove(), 4000);
    }
}

// Initialize notes system
const notesHighlight = new NotesHighlight();
