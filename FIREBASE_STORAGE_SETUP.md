# Firebase Storage Rules Setup

## Problem
Files are not being attached to content when uploading in the CR portal. This is because Firebase Storage security rules need to be configured to allow authenticated users to upload files.

## Solution

### Deploy Storage Rules

You need to deploy the `storage.rules` file to your Firebase project. Here are the options:

#### Option 1: Using Firebase Console (Easiest)
1. Go to [Firebase Console](https://console.firebase.google.com/)
2. Select your project: `studio-8031147147-a5125`
3. Navigate to **Storage** in the left sidebar
4. Click on the **Rules** tab
5. Copy the contents from `storage.rules` file in this project
6. Paste it into the Firebase Console Rules editor
7. Click **Publish**

#### Option 2: Using Firebase CLI
```bash
# Install Firebase CLI if you haven't already
npm install -g firebase-tools

# Login to Firebase
firebase login

# Initialize Firebase in your project (if not already done)
firebase init storage

# Deploy storage rules
firebase deploy --only storage
```

## Storage Rules Overview

The `storage.rules` file allows:
- ✅ Any authenticated user can **read** files
- ✅ Any authenticated user can **upload** files (max 5MB)
- ✅ Users can **delete** their own files
- ✅ Supported file types: images, PDFs, documents, text files

## Verify Setup

After deploying the rules:
1. Try uploading a file in the CR portal
2. Check the browser console (F12) for detailed upload logs
3. The logs will show:
   - Upload progress percentage
   - Upload state
   - Download URL when complete
   - Any errors with detailed messages

## Troubleshooting

If uploads still fail:
1. Check browser console for error messages
2. Verify you're signed in (anonymous or authenticated)
3. Check file size (must be < 5MB)
4. Verify Firebase Storage is enabled in your project
5. Check that the storage bucket exists: `studio-8031147147-a5125.appspot.com`
