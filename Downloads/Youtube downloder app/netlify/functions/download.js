const validator = require('validator');

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
    /[;&|`$(){}[\]<>]/,  // Shell metacharacters
    /\.\.\//,             // Path traversal
    /eval\(/i,            // eval function
    /exec\(/i,            // exec function
    /process\./i,         // Node.js process
  ];
  
  return suspiciousPatterns.some(pattern => pattern.test(url));
}

// CORS headers for all responses
const corsHeaders = {
  'Access-Control-Allow-Origin': '*',
  'Access-Control-Allow-Methods': 'POST, OPTIONS, GET',
  'Access-Control-Allow-Headers': 'Content-Type',
  'Content-Type': 'application/json'
};

// Main handler
exports.handler = async (event, context) => {
  console.log('Download function called', {
    method: event.httpMethod,
    path: event.path,
    body: event.body
  });

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
    console.log('Invalid method:', event.httpMethod);
    return {
      statusCode: 405,
      headers: corsHeaders,
      body: JSON.stringify({ error: 'Method not allowed. Use POST.' })
    };
  }

  try {
    // Parse request body
    let url, format;
    
    console.log('Event body:', event.body);
    
    if (!event.body) {
      console.log('No body provided');
      return {
        statusCode: 400,
        headers: corsHeaders,
        body: JSON.stringify({ error: 'Request body is empty' })
      };
    }

    try {
      const parsedBody = typeof event.body === 'string' 
        ? JSON.parse(event.body)
        : event.body;
      url = parsedBody.url;
      format = parsedBody.format;
    } catch (parseErr) {
      console.log('JSON parse error:', parseErr.message);
      return {
        statusCode: 400,
        headers: corsHeaders,
        body: JSON.stringify({ error: 'Invalid JSON in request body' })
      };
    }

    // Input validation
    if (!url || typeof url !== 'string') {
      console.log('Invalid URL:', url);
      return {
        statusCode: 400,
        headers: corsHeaders,
        body: JSON.stringify({ error: 'Invalid URL provided' })
      };
    }

    const trimmedUrl = url.trim();

    // Check for suspicious patterns
    if (containsSuspiciousPatterns(trimmedUrl)) {
      console.log('Suspicious patterns detected in URL');
      return {
        statusCode: 400,
        headers: corsHeaders,
        body: JSON.stringify({ error: 'Suspicious URL detected' })
      };
    }

    // Validate format
    if (!format || !['video', 'audio'].includes(format)) {
      console.log('Invalid format:', format);
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
      console.log('Invalid platform URL');
      return {
        statusCode: 400,
        headers: corsHeaders,
        body: JSON.stringify({ error: 'Please provide a valid YouTube or Instagram URL' })
      };
    }

    const platform = isYouTube ? 'youtube' : 'instagram';

    console.log(`Processing ${platform} ${format} download from URL: ${trimmedUrl}`);

    // For Netlify: Return download options using external services
    // Users can download using these services
    let downloadLinks = [];
    
    if (isYouTube) {
      downloadLinks = [
        {
          service: 'Y2Mate',
          url: `https://www.y2mate.com/en/youtube-downloader`,
          note: 'Free YouTube downloader - paste your URL there'
        },
        {
          service: 'SS YouTube DL',
          url: `https://www.ssyoutube.com/`,
          note: 'Another free YouTube downloader'
        },
        {
          service: 'Loader.to',
          url: `https://loader.to/`,
          note: 'Fast and reliable downloader'
        }
      ];
    } else if (isInstagram) {
      downloadLinks = [
        {
          service: 'SaveInsta',
          url: `https://saveinsta.io/`,
          note: 'Free Instagram downloader'
        },
        {
          service: 'Insta Downloader',
          url: `https://instadownloader.io/`,
          note: 'Download Instagram posts and reels'
        }
      ];
    }

    // Return success response with download options
    return {
      statusCode: 200,
      headers: corsHeaders,
      body: JSON.stringify({
        success: true,
        message: `To download this ${format} from ${platform}, use one of these services:`,
        platform: platform,
        format: format,
        url: trimmedUrl,
        downloadServices: downloadLinks,
        instructions: `Copy your ${platform} link and paste it into one of the services above. Downloads will start automatically.`
      })
    };

  } catch (error) {
    console.error('Error:', error);
    return {
      statusCode: 500,
      headers: corsHeaders,
      body: JSON.stringify({ error: `Server error: ${error.message}` })
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
