# 🚀 Quick Start Guide

## Run Locally in 3 Steps:

```bash
# 1. Install dependencies
npm install

# 2. Run development server
npm run dev

# 3. Open browser
# Go to http://localhost:3000
```

## Deploy to Production:

### Option 1: Automatic (Recommended)
```bash
./deploy.sh
```

### Option 2: Manual
```bash
# 1. Push to GitHub
git init
git add .
git commit -m "Initial commit"
git remote add origin YOUR_GITHUB_URL
git push -u origin main

# 2. Deploy to Vercel
# - Go to vercel.com/new
# - Import your repo
# - Add env variables
# - Deploy!
```

## Environment Variables Already Set:
✅ `NEXT_PUBLIC_SUPABASE_URL`
✅ `NEXT_PUBLIC_SUPABASE_ANON_KEY`

Your credentials are securely stored in `.env.local` and will NOT be committed to GitHub.

## Need Help?
- Check the full README.md
- View logs in browser console
- Check Supabase dashboard for API issues