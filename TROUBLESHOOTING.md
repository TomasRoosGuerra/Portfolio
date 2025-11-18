# Google Sign-In Troubleshooting Guide

## 🔍 **Step 1: Test Firebase Connection**

1. Open `/admin.html` in your browser
2. Click **"Test Firebase Connection"** button
3. Check browser console (F12 → Console tab)
4. Look for any error messages

## 🚨 **Common Issues & Solutions**

### **Issue 1: "This domain is not authorized"**

**Solution:**

1. Go to [Firebase Console](https://console.firebase.google.com/)
2. Select your project `portfolio-7ba48`
3. Go to **Authentication** → **Settings** → **Authorized domains**
4. Add your domain:
   - `localhost` (for local testing)
   - `127.0.0.1` (alternative localhost)
   - Your actual domain (when deployed)

### **Issue 2: "Google sign-in is not enabled"**

**Solution:**

1. Firebase Console → **Authentication** → **Sign-in method**
2. Click on **Google** provider
3. Toggle **Enable** to ON
4. Add your **Project support email**
5. Click **Save**

### **Issue 3: "Popup blocked by browser"**

**Solution:**

1. Allow popups for your site
2. Try in incognito/private mode
3. Disable ad blockers temporarily

### **Issue 4: "Network request failed"**

**Solution:**

1. Check internet connection
2. Try different browser
3. Check if Firebase is accessible in your region

## 🔧 **Firebase Console Setup Checklist**

### **Authentication Setup:**

- [ ] Google provider enabled
- [ ] Project support email added
- [ ] Authorized domains include `localhost`
- [ ] OAuth consent screen configured

### **Firestore Setup:**

- [ ] Database created
- [ ] Security rules configured
- [ ] Test mode enabled (temporarily)

### **Project Settings:**

- [ ] Web app added
- [ ] Firebase config matches your code
- [ ] Billing enabled (if using paid features)

## 🧪 **Debugging Steps**

### **1. Check Browser Console**

Open Developer Tools (F12) and look for:

- Firebase initialization errors
- Authentication errors
- Network errors

### **2. Test Firebase Connection**

Click the "Test Firebase Connection" button and check console output.

### **3. Verify Firebase Config**

Make sure your config matches Firebase Console:

```javascript
const firebaseConfig = {
  apiKey: "AIzaSyBilQwP9N6kCw1IsxnDDkvkEj7HUsLTtAE",
  authDomain: "portfolio-7ba48.firebaseapp.com",
  projectId: "portfolio-7ba48",
  storageBucket: "portfolio-7ba48.firebasestorage.app",
  messagingSenderId: "1022085096489",
  appId: "1:1022085096489:web:9182270ab64bd18aba2838",
  measurementId: "G-ELZZ0CREEN",
};
```

### **4. Check Network Tab**

Look for failed requests to:

- `firebaseapp.com`
- `googleapis.com`
- `gstatic.com`

## 🚀 **Quick Fix Commands**

### **Reset Firebase Auth:**

1. Firebase Console → Authentication → Users
2. Delete any test users
3. Clear browser cookies/localStorage
4. Try signing in again

### **Test with Different Browser:**

- Chrome (recommended)
- Firefox
- Safari
- Edge

### **Test in Incognito Mode:**

- Disable extensions
- Clear cache
- Test authentication

## 📞 **Still Not Working?**

If you're still having issues, please share:

1. **Browser console errors** (screenshot or copy/paste)
2. **What happens when you click "Test Firebase Connection"**
3. **What error message appears when you try to sign in**
4. **Your browser and version**

## 🎯 **Expected Behavior**

**When working correctly:**

1. Click "Test Firebase Connection" → Success message
2. Click "Sign in with Google" → Google popup opens
3. Select Gmail account → Popup closes
4. Admin panel appears with your email
5. You can add/edit projects

The most common issue is **unauthorized domain** - make sure `localhost` is added to your Firebase authorized domains!
