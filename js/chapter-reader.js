// Chapter Reader - Loads and displays markdown chapters with pagination

// Pagination state
let currentPage = 1;
let totalPages = 1;
let allContent = '';

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
        
        // Parse and store all content
        allContent = parseMarkdown(markdown);
        
        // Initialize pagination
        initPagination();
        
        // Build navigation
        buildNavigation(params, bookData, chapterData);
        
    } catch (error) {
        contentDiv.innerHTML = `<p class="error">Error loading chapter: ${error.message}</p>`;
    }
}

// Initialize pagination system
function initPagination() {
    const contentDiv = document.getElementById('chapter-content');
    const pageWrapper = document.querySelector('.page-wrapper');
    
    // Create a hidden measurer div
    const measurer = document.createElement('div');
    measurer.style.cssText = 'position: absolute; visibility: hidden; width: ' + contentDiv.offsetWidth + 'px;';
    measurer.innerHTML = allContent;
    document.body.appendChild(measurer);
    
    // Get computed height available for content
    const pageHeight = pageWrapper.offsetHeight || (window.innerHeight - 280);
    
    // Split content into pages by elements
    const elements = Array.from(measurer.children);
    const pages = [];
    let currentPageContent = [];
    let currentHeight = 0;
    
    elements.forEach((el, index) => {
        const elHeight = el.offsetHeight + parseInt(getComputedStyle(el).marginBottom) + parseInt(getComputedStyle(el).marginTop);
        
        if (currentHeight + elHeight > pageHeight && currentPageContent.length > 0) {
            // Start new page
            pages.push(currentPageContent.join(''));
            currentPageContent = [];
            currentHeight = 0;
        }
        
        currentPageContent.push(el.outerHTML);
        currentHeight += elHeight;
    });
    
    // Don't forget the last page
    if (currentPageContent.length > 0) {
        pages.push(currentPageContent.join(''));
    }
    
    // Clean up measurer
    document.body.removeChild(measurer);
    
    // If no pages were created, just show all content as one page
    if (pages.length === 0) {
        pages.push(allContent);
    }
    
    // Store pages globally
    window.chapterPages = pages;
    totalPages = pages.length;
    currentPage = 1;
    
    // Check URL for page parameter
    const urlParams = new URLSearchParams(window.location.search);
    const pageParam = parseInt(urlParams.get('page'));
    if (pageParam && pageParam > 0 && pageParam <= totalPages) {
        currentPage = pageParam;
    }
    
    // Display first page
    showPage(currentPage);
    
    // Set up page navigation
    setupPageNavigation();
}

// Show a specific page
function showPage(pageNum) {
    const contentDiv = document.getElementById('chapter-content');
    const pages = window.chapterPages || [allContent];
    
    if (pageNum < 1) pageNum = 1;
    if (pageNum > pages.length) pageNum = pages.length;
    
    currentPage = pageNum;
    contentDiv.innerHTML = pages[pageNum - 1];
    
    // Update UI
    document.getElementById('current-page').textContent = currentPage;
    document.getElementById('total-pages').textContent = totalPages;
    
    // Update button states
    document.getElementById('prev-page').disabled = currentPage <= 1;
    document.getElementById('next-page').disabled = currentPage >= totalPages;
    
    // Update URL without reload
    const url = new URL(window.location);
    url.searchParams.set('page', currentPage);
    window.history.replaceState({}, '', url);
    
    // Scroll to top of content
    window.scrollTo({ top: 0, behavior: 'instant' });
}

// Set up page navigation controls
function setupPageNavigation() {
    const prevBtn = document.getElementById('prev-page');
    const nextBtn = document.getElementById('next-page');
    
    prevBtn.addEventListener('click', () => {
        if (currentPage > 1) showPage(currentPage - 1);
    });
    
    nextBtn.addEventListener('click', () => {
        if (currentPage < totalPages) showPage(currentPage + 1);
    });
    
    // Keyboard navigation
    document.addEventListener('keydown', (e) => {
        // Don't navigate if user is typing in an input
        if (e.target.tagName === 'INPUT' || e.target.tagName === 'TEXTAREA') return;
        
        if (e.key === 'ArrowLeft' || e.key === 'a' || e.key === 'A') {
            if (currentPage > 1) showPage(currentPage - 1);
        } else if (e.key === 'ArrowRight' || e.key === 'd' || e.key === 'D') {
            if (currentPage < totalPages) showPage(currentPage + 1);
        }
    });
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
