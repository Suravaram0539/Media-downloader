# 📊 Instagram Integration - Visual Diagrams

## Architecture Comparison

### BEFORE (YouTube Only)
```
┌─────────────────────────────────────┐
│     Web Browser (User Interface)    │
│                                     │
│  "YouTube Downloader"               │
│  ▼ [Download]                       │
│  [YouTube URL Input]                │
│  [Video] [Audio] Format Select      │
└──────────────┬──────────────────────┘
               │ HTTP POST
               │ {url, format}
               ▼
┌──────────────────────────────────────┐
│    Node.js Express Backend           │
│                                      │
│  1. Validate YouTube URL ✓           │
│  2. Security Checks ✓                │
│  3. downloadYouTube(url, format)     │
│  4. Run: python -m yt_dlp            │
│  5. Save to Downloads/               │
└──────────────┬───────────────────────┘
               │
               ▼
        Downloads Folder
        (Only YouTube files)
```

### AFTER (YouTube + Instagram)
```
┌──────────────────────────────────────┐
│    Web Browser (User Interface)      │
│                                      │
│  "Media Downloader"                  │
│  ▶️ YouTube │ 📷 Instagram           │
│  [URL Input]                         │
│  [Video] [Audio]                     │
└───────────────┬──────────────────────┘
                │ HTTP POST
                │ {url, format}
                ▼
┌──────────────────────────────────────┐
│    Node.js Express Backend           │
│                                      │
│  1. Detect Platform:                 │
│     ├─ isValidYouTubeUrl()  ✓        │
│     └─ isValidInstagramUrl() ✓       │
│  2. Security Checks ✓                │
│  3. downloadMedia(..., platform)     │
│  4. Run: python -m yt_dlp            │
│  5. Save with platform prefix        │
└───────────────┬──────────────────────┘
                │
                ▼
        Downloads Folder
        (YouTube + Instagram files)
```

---

## Platform Detection Flow

```
                    User URL Input
                          │
                          ▼
        ┌─────────────────────────────────┐
        │   isValidYouTubeUrl(url)?        │
        │   /^(https?:\/\/)?(www\.)?      │
        │   (youtube|youtu|youtube-)      │
        │   (com|be)\/[^\s]*$/            │
        └────┬──────────────────┬─────────┘
             │                  │
             YES                NO
             │                  │
             ▼                  ▼
      platform =          ┌─────────────────┐
      'youtube'           │ isValidInstagram│
                          │ Url(url)?       │
                          │ /^(https?:\/\/) │
                          │ (www\.)?        │
                          │ instagram.com\/ │
                          │ (p|reel|tv|    │
                          │ stories)\/...   │
                          └────┬────────┬──┘
                               │        │
                               YES      NO
                               │        │
                               ▼        ▼
                        platform =   ERROR:
                        'instagram' Invalid URL
```

---

## Download Process Comparison

### YouTube Download
```
┌─────────────────────────────────────┐
│  Detect: isValidYouTubeUrl() = true  │
│  Platform = 'youtube'               │
└─────────────────┬───────────────────┘
                  │
                  ▼
        ┌─────────────────────────┐
        │  downloadMedia(url,     │
        │  format,                │
        │  outputPath,            │
        │  'youtube')             │
        └────────────┬────────────┘
                     │
                     ▼
        ┌─────────────────────────┐
        │  File: youtube_video_  │
        │  1234567890.mp4        │
        │  Logs: [YOUTUBE] Out   │
        └────────────┬────────────┘
                     │
                     ▼
        File saved to Downloads/
```

### Instagram Download
```
┌─────────────────────────────────────┐
│ Detect: isValidInstagramUrl() = true │
│ Platform = 'instagram'              │
└─────────────────┬───────────────────┘
                  │
                  ▼
        ┌─────────────────────────┐
        │  downloadMedia(url,     │
        │  format,                │
        │  outputPath,            │
        │  'instagram')           │
        └────────────┬────────────┘
                     │
                     ▼
        ┌─────────────────────────┐
        │  File: instagram_video_ │
        │  1234567890.mp4        │
        │  Logs: [INSTAGRAM] Out  │
        └────────────┬────────────┘
                     │
                     ▼
        File saved to Downloads/
```

---

## URL Format Support

### YouTube URLs Accepted
```
Standard:  https://youtube.com/watch?v=VIDEO_ID
Short:     https://youtu.be/VIDEO_ID
Shorts:    https://youtube.com/shorts/VIDEO_ID
With time: https://youtube.com/watch?v=VIDEO_ID&t=123s

Validation Regex:
^(https?:\/\/)?(www\.)?(youtube|youtu|youtube-nocookie)\.(com|be)\/[^\s]*$
```

### Instagram URLs Accepted
```
Post:      https://instagram.com/p/POST_ID
Reel:      https://instagram.com/reel/REEL_ID
TV/IGTV:   https://instagram.com/tv/TV_ID
Story:     https://instagram.com/stories/PROFILE/STORY_ID

Validation Regex:
^(https?:\/\/)?(www\.)?instagram\.com\/(p|reel|tv|stories)\/[^\s]*$
```

---

## Security Features Matrix

```
┌────────────────────┬──────────────┬──────────────┐
│   Security Layer   │   YouTube    │   Instagram  │
├────────────────────┼──────────────┼──────────────┤
│ Input Validation   │      ✅      │      ✅      │
│ Rate Limiting      │      ✅      │      ✅      │
│ Command Injection  │      ✅      │      ✅      │
│ XSS Protection     │      ✅      │      ✅      │
│ CORS Security      │      ✅      │      ✅      │
│ Process Isolation  │      ✅      │      ✅      │
│ Security Headers   │      ✅      │      ✅      │
│ Data Sanitization  │      ✅      │      ✅      │
│ Error Handling     │      ✅      │      ✅      │
│ Process Limits     │      ✅      │      ✅      │
└────────────────────┴──────────────┴──────────────┘

Rate Limiting Details:
  Global: 100 requests per 15 minutes
  Per-Download: 5 downloads per minute per IP
  
Process Timeout: 180 seconds (both platforms)
Max File Size: 10 MB
```

---

## File Naming Convention

```
Platform Prefix + Format + Timestamp + Extension

YOUTUBE DOWNLOADS:
├── youtube_video_1765648119334.mp4
└── youtube_audio_1765648119334.m4a

INSTAGRAM DOWNLOADS:
├── instagram_video_1765648119334.mp4
└── instagram_audio_1765648119334.m4a

Format Details:
  Video: MP4 (H.264 codec, best quality available)
  Audio: M4A (AAC codec, no conversion needed)
```

---

## Code Change Impact

```
┌──────────────────────────────────────────────┐
│    Backend Changes (server.js)               │
│                                              │
│  + isValidInstagramUrl() function            │
│  + Platform detection logic                  │
│  • Refactored downloadYouTube() →            │
│    downloadMedia(platform)                   │
│  • Updated route handler                     │
│  • Platform-specific logging                 │
│                                              │
│  Impact: ~50 lines of code                   │
└──────────────────────────────────────────────┘
         │
         │ Together they enable:
         │ • Dual platform support
         │ • Secure validation
         │ • Feature parity
         │ • Logging capability
         │
         ▼
┌──────────────────────────────────────────────┐
│    Frontend Changes                          │
│                                              │
│  HTML (index.html):                          │
│  + Platform selection buttons                │
│  • Updated title & labels                    │
│                                              │
│  JavaScript (script.js):                     │
│  + Platform button event listeners           │
│  + isValidInstagramUrl() function            │
│  • Updated validation logic                  │
│                                              │
│  CSS (style.css):                            │
│  + Platform button styling                   │
│  + Hover & active states                     │
│                                              │
│  Impact: ~100 lines of code                  │
└──────────────────────────────────────────────┘
```

---

## Request Processing Pipeline

```
1. Browser Request
   ├─ URL Input
   ├─ Format Selection (video/audio)
   └─ Platform Selection (youtube/instagram)
              │
              ▼
2. Frontend Validation (script.js)
   ├─ Check URL not empty
   ├─ Platform-specific validation
   │  ├─ If YouTube: isValidYouTubeUrl()
   │  └─ If Instagram: isValidInstagramUrl()
   └─ Send to server if valid
              │
              ▼
3. Backend Receives (server.js)
   ├─ Rate limit check (5 downloads/min)
   ├─ Sanitization (NoSQL injection)
   ├─ Request size check (10MB max)
   └─ Parse JSON body
              │
              ▼
4. Platform Detection (server.js)
   ├─ isValidYouTubeUrl()?
   │  └─ YES → platform = 'youtube'
   ├─ isValidInstagramUrl()?
   │  └─ YES → platform = 'instagram'
   └─ Neither? → Error response
              │
              ▼
5. Security Validation (server.js)
   ├─ containsSuspiciousPatterns()?
   │  ├─ YES → Block (error response)
   │  └─ NO → Continue
   └─ Format check (audio/video)
              │
              ▼
6. Download Execution (server.js)
   ├─ Generate filename with platform
   ├─ Call downloadMedia(url, format, path, platform)
   ├─ Spawn Python: python -m yt_dlp
   ├─ Monitor with 180-second timeout
   ├─ Check exit code (0 or 101 = success)
   └─ Platform-specific logging
              │
              ▼
7. Response Sent
   ├─ Success: File downloaded + saved
   ├─ Error: Generic message
   └─ Platform name included in response
              │
              ▼
8. File Storage
   └─ Windows Downloads Folder
      ├─ youtube_video_TIMESTAMP.mp4
      ├─ youtube_audio_TIMESTAMP.m4a
      ├─ instagram_video_TIMESTAMP.mp4
      └─ instagram_audio_TIMESTAMP.m4a
```

---

## Browser UI Layout

### BEFORE
```
┌────────────────────────────────────┐
│  YouTube Downloader                │
│  Download YouTube videos easily    │
├────────────────────────────────────┤
│ YouTube URL:                       │
│ [_________________________]         │
│                                    │
│ Select Format:                     │
│ [🎬 Video] [🎵 Audio (MP3)]       │
│                                    │
│ [⬇️ Download]                      │
├────────────────────────────────────┤
│ Recent Downloads                   │
│ • video_1234567890.mp4            │
│ • audio_1234567890.m4a            │
└────────────────────────────────────┘
```

### AFTER
```
┌────────────────────────────────────┐
│  🎥 Media Downloader               │
│  Download from YouTube & Instagram │
├────────────────────────────────────┤
│ Select Platform:                   │
│ [▶️ YouTube] [📷 Instagram]        │
│                                    │
│ Media URL:                         │
│ [_________________________]         │
│ (Paste YouTube or Instagram URL)   │
│                                    │
│ Select Format:                     │
│ [🎬 Video (MP4)] [🎵 Audio (M4A)] │
│                                    │
│ [⬇️ Download]                      │
├────────────────────────────────────┤
│ Recent Downloads                   │
│ • youtube_video_1234567890.mp4    │
│ • instagram_audio_1234567890.m4a  │
└────────────────────────────────────┘
```

---

## Feature Comparison Table

```
┌─────────────────────┬──────────────┬──────────────────┐
│      Feature        │    YouTube   │    Instagram     │
├─────────────────────┼──────────────┼──────────────────┤
│ Video Download      │      ✅      │       ✅         │
│ Audio Download      │      ✅      │       ✅         │
│ Format: MP4         │      ✅      │       ✅         │
│ Format: M4A         │      ✅      │       ✅         │
│ Rate Limiting       │      ✅      │       ✅         │
│ Security Headers    │      ✅      │       ✅         │
│ Input Validation    │      ✅      │       ✅         │
│ Error Handling      │      ✅      │       ✅         │
│ Platform Logging    │      ✅      │       ✅         │
│ File Naming Prefix  │      ✅      │       ✅         │
│ URLS Supported      │     Many     │      p,reel,tv   │
│ Max Download Size   │   Unlimited  │    Unlimited     │
│ Playlist Download   │      ❌      │       ❌         │
│ Private Content     │      ❌      │       ❌         │
└─────────────────────┴──────────────┴──────────────────┘
```

---

## Testing Scenarios

### Scenario 1: YouTube Video Download
```
Step 1: Select ▶️ YouTube ✓
Step 2: Paste https://youtube.com/watch?v=ABC123 ✓
Step 3: Select 🎬 Video (MP4) ✓
Step 4: Click ⬇️ Download ✓
Step 5: Check server log for [YOUTUBE] ✓
Step 6: Find youtube_video_TIMESTAMP.mp4 in Downloads ✓
Result: ✅ SUCCESS
```

### Scenario 2: Instagram Reel Audio Download
```
Step 1: Select 📷 Instagram ✓
Step 2: Paste https://instagram.com/reel/ABC123 ✓
Step 3: Select 🎵 Audio (M4A) ✓
Step 4: Click ⬇️ Download ✓
Step 5: Check server log for [INSTAGRAM] ✓
Step 6: Find instagram_audio_TIMESTAMP.m4a in Downloads ✓
Result: ✅ SUCCESS
```

### Scenario 3: Platform Mismatch Error
```
Step 1: Select ▶️ YouTube ✓
Step 2: Paste https://instagram.com/p/ABC123 ✓
Step 3: Click ⬇️ Download ✓
Step 4: See error "Please enter a valid YouTube URL" ✓
Step 5: Select 📷 Instagram ✓
Step 6: Click ⬇️ Download (same URL) ✓
Step 7: Download succeeds ✓
Result: ✅ SUCCESS - Proper validation working
```

---

## Conclusion

The Instagram integration adds a complete second platform with:
- **Identical** security features
- **Matching** functionality
- **Platform-aware** logging and naming
- **Zero** breaking changes to YouTube

All through a **clean, minimal** code addition! 🎉
