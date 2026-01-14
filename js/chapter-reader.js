// Chapter Reader - Loads and displays markdown chapters

// Simple markdown to HTML converter
function parseMarkdown(md) {
    let html = md
        // Escape HTML
        .replace(/&/g, '&amp;')
        .replace(/</g, '&lt;')
        .replace(/>/g, '&gt;')
        // Headers
        .replace(/^### (.+)$/gm, '<h3>$1</h3>')
        .replace(/^## (.+)$/gm, '<h2>$1</h2>')
        .replace(/^# (.+)$/gm, '<h1>$1</h1>')
        // Bold
        .replace(/\*\*(.+?)\*\*/g, '<strong>$1</strong>')
        // Italic
        .replace(/\*(.+?)\*/g, '<em>$1</em>')
        // Line breaks - convert double newlines to paragraphs
        .split(/\n\n+/)
        .map(para => {
            para = para.trim();
            if (!para) return '';
            // Don't wrap headers in p tags
            if (para.startsWith('<h1>') || para.startsWith('<h2>') || para.startsWith('<h3>')) {
                return para;
            }
            return '<p>' + para.replace(/\n/g, '<br>') + '</p>';
        })
        .join('\n');
    
    return html;
}

// Chapter data structure
const chapters = {
    'book-one': {
        title: 'Book One',
        chapters: {
            'prologue': {
                title: 'Prologue: First Blood',
                file: 'chapters/prologue.md',
                pages: 1
            },
            'chapter-01': {
                title: 'Chapter One: Containment Failure',
                file: 'chapters/chapter-01.md',
                pages: 1
            }
            // Add more chapters as they're written
        }
    }
};

// Get URL parameters
function getParams() {
    const params = new URLSearchParams(window.location.search);
    return {
        book: params.get('book') || 'book-one',
        chapter: params.get('chapter') || 'prologue',
        page: parseInt(params.get('page')) || 1
    };
}

// Load chapter content
async function loadChapter() {
    const params = getParams();
    const contentDiv = document.getElementById('chapter-content');
    const titleDiv = document.getElementById('chapter-title');
    const navDiv = document.getElementById('chapter-nav');
    
    try {
        // Get chapter info
        const bookData = chapters[params.book];
        const chapterData = bookData?.chapters[params.chapter];
        
        if (!chapterData) {
            contentDiv.innerHTML = '<p class="error">Chapter not found.</p>';
            return;
        }
        
        // Update title
        titleDiv.textContent = chapterData.title;
        document.title = `${chapterData.title} - LILITH BLACKWELL`;
        
        // Fetch markdown file
        const response = await fetch(chapterData.file);
        if (!response.ok) {
            throw new Error('Chapter file not found');
        }
        
        const markdown = await response.text();
        
        // Parse and display
        contentDiv.innerHTML = parseMarkdown(markdown);
        
        // Build navigation
        buildNavigation(params, bookData, chapterData);
        
    } catch (error) {
        contentDiv.innerHTML = `<p class="error">Error loading chapter: ${error.message}</p>`;
    }
}

// Build chapter navigation
function buildNavigation(params, bookData, chapterData) {
    const navDiv = document.getElementById('chapter-nav');
    
    const chapterKeys = Object.keys(bookData.chapters);
    const currentIndex = chapterKeys.indexOf(params.chapter);
    
    let navHTML = '<div class="nav-buttons">';
    
    // Previous chapter
    if (currentIndex > 0) {
        const prevChapter = chapterKeys[currentIndex - 1];
        navHTML += `<a href="?book=${params.book}&chapter=${prevChapter}" class="nav-btn prev-btn">&larr; Previous Chapter</a>`;
    } else {
        navHTML += '<span class="nav-btn disabled">&larr; Previous Chapter</span>';
    }
    
    // Chapter list link
    navHTML += '<a href="chapters.html" class="nav-btn list-btn">All Chapters</a>';
    
    // Next chapter
    if (currentIndex < chapterKeys.length - 1) {
        const nextChapter = chapterKeys[currentIndex + 1];
        navHTML += `<a href="?book=${params.book}&chapter=${nextChapter}" class="nav-btn next-btn">Next Chapter &rarr;</a>`;
    } else {
        navHTML += '<span class="nav-btn disabled">Next Chapter &rarr;</span>';
    }
    
    navHTML += '</div>';
    navDiv.innerHTML = navHTML;
}

// Initialize on page load
document.addEventListener('DOMContentLoaded', loadChapter);
