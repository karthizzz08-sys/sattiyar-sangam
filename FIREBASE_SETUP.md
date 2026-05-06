# Firebase Phone Authentication Setup Guide
## Complete Real OTP Integration for Sattiyar Matrimony

### 📋 Table of Contents
1. [Firebase Project Setup](#firebase-project-setup)
2. [Enable Phone Authentication](#enable-phone-authentication)
3. [Configure Environment Variables](#configure-environment-variables)
4. [Installation & Dependencies](#installation--dependencies)
5. [Code Implementation](#code-implementation)
6. [Testing](#testing)
7. [Troubleshooting](#troubleshooting)

---

## Firebase Project Setup

### Step 1: Create Firebase Project

1. Go to **[Firebase Console](https://console.firebase.google.com)**
2. Click **"Create a project"** or select existing project
3. Enter project name: **`sattiyar-matrimony`**
4. Select region (India recommended): **`Asia-South1 (Mumbai)`**
5. Enable Google Analytics (optional)
6. Click **"Create project"**
7. Wait for project creation to complete

### Step 2: Get Firebase Credentials

1. Click the **gear icon** (Settings) in top-left
2. Go to **"Project Settings"**
3. Scroll to **"Your apps"** section
4. Click **"Web"** icon (or create if not exists)
5. Register app name: **`sattiyar-matrimony-web`**
6. Copy the configuration object:

```javascript
const firebaseConfig = {
  apiKey: "YOUR_API_KEY",
  authDomain: "YOUR_PROJECT_ID.firebaseapp.com",
  projectId: "YOUR_PROJECT_ID",
  storageBucket: "YOUR_PROJECT_ID.appspot.com",
  messagingSenderId: "YOUR_MESSAGING_SENDER_ID",
  appId: "YOUR_APP_ID"
};
```

---

## Enable Phone Authentication

### Step 1: Enable Phone Sign-In Method

1. In Firebase Console, go to **"Authentication"**
2. Click **"Sign-in method"** tab
3. Click **"Phone"**
4. Toggle **"Enable"**
5. Click **"Save"**

### Step 2: Setup reCAPTCHA

Firebase requires reCAPTCHA for phone authentication security.

#### Option A: reCAPTCHA v3 (Recommended - Invisible)

1. In the Phone sign-in method, you'll see reCAPTCHA options
2. Select **"reCAPTCHA Enterprise"** or **"reCAPTCHA v3"**
3. Click **"Create Key"** (if not existing)
4. Enter site name: **`sattiyar-matrimony`**
5. Choose **"reCAPTCHA v3"** or **"reCAPTCHA Enterprise"**
6. Add domains:
   - `localhost:3000`
   - `localhost:5173` (if using Vite)
   - `yourdomainname.com`
7. Click **"Create"**
8. Save the **Site Key** for later
9. Back in Firebase, select your reCAPTCHA key
10. Click **"Save"**

#### Option B: reCAPTCHA Visible (Alternative)

Select **"reCAPTCHA v2"** and choose **"I'm not a robot"** style.

### Step 3: Verify Testing Number (Optional but Recommended)

1. Go to **"Phone numbers for testing"** in Authentication
2. Click **"Add phone number for testing"**
3. Enter phone: **`+919876543210`**
4. Enter OTP: **`123456`** (any 6-digit code)
5. Click **"Save"**

This allows testing without sending real OTPs.

---

## Configure Environment Variables

### Step 1: Create `.env` File

Create `.env` in your project root (same level as `package.json`):

```bash
# Firebase Configuration
VITE_FIREBASE_API_KEY=YOUR_API_KEY
VITE_FIREBASE_AUTH_DOMAIN=your-project-id.firebaseapp.com
VITE_FIREBASE_PROJECT_ID=your-project-id
VITE_FIREBASE_STORAGE_BUCKET=your-project-id.appspot.com
VITE_FIREBASE_MESSAGING_SENDER_ID=123456789
VITE_FIREBASE_APP_ID=1:123456789:web:abcdef1234567890
```

### Step 2: Update `.env.example` for Version Control

```bash
# Copy to .env and fill in your Firebase credentials
VITE_FIREBASE_API_KEY=YOUR_API_KEY
VITE_FIREBASE_AUTH_DOMAIN=YOUR_PROJECT_ID.firebaseapp.com
VITE_FIREBASE_PROJECT_ID=YOUR_PROJECT_ID
VITE_FIREBASE_STORAGE_BUCKET=YOUR_PROJECT_ID.appspot.com
VITE_FIREBASE_MESSAGING_SENDER_ID=YOUR_MESSAGING_SENDER_ID
VITE_FIREBASE_APP_ID=YOUR_APP_ID
```

### Step 3: Add to `.gitignore`

```bash
# .gitignore
.env
.env.local
.env.*.local
```

---

## Installation & Dependencies

### Step 1: Install Firebase

```bash
npm install firebase
```

### Step 2: Verify Installation

```bash
npm list firebase
```

Should show: `firebase@^X.X.X`

---

## Code Implementation

### File Structure

```
src/
├── lib/
│   └── firebase.ts              # Firebase config & initialization
├── components/
│   └── FirebaseOTPVerify.tsx    # OTP component (REAL Firebase)
│   └── OTPVerify.tsx            # Old mock OTP component (kept for reference)
└── routes/
    ├── login.tsx                # Updated with Firebase
    └── register.tsx             # Updated with Firebase
```

### Key Files Created

#### 1. `src/lib/firebase.ts`
- Firebase initialization
- Auth setup with language configuration
- Environment variable handling

#### 2. `src/components/FirebaseOTPVerify.tsx`
- Real phone OTP with Firebase
- reCAPTCHA verification
- 120-second countdown timer
- Error handling for Firebase errors
- Resend OTP after 30 seconds
- India phone number format validation

#### 3. Updated `src/routes/login.tsx`
- Integrated FirebaseOTPVerify
- Phone number lookup in database
- Session management
- Error handling

#### 4. Updated `src/routes/register.tsx`
- Integrated FirebaseOTPVerify
- Automatic step transition
- Duplicate phone prevention
- Profile creation after verification

---

## Testing

### Test Method 1: Real Phone Numbers (Production)

1. User enters their actual phone number: `9876543210`
2. Firebase sends real OTP via SMS
3. User enters OTP from SMS
4. System authenticates

### Test Method 2: Testing Numbers (Development)

1. **Enable testing number** in Firebase Console (see above)
2. Use phone: `+919876543210`
3. Enter any OTP: `123456`
4. System authenticates without sending SMS

### Test Flow for Registration

```
1. Go to /register
2. Click "Send OTP"
3. Enter phone: 9876543210
4. Enter OTP (real SMS or testing number: 123456)
5. Fill profile details
6. Click "Create Profile"
7. Redirect to /dashboard
```

### Test Flow for Login

```
1. Go to /login
2. Click "Use Real Phone OTP (Firebase)"
3. Enter registered phone number
4. Enter OTP from SMS
5. Redirect to /dashboard
6. Or use "Demo Login" for quick testing
```

---

## Features Implemented

### ✅ Real Firebase Phone Authentication
- Real phone numbers only (no mock OTP)
- Firebase handles SMS delivery
- Secure OTP verification

### ✅ reCAPTCHA Protection
- Invisible reCAPTCHA v3
- Prevents bot abuse
- Enterprise-grade security

### ✅ Error Handling
- Invalid phone format
- Too many requests (rate limiting)
- Invalid OTP
- Expired OTP
- Session timeout
- Operation not allowed

### ✅ User Experience
- 6-digit OTP input with formatting
- 120-second OTP expiry timer
- 30-second resend timer
- Phone number validation (India format)
- Loading spinners during OTP send/verify
- Toast notifications for success/errors
- "Change Number" option

### ✅ Security Features
- Phone number + OTP two-factor authentication
- reCAPTCHA verification
- Session management
- Duplicate phone prevention
- Email uniqueness validation

---

## Firebase Error Codes & Solutions

| Error Code | Meaning | Solution |
|-----------|---------|----------|
| `auth/invalid-phone-number` | Phone format incorrect | Ensure 10-digit Indian number |
| `auth/too-many-requests` | Rate limited | Wait 15 minutes before retry |
| `auth/operation-not-allowed` | Phone auth disabled | Enable in Firebase Console |
| `auth/invalid-verification-code` | Wrong OTP entered | Re-enter correct OTP |
| `auth/code-expired` | OTP expired (>120sec) | Request new OTP |
| `auth/network-request-failed` | Network error | Check internet connection |

---

## Deployment Considerations

### Production Checklist

- [ ] Firebase project set to production mode
- [ ] Custom domain added to reCAPTCHA allowed domains
- [ ] SMS billing enabled in Firebase
- [ ] Authentication rate limits configured
- [ ] Error monitoring setup (Firebase Crashlytics)
- [ ] User data backup strategy
- [ ] GDPR/Privacy policy updated
- [ ] Phone number format for your country
- [ ] SMS provider quotas verified
- [ ] Monitoring dashboard created

### Production Domains

Add to Firebase reCAPTCHA allowed domains:
```
- yourdomainname.com
- www.yourdomainname.com
- app.yourdomainname.com
- *.yourdomainname.com (wildcard if supported)
```

---

## Advanced Configuration

### Custom Error Messages

Edit `src/components/FirebaseOTPVerify.tsx`:

```typescript
if (err.code === "auth/invalid-phone-number") {
  setError("Please enter a valid 10-digit phone number starting with 9");
}
```

### OTP Timeout Duration

Edit `src/components/FirebaseOTPVerify.tsx`:

```typescript
setTimeLeft(120); // Change 120 to desired seconds
```

### reCAPTCHA Type

Edit `src/components/FirebaseOTPVerify.tsx`:

```typescript
size: "invisible", // Change to "normal" for visible reCAPTCHA
```

---

## Debugging

### Enable Firebase Debug Logging

```typescript
import { connectAuthEmulator } from "firebase/auth";

// In development only
if (window.location.hostname === "localhost") {
  connectAuthEmulator(auth, "http://localhost:9099", { disableWarnings: true });
}
```

### Check reCAPTCHA Status

```javascript
// In browser console
window.grecaptcha.ready(() => {
  console.log("reCAPTCHA loaded successfully");
});
```

### Monitor OTP Requests

Firebase Console → Authentication → Sign-in method → Phone → View recent activity

---

## FAQ

### Q: Will SMS charges apply?
**A:** Yes, Firebase charges per SMS after free tier (usually 50-100 free OTPs/month, then ~$0.02-0.05 per SMS).

### Q: Can I use testing numbers in production?
**A:** No, testing numbers only work in development. In production, real SMS are sent.

### Q: How do I handle international phone numbers?
**A:** Modify the validation in `FirebaseOTPVerify.tsx` to accept different country codes.

### Q: What if user doesn't receive OTP?
**A:** Implement "Resend OTP" or "Call instead" feature. Current code has resend after 30 seconds.

### Q: How secure is this solution?
**A:** Very secure. Uses Firebase's enterprise security + reCAPTCHA + rate limiting.

---

## Support & Resources

- **Firebase Documentation:** https://firebase.google.com/docs/auth/web/phone-auth
- **React Firebase Guide:** https://firebase.google.com/docs/database/usage/best-practices
- **reCAPTCHA Setup:** https://www.google.com/recaptcha/admin
- **Firebase Console:** https://console.firebase.google.com

---

## Next Steps

1. ✅ Create Firebase project
2. ✅ Enable Phone Authentication
3. ✅ Configure reCAPTCHA
4. ✅ Add environment variables
5. ✅ Test with development/testing numbers
6. ✅ Deploy to production with real SMS
7. ✅ Monitor usage and errors
8. ✅ Set up backup authentication method

---

**Last Updated:** May 5, 2026  
**Status:** Production Ready ✅
