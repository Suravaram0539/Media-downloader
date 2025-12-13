# Security Documentation

## YouTube Downloader - Security Implementation

This document outlines the security features implemented in the YouTube Downloader application to protect against various cyber attacks and vulnerabilities.

---

## 🔒 Security Features Implemented

### 1. **Input Validation & Sanitization**

#### URL Validation
- ✅ Strict YouTube URL format validation
- ✅ Whitelist-based URL checking (only YouTube URLs accepted)
- ✅ URL encoding/decoding with safety checks
- ✅ Prevention of path traversal attacks (`../`, `./`)

```javascript
// YouTube URL validation regex
/^(https?:\/\/)?(www\.)?(youtube|youtu|youtube-nocookie)\.(com|be)\/[^\s]*$/
```

#### Input Sanitization
- ✅ Removal of dangerous characters and shell metacharacters
- ✅ Detection and blocking of command injection patterns
- ✅ HTML entity encoding to prevent XSS attacks
- ✅ Trimming and validation of all user inputs

**Protected Against:**
- Command Injection
- Path Traversal
- NoSQL Injection
- XSS (Cross-Site Scripting)

---

### 2. **Rate Limiting (DDoS Prevention)**

#### Global Rate Limiter
```
- 100 requests per 15 minutes per IP
- Prevents brute force attacks
- Protects against DoS (Denial of Service) attacks
```

#### Download Rate Limiter
```
- 5 downloads per minute per IP
- Prevents rapid automated downloads
- Protects against bandwidth abuse
```

**Implemented Using:** `express-rate-limit`

---

### 3. **Security Headers (Helmet.js)**

All requests include security headers:

| Header | Purpose | Value |
|--------|---------|-------|
| `Strict-Transport-Security` | Force HTTPS | max-age=31536000 |
| `Content-Security-Policy` | Prevent XSS & Clickjacking | default-src 'self' |
| `X-Frame-Options` | Prevent clickjacking | DENY |
| `X-Content-Type-Options` | Prevent MIME sniffing | nosniff |
| `X-XSS-Protection` | Enable browser XSS filter | 1; mode=block |
| `Referrer-Policy` | Control referrer info | strict-origin-when-cross-origin |

**Implemented Using:** `helmet`

---

### 4. **CORS (Cross-Origin Resource Sharing)**

```javascript
CORS Configuration:
- Origin: http://localhost:3000, 127.0.0.1
- Credentials: Required
- Only allows same-origin requests in development
```

**Protected Against:**
- Cross-Site Request Forgery (CSRF)
- Unauthorized cross-origin access

---

### 5. **Payload Size Limiting**

```javascript
- JSON payload: Limited to 10MB
- URL encoded payload: Limited to 10MB
- Prevents buffer overflow attacks
```

---

### 6. **Process Isolation & Timeouts**

Each download process includes:
- **Socket Timeout:** 30 seconds (prevents hanging connections)
- **Process Timeout:** 60 seconds (prevents resource exhaustion)
- **Single File Limit:** Maximum 1 file per request
- **No Playlist Downloads:** Prevents bulk operations

```javascript
args = ['-m', 'yt_dlp', 
        '--socket-timeout', '30',
        '--max-downloads', '1',
        '--no-playlist',
        // ... other args
]
```

---

### 7. **Data Sanitization (NoSQL Protection)**

Using `express-mongo-sanitize`:
- Removes `$` and `.` from user inputs
- Prevents NoSQL injection attacks
- Sanitizes all request data automatically

---

### 8. **Client-Side Security**

#### Content Security Policy (CSP)
```html
<meta http-equiv="Content-Security-Policy" 
      content="default-src 'self'; 
               script-src 'self'; 
               style-src 'self' 'unsafe-inline'; 
               img-src 'self' data:; 
               font-src 'self'; 
               connect-src 'self' http://localhost:*">
```

#### XSS Prevention
- HTML sanitization for all output
- Text content only (no innerHTML)
- DOM-based sanitization functions

```javascript
function sanitizeHtml(str) {
    const div = document.createElement('div');
    div.textContent = str;  // Prevents script execution
    return div.innerHTML;
}
```

#### Security Meta Tags
```html
<!-- Prevent clickjacking -->
<meta http-equiv="X-Frame-Options" content="DENY">

<!-- Prevent MIME type sniffing -->
<meta http-equiv="X-Content-Type-Options" content="nosniff">

<!-- Enable XSS protection -->
<meta http-equiv="X-XSS-Protection" content="1; mode=block">

<!-- Control referrer information -->
<meta name="referrer" content="strict-origin-when-cross-origin">
```

---

### 9. **Error Handling & Information Disclosure**

- ✅ No sensitive error details in responses
- ✅ Generic error messages in production
- ✅ Detailed logging on server (not exposed to client)
- ✅ Unique timestamp on all error responses

```javascript
// Production error response
{
  "error": "An error occurred processing your request",
  "timestamp": "2025-12-13T16:00:00.000Z"
}
```

---

### 10. **Command Injection Prevention**

Multiple layers of protection:

1. **URL Validation** - Only YouTube URLs accepted
2. **Character Blacklist** - Shell metacharacters blocked
3. **Pattern Detection** - Suspicious patterns rejected
4. **Argument Sanitization** - Arguments passed safely to spawn()
5. **Process Isolation** - Child process runs with restricted permissions

**Blocked Patterns:**
```javascript
[;&|`$(){}[\]<>]     // Shell metacharacters
\.\.\/                // Path traversal
eval\(/i              // eval function
exec\(/i              // exec function
process\./i           // Node.js process access
```

---

## 🛡️ Protected Against These Attacks

| Attack Type | Defense |
|------------|---------|
| **Command Injection** | Input validation, argument sanitization |
| **SQL/NoSQL Injection** | Input sanitization, parameterized queries |
| **XSS (Cross-Site Scripting)** | HTML encoding, CSP headers, DOM sanitization |
| **CSRF (Cross-Site Request Forgery)** | CORS restrictions, same-origin policy |
| **DDoS (Denial of Service)** | Rate limiting, timeout controls |
| **Path Traversal** | URL validation, path restrictions |
| **Clickjacking** | X-Frame-Options header |
| **MIME Sniffing** | X-Content-Type-Options header |
| **Man-in-the-Middle (MITM)** | HSTS header (when HTTPS enabled) |
| **Information Disclosure** | Generic error messages |

---

## 📊 Security Checklist

- [x] Input validation on all user inputs
- [x] Output encoding to prevent XSS
- [x] Rate limiting to prevent DDoS
- [x] CORS properly configured
- [x] Security headers enabled (Helmet.js)
- [x] Error handling without information disclosure
- [x] Process timeouts to prevent hangs
- [x] Payload size limits
- [x] Command injection prevention
- [x] NoSQL sanitization
- [x] Client-side security headers
- [x] Content Security Policy implemented
- [x] Logging for security events
- [x] Process isolation

---

## 🔐 Best Practices Followed

1. **Principle of Least Privilege**
   - Processes run with minimal required permissions
   - Only necessary arguments passed to child processes

2. **Defense in Depth**
   - Multiple layers of security checks
   - Validation on both client and server

3. **Security by Default**
   - Secure defaults configured
   - Opt-out rather than opt-in for security

4. **Fail Securely**
   - Errors default to secure state
   - No information leakage on failure

5. **Regular Security Updates**
   - All dependencies pinned to secure versions
   - Regular updates recommended

---

## 🚀 Deployment Security Recommendations

### For Production:

1. **Enable HTTPS/TLS**
   ```javascript
   // Use helmet with HSTS
   app.use(helmet({
     hsts: {
       maxAge: 31536000,
       includeSubDomains: true,
       preload: true
     }
   }));
   ```

2. **Environment Variables**
   - Use `.env` file (never commit to git)
   - Set `NODE_ENV=production`
   - Use different rate limits

3. **CORS Configuration**
   ```javascript
   CORS: {
     origin: process.env.ALLOWED_ORIGINS,
     credentials: true
   }
   ```

4. **Logging & Monitoring**
   - Implement request logging
   - Monitor rate limit violations
   - Alert on suspicious patterns

5. **Regular Updates**
   ```bash
   npm audit
   npm update
   ```

6. **Security Headers**
   - Add Content-Security-Policy header
   - Add Strict-Transport-Security
   - Configure X-Frame-Options

---

## 📝 Logs & Monitoring

The application logs:
- All download requests
- Failed validations
- Process timeouts
- Error events
- Security warnings

Example log:
```
[2025-12-13T16:00:00] Download request from 127.0.0.1
[2025-12-13T16:00:01] Validation passed: https://youtube.com/watch?v=...
[2025-12-13T16:00:02] Download completed successfully
```

---

## 🔄 Security Update Policy

- Regular dependency updates: Monthly
- Critical patches: Immediate
- Security audit: Quarterly
- Penetration testing: Recommended annually

---

## 📞 Security Contact

For security issues, please report privately to the development team.

**Do not** publicly disclose security vulnerabilities.

---

## License

This security documentation is part of the YouTube Downloader application and is licensed under the ISC License.

---

**Last Updated:** December 13, 2025
**Version:** 1.0 Security Enhanced
