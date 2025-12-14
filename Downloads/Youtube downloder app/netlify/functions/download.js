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

// Main handler - This is the ONLY handler that should be exported
exports.handler = async (event, context) => {
  // CORS headers - MUST be in every response
  const corsHeaders = {
    'Access-Control-Allow-Origin': '*',
    'Access-Control-Allow-Methods': 'POST, OPTIONS, GET',
    'Access-Control-Allow-Headers': 'Content-Type',
    'Content-Type': 'application/json'
  };

  try {
    // Log for debugging
    console.log('[NETLIFY FUNCTION] Handler called:', {
      method: event.httpMethod,
      path: event.path,
      body: event.body ? 'present' : 'empty'
    });

    // Handle OPTIONS preflight
    if (event.httpMethod === 'OPTIONS') {
      console.log('[NETLIFY FUNCTION] Handling OPTIONS preflight');
      return {
        statusCode: 200,
        headers: corsHeaders,
        body: JSON.stringify({ ok: true })
      };
    }

    // Only POST allowed
    if (event.httpMethod !== 'POST') {
      console.log('[NETLIFY FUNCTION] Invalid method:', event.httpMethod);
      return {
        statusCode: 405,
        headers: corsHeaders,
        body: JSON.stringify({ error: 'Method not allowed. Use POST.' })
      };
    }

    // Parse body - handle both string and object
    let body = event.body;
    if (!body) {
      console.log('[NETLIFY FUNCTION] Empty body');
      return {
        statusCode: 400,
        headers: corsHeaders,
        body: JSON.stringify({ error: 'Request body is empty' })
      };
    }

    if (typeof body === 'string') {
      try {
        body = JSON.parse(body);
      } catch (e) {
        console.error('[NETLIFY FUNCTION] JSON parse error:', e);
        return {
          statusCode: 400,
          headers: corsHeaders,
          body: JSON.stringify({ error: 'Invalid JSON in request body' })
        };
      }
    }

    const { url, format } = body;
    console.log('[NETLIFY FUNCTION] Received:', { url: url ? 'present' : 'missing', format });

    // Validate inputs
    if (!url || !format) {
      console.log('[NETLIFY FUNCTION] Missing url or format');
      return {
        statusCode: 400,
        headers: corsHeaders,
        body: JSON.stringify({ error: 'Missing url or format' })
      };
    }

    if (!['video', 'audio'].includes(format)) {
      console.log('[NETLIFY FUNCTION] Invalid format:', format);
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

    console.log('[NETLIFY FUNCTION] URL validation:', { isYT, isIG });

    if (!isYT && !isIG) {
      console.log('[NETLIFY FUNCTION] Invalid YouTube or Instagram URL');
      return {
        statusCode: 400,
        headers: corsHeaders,
        body: JSON.stringify({ error: 'Invalid YouTube or Instagram URL' })
      };
    }

    if (containsSuspiciousPatterns(trimmedUrl)) {
      console.log('[NETLIFY FUNCTION] Suspicious patterns detected');
      return {
        statusCode: 400,
        headers: corsHeaders,
        body: JSON.stringify({ error: 'Invalid URL pattern detected' })
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

    const responseData = {
      success: true,
      message: `Use one of these free services to download:`,
      platform: platform,
      format: format,
      downloadServices: services
    };

    // CRITICAL: Ensure body is always a string
    const responseBody = JSON.stringify(responseData);
    console.log('[NETLIFY FUNCTION] Returning success response');

    return {
      statusCode: 200,
      headers: corsHeaders,
      body: responseBody
    };

  } catch (err) {
    console.error('[NETLIFY FUNCTION] Caught error:', err);
    
    // CRITICAL: Always return valid JSON even on error
    const errorResponse = {
      error: 'Internal server error',
      message: err.message || 'Unknown error'
    };

    return {
      statusCode: 500,
      headers: corsHeaders,
      body: JSON.stringify(errorResponse)
    };
  }
};
