const { spawn } = require('child_process');
const os = require('os');
const path = require('path');
const fs = require('fs');
const validator = require('validator');

// Download directory
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
  // Handle preflight requests
  if (event.httpMethod === 'OPTIONS') {
    return {
      statusCode: 200,
      headers: {
        'Access-Control-Allow-Origin': '*',
        'Access-Control-Allow-Methods': 'POST, OPTIONS',
        'Access-Control-Allow-Headers': 'Content-Type'
      }
    };
  }

  // Only allow POST requests
  if (event.httpMethod !== 'POST') {
    return {
      statusCode: 405,
      headers: {
        'Access-Control-Allow-Origin': '*',
        'Content-Type': 'application/json'
      },
      body: JSON.stringify({ error: 'Method not allowed' })
    };
  }

  try {
    const { url, format } = JSON.parse(event.body);

    // Input validation
    if (!url || typeof url !== 'string') {
      return {
        statusCode: 400,
        headers: {
          'Access-Control-Allow-Origin': '*',
          'Content-Type': 'application/json'
        },
        body: JSON.stringify({ error: 'Invalid URL provided' })
      };
    }

    const trimmedUrl = url.trim();

    // Check for suspicious patterns
    if (containsSuspiciousPatterns(trimmedUrl)) {
      return {
        statusCode: 400,
        headers: {
          'Access-Control-Allow-Origin': '*',
          'Content-Type': 'application/json'
        },
        body: JSON.stringify({ error: 'Suspicious URL detected' })
      };
    }

    // Validate format
    if (!format || !['video', 'audio'].includes(format)) {
      return {
        statusCode: 400,
        headers: {
          'Access-Control-Allow-Origin': '*',
          'Content-Type': 'application/json'
        },
        body: JSON.stringify({ error: 'Invalid format. Choose video or audio.' })
      };
    }

    // Determine platform
    const isYouTube = isValidYouTubeUrl(trimmedUrl);
    const isInstagram = isValidInstagramUrl(trimmedUrl);

    if (!isYouTube && !isInstagram) {
      return {
        statusCode: 400,
        headers: {
          'Access-Control-Allow-Origin': '*',
          'Content-Type': 'application/json'
        },
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
        headers: {
          'Access-Control-Allow-Origin': '*',
          'Content-Type': 'application/json'
        },
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
        headers: {
          'Access-Control-Allow-Origin': '*',
          'Content-Type': 'application/json'
        },
        body: JSON.stringify({ error: `Download failed: ${downloadError.message}` })
      };
    }

  } catch (error) {
    console.error('Error:', error);
    return {
      statusCode: 500,
      headers: {
        'Access-Control-Allow-Origin': '*',
        'Content-Type': 'application/json'
      },
      body: JSON.stringify({ error: `Server error: ${error.message}` })
    };
  }
};
