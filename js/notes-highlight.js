// Text Highlighting & Notes System for BLACKWELL
// Public annotations using Firebase Realtime Database
// All users can see each other's highlights and notes

class NotesHighlight {
    constructor() {
        this.selectedText = '';
        this.selectionRange = null;
        this.annotations = new Map(); // Store annotations by ID
        this.init();
    }
    
    async init() {
        // Wait for auth to be ready
        const checkReady = setInterval(() => {
            if (window.authManager) {
                clearInterval(checkReady);
                window.authManager.onReady(() => {
                    this.createNoteUI();
                    this.setupTextSelection();
                    this.loadPublicAnnotations();
                });
            }
        }, 100);
    }
    
    getChapterPath() {
        const params = new URLSearchParams(window.location.search);
        const book = params.get('book') || 'book-one';
        const chapter = params.get('chapter') || 'chapter-01';
        return `annotations/${book}/${chapter}`;
    }
    
    createNoteUI() {
        // Floating note button that appears on text selection
        const noteButton = document.createElement('div');
        noteButton.className = 'note-popup-button';
        noteButton.innerHTML = '📝 Add Note';
        noteButton.style.display = 'none';
        document.body.appendChild(noteButton);
        this.noteButton = noteButton;
        
        // Note modal for adding new notes
        const noteModal = document.createElement('div');
        noteModal.className = 'note-modal';
        noteModal.innerHTML = `
            <div class="note-modal-content">
                <div class="note-modal-header">
                    <h3>📝 Leave a Public Note</h3>
                    <button class="note-close">&times;</button>
                </div>
                <div class="note-modal-body">
                    <div class="selected-text-preview">
                        <label>Selected text:</label>
                        <p class="quoted-text"></p>
                    </div>
                    <div class="note-type-select">
                        <label>Note type:</label>
                        <select id="note-type">
                            <option value="comment">💬 Comment</option>
                            <option value="typo">🔤 Typo / Grammar</option>
                            <option value="confusion">❓ Confusing / Unclear</option>
                            <option value="plothole">🕳️ Plot Hole</option>
                            <option value="suggestion">💡 Suggestion</option>
                            <option value="love">❤️ Love this part!</option>
                            <option value="theory">🔮 Theory</option>
                        </select>
                    </div>
                    <div class="note-textarea">
                        <label>Your note:</label>
                        <textarea id="note-text" placeholder="Share your thoughts with other readers..." required></textarea>
                    </div>
                </div>
                <div class="note-modal-footer">
                    <button class="note-cancel">Cancel</button>
                    <button class="note-submit">Post Note</button>
                </div>
            </div>
        `;
        document.body.appendChild(noteModal);
        this.noteModal = noteModal;
        
        // Annotation popup for viewing existing notes
        const annotationPopup = document.createElement('div');
        annotationPopup.className = 'annotation-popup';
        annotationPopup.innerHTML = `
            <div class="annotation-popup-content">
                <div class="annotation-header">
                    <span class="annotation-user"></span>
                    <span class="annotation-time"></span>
                </div>
                <div class="annotation-type"></div>
                <div class="annotation-text"></div>
                <div class="annotation-actions"></div>
            </div>
        `;
        document.body.appendChild(annotationPopup);
        this.annotationPopup = annotationPopup;
        
        // Event listeners
        noteButton.onclick = () => this.openNoteModal();
        noteModal.querySelector('.note-close').onclick = () => this.closeNoteModal();
        noteModal.querySelector('.note-cancel').onclick = () => this.closeNoteModal();
        noteModal.querySelector('.note-submit').onclick = () => this.submitNote();
        
        // Close on outside click
        noteModal.onclick = (e) => {
            if (e.target === noteModal) this.closeNoteModal();
        };
        
        // Hide annotation popup when clicking elsewhere
        document.addEventListener('click', (e) => {
            if (!e.target.closest('.public-highlight') && !e.target.closest('.annotation-popup')) {
                this.hideAnnotationPopup();
            }
        });
    }
    
    setupTextSelection() {
        const contentArea = document.getElementById('chapter-content');
        if (!contentArea) return;
        
        document.addEventListener('mouseup', (e) => {
            // Don't trigger on highlighted text clicks
            if (e.target.closest('.public-highlight')) return;
            
            const selection = window.getSelection();
            const selectedText = selection.toString().trim();
            
            if (selectedText.length > 3 && contentArea.contains(selection.anchorNode)) {
                this.selectedText = selectedText;
                try {
                    this.selectionRange = selection.getRangeAt(0).cloneRange();
                    // Store text position info for later matching
                    this.selectionContext = this.getSelectionContext(selection);
                    this.showNoteButton(e.pageX, e.pageY);
                } catch (err) {
                    console.log('Selection error:', err);
                }
            } else {
                this.hideNoteButton();
            }
        });
        
        document.addEventListener('mousedown', (e) => {
            if (!this.noteButton.contains(e.target) && !this.noteModal.contains(e.target)) {
                this.hideNoteButton();
            }
        });
    }
    
    getSelectionContext(selection) {
        // Get text before and after selection for matching
        const range = selection.getRangeAt(0);
        const container = document.getElementById('chapter-content');
        if (!container) return null;
        
        const fullText = container.textContent;
        const selectedText = selection.toString();
        const startIndex = fullText.indexOf(selectedText);
        
        return {
            text: selectedText,
            beforeContext: fullText.substring(Math.max(0, startIndex - 30), startIndex),
            afterContext: fullText.substring(startIndex + selectedText.length, startIndex + selectedText.length + 30)
        };
    }
    
    showNoteButton(x, y) {
        if (!window.authManager.isLoggedIn()) {
            this.noteButton.innerHTML = '🔐 Sign in to add notes';
            this.noteButton.onclick = () => window.authManager.signIn();
        } else {
            this.noteButton.innerHTML = '📝 Add Note';
            this.noteButton.onclick = () => this.openNoteModal();
        }
        
        this.noteButton.style.left = `${Math.min(x, window.innerWidth - 150)}px`;
        this.noteButton.style.top = `${y - 50}px`;
        this.noteButton.style.display = 'block';
    }
    
    hideNoteButton() {
        this.noteButton.style.display = 'none';
    }
    
    openNoteModal() {
        if (!window.authManager.isLoggedIn()) {
            window.authManager.signIn();
            return;
        }
        
        this.noteModal.querySelector('.quoted-text').textContent = `"${this.selectedText}"`;
        this.noteModal.querySelector('#note-type').value = 'comment';
        this.noteModal.querySelector('#note-text').value = '';
        this.noteModal.classList.add('show');
        this.hideNoteButton();
    }
    
    closeNoteModal() {
        this.noteModal.classList.remove('show');
        this.selectedText = '';
    }
    
    async submitNote() {
        if (!window.authManager.isLoggedIn()) return;
        
        const noteType = this.noteModal.querySelector('#note-type').value;
        const noteText = this.noteModal.querySelector('#note-text').value.trim();
        
        if (!noteText) {
            this.showToast('⚠️ Please enter a note');
            return;
        }
        
        try {
            const { rtdb, ref, push, set } = window.firebaseRTDB;
            const user = window.authManager.getUser();
            const path = this.getChapterPath();
            
            const annotationRef = push(ref(rtdb, path));
            
            await set(annotationRef, {
                userId: user.uid,
                userName: user.displayName || 'Anonymous',
                userPhoto: user.photoURL || null,
                selectedText: this.selectedText,
                context: this.selectionContext,
                noteType: noteType,
                noteText: noteText,
                timestamp: Date.now()
            });
            
            this.closeNoteModal();
            this.showToast('✅ Note posted! Other readers can now see it.');
            
        } catch (error) {
            console.error('Error submitting note:', error);
            this.showToast('❌ Error posting note. Please try again.');
        }
    }
    
    async loadPublicAnnotations() {
        const contentArea = document.getElementById('chapter-content');
        if (!contentArea) return;
        
        try {
            const { rtdb, ref, onChildAdded, onChildRemoved } = window.firebaseRTDB;
            const path = this.getChapterPath();
            const annotationsRef = ref(rtdb, path);
            
            // Listen for new annotations
            onChildAdded(annotationsRef, (snapshot) => {
                const annotation = snapshot.val();
                const id = snapshot.key;
                this.annotations.set(id, annotation);
                this.renderAnnotation(id, annotation);
            });
            
            // Listen for removed annotations
            onChildRemoved(annotationsRef, (snapshot) => {
                const id = snapshot.key;
                this.annotations.delete(id);
                this.removeAnnotationHighlight(id);
            });
            
        } catch (error) {
            console.error('Error loading annotations:', error);
        }
    }
    
    renderAnnotation(id, annotation) {
        const contentArea = document.getElementById('chapter-content');
        if (!contentArea) return;
        
        // Find the text in the content
        const textToFind = annotation.selectedText;
        if (!textToFind) return;
        
        // Use TreeWalker to find text nodes
        const walker = document.createTreeWalker(
            contentArea,
            NodeFilter.SHOW_TEXT,
            null,
            false
        );
        
        let node;
        while (node = walker.nextNode()) {
            const index = node.textContent.indexOf(textToFind);
            if (index !== -1) {
                // Check if already highlighted
                if (node.parentElement.classList.contains('public-highlight')) {
                    // Add to existing highlight's data
                    const existing = node.parentElement;
                    const ids = existing.dataset.annotationIds ? existing.dataset.annotationIds.split(',') : [];
                    if (!ids.includes(id)) {
                        ids.push(id);
                        existing.dataset.annotationIds = ids.join(',');
                        this.updateHighlightCount(existing, ids.length);
                    }
                    return;
                }
                
                // Create highlight span
                const range = document.createRange();
                range.setStart(node, index);
                range.setEnd(node, index + textToFind.length);
                
                const highlight = document.createElement('span');
                highlight.className = `public-highlight highlight-${annotation.noteType}`;
                highlight.dataset.annotationIds = id;
                highlight.title = `${annotation.userName}: ${annotation.noteText.substring(0, 50)}...`;
                
                // Add click handler
                highlight.onclick = (e) => {
                    e.stopPropagation();
                    this.showAnnotationPopup(highlight);
                };
                
                try {
                    range.surroundContents(highlight);
                    this.updateHighlightCount(highlight, 1);
                } catch (e) {
                    // Text spans multiple elements
                    console.log('Could not highlight:', e);
                }
                break;
            }
        }
    }
    
    updateHighlightCount(element, count) {
        // Remove existing badge
        const existingBadge = element.querySelector('.highlight-count');
        if (existingBadge) existingBadge.remove();
        
        if (count > 1) {
            const badge = document.createElement('span');
            badge.className = 'highlight-count';
            badge.textContent = count;
            element.appendChild(badge);
        }
    }
    
    removeAnnotationHighlight(id) {
        const highlights = document.querySelectorAll(`[data-annotation-ids*="${id}"]`);
        highlights.forEach(highlight => {
            const ids = highlight.dataset.annotationIds.split(',').filter(i => i !== id);
            if (ids.length === 0) {
                // Remove highlight entirely
                const text = highlight.textContent;
                highlight.replaceWith(text);
            } else {
                highlight.dataset.annotationIds = ids.join(',');
                this.updateHighlightCount(highlight, ids.length);
            }
        });
    }
    
    showAnnotationPopup(highlightElement) {
        const ids = highlightElement.dataset.annotationIds.split(',');
        const annotations = ids.map(id => ({ id, ...this.annotations.get(id) })).filter(a => a.noteText);
        
        if (annotations.length === 0) return;
        
        const popup = this.annotationPopup;
        const content = popup.querySelector('.annotation-popup-content');
        
        // Build popup content
        let html = '';
        annotations.forEach((annotation, index) => {
            const time = this.formatTime(annotation.timestamp);
            const typeEmoji = this.getTypeEmoji(annotation.noteType);
            const isOwner = window.authManager.isLoggedIn() && window.authManager.getUser().uid === annotation.userId;
            
            html += `
                <div class="annotation-item" data-id="${annotation.id}">
                    <div class="annotation-header">
                        ${annotation.userPhoto ? `<img src="${annotation.userPhoto}" class="annotation-avatar" alt="">` : ''}
                        <span class="annotation-user">${annotation.userName}</span>
                        <span class="annotation-time">${time}</span>
                    </div>
                    <div class="annotation-type">${typeEmoji} ${annotation.noteType}</div>
                    <div class="annotation-text">${this.escapeHtml(annotation.noteText)}</div>
                    ${isOwner ? `<button class="annotation-delete" onclick="notesHighlight.deleteAnnotation('${annotation.id}')">🗑️ Delete</button>` : ''}
                </div>
                ${index < annotations.length - 1 ? '<hr class="annotation-divider">' : ''}
            `;
        });
        
        content.innerHTML = html;
        
        // Position popup
        const rect = highlightElement.getBoundingClientRect();
        popup.style.left = `${rect.left + window.scrollX}px`;
        popup.style.top = `${rect.bottom + window.scrollY + 10}px`;
        popup.classList.add('show');
    }
    
    hideAnnotationPopup() {
        this.annotationPopup.classList.remove('show');
    }
    
    async deleteAnnotation(id) {
        if (!window.authManager.isLoggedIn()) return;
        
        const annotation = this.annotations.get(id);
        if (!annotation || annotation.userId !== window.authManager.getUser().uid) {
            this.showToast('❌ You can only delete your own notes');
            return;
        }
        
        try {
            const { rtdb, ref, remove } = window.firebaseRTDB;
            const path = `${this.getChapterPath()}/${id}`;
            await remove(ref(rtdb, path));
            
            this.hideAnnotationPopup();
            this.showToast('🗑️ Note deleted');
            
        } catch (error) {
            console.error('Error deleting annotation:', error);
            this.showToast('❌ Error deleting note');
        }
    }
    
    getTypeEmoji(type) {
        const emojis = {
            comment: '💬',
            typo: '🔤',
            confusion: '❓',
            plothole: '🕳️',
            suggestion: '💡',
            love: '❤️',
            theory: '🔮'
        };
        return emojis[type] || '📝';
    }
    
    formatTime(timestamp) {
        const now = Date.now();
        const diff = now - timestamp;
        const minutes = Math.floor(diff / 60000);
        const hours = Math.floor(diff / 3600000);
        const days = Math.floor(diff / 86400000);
        
        if (minutes < 1) return 'just now';
        if (minutes < 60) return `${minutes}m ago`;
        if (hours < 24) return `${hours}h ago`;
        if (days < 7) return `${days}d ago`;
        return new Date(timestamp).toLocaleDateString();
    }
    
    escapeHtml(text) {
        const div = document.createElement('div');
        div.textContent = text;
        return div.innerHTML;
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
window.notesHighlight = notesHighlight;
