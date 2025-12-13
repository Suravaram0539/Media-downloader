# Quick Deployment Steps

## 🚀 Deploy Your App in 5 Minutes

### Your Current Error
You deployed to Netlify but the backend isn't running, causing:
```
Network error: Unexpected token '<', "<!DOCTYPE "... is not valid JSON
```

### The Fix: Backend + Frontend Separation

#### Step 1: Push to GitHub
```powershell
cd "c:\Users\jagadeeswar reddy.s\Downloads\Youtube downloder app"
git init
git add .
git commit -m "YouTube & Instagram Downloader"
git remote add origin https://github.com/YOUR_USERNAME/youtube-downloader.git
git branch -M main
git push -u origin main
```

#### Step 2: Deploy Backend to Railway (2 min)
1. Go to https://railway.app
2. Sign up with GitHub
3. Click "New Project" → "Deploy from GitHub repo"
4. Select your `youtube-downloader` repo
5. Wait for deployment (shows green ✓)
6. Copy your Railway URL: `https://YOUR-APP-NAME.railway.app`

#### Step 3: Update Your Frontend
In `public/script.js`, change line 2:
```javascript
const API_URL = window.location.hostname === 'localhost' 
  ? 'http://localhost:3000' 
  : 'https://your-railway-url.railway.app'; // PUT YOUR RAILWAY URL HERE
```

#### Step 4: Deploy Frontend to Netlify (2 min)
1. Push updated code to GitHub
2. Go to https://netlify.app
3. Click "Add new site" → "Import existing project"
4. Select your GitHub repo
5. Deploy
6. Done! ✅

---

## ✅ After Deployment

Your app structure:
```
Frontend (Netlify)          Backend (Railway)
└─ Your site URL      ←→    └─ API endpoints
  └─ script.js                └─ /api/download
  └─ Makes API calls          └─ /api/status
```

## 🔍 Testing After Deploy

1. Visit your Netlify URL
2. Open DevTools (F12)
3. Check "Network" tab
4. Try downloading
5. See the `/api/download` request succeed ✓

---

## 📚 Detailed Guide

See `DEPLOYMENT_GUIDE.md` for:
- Step-by-step instructions
- Environment variables
- Troubleshooting
- Alternative hosting options

---

## 🆘 If It Still Doesn't Work

1. **Check Railway URL is correct** in `script.js`
2. **Check Railway logs** for backend errors
3. **Check CORS**: Backend now allows Netlify domains
4. **Check API response** in DevTools Network tab

---

**Questions? Need help?**

Your backend is ready to deploy! Just follow the 4 steps above. 🚀
