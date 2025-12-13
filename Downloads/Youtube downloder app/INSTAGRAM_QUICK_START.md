# Quick Start Guide - Instagram Integration

## 🎯 What's New

Your app now downloads from **YouTube AND Instagram** with identical security!

## 🚀 Quick Test

### YouTube Download
1. Go to `http://localhost:3000`
2. Leave platform as **▶️ YouTube** (default)
3. Paste: `https://www.youtube.com/watch?v=BQa2hbAC9W4`
4. Select **🎬 Video** or **🎵 Audio**
5. Click **⬇️ Download**

### Instagram Download
1. Go to `http://localhost:3000`
2. Click **📷 Instagram** button (turns purple)
3. Paste: `https://instagram.com/p/ABC123...` (any post/reel/tv/story URL)
4. Select **🎬 Video** or **🎵 Audio**
5. Click **⬇️ Download**

## 📱 Instagram URL Types

| Type | URL Format | Example |
|------|-----------|---------|
| Post | `/p/` | instagram.com/p/ABC123 |
| Reel | `/reel/` | instagram.com/reel/ABC123 |
| TV/IGTV | `/tv/` | instagram.com/tv/ABC123 |
| Story | `/stories/` | instagram.com/stories/ABC123 |

## 🔒 Security Check

All security features work for both platforms:
- ✅ Input validation (both YouTube & Instagram URLs)
- ✅ Rate limiting (100 requests/15min)
- ✅ Command injection prevention
- ✅ XSS protection
- ✅ Error handling

## 📁 Download Location

Both YouTube and Instagram files go to:
```
C:\Users\jagadeeswar reddy.s\Downloads\
```

Files are named with platform prefix:
- `youtube_video_1234567890.mp4`
- `youtube_audio_1234567890.m4a`
- `instagram_video_1234567890.mp4`
- `instagram_audio_1234567890.m4a`

## 🔧 Files Changed

| File | Change |
|------|--------|
| `server.js` | Added Instagram validation, refactored download function |
| `public/index.html` | Added platform selector UI |
| `public/script.js` | Added platform tracking and Instagram validation |
| `public/style.css` | Added platform button styling |
| `README.md` | Updated documentation |
| `INSTAGRAM_INTEGRATION.md` | Full implementation details (NEW) |

## ⚠️ Important Notes

1. **Server Running**: Check terminal output shows "running at http://localhost:3000"
2. **yt-dlp Installed**: Make sure `pip install yt-dlp` was run
3. **Private Content**: Instagram private accounts cannot be downloaded
4. **Rate Limits**: App enforces 5 downloads per minute per IP

## 🐛 Troubleshooting

### "Invalid URL" Error
- Check platform selection matches URL (YouTube vs Instagram)
- Verify URL format matches supported patterns
- Try a different video/post

### "Download Failed" Error
- Check internet connection
- Verify video is public/accessible
- Check if you've hit rate limit (wait a minute)
- Check yt-dlp is installed: `yt-dlp --version`

### Server Won't Start
- Check port 3000 is available
- Run: `taskkill /F /IM node.exe`
- Run: `npm start` again

## 📞 Support

For detailed information, see:
- `INSTAGRAM_INTEGRATION.md` - Full technical details
- `SECURITY.md` - Security documentation
- `README.md` - Setup and usage guide

## ✨ You're All Set!

The app is ready with YouTube + Instagram support! 🎉
