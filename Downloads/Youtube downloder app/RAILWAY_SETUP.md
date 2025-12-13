# Railway Deployment - Step by Step

## Prerequisites
- GitHub account with your code pushed
- Railway account (free tier)

## Exact Steps

### 1. Create GitHub Repository (if not done)

```powershell
cd "c:\Users\jagadeeswar reddy.s\Downloads\Youtube downloder app"

# Initialize git if not already done
git init

# Add all files
git add .

# Commit
git commit -m "YouTube & Instagram Downloader App"

# Add remote (replace YOUR_USERNAME)
git remote add origin https://github.com/YOUR_USERNAME/youtube-downloader.git

# Rename branch to main if needed
git branch -M main

# Push to GitHub
git push -u origin main
```

### 2. Deploy on Railway

1. **Visit https://railway.app**

2. **Sign in with GitHub**
   - Click "Sign in with GitHub"
   - Authorize Railway
   - Select account

3. **Create New Project**
   - Click "Create new" button (top right)
   - Click "Deploy from GitHub repo"

4. **Select Your Repository**
   - Find your `youtube-downloader` repo
   - Click "Deploy"
   - Select "Confirm & Deploy"

5. **Wait for Deployment**
   - Railway automatically detects Node.js
   - Installs dependencies
   - Starts the server
   - Green checkmark = Success ✅

6. **Get Your Backend URL**
   - Click on your deployed app in Railway
   - Click on "Deployments" tab
   - Find your app's URL
   - Example: `https://youtube-downloader-prod-xxx.railway.app`

### 3. Update Frontend Code

Open `public/script.js` and update line 2-5:

**BEFORE:**
```javascript
const API_URL = window.location.hostname === 'localhost' 
  ? 'http://localhost:3000' 
  : 'https://your-backend-url.railway.app';
```

**AFTER:** (Replace with your actual Railway URL)
```javascript
const API_URL = window.location.hostname === 'localhost' 
  ? 'http://localhost:3000' 
  : 'https://youtube-downloader-prod-xxx.railway.app';
```

### 4. Push Updated Code

```powershell
cd "c:\Users\jagadeeswar reddy.s\Downloads\Youtube downloder app"

git add public/script.js
git commit -m "Update backend API URL for production"
git push origin main
```

### 5. Deploy Frontend on Netlify

1. **Visit https://netlify.app**

2. **Sign in with GitHub**
   - Click "Sign up"
   - Choose "GitHub"
   - Authorize Netlify

3. **Add New Site**
   - Click "Add new site"
   - Choose "Import an existing project"

4. **Select Your Repository**
   - Search for `youtube-downloader`
   - Click it

5. **Configure Build**
   - Build command: `(leave empty)`
   - Publish directory: `public`
   - Click "Deploy site"

6. **Wait for Deployment**
   - Netlify builds and deploys
   - Green checkmark = Live ✅
   - Your site URL appears (e.g., `https://your-site-123.netlify.app`)

---

## ✅ Testing Your Deployed App

1. **Visit your Netlify URL** (e.g., `https://your-site-123.netlify.app`)

2. **Test a download:**
   - Enter YouTube/Instagram URL
   - Select Video or Audio
   - Click "Download"

3. **Check if it works:**
   - Open DevTools (F12)
   - Go to "Network" tab
   - Look for API calls to your Railway URL
   - Should see successful responses

4. **Check for errors:**
   - If you see `<` or `<!DOCTYPE`, the API URL is wrong
   - Update `script.js` with correct Railway URL
   - Push to GitHub
   - Netlify auto-redeploys

---

## 🔑 Important URLs

- **GitHub**: https://github.com/YOUR_USERNAME/youtube-downloader
- **Railway Backend**: `https://your-app-name.railway.app` (API only)
- **Netlify Frontend**: `https://your-site-name.netlify.app` (User interface)

---

## 🆘 Troubleshooting

### Backend Shows Red Error
- Check Railway logs: Click app → Logs tab
- Common issues:
  - `yt-dlp` not installed
  - PORT environment variable wrong
  - Node version mismatch

### Frontend Shows JSON Error
- API URL is wrong in `script.js`
- Backend URL not deployed yet
- Check Network tab in DevTools

### Downloads Don't Work
- Backend is deployed but not processing
- Check Railway logs for errors
- May need to install Python for `yt-dlp`

---

## 📝 Environment Variables

Railway automatically sets:
- `PORT=3000` (default)
- `NODE_ENV=production`

If needed, add more in Railway dashboard:
1. Click your app
2. Click "Variables" tab
3. Add custom variables

Example:
```
FRONTEND_URL = https://your-site-name.netlify.app
```

---

## 🎉 You're Done!

Your app is now live and can be accessed from anywhere!

- Frontend: Your Netlify URL
- Backend: Your Railway URL
- Both connected and working together

**Share your Netlify URL with anyone to let them use your app!** 🚀
