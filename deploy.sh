#!/bin/bash

# BRODB Dashboard Deployment Script

echo "🚀 BRODB Dashboard Deployment Helper"
echo "===================================="
echo ""

# Check if git is initialized
if [ ! -d .git ]; then
    echo "📦 Initializing Git repository..."
    git init
    git add .
    git commit -m "Initial commit: BRODB Admin Dashboard"
    echo "✅ Git repository initialized"
else
    echo "✅ Git already initialized"
fi

# Check if we have a remote
if ! git remote | grep -q origin; then
    echo ""
    echo "📝 Please create a new repository on GitHub:"
    echo "   1. Go to https://github.com/new"
    echo "   2. Name it 'brodb-dashboard'"
    echo "   3. Don't initialize with README (we already have one)"
    echo ""
    read -p "Enter your GitHub repository URL (e.g., https://github.com/username/brodb-dashboard.git): " repo_url
    
    if [ ! -z "$repo_url" ]; then
        git remote add origin "$repo_url"
        echo "✅ Remote added"
    else
        echo "❌ No repository URL provided"
        exit 1
    fi
else
    echo "✅ Remote 'origin' already exists"
fi

# Push to GitHub
echo ""
echo "📤 Pushing to GitHub..."
git branch -M main
git push -u origin main

echo ""
echo "✅ Code pushed to GitHub!"
echo ""
echo "🔧 Next Steps for Vercel Deployment:"
echo "===================================="
echo "1. Go to https://vercel.com/new"
echo "2. Import your GitHub repository"
echo "3. Vercel will auto-detect Next.js"
echo "4. Add these environment variables in Vercel:"
echo "   - NEXT_PUBLIC_SUPABASE_URL"
echo "   - NEXT_PUBLIC_SUPABASE_ANON_KEY"
echo "5. Click 'Deploy'"
echo ""
echo "📝 Note: Your .env.local file is gitignored for security"
echo "📝 Make sure to add the env vars in Vercel's settings"
echo ""
echo "🎉 Happy deploying!"