# BLACKWELL Website - Setup Guide

## 🎉 What's New

Your website has been updated with the following features:

### 1. **Improved Visual Design**
- Better typography with professional serif fonts (Crimson Pro, Playfair Display)
- Improved line-height and spacing for easier reading
- Dark theme with golden accents
- Smooth hover effects and animations
- Reading progress bar at the top of the page

### 2. **Google Sign-In**
- Users can sign in with their Google account
- Saves user data securely in Firebase

### 3. **Reading Progress Tracking**
- Automatically saves where users stopped reading
- "Resume where you left off" prompt when returning
- Bookmark button to manually save position
- Visual progress bar shows how far through the chapter they are

### 4. **Text Highlighting & Notes**
- Users can highlight any text and leave feedback
- Feedback categories: Typo, Confusion, Plot Hole, Suggestion, Love it!
- All feedback saved to your Firebase database
- Admin panel to review all feedback (visible only to you)

---

## 🔧 Firebase Setup (Required)

To enable Google Sign-In and the notes system, you need to set up Firebase:

### Step 1: Create a Firebase Project
1. Go to [Firebase Console](https://console.firebase.google.com/)
2. Click "Create a project"
3. Name it "BLACKWELL" (or any name you prefer)
4. Follow the prompts (you can disable Google Analytics if you want)

### Step 2: Enable Google Authentication
1. In your Firebase project, go to **Build > Authentication**
2. Click "Get started"
3. Go to the **Sign-in method** tab
4. Click on **Google** and enable it
5. Select a support email (your email)
6. Click **Save**

### Step 3: Enable Firestore Database
1. Go to **Build > Firestore Database**
2. Click "Create database"
3. Choose **Start in test mode** (you can add security rules later)
4. Select a location close to you
5. Click **Enable**

### Step 4: Get Your Firebase Config
1. Go to **Project Settings** (gear icon)
2. Scroll down to "Your apps" section
3. Click the **</>** (Web) icon to add a web app
4. Name it "BLACKWELL Website"
5. You'll see a config object like this:

```javascript
const firebaseConfig = {
    apiKey: "AIzaSy...",
    authDomain: "your-project.firebaseapp.com",
    projectId: "your-project",
    storageBucket: "your-project.appspot.com",
    messagingSenderId: "123456789",
    appId: "1:123456789:web:abc123"
};
```

### Step 5: Update Your Config File
1. Open `js/firebase-config.js`
2. Replace the placeholder values with your real config:

```javascript
const firebaseConfig = {
    apiKey: "YOUR_ACTUAL_API_KEY",
    authDomain: "YOUR_PROJECT_ID.firebaseapp.com",
    projectId: "YOUR_PROJECT_ID",
    storageBucket: "YOUR_PROJECT_ID.appspot.com",
    messagingSenderId: "YOUR_SENDER_ID",
    appId: "YOUR_APP_ID"
};
```

### Step 6: Add Yourself as Admin (to see feedback)
1. Open `js/feedback-admin.js`
2. Find the `adminEmails` array and add your Google email:

```javascript
this.adminEmails = [
    'your.email@gmail.com'
];
```

---

## 🚀 Hosting Your Site

The site needs to be hosted on a web server (not just opened as a file) for the Google Sign-In to work.

### Option 1: Firebase Hosting (Free & Recommended)
1. Install Firebase CLI: `npm install -g firebase-tools`
2. Run `firebase login` in your terminal
3. Run `firebase init hosting` in your project folder
4. Deploy with `firebase deploy`

### Option 2: GitHub Pages
1. Push your code to GitHub
2. Go to Settings > Pages
3. Enable GitHub Pages from your main branch

### Option 3: Netlify / Vercel
1. Connect your GitHub repo to Netlify or Vercel
2. They'll auto-deploy your site

---

## 📝 How the Features Work

### For Readers:
1. Click "Sign In" and use their Google account
2. Read chapters - their progress is auto-saved
3. Use the 🔖 bookmark button to manually save their spot
4. Highlight text and click "📝 Add Note" to give you feedback

### For You (Author):
1. Sign in with your admin email
2. A "📋 Feedback" button appears at the bottom left
3. View all reader notes and filter by type/status
4. Mark feedback as "Reviewed" or "Resolved"

---

## 🎨 Customization Tips

### Change Colors
Edit the CSS variables in `css/style.css`:
```css
:root {
    --accent-color: #d4a84b;     /* Gold accent */
    --accent-hover: #e6c56c;     /* Lighter gold */
    --primary-color: #1a1a2e;    /* Dark purple */
    --card-bg: #161b22;          /* Card background */
}
```

### Change Fonts
The fonts are imported from Google Fonts. You can change them in the CSS:
```css
--font-body: 'Crimson Pro', 'Georgia', serif;
--font-heading: 'Playfair Display', 'Georgia', serif;
--font-ui: 'Inter', sans-serif;
```

---

## 🔒 Security Note

Before going live, add Firestore security rules to protect your data:

1. Go to Firestore > Rules
2. Replace with:

```
rules_version = '2';
service cloud.firestore {
  match /databases/{database}/documents {
    // Users can only read/write their own data
    match /users/{userId} {
      allow read, write: if request.auth != null && request.auth.uid == userId;
      
      match /progress/{progressId} {
        allow read, write: if request.auth != null && request.auth.uid == userId;
      }
    }
    
    // Anyone signed in can submit feedback
    match /feedback/{feedbackId} {
      allow create: if request.auth != null;
      allow read, update: if request.auth != null && 
        request.auth.token.email in ['your.email@gmail.com'];
    }
  }
}
```

Replace `your.email@gmail.com` with your actual email.

---

## ❓ Need Help?

If something's not working:
1. Check the browser console (F12) for errors
2. Make sure Firebase config is correct
3. Ensure the site is hosted (not opened as a local file)
4. Check that Google Sign-in is enabled in Firebase

Enjoy your new website! 🎉
