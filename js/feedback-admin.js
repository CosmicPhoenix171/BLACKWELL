// Feedback Admin Panel for BLACKWELL
// View all reader notes and feedback (for author use)

class FeedbackAdmin {
    constructor() {
        this.feedbackList = [];
        this.adminEmails = [
            // Add your email here to access the admin panel
            // 'your.email@gmail.com'
        ];
    }
    
    async init() {
        authManager.onReady(async (user) => {
            if (user && this.isAdmin(user.email)) {
                await this.loadFeedback();
                this.renderAdminPanel();
            }
        });
    }
    
    isAdmin(email) {
        return this.adminEmails.includes(email);
    }
    
    async loadFeedback() {
        try {
            const { db, collection, query, orderBy, getDocs } = window.firebaseDB;
            
            const feedbackQuery = query(
                collection(db, 'feedback'),
                orderBy('timestamp', 'desc')
            );
            
            const snapshot = await getDocs(feedbackQuery);
            this.feedbackList = snapshot.docs.map(doc => ({
                id: doc.id,
                ...doc.data()
            }));
            
        } catch (error) {
            console.error('Error loading feedback:', error);
        }
    }
    
    renderAdminPanel() {
        const adminPanel = document.createElement('div');
        adminPanel.className = 'admin-panel';
        adminPanel.innerHTML = `
            <button class="admin-toggle">📋 Feedback (${this.feedbackList.length})</button>
            <div class="admin-content" style="display: none;">
                <h3>Reader Feedback</h3>
                <div class="feedback-filters">
                    <select id="filter-type">
                        <option value="all">All Types</option>
                        <option value="typo">🔤 Typos</option>
                        <option value="plothole">🕳️ Plot Holes</option>
                        <option value="confusion">❓ Confusing</option>
                        <option value="suggestion">💡 Suggestions</option>
                    </select>
                    <select id="filter-status">
                        <option value="all">All Status</option>
                        <option value="new">New</option>
                        <option value="reviewed">Reviewed</option>
                        <option value="resolved">Resolved</option>
                    </select>
                </div>
                <div class="feedback-list"></div>
            </div>
        `;
        
        document.body.appendChild(adminPanel);
        
        const toggle = adminPanel.querySelector('.admin-toggle');
        const content = adminPanel.querySelector('.admin-content');
        
        toggle.onclick = () => {
            content.style.display = content.style.display === 'none' ? 'block' : 'none';
        };
        
        this.renderFeedbackList();
        
        // Filter handlers
        adminPanel.querySelector('#filter-type').onchange = () => this.renderFeedbackList();
        adminPanel.querySelector('#filter-status').onchange = () => this.renderFeedbackList();
    }
    
    renderFeedbackList() {
        const listContainer = document.querySelector('.feedback-list');
        if (!listContainer) return;
        
        const typeFilter = document.getElementById('filter-type')?.value || 'all';
        const statusFilter = document.getElementById('filter-status')?.value || 'all';
        
        const filtered = this.feedbackList.filter(f => {
            if (typeFilter !== 'all' && f.noteType !== typeFilter) return false;
            if (statusFilter !== 'all' && f.status !== statusFilter) return false;
            return true;
        });
        
        if (filtered.length === 0) {
            listContainer.innerHTML = '<p class="no-feedback">No feedback found.</p>';
            return;
        }
        
        listContainer.innerHTML = filtered.map(f => `
            <div class="feedback-item" data-id="${f.id}">
                <div class="feedback-header">
                    <span class="feedback-type">${this.getTypeEmoji(f.noteType)}</span>
                    <span class="feedback-chapter">Book ${f.book} Ch ${f.chapter}</span>
                    <span class="feedback-status status-${f.status}">${f.status}</span>
                </div>
                <blockquote class="feedback-quote">"${f.selectedText}"</blockquote>
                ${f.noteText ? `<p class="feedback-note">${f.noteText}</p>` : ''}
                <div class="feedback-meta">
                    <span>${f.userName || 'Anonymous'}</span>
                    <span>${this.formatDate(f.timestamp)}</span>
                </div>
                <div class="feedback-actions">
                    <button onclick="feedbackAdmin.updateStatus('${f.id}', 'reviewed')">Mark Reviewed</button>
                    <button onclick="feedbackAdmin.updateStatus('${f.id}', 'resolved')">Mark Resolved</button>
                </div>
            </div>
        `).join('');
    }
    
    getTypeEmoji(type) {
        const emojis = {
            typo: '🔤',
            confusion: '❓',
            plothole: '🕳️',
            suggestion: '💡',
            love: '❤️',
            other: '📌'
        };
        return emojis[type] || '📝';
    }
    
    formatDate(timestamp) {
        if (!timestamp) return 'Unknown';
        const date = timestamp.toDate ? timestamp.toDate() : new Date(timestamp);
        return date.toLocaleDateString();
    }
    
    async updateStatus(feedbackId, newStatus) {
        try {
            const { db, doc, updateDoc } = window.firebaseDB;
            
            await updateDoc(doc(db, 'feedback', feedbackId), {
                status: newStatus
            });
            
            // Update local list
            const item = this.feedbackList.find(f => f.id === feedbackId);
            if (item) item.status = newStatus;
            
            this.renderFeedbackList();
            
        } catch (error) {
            console.error('Error updating status:', error);
        }
    }
}

// Initialize admin panel
const feedbackAdmin = new FeedbackAdmin();
