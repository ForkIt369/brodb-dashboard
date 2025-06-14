# BRODB Admin Dashboard

A modern, production-ready admin dashboard for the BRO Telegram play-to-earn platform built with Next.js, TypeScript, Tailwind CSS, and Supabase.

## Features

- 🚀 **Next.js 14** with App Router
- 🎨 **Tailwind CSS** with custom W3DV design system
- 📊 **Real-time data** from Supabase
- 🔐 **Environment variables** for secure credential management
- 📈 **Chart.js** integration for data visualization
- 🎯 **TypeScript** for type safety
- 🌐 **Vercel-ready** for easy deployment

## Project Structure

```
brodb-dashboard/
├── src/
│   ├── app/           # Next.js app directory
│   ├── components/    # React components
│   ├── lib/          # Utilities and Supabase client
│   ├── types/        # TypeScript type definitions
│   └── utils/        # Helper functions
├── public/           # Static assets
├── .env.local       # Environment variables (already configured)
└── package.json     # Dependencies and scripts
```

## Getting Started

### 1. Install Dependencies

```bash
cd brodb-dashboard
npm install
```

### 2. Environment Variables

The `.env.local` file is already configured with your Supabase credentials:

```env
NEXT_PUBLIC_SUPABASE_URL=https://mekstllsjfxfaktyctcy.supabase.co
NEXT_PUBLIC_SUPABASE_ANON_KEY=your-anon-key
```

### 3. Run Development Server

```bash
npm run dev
```

Open [http://localhost:3000](http://localhost:3000) to view the dashboard.

## Deployment

### Deploy to Vercel

1. Push the project to GitHub:
```bash
git init
git add .
git commit -m "Initial commit"
git branch -M main
git remote add origin https://github.com/YOUR_USERNAME/brodb-dashboard.git
git push -u origin main
```

2. Import to Vercel:
   - Go to [vercel.com](https://vercel.com)
   - Click "New Project"
   - Import your GitHub repository
   - Vercel will automatically detect Next.js
   - Environment variables will be read from `.env.local`
   - Click "Deploy"

### Environment Variables in Vercel

Add these in your Vercel project settings:
- `NEXT_PUBLIC_SUPABASE_URL`
- `NEXT_PUBLIC_SUPABASE_ANON_KEY`

## Development Workflow

### Adding New Components

1. Create component in `src/components/`
2. Import and use in pages
3. Components are automatically typed with TypeScript

### Adding New API Routes

Create files in `src/app/api/` for server-side operations:

```typescript
// src/app/api/users/route.ts
import { NextResponse } from 'next/server'
import { createServerSupabaseClient } from '@/lib/supabase'

export async function GET() {
  const supabase = createServerSupabaseClient()
  const { data, error } = await supabase.from('users').select()
  
  if (error) {
    return NextResponse.json({ error: error.message }, { status: 500 })
  }
  
  return NextResponse.json(data)
}
```

### Database Types

Types are auto-generated from your Supabase schema in `src/types/database.ts`. Update these when your schema changes:

```bash
npx supabase gen types typescript --project-id mekstllsjfxfaktyctcy > src/types/database.ts
```

## Security Best Practices

1. **Never commit** `.env.local` to public repositories
2. Use **Row Level Security (RLS)** in Supabase
3. Keep service role keys on server-side only
4. Implement authentication before production

## Next Steps

1. **Complete Components**: The basic structure is ready. Add remaining components:
   - `UserSegments.tsx`
   - `ActivityChart.tsx`
   - `UsersTable.tsx`

2. **Add Authentication**: Implement Supabase Auth for admin access

3. **Optimize Queries**: Add database functions for complex queries

4. **Add More Features**:
   - Export functionality
   - Real-time updates
   - Advanced filtering
   - Bulk operations

## Support

For issues or questions:
- Check Supabase logs in your project dashboard
- Use browser DevTools for debugging
- Monitor Vercel Functions logs for API errors

## License

Private - Internal use only