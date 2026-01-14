# BLACKWELL

**A dark magic-tech war epic published chapter by chapter.**

*She doesn't rebel. She litigates reality until God bleeds Aether.*

---

## 🌐 Live Website

**[https://CosmicPhoenix171.github.io/BLACKWELL](https://CosmicPhoenix171.github.io/BLACKWELL)**

---

## 📖 About

**LILITH BLACKWELL** is a villain-protagonist saga where a defense lawyer with no empathy wages procedural warfare against God Himself.

In 2020, humanity discovered Aether — a fundamental force shaped by consciousness. The "pandemic" was a lie. The lockdowns were containment. God is real, but He's not the creator — He's a parasitic thought-form feeding on billions of years of human belief.

One woman refuses to kneel. One woman learns to exploit divine law itself.

⚠️ *Content warnings: Villain protagonist. War crimes. Psychological horror. No redemption arcs.*

---

## 📁 Project Structure

```
BLACKWELL/
├── index.html              # Home page
├── chapters.html           # Chapter listing
├── reader.html             # Dynamic chapter reader
├── about.html              # About the book/author
├── css/
│   └── style.css           # Website styling
├── js/
│   ├── chapter-reader.js   # Markdown chapter loader
│   ├── firebase-config.js  # Firebase configuration
│   ├── auth.js             # Google Sign-In
│   ├── reading-progress.js # Bookmark & progress tracking
│   ├── notes-highlight.js  # Reader feedback system
│   └── feedback-admin.js   # Author feedback panel
├── chapters/
│   ├── book-one-chapter-01.md  # Prologue: First Blood
│   └── _chapter-template.html  # Template for HTML chapters
└── worldbuilding/
    ├── README.md           # Worldbuilding index
    ├── book-overview.md    # Series structure & outline
    ├── characters.md       # Character profiles
    ├── aether.md           # The fundamental force
    ├── the-war.md          # World War III & AETHCOM
    ├── factions.md         # Nations & organizations
    ├── divine-law.md       # God, angels, and loopholes
    ├── locations.md        # Key places
    ├── technology.md       # Aether-tech weapons
    └── plot-holes.md       # Consistency tracking
```

---

## 🚀 Setup

### Enable GitHub Pages
1. Go to **Settings** → **Pages**
2. Under "Source", select **Deploy from a branch**
3. Select **main** branch and **/ (root)**
4. Click **Save**

Your site will be live in 1-2 minutes!

### Enable User Features (Optional)
The site supports Google Sign-In, reading progress, and reader feedback via Firebase. See [SETUP_GUIDE.md](SETUP_GUIDE.md) for configuration.

---

## ✍️ Publishing New Chapters

### 1. Create the Chapter File
Create a new markdown file in `chapters/`:
```
chapters/book-one-chapter-02.md
```

### 2. Register the Chapter
Add it to `js/chapter-reader.js`:
```javascript
'01': {
    title: 'Chapter One: [Title]',
    file: 'chapters/book-one-chapter-02.md',
    pages: 1
}
```

### 3. Add to Chapter List
Update `chapters.html` with a new chapter card.

### 4. Publish
```bash
git add .
git commit -m "Add Chapter 1"
git push
```

---

## 🎨 Customization

Edit CSS variables in `css/style.css`:
```css
:root {
    --accent-color: #d4a84b;     /* Gold accent */
    --primary-color: #1a1a2e;    /* Dark background */
    --text-color: #e8e8e8;       /* Light text */
}
```

---

## 📚 Worldbuilding

See the [worldbuilding folder](worldbuilding/) for comprehensive lore documentation including:
- Aether physics and mechanics
- Character profiles and arcs
- The war timeline
- Divine law and how Lilith exploits it
- Technology and weapons

---

## 📜 License

All rights reserved. This is an original creative work.