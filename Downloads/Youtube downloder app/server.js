const express = require('express');
const path = require('path');
const cors = require('cors');
const { spawn } = require('child_process');
const fs = require('fs');
const os = require('os');
const helmet = require('helmet');
const rateLimit = require('express-rate-limit');
const mongoSanitize = require('express-mongo-sanitize');
const validator = require('validator');

const app = express();
const PORT = process.env.PORT || 3000;

// Security Middleware
app.use(helmet()); // Set security HTTP headers
app.use(mongoSanitize()); // Data sanitization against NoSQL injection

// Rate limiting - prevent brute force attacks
const limiter = rateLimit({
  windowMs: 15 * 60 * 1000, // 15 minutes
  max: 100, // limit each IP to 100 requests per windowMs
  message: 'Too many requests from this IP, please try again later.',
  standardHeaders: true,
  legacyHeaders: false,
});

const downloadLimiter = rateLimit({
  windowMs: 1 * 60 * 1000, // 1 minute
  max: 5, // limit to 5 downloads per minute
  message: 'Too many download requests. Please wait before downloading again.',
  standardHeaders: true,
  legacyHeaders: false,
  skip: (req, res) => {
    // Don't count GET requests in the limit
    return req.method === 'GET';
  }
});

app.use(limiter); // Apply rate limiter to all requests
app.use(express.json({ limit: '10mb' })); // Limit JSON payload size
app.use(express.urlencoded({ limit: '10mb', extended: true }));
app.use(cors({
  origin: ['http://localhost:3000', 'http://localhost:*', '127.0.0.1'],
  credentials: true,
  optionsSuccessStatus: 200
}));
app.use(express.static('public'));

// Create downloads directory if it doesn't exist
const downloadsDir = path.join(os.homedir(), 'Downloads');
if (!fs.existsSync(downloadsDir)) {
  fs.mkdirSync(downloadsDir, { recursive: true });
}

// Helper function to validate YouTube and Instagram URLs
function isValidYouTubeUrl(url) {
  const youtubeRegex = /^(https?:\/\/)?(www\.)?(youtube|youtu|youtube-nocookie)\.(com|be)\/[^\s]*$/;
  return youtubeRegex.test(url);
}

// Helper function to validate Instagram URLs
function isValidInstagramUrl(url) {
  const instagramRegex = /^(https?:\/\/)?(www\.)?instagram\.com\/(p|reel|tv|stories)\/[^\s]*$/;
  return instagramRegex.test(url);
}

// Helper function to detect suspicious patterns (command injection prevention)
function containsSuspiciousPatterns(url) {
  const suspiciousPatterns = [
    /[;&|`$(){}[\]<>]/,  // Shell metacharacters
    /\.\.\//,             // Path traversal
    /eval\(/i,            // eval function
    /exec\(/i,            // exec function
    /process\./i,         // Node.js process
  ];
  
  return suspiciousPatterns.some(pattern => pattern.test(url));
}

// Helper function to download using yt-dlp with security measures
function downloadMedia(url, format, outputPath, platform) {
  return new Promise((resolve, reject) => {
    // Build the output template for yt-dlp
    // yt-dlp will automatically add the correct extension
    const outputTemplate = `${outputPath}.%(ext)s`;
    
    let args = [];

    if (format === 'audio') {
      // Download audio in best available format (m4a preferred, no conversion needed)
      args = [
        '-m', 'yt_dlp',
        '-f', 'bestaudio[ext=m4a]/bestaudio',
        '--no-warnings',
        '--socket-timeout', '30',
        '--max-downloads', '1',
        '--no-playlist',
        '-o', outputTemplate,
        url
      ];
    } else {
      // Download best video quality
      args = [
        '-m', 'yt_dlp',
        '-f', 'best[ext=mp4]/best[vcodec=h264]/best',
        '--no-warnings',
        '--socket-timeout', '30',  // Timeout after 30 seconds
        '--max-downloads', '1',     // Only download 1 file
        '--no-playlist',            // Prevent playlist downloads
        '-o', outputTemplate,
        url
      ];
    }

    const ytdlp = spawn('python', args, {
      stdio: ['pipe', 'pipe', 'pipe'],
      timeout: 180000  // 180 second timeout for download
    });

    let output = '';
    let error = '';
    let timedOut = false;

    const timeoutHandle = setTimeout(() => {
      timedOut = true;
      ytdlp.kill('SIGTERM');
    }, 180000);

    ytdlp.stdout.on('data', (data) => {
      output += data.toString();
      console.log(`[${platform.toUpperCase()}] Output: ${data}`);
    });

    ytdlp.stderr.on('data', (data) => {
      error += data.toString();
      console.log(`[${platform.toUpperCase()}] Error: ${data}`);
    });

    ytdlp.on('close', (code) => {
      clearTimeout(timeoutHandle);
      
      if (timedOut) {
        reject(new Error('Download timeout: The media took too long to download. Please try again.'));
      } else if (code === 0 || code === 101) {
        // Code 101 is yt-dlp's way of saying max downloads reached (expected)
        resolve({ success: true, message: 'Download completed successfully' });
      } else {
        reject(new Error(`yt-dlp process exited with code ${code}: ${error}`));
      }
    });

    ytdlp.on('error', (err) => {
      clearTimeout(timeoutHandle);
      reject(new Error(`Failed to start yt-dlp: ${err.message}`));
    });
  });
}

// Routes
app.get('/', (req, res) => {
  res.sendFile(path.join(__dirname, 'public', 'index.html'));
});

app.post('/api/download', downloadLimiter, async (req, res) => {
  const { url, format } = req.body;

  // Input validation
  if (!url) {
    return res.status(400).json({ error: 'URL is required' });
  }

  if (!format || !['video', 'audio'].includes(format)) {
    return res.status(400).json({ error: 'Format must be "video" or "audio"' });
  }

  // Sanitize URL to prevent injection attacks
  const sanitizedUrl = validator.trim(url);
  
  // Validate YouTube or Instagram URL format
  const isYouTube = isValidYouTubeUrl(sanitizedUrl);
  const isInstagram = isValidInstagramUrl(sanitizedUrl);

  if (!isYouTube && !isInstagram) {
    return res.status(400).json({ error: 'Invalid URL. Please provide a valid YouTube or Instagram link.' });
  }

  // Prevent command injection by validating URL more strictly
  if (containsSuspiciousPatterns(sanitizedUrl)) {
    return res.status(400).json({ error: 'Invalid URL format detected' });
  }

  try {
    const timestamp = Date.now();
    const platform = isYouTube ? 'youtube' : 'instagram';
    // Don't include extension - yt-dlp will add it based on format
    const filename = format === 'audio' 
      ? `${platform}_audio_${timestamp}`
      : `${platform}_video_${timestamp}`;
    
    const outputPath = path.join(downloadsDir, filename);

    // Start download
    await downloadMedia(sanitizedUrl, format, outputPath, platform);

    res.json({
      success: true,
      message: `${format.charAt(0).toUpperCase() + format.slice(1)} from ${platform.charAt(0).toUpperCase() + platform.slice(1)} downloaded successfully!`,
      downloadPath: downloadsDir
    });
  } catch (error) {
    console.error('Download error:', error);
    res.status(500).json({ 
      error: error.message || 'Failed to download. Please check the URL and try again.'
    });
  }
});

app.get('/api/downloads', (req, res) => {
  try {
    if (!fs.existsSync(downloadsDir)) {
      return res.json({ files: [] });
    }

    const files = fs.readdirSync(downloadsDir);
    res.json({ files: files, path: downloadsDir });
  } catch (error) {
    res.status(500).json({ error: 'Failed to read downloads directory' });
  }
});

// Error handling middleware - should be last
app.use((err, req, res, next) => {
  console.error(err.stack);
  
  // Don't expose sensitive error details in production
  const statusCode = err.statusCode || 500;
  const message = process.env.NODE_ENV === 'production' 
    ? 'An error occurred processing your request' 
    : err.message;
  
  res.status(statusCode).json({ 
    error: message,
    timestamp: new Date().toISOString()
  });
});

// 404 handler
app.use((req, res) => {
  res.status(404).json({ error: 'Not found' });
});

app.listen(PORT, () => {
  console.log(`YouTube Downloader server running at http://localhost:${PORT}`);
  console.log(`Downloads will be saved to: ${downloadsDir}`);
  console.log(`Environment: ${process.env.NODE_ENV || 'development'}`);
  console.log('Security features enabled: Rate limiting, Input validation, Command injection prevention');
});
