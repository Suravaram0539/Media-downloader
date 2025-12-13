#!/bin/bash

# Deploy to Netlify

echo "🚀 Deploying to Netlify..."
echo ""

# Check if netlify CLI is installed
if ! command -v netlify &> /dev/null; then
    echo "Installing Netlify CLI..."
    npm install -g netlify-cli
fi

# Deploy to production
echo "Starting deployment..."
netlify deploy --prod

echo ""
echo "✅ Deployment complete!"
echo ""
echo "Your app is now live at your Netlify domain!"
