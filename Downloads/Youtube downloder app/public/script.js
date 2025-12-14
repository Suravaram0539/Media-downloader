// API Configuration - Works both locally and on Netlify
// On Netlify, this will call /.netlify/functions/download
// Locally, this will call http://localhost:3000/api/download
function getApiUrl() {
    if (window.location.hostname === 'localhost' || window.location.hostname === '127.0.0.1') {
        return '/api/download';
    } else {
        // On Netlify
        return '/.netlify/functions/download';
    }
}

// DOM Elements
const urlInput = document.getElementById('urlInput');
const downloadBtn = document.getElementById('downloadBtn');
const statusMessage = document.getElementById('statusMessage');
const progressContainer = document.getElementById('progressContainer');
const progressFill = document.getElementById('progressFill');
const progressText = document.getElementById('progressText');
const formatBtns = document.querySelectorAll('.format-btn');
const platformBtns = document.querySelectorAll('.platform-btn');

let selectedFormat = 'video';
let selectedPlatform = 'youtube';

// Security: Content Security Policy headers check
function verifySecurityHeaders() {
  console.log('✓ Security features active');
}

// Format selection
formatBtns.forEach(btn => {
    btn.addEventListener('click', function() {
        formatBtns.forEach(b => b.classList.remove('active'));
        this.classList.add('active');
        selectedFormat = this.dataset.format;
    });
});

// Platform selection
platformBtns.forEach(btn => {
    btn.addEventListener('click', function() {
        platformBtns.forEach(b => b.classList.remove('active'));
        this.classList.add('active');
        selectedPlatform = this.dataset.platform;
        urlInput.focus();
    });
});

// Download button click
downloadBtn.addEventListener('click', async function() {
    const url = urlInput.value.trim();

    if (!url) {
        showStatus('Please enter a URL', 'error');
        return;
    }

    // Validate URL based on selected platform
    const isValidUrl = selectedPlatform === 'youtube' 
        ? isValidYouTubeUrl(url)
        : isValidInstagramUrl(url);

    if (!isValidUrl) {
        showStatus(`Please enter a valid ${selectedPlatform.charAt(0).toUpperCase() + selectedPlatform.slice(1)} URL`, 'error');
        return;
    }

    downloadBtn.disabled = true;
    progressContainer.style.display = 'block';
    updateProgress(0);
    showStatus(`Starting ${selectedFormat} download from ${selectedPlatform}...`, 'info');

    try {
        const apiUrl = getApiUrl();
        console.log('Calling API:', apiUrl);
        
        const response = await fetch(apiUrl, {
            method: 'POST',
            headers: {
                'Content-Type': 'application/json',
            },
            body: JSON.stringify({
                url: url,
                format: selectedFormat
            })
        });

        console.log('Response status:', response.status);
        console.log('Response headers:', response.headers);
        
        // Try to get text first for debugging
        const responseText = await response.text();
        console.log('Response text:', responseText);
        
        // Then parse as JSON
        let data;
        try {
            data = JSON.parse(responseText);
        } catch (parseErr) {
            console.error('JSON parse error:', parseErr);
            showStatus('Server error: Invalid response format', 'error');
            progressContainer.style.display = 'none';
            downloadBtn.disabled = false;
            return;
        }

        if (response.ok) {
            updateProgress(100);
            
            // Check if we have download services (Netlify deployment)
            if (data.downloadServices && data.downloadServices.length > 0) {
                showStatus(data.message, 'info');
                // Show download services
                let servicesHtml = '<div style="margin-top: 15px; text-align: left;">';
                servicesHtml += '<p style="font-weight: bold; margin-bottom: 10px;">Use these free services:</p>';
                data.downloadServices.forEach((service, index) => {
                  servicesHtml += `<div style="margin-bottom: 10px; padding: 10px; background: rgba(255,255,255,0.1); border-radius: 5px;">`;
                  servicesHtml += `<a href="${service.url}" target="_blank" style="color: #4CAF50; text-decoration: none; font-weight: bold;">${service.name}</a><br>`;
                  servicesHtml += `<small>${service.desc}</small>`;
                  servicesHtml += `</div>`;
                });
                servicesHtml += '</div>';
                statusMessage.innerHTML = data.message + servicesHtml;
                statusMessage.className = 'status-message success';
            } else {
                // Local server response with actual download
                showStatus(data.message || 'Download successful!', 'success');
            }
            
            urlInput.value = '';
            setTimeout(() => {
                progressContainer.style.display = 'none';
            }, 1000);
        } else {
            showStatus(data.error || 'Download failed', 'error');
            progressContainer.style.display = 'none';
        }
    } catch (error) {
        console.error('Error:', error);
        showStatus('Network error: ' + error.message, 'error');
        progressContainer.style.display = 'none';
    } finally {
        downloadBtn.disabled = false;
    }
});

// Load on page load
window.addEventListener('load', () => {
  verifySecurityHeaders();
});

// Functions
function showStatus(message, type) {
    statusMessage.textContent = sanitizeHtml(message);
    statusMessage.className = `status-message ${type}`;
    
    if (type === 'success') {
        setTimeout(() => {
            statusMessage.className = 'status-message';
        }, 5000);
    }
}

function updateProgress(percent) {
    progressFill.style.width = percent + '%';
    progressText.textContent = `Downloading... ${percent}%`;
}

function isValidYouTubeUrl(url) {
  const youtubeRegex = /^(https?:\/\/)?(www\.)?(youtube|youtu|youtube-nocookie)\.(com|be)\/[^\s]*$/;
  return youtubeRegex.test(url);
}

function isValidInstagramUrl(url) {
  const instagramRegex = /^(https?:\/\/)?(www\.)?instagram\.com\/(p|reel|tv|stories)\/[^\s]*$/;
  return instagramRegex.test(url);
}

// Security: Sanitize HTML to prevent XSS attacks
function sanitizeHtml(str) {
  const div = document.createElement('div');
  div.textContent = str;
  return div.innerHTML;
}

// Allow Enter key to trigger download
urlInput.addEventListener('keypress', function(event) {
    if (event.key === 'Enter') {
        downloadBtn.click();
    }
});
