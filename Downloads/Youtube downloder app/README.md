# Media Downloader Application

A secure, user-friendly web application to download videos and audio from YouTube and Instagram directly from your browser.

## ✨ Features

✨ **Multi-Platform Support** - Download from YouTube and Instagram  
🎬 **Download Videos** - Get the best quality video (MP4 format)  
🎵 **Download Audio** - Extract audio as M4A format  
📁 **View Downloads** - See your recent downloads  
🎨 **Modern UI** - Clean and intuitive interface with platform selection  
⚡ **Fast & Simple** - Just paste a URL and download  
🔒 **Secure** - Enterprise-grade security protecting against attacks  

## 🔒 Security Features

Your application is protected with enterprise-grade security:

- ✅ **Input Validation** - Strict URL validation for YouTube and Instagram
- ✅ **Rate Limiting** - DDoS protection (100 requests/15min, 5 downloads/min)
- ✅ **Security Headers** - Helmet.js with Content Security Policy
- ✅ **Command Injection Prevention** - Multi-layer command injection blocking
- ✅ **XSS Protection** - HTML encoding and Content Security Policy
- ✅ **CORS Security** - Restricted cross-origin resource sharing
- ✅ **Process Isolation** - Timeouts and resource limits
- ✅ **Data Sanitization** - NoSQL injection prevention
- ✅ **Error Handling** - No information disclosure

**See [SECURITY.md](SECURITY.md) for detailed security documentation.**  

## Prerequisites

Before you begin, make sure you have:

1. **Node.js** (v14 or higher) - [Download](https://nodejs.org/)
2. **yt-dlp** - A command-line video downloader

### Installing yt-dlp

#### Option 1: Using Python pip (Recommended)
```bash
pip install yt-dlp
```

#### Option 2: Using Chocolatey (Windows)
```bash
choco install yt-dlp
```

#### Option 3: Download Binary
- Download from [yt-dlp releases](https://github.com/yt-dlp/yt-dlp/releases)
- Extract and add to your system PATH

**Verify installation:**
```bash
yt-dlp --version
```

## Installation

1. **Navigate to the project directory:**
   ```bash
   cd "Youtube downloader app"
   ```

2. **Install Node.js dependencies:**
   ```bash
   npm install
   ```

## Usage

1. **Start the server:**
   ```bash
   npm start
   ```

2. **Open in browser:**
   - Navigate to `http://localhost:3000`
   - Or open automatically in your default browser

3. **Download content:**
   - **Select Platform:** Choose YouTube or Instagram
   - **Paste URL:** Enter a valid YouTube or Instagram link
     - YouTube: `https://youtube.com/watch?v=...` or `https://youtu.be/...`
     - Instagram: `https://instagram.com/p/...`, `/reel/...`, `/tv/...`, or `/stories/...`
   - **Select Format:** Choose Video (MP4) or Audio (M4A)
   - **Click Download:** Wait for completion
   - **Check Downloads:** Recent downloads appear in the list below

## Project Structure

```
Youtube downloader app/
├── package.json           # Project dependencies
├── server.js              # Express server & API
├── README.md              # This file
└── public/
    ├── index.html         # Main HTML file
    ├── style.css          # Styling
    └── script.js          # Frontend logic
```

## API Endpoints

### POST /api/download
Download a YouTube video or audio.

**Request:**
```json
{
  "url": "https://www.youtube.com/watch?v=...",
  "format": "video" or "audio"
}
```

**Response (Success):**
```json
{
  "success": true,
  "message": "Video/Audio downloaded successfully!",
  "downloadPath": "C:\\Users\\YourUser\\Downloads\\YTDownloader"
}
```

**Response (Error):**
```json
{
  "error": "Error message"
}
```

### GET /api/downloads
Get list of downloaded files.

**Response:**
```json
{
  "files": ["video_123456.mp4", "audio_123457.mp3"],
  "path": "C:\\Users\\YourUser\\Downloads\\YTDownloader"
}
```

## Download Location

All downloads are saved to:
- **Windows:** `C:\Users\YourUsername\Downloads\YTDownloader`
- **macOS:** `~/Downloads/YTDownloader`
- **Linux:** `~/Downloads/YTDownloader`

## Supported Formats

### Video
- MP4 (best quality available)
- MKV
- WebM
- And more formats supported by yt-dlp

### Audio
- MP3 (192 kbps)
- Uses best available audio track

## Troubleshooting

### "yt-dlp not found" Error
- **Solution:** Install yt-dlp: `pip install yt-dlp`
- Verify it's in your system PATH

### Download fails with invalid URL
- Make sure it's a valid YouTube URL
- Try: `https://www.youtube.com/watch?v=...`

### Server won't start
- Check if port 3000 is available
- Try: `netstat -ano | findstr :3000` (Windows)
- Kill the process or use different port

### No downloads showing
- Check that `~/Downloads/YTDownloader` exists
- Verify read permissions on the directory

## Environment Variables (Optional)

Create a `.env` file in the root directory:

```
PORT=3000
NODE_ENV=development
```

## Performance Tips

- Close unused browser tabs for better performance
- Large videos may take time depending on your internet speed
- Best quality videos use more bandwidth

## Limitations

- Respects video copyright and YouTube ToS
- Some videos may be age-restricted or region-locked
- Downloading may be slower for very large files
- Some formats might not be available for all videos

## Future Enhancements

- [ ] Batch download multiple videos
- [ ] Download playlists
- [ ] Video quality selection
- [ ] Subtitle download
- [ ] Desktop app with Electron
- [ ] Schedule downloads

## Legal Notice

This tool is intended for personal use only. Always respect copyright laws and platform terms of service. The author is not responsible for misuse of this tool.

## License

ISC License

## Support

For issues or questions:
1. Check the troubleshooting section
2. Verify yt-dlp installation
3. Check console for error messages

---

**Happy downloading!** 🎉
