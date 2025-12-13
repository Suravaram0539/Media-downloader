# Deploy to Netlify

Write-Host "🚀 Deploying to Netlify..." -ForegroundColor Green
Write-Host ""

# Check if netlify CLI is installed
$netlifyPath = $null
try {
    $netlifyPath = (Get-Command netlify -ErrorAction SilentlyContinue).Source
} catch {
    $netlifyPath = $null
}

if ($null -eq $netlifyPath) {
    Write-Host "Installing Netlify CLI globally..." -ForegroundColor Yellow
    npm install -g netlify-cli
}

# Login if needed
Write-Host "Checking Netlify login status..." -ForegroundColor Cyan
netlify status

# Deploy to production
Write-Host ""
Write-Host "Starting production deployment..." -ForegroundColor Cyan
netlify deploy --prod

Write-Host ""
Write-Host "✅ Deployment complete!" -ForegroundColor Green
Write-Host "Your app is now live on Netlify!" -ForegroundColor Green
