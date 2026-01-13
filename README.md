# BLACKWELL

A novel published chapter by chapter on GitHub Pages.

## 🌐 Live Website

Visit: **https://CosmicPhoenix171.github.io/BLACKWELL**

## 📖 How to Enable GitHub Pages

1. Go to your repository on GitHub: https://github.com/CosmicPhoenix171/BLACKWELL
2. Click **Settings** (gear icon)
3. Scroll down to **Pages** in the left sidebar
4. Under "Source", select **Deploy from a branch**
5. Under "Branch", select **main** and **/ (root)**
6. Click **Save**
7. Wait 1-2 minutes, then your site will be live!

## ✍️ How to Publish a New Chapter

### Step 1: Create the Chapter File
1. Open the `chapters` folder
2. Copy `_chapter-template.html` 
3. Rename it to `chapter-02.html` (or next number)
4. Fill in:
   - Replace `[NUMBER]` with the chapter number
   - Replace `[Your Chapter Title Here]` with your title
   - Add your chapter text inside the `<div class="chapter-text">` section
   - Update the Previous/Next navigation links

### Step 2: Add to Chapter List
1. Open `chapters.html`
2. Copy the chapter card template (in the comments)
3. Paste it and update the number, title, and link

### Step 3: Update Home Page (Optional)
1. Open `index.html`
2. Update the "Latest Chapter" section with your new chapter

### Step 4: Publish
```bash
git add .
git commit -m "Add Chapter 2"
git push
```

Your new chapter will be live in 1-2 minutes!

## 📁 File Structure

```
BLACKWELL/
├── index.html          # Home page
├── chapters.html       # Chapter listing page
├── about.html          # About the book/author
├── css/
│   └── style.css       # Website styling
└── chapters/
    ├── _chapter-template.html  # Template for new chapters
    ├── chapter-01.html         # Chapter 1
    └── chapter-02.html         # Chapter 2 (add as needed)
```

## 🎨 Customization

- Edit `css/style.css` to change colors, fonts, and layout
- The main colors are set at the top of the CSS file in `:root`