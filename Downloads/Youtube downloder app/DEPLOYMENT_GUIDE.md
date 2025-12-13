# Deployment Guide - YouTube & Instagram Downloader

This guide explains how to deploy your application with the frontend on Netlify and the backend on Railway (or similar service).

## Problem Explanation

When you deploy only the frontend to Netlify, the backend API server is not running. The frontend tries to make API calls to `/api/download` but gets HTML error pages instead of JSON responses, causing the error:
```
Network error: Unexpected token '<', "<!DOCTYPE "... is not valid JSON
```

## Solution: Deploy Backend Separately

### Step 1: Deploy Backend on Railway (Recommended - Free)

**Why Railway?**
- Free tier: 5GB/month data, generous limits
- Easy deployment from GitHub
- Automatic HTTPS
- Environment variables support

**Instructions:**

1. **Push your code to GitHub:**
   ```bash
   cd "c:\Users\jagadeeswar reddy.s\Downloads\Youtube downloder app"
   git init
   git add .
   git commit -m "Initial commit"
   git remote add origin https://github.com/YOUR_USERNAME/youtube-downloader.git
   git push -u origin main
   ```

2. **Create Railway Account:**
   - Visit https://railway.app
   - Sign up with GitHub
   - Authorize Railway

3. **Deploy Your Backend:**
   - Click "New Project"
   - Select "Deploy from GitHub repo"
   - Select your `youtube-downloader` repository
   - Railway will auto-detect it's a Node.js app
   - Wait for deployment to complete

4. **Get Your Backend URL:**
   - Your backend will be available at: `https://YOUR-APP-NAME.railway.app`
   - Note this URL (you'll need it in the next step)

### Step 2: Update Frontend for Production

1. **Update the API URL in `public/script.js`:**
   
   Find this line:
   ```javascript
   const API_URL = window.location.hostname === 'localhost' 
     ? 'http://localhost:3000' 
     : 'https://your-backend-url.railway.app';
   ```
   
   Replace `https://your-backend-url.railway.app` with your actual Railway URL.

2. **Update `.env` file:**
   ```
   PORT=3000
   NODE_ENV=production
   FRONTEND_URL=https://your-netlify-site.netlify.app
   ```

### Step 3: Deploy Frontend on Netlify

1. **Create a Netlify Account:**
   - Visit https://netlify.app
   - Sign up with GitHub

2. **Deploy Your Frontend:**
   - Click "Add new site" → "Import an existing project"
   - Select your GitHub repository
   - Leave build settings as default (Netlify will serve the `public` folder)
   - Click "Deploy site"

3. **Your Site is Live:**
   - Netlify gives you a URL like: `https://your-app-name.netlify.app`
   - Your app is now accessible from anywhere!

### Step 4: Verify Everything Works

1. Visit your Netlify URL
2. Enter a YouTube or Instagram URL
3. Select format (Video/Audio)
4. Click Download
5. Check if it works!

## Alternative Backend Hosting Options

### Option 2: Render.com
- Free tier: 750 hours/month
- https://render.com
- Similar setup to Railway

### Option 3: Heroku (Now Paid)
- Previously free, now requires credit card
- https://heroku.com

## Troubleshooting

### Still Getting JSON Error?
1. Check your Railway URL is correct in `script.js`
2. Make sure Railway deployment is complete (green checkmark)
3. Test your backend directly: `https://your-railway-url/api/status` (add this endpoint if needed)

### Backend Not Working?
1. Check Railway logs: Go to Railway dashboard → Your app → Logs
2. Ensure `yt-dlp` is installed on the server
3. Check if rate limiting is blocking requests

### CORS Errors?
- The backend now accepts requests from any Netlify domain
- No additional setup needed

## Environment Variables on Railway

1. Go to Railway Dashboard
2. Select your project
3. Click "Variables" tab
4. Add these if needed:
   ```
   NODE_ENV=production
   PORT=3000
   ```

## Important Notes

⚠️ **Limitations:**
- Railway has download limits (5GB/month free tier)
- Large files might not work due to server constraints
- yt-dlp needs to be available on the server

✅ **What Works:**
- Small to medium video downloads
- Audio extraction
- Both YouTube and Instagram
- All security features
- Rate limiting

## Support

If you encounter issues:
1. Check Railway logs for backend errors
2. Open browser DevTools (F12) → Network tab → see API responses
3. Check console for error messages

---

**Your app is now live and accessible from anywhere! 🚀**
