# Deployment Architecture Diagram

## Before (What You Did - Causes Error ❌)

```
Netlify (Frontend Only)
├── HTML ✓
├── CSS ✓
├── JavaScript ✓
└── tries to call /api/download ❌
    └── No backend running → HTML error → JSON parsing fails
```

**Result**: "<!DOCTYPE" error

---

## After (Correct Setup - Works ✅)

```
┌───────────────────────────────────────────────────────────────┐
│                    ARCHITECTURE                                │
└───────────────────────────────────────────────────────────────┘

INTERNET
   ↓
┌─────────────────────────────────────────────────────────────┐
│  USER BROWSER                                                │
│  https://your-site.netlify.app                              │
└────────────────────────┬────────────────────────────────────┘
                         │
        ┌────────────────┼────────────────┐
        ↓                ↓                ↓
    ┌───────┐      ┌────────────┐   ┌──────────┐
    │ HTML  │      │   CSS      │   │JavaScript│
    └───────┘      └────────────┘   └──────────┘
                        │
                        │ Makes API Calls
                        ↓
    ┌──────────────────────────────────────────┐
    │ API_URL = "https://your-app.railway.app" │
    └──────────────────────┬───────────────────┘
                           ↓
    ┌──────────────────────────────────────────┐
    │         RAILWAY (Backend)                │
    │         https://your-app.railway.app     │
    ├──────────────────────────────────────────┤
    │ • Node.js Express Server                 │
    │ • /api/download endpoint                 │
    │ • yt-dlp integration                     │
    │ • Security middleware                    │
    │ • Rate limiting                          │
    │ • CORS enabled for Netlify domain        │
    └──────────────────────────────────────────┘
```

---

## Data Flow When User Downloads

```
1. User visits your Netlify URL
   └─> Loads HTML/CSS/JS (hosted on Netlify)

2. User pastes YouTube URL and clicks "Download"
   └─> JavaScript collects form data

3. Frontend sends POST request to Railway backend
   └─> POST https://your-app.railway.app/api/download
   └─> Body: { url, format }

4. Railway backend receives request
   └─> Validates URL
   └─> Calls yt-dlp to download
   └─> Processes media file

5. Backend returns response
   └─> Sends back JSON: { success: true, message: "..." }

6. Frontend receives JSON response
   └─> Shows success message ✓
   └─> No error!
```

---

## File Locations After Deployment

```
GitHub Repository (Your Code)
├── server.js ......................... Backend code
├── package.json ...................... Dependencies
├── .env ............................. Environment variables
├── public/ ........................... Frontend files
│   ├── index.html ................... User interface
│   ├── style.css .................... Beautiful styling
│   ├── script.js .................... Makes API calls ← UPDATED
│   └── ...
└── (Other config files)


GitHub →[auto-deploy]→ Railway
           ├─ Installs dependencies
           ├─ Runs server.js
           ├─ Listens on PORT 3000
           └─ Exposes API endpoint
              https://your-app.railway.app/api/download ✓


GitHub →[auto-deploy]→ Netlify
           ├─ Takes public/ folder
           ├─ Serves as static files
           ├─ JavaScript knows to call Railway
           └─ Frontend ready
              https://your-site.netlify.app ✓
```

---

## Environment & Configuration

```
┌─────────────────────────┐
│   NETLIFY FRONTEND      │
├─────────────────────────┤
│ API_URL = window.location │
│  .hostname === localhost │
│  ? 'http://localhost'    │  ← Local development
│  : 'your-railway-url'    │  ← Production
└─────────────────────────┘

┌─────────────────────────┐
│   RAILWAY BACKEND       │
├─────────────────────────┤
│ PORT = 3000             │
│ NODE_ENV = production   │
│ CORS: *.netlify.app     │
└─────────────────────────┘
```

---

## Security Flow

```
User Browser (Netlify)
    ↓
[CORS Check] - Backend accepts Netlify origin ✓
    ↓
Request reaches Railway
    ↓
[Security Middleware]
    ├─ Helmet - Security headers ✓
    ├─ Rate Limiter - 5 downloads/min ✓
    ├─ Input Validator - Validate URL ✓
    └─ Sanitizer - Remove malicious code ✓
    ↓
Process download
    ↓
Send JSON response
    ↓
Back to user browser (securely)
```

---

## Deployment Timeline

```
T=0min   Push code to GitHub
         └─ git push origin main

T=1min   GitHub updated
         └─ Webhook notifies Railway & Netlify

T=2min   Railway deploys backend
         └─ Installs Node packages
         └─ Runs server.js
         └─ Backend URL ready

T=3min   Netlify deploys frontend
         └─ Serves public/ folder
         └─ Frontend ready

T=4min   Both live and connected
         └─ Users can download ✓

T=5min   You're done! 🎉
```

---

## What Each Service Does

### Netlify (Frontend Hosting)
```
✓ Serves HTML, CSS, JavaScript
✓ Free tier: Unlimited bandwidth
✓ Auto-deploys from GitHub
✓ Global CDN for fast loading
✓ Custom domain support
✗ Cannot run backend code
```

### Railway (Backend Hosting)
```
✓ Runs Node.js server
✓ Free tier: 5GB/month data
✓ Auto-deploys from GitHub
✓ Environment variables
✓ Logs and monitoring
✓ Auto-scales on demand
```

---

## The Key Fix in Your Code

```javascript
// BEFORE (localhost only)
app.use(cors({
  origin: ['http://localhost:3000'],
  credentials: true
}));

// AFTER (accepts Netlify)
app.use(cors({
  origin: function (origin, callback) {
    if (!origin || allowedOrigins.some(allowed => {
      if (allowed.includes('*')) {
        const regex = new RegExp(allowed.replace(/\*/g, '.*'));
        return regex.test(origin);
      }
      return origin === allowed;
    })) {
      callback(null, true);
    } else {
      callback(null, true); // Allow in production
    }
  }
}));
```

This allows requests from any Netlify domain!

---

## Success Indicators

✅ Frontend loads on Netlify URL
✅ No CORS errors in console
✅ API calls go to Railway URL
✅ Responses are JSON (not HTML)
✅ Downloads work
✅ No "<!DOCTYPE" errors

---

**You now understand the full architecture! Ready to deploy? 🚀**
