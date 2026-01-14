// Chapter Reader - Loads and displays markdown chapters

// Simple markdown to HTML converter with book-like formatting
function parseMarkdown(md) {
    // Split into blocks by double newlines
    const blocks = md.split(/\n\n+/);
    
    let html = '';
    let isFirstParagraphAfterHeader = false;
    
    for (let i = 0; i < blocks.length; i++) {
        let block = blocks[i].trim();
        if (!block) continue;
        
        // Escape HTML
        block = block
            .replace(/&/g, '&amp;')
            .replace(/</g, '&lt;')
            .replace(/>/g, '&gt;');
        
        // Check for headers
        if (block.startsWith('### ')) {
            html += '<h3>' + block.slice(4) + '</h3>';
            isFirstParagraphAfterHeader = true;
            continue;
        }
        if (block.startsWith('## ')) {
            html += '<h2>' + block.slice(3) + '</h2>';
            isFirstParagraphAfterHeader = true;
            continue;
        }
        if (block.startsWith('# ')) {
            html += '<h1>' + block.slice(2) + '</h1>';
            isFirstParagraphAfterHeader = true;
            continue;
        }
        
        // Handle horizontal rules
        if (block === '---' || block === '***' || block === '___') {
            html += '<hr>';
            continue;
        }
        
        // Handle blockquotes
        if (block.startsWith('&gt; ')) {
            const quoteContent = block.replace(/^&gt; /gm, '');
            html += '<blockquote>' + parseInlineFormatting(quoteContent) + '</blockquote>';
            continue;
        }
        
        // Check if this is a "short line" block (multiple short lines)
        const lines = block.split('\n');
        const isShortLineBlock = lines.length > 1 && lines.every(line => line.trim().length < 40);
        
        if (isShortLineBlock) {
            // Render each line as its own centered paragraph
            for (const line of lines) {
                if (line.trim()) {
                    html += '<p class="short-line">' + parseInlineFormatting(line.trim()) + '</p>';
                }
            }
            isFirstParagraphAfterHeader = false;
            continue;
        }
        
        // Check if single short line (emphasis)
        if (block.length < 50 && !block.includes('.') || 
            (block.split('.').length <= 2 && block.length < 40)) {
            // Check if it looks like a standalone emphasis line
            const isEmphasis = block.length < 35;
            if (isEmphasis && !isFirstParagraphAfterHeader) {
                html += '<p class="emphasis-line">' + parseInlineFormatting(block) + '</p>';
                continue;
            }
        }
        
        // Regular paragraph
        const paraClass = isFirstParagraphAfterHeader ? ' class="first-para"' : '';
        html += '<p' + paraClass + '>' + parseInlineFormatting(block.replace(/\n/g, ' ')) + '</p>';
        isFirstParagraphAfterHeader = false;
    }
    
    return html;
}

// Parse inline formatting (bold, italic)
function parseInlineFormatting(text) {
    return text
        // Bold
        .replace(/\*\*(.+?)\*\*/g, '<strong>$1</strong>')
        // Italic
        .replace(/\*(.+?)\*/g, '<em>$1</em>');
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
