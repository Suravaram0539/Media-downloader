// Helper functions
function isValidYouTubeUrl(url) {
  const youtubeRegex = /^(https?:\/\/)?(www\.)?(youtube|youtu|youtube-nocookie)\.(com|be)\/[^\s]*$/;
  return youtubeRegex.test(url);
}

function isValidInstagramUrl(url) {
  const instagramRegex = /^(https?:\/\/)?(www\.)?instagram\.com\/(p|reel|tv|stories)\/[^\s]*$/;
  return instagramRegex.test(url);
}

function containsSuspiciousPatterns(url) {
  const suspiciousPatterns = [
    /[;&|`$(){}[\]<>]/,
    /\.\.\//,
    /eval\(/i,
    /exec\(/i,
    /process\./i,
  ];
  return suspiciousPatterns.some(pattern => pattern.test(url));
}

// Main handler
exports.handler = async (event, context) => {
  // CORS headers - MUST be in every response
  const corsHeaders = {
    'Access-Control-Allow-Origin': '*',
    'Access-Control-Allow-Methods': 'POST, OPTIONS, GET',
    'Access-Control-Allow-Headers': 'Content-Type',
    'Content-Type': 'application/json'
  };

  try {
    // Handle OPTIONS preflight
    if (event.httpMethod === 'OPTIONS') {
      return {
        statusCode: 200,
        headers: corsHeaders,
        body: JSON.stringify({ ok: true })
      };
    }

    // Only POST allowed
    if (event.httpMethod !== 'POST') {
      return {
        statusCode: 405,
        headers: corsHeaders,
        body: JSON.stringify({ error: 'Method not allowed' })
      };
    }

    // Parse body
    let body = event.body;
    if (typeof body === 'string') {
      body = JSON.parse(body);
    }

    const { url, format } = body;

    // Validate inputs
    if (!url || !format) {
      return {
        statusCode: 400,
        headers: corsHeaders,
        body: JSON.stringify({ error: 'Missing url or format' })
      };
    }

    if (!['video', 'audio'].includes(format)) {
      return {
        statusCode: 400,
        headers: corsHeaders,
        body: JSON.stringify({ error: 'Format must be video or audio' })
      };
    }

    const trimmedUrl = String(url).trim();

    // Validate URL
    const isYT = isValidYouTubeUrl(trimmedUrl);
    const isIG = isValidInstagramUrl(trimmedUrl);

    if (!isYT && !isIG) {
      return {
        statusCode: 400,
        headers: corsHeaders,
        body: JSON.stringify({ error: 'Invalid YouTube or Instagram URL' })
      };
    }

    if (containsSuspiciousPatterns(trimmedUrl)) {
      return {
        statusCode: 400,
        headers: corsHeaders,
        body: JSON.stringify({ error: 'Invalid URL pattern' })
      };
    }

    const platform = isYT ? 'youtube' : 'instagram';

    // Return success with download services
    const services = isYT ? [
      { name: 'Y2Mate', url: 'https://www.y2mate.com/en/youtube-downloader', desc: 'Free YouTube downloader' },
      { name: 'SS YouTube DL', url: 'https://www.ssyoutube.com/', desc: 'Fast downloads' },
      { name: 'Loader.to', url: 'https://loader.to/', desc: 'Reliable downloader' }
    ] : [
      { name: 'SaveInsta', url: 'https://saveinsta.io/', desc: 'Free Instagram downloader' },
      { name: 'Insta Downloader', url: 'https://instadownloader.io/', desc: 'Posts and reels' }
    ];

    return {
      statusCode: 200,
      headers: corsHeaders,
      body: JSON.stringify({
        success: true,
        message: `Use one of these free services to download:`,
        platform: platform,
        format: format,
        url: trimmedUrl,
        downloadServices: services
      })
    };

  } catch (err) {
    return {
      statusCode: 500,
      headers: corsHeaders,
      body: JSON.stringify({ error: err.message || 'Server error' })
    };
  }
};


// Download directory - Note: Netlify Functions have limited file system access
// This function will generate download commands instead of actual downloads
const downloadsDir = path.join(os.homedir(), 'Downloads');

// Helper functions (from server.js)
function isValidYouTubeUrl(url) {
  const youtubeRegex = /^(https?:\/\/)?(www\.)?(youtube|youtu|youtube-nocookie)\.(com|be)\/[^\s]*$/;
  return youtubeRegex.test(url);
}

function isValidInstagramUrl(url) {
  const instagramRegex = /^(https?:\/\/)?(www\.)?instagram\.com\/(p|reel|tv|stories)\/[^\s]*$/;
  return instagramRegex.test(url);
}

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

function downloadMedia(url, format, outputPath, platform) {
  return new Promise((resolve, reject) => {
    const outputTemplate = `${outputPath}.%(ext)s`;
    
    let args = ['-m', 'yt_dlp'];
    
    if (format === 'audio') {
      args.push('-x', '--audio-format', 'm4a', '--audio-quality', '192');
    } else {
      args.push('-f', 'best[ext=mp4]/best[vcodec=h264]/best');
    }
    
    args.push('-o', outputTemplate, url);

    const pythonProcess = spawn('python', args, {
      stdio: ['pipe', 'pipe', 'pipe'],
      timeout: 180000 // 3 minutes timeout
    });

    let output = '';
    let errorOutput = '';

    pythonProcess.stdout.on('data', (data) => {
      output += data.toString();
      console.log(`[${platform.toUpperCase()}] Output: ${data.toString()}`);
    });

    pythonProcess.stderr.on('data', (data) => {
      errorOutput += data.toString();
      console.log(`[${platform.toUpperCase()}] Error: ${data.toString()}`);
    });

    pythonProcess.on('close', (code) => {
      if (code === 0) {
        // Find the downloaded file
        const fileName = path.basename(outputPath);
        const parentDir = path.dirname(outputPath);
        
        try {
          const files = fs.readdirSync(parentDir);
          const downloadedFile = files.find(file => file.startsWith(fileName));
          
          if (downloadedFile) {
            resolve({
              success: true,
              fileName: downloadedFile,
              filePath: path.join(parentDir, downloadedFile)
            });
          } else {
            reject(new Error('File not found after download'));
          }
        } catch (err) {
          reject(new Error('Failed to verify downloaded file'));
        }
      } else {
        reject(new Error(`Download failed with code ${code}: ${errorOutput}`));
      }
    });

    pythonProcess.on('error', (error) => {
      reject(new Error(`Process error: ${error.message}`));
    });
  });
}

// Main handler
exports.handler = async (event, context) => {
  // CORS headers for all responses
  const corsHeaders = {
    'Access-Control-Allow-Origin': '*',
    'Access-Control-Allow-Methods': 'POST, OPTIONS, GET',
    'Access-Control-Allow-Headers': 'Content-Type',
    'Content-Type': 'application/json'
  };

  // Handle preflight requests
  if (event.httpMethod === 'OPTIONS') {
    return {
      statusCode: 200,
      headers: corsHeaders,
      body: JSON.stringify({ status: 'ok' })
    };
  }

  // Only allow POST requests
  if (event.httpMethod !== 'POST') {
    return {
      statusCode: 405,
      headers: corsHeaders,
      body: JSON.stringify({ error: 'Method not allowed. Use POST.' })
    };
  }

  try {
    // Parse request body
    let url, format;
    
    if (!event.body) {
      return {
        statusCode: 400,
        headers: corsHeaders,
        body: JSON.stringify({ error: 'Request body is empty' })
      };
    }

    const parsedBody = JSON.parse(event.body);
    url = parsedBody.url;
    format = parsedBody.format;

    // Input validation
    if (!url || typeof url !== 'string') {
      return {
        statusCode: 400,
        headers: corsHeaders,
        body: JSON.stringify({ error: 'Invalid URL provided' })
      };
    }

    const trimmedUrl = url.trim();

    // Check for suspicious patterns
    if (containsSuspiciousPatterns(trimmedUrl)) {
      return {
        statusCode: 400,
        headers: corsHeaders,
        body: JSON.stringify({ error: 'Suspicious URL detected' })
      };
    }

    // Validate format
    if (!format || !['video', 'audio'].includes(format)) {
      return {
        statusCode: 400,
        headers: corsHeaders,
        body: JSON.stringify({ error: 'Invalid format. Choose video or audio.' })
      };
    }

    // Determine platform
    const isYouTube = isValidYouTubeUrl(trimmedUrl);
    const isInstagram = isValidInstagramUrl(trimmedUrl);

    if (!isYouTube && !isInstagram) {
      return {
        statusCode: 400,
        headers: corsHeaders,
        body: JSON.stringify({ error: 'Please provide a valid YouTube or Instagram URL' })
      };
    }

    const platform = isYouTube ? 'youtube' : 'instagram';

    // Generate filename with timestamp
    const timestamp = Date.now();
    const filename = format === 'audio' 
      ? `${platform}_audio_${timestamp}`
      : `${platform}_video_${timestamp}`;
    
    const outputPath = path.join(downloadsDir, filename);

    // Download media
    try {
      const result = await downloadMedia(trimmedUrl, format, outputPath, platform);
      
      return {
        statusCode: 200,
        headers: corsHeaders,
        body: JSON.stringify({
          success: true,
          message: `${format.charAt(0).toUpperCase() + format.slice(1)} downloaded successfully: ${result.fileName}`,
          fileName: result.fileName
        })
      };
    } catch (downloadError) {
      console.error('Download error:', downloadError);
      return {
        statusCode: 500,
        headers: corsHeaders,
        body: JSON.stringify({ error: `Download failed: ${downloadError.message}` })
      };
    }

  } catch (error) {
    console.error('Error:', error);
    return {
      statusCode: 500,
      headers: corsHeaders,
      body: JSON.stringify({ error: `Server error: ${error.message}` })
    };
  }
};
