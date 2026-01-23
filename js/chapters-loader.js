// Chapters Loader - Auto-detects and displays chapters from .md files

// Chapter metadata - add entries here as you create new chapters
// The loader will verify each file exists before displaying
const chapterRegistry = {
    'book-one': {
        title: 'Lilith Blackwell: First Blood',
        chapters: [
            {
                id: 'prologue',
                file: 'chapters/prologue.md',
                number: 'Prologue',
                title: 'First Blood',
                preview: 'In a ruined church in downtown Baltimore, Lilith Blackwell executes her first angel and declares war on Heaven itself.'
            },
            {
                id: 'chapter-01',
                file: 'chapters/chapter-01.md',
                number: 'Chapter 1',
                title: 'The Aftermath',
                preview: 'In the wake of the first angel kill, AETHCOM reels as God responds with overwhelming force. Lilith must answer for what she\'s done.'
            },
            {
                id: 'chapter-02',
                file: 'chapters/chapter-02.md',
                number: 'Chapter 2',
                title: null, // Will be extracted from file
                preview: null
            },
            {
                id: 'chapter-03',
                file: 'chapters/chapter-03.md',
                number: 'Chapter 3',
                title: null,
                preview: null
            },
            {
                id: 'chapter-04',
                file: 'chapters/chapter-04.md',
                number: 'Chapter 4',
                title: null,
                preview: null
            },
            {
                id: 'chapter-05',
                file: 'chapters/chapter-05.md',
                number: 'Chapter 5',
                title: null,
                preview: null
            }
            // Add more chapters as needed - they'll only show if the .md file exists
        ]
    }
};

// Extract title and preview from markdown content
function extractChapterInfo(markdown) {
    const lines = markdown.split('\n');
    let title = null;
    let preview = null;
    
    for (let i = 0; i < lines.length && i < 20; i++) {
        const line = lines[i].trim();
        
        // Get title from first H1
        if (!title && line.startsWith('# ')) {
            title = line.slice(2).trim();
        }
        
        // Get first substantial paragraph as preview
        if (title && !preview && line.length > 50 && !line.startsWith('#') && !line.startsWith('*')) {
            preview = line.slice(0, 150) + (line.length > 150 ? '...' : '');
        }
        
        if (title && preview) break;
    }
    
    return { title, preview };
}

// Check if a chapter file exists and get its content
async function checkChapter(chapter) {
    try {
        const response = await fetch(chapter.file);
        if (!response.ok) return null;
        
        const content = await response.text();
        const extracted = extractChapterInfo(content);
        
        return {
            ...chapter,
            title: chapter.title || extracted.title || 'Untitled',
            preview: chapter.preview || extracted.preview || 'Chapter content available.'
        };
    } catch (e) {
        return null;
    }
}

// Create chapter card HTML
function createChapterCard(chapter, bookId) {
    return `
        <div class="chapter-card">
            <span class="chapter-number">${chapter.number}</span>
            <h3>${chapter.title}</h3>
            <p class="chapter-preview">${chapter.preview}</p>
            <a href="reader.html?book=${bookId}&chapter=${chapter.id}" class="read-link">Read ${chapter.number} →</a>
        </div>
    `;
}

// Load and display all chapters
async function loadChapters() {
    const container = document.getElementById('chapters-container');
    if (!container) return;
    
    container.innerHTML = '<p class="loading">Loading chapters...</p>';
    
    let html = '';
    
    for (const [bookId, book] of Object.entries(chapterRegistry)) {
        // Check which chapters exist
        const chapterPromises = book.chapters.map(ch => checkChapter(ch));
        const results = await Promise.all(chapterPromises);
        const existingChapters = results.filter(ch => ch !== null);
        
        if (existingChapters.length > 0) {
            html += `<h2 class="book-title">${book.title}</h2>`;
            existingChapters.forEach(chapter => {
                html += createChapterCard(chapter, bookId);
            });
        }
    }
    
    container.innerHTML = html || '<p>No chapters available yet.</p>';
}

// Initialize on page load
document.addEventListener('DOMContentLoaded', loadChapters);
