# Firebase Setup Guide

## ✅ What's Already Done

1. **Firebase Configuration**: Your actual Firebase config is now integrated
2. **Authentication**: Gmail sign-in is set up in the admin panel
3. **Database Connection**: Firestore is connected for project storage
4. **Admin Panel**: Complete admin interface at `/admin.html`
5. **Portfolio Integration**: Main site now loads projects from Firebase

## 🔧 Final Setup Steps

### 1. Firestore Security Rules

Go to Firebase Console → Firestore Database → Rules and update:

```javascript
rules_version = '2';
service cloud.firestore {
  match /databases/{database}/documents {
    // Allow read access to published projects
    match /projects/{document} {
      allow read: if resource.data.published == true;
      allow write: if request.auth != null && request.auth.token.email == "your-email@gmail.com";
    }
  }
}
```

**Replace `your-email@gmail.com` with your actual Gmail address.**

### 2. Test the Admin Panel

1. Open `http://localhost:8000/admin.html` (or your local server)
2. Click "Sign in with Google"
3. Use your Gmail account
4. Try adding a test project

### 3. Test the Main Site

1. Open `http://localhost:8000/index.html`
2. Projects should load from Firebase
3. If Firebase fails, it falls back to static data

## 📝 How to Add Projects

### Via Admin Panel (Recommended)

1. Go to `/admin.html`
2. Sign in with Gmail
3. Fill out the form:
   - **Title**: Project name
   - **Description**: Project description
   - **Category**: Choose from dropdown
   - **Image**: Upload project image
   - **Published**: Check to make it visible

### Categories Available

- `web-design` - Shows in "What I've Been Working On"
- `mobile-app` - Shows in "What I've Been Working On"
- `ui-ux` - Shows in "Design Experiments"
- `branding` - Shows in "Design Experiments"
- `illustration` - Shows in "Design Experiments"

## 🔄 How It Works

1. **Admin adds project** → Saved to Firestore
2. **Main site loads** → Reads from Firestore
3. **Projects display** → Filtered by `published: true`
4. **Grid system** → Automatically adjusts columns

## 🚨 Troubleshooting

### If projects don't show:

1. Check browser console for errors
2. Verify Firestore rules allow read access
3. Check if projects have `published: true`

### If admin panel doesn't work:

1. Verify Gmail authentication is enabled in Firebase
2. Check Firestore rules allow write access for your email
3. Make sure you're signed in with the correct Gmail account

### If images don't upload:

Currently using base64 encoding (temporary). For production, set up Firebase Storage:

1. Enable Firebase Storage
2. Update admin panel to upload to Storage
3. Get download URLs for images

## 🎯 Next Steps

1. **Test the complete flow**: Add a project via admin → See it on main site
2. **Set up Firebase Storage**: For proper image handling
3. **Add more categories**: Extend the category dropdown
4. **Add edit functionality**: Complete the edit project feature

Your Firebase integration is now complete! 🎉
