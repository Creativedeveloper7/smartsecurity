# Environment Setup Guide

## Quick Fix for Localhost Not Loading

The app needs environment variables to run. Follow these steps:

### 1. Create/Update `.env` file

Create a `.env` file in the root directory with these minimum required variables:

```env
# Database - Use a placeholder for now if you don't have PostgreSQL set up
DATABASE_URL="postgresql://user:password@localhost:5432/shioso?schema=public"

# NextAuth - Required for authentication
NEXTAUTH_URL="http://localhost:3000"
NEXTAUTH_SECRET="development-secret-key-change-in-production"

# Optional - Can be added later
NEXT_PUBLIC_STRIPE_PUBLISHABLE_KEY=""
STRIPE_SECRET_KEY=""
```

### 2. Generate Prisma Client

```bash
npm run db:generate
```

### 3. Start the Development Server

```bash
npm run dev
```

## If You Don't Have a Database Yet

The app will now work without a database connection for the frontend pages. However:

- **Frontend pages** (Home, Blog, Videos, Shop, Bookings) will work with mock data
- **Admin dashboard** will redirect to login (which is expected)
- **API routes** that require database will fail gracefully

## Setting Up a Database (Optional but Recommended)

### Option 1: Local PostgreSQL

1. Install PostgreSQL
2. Create a database:
```sql
CREATE DATABASE shioso;
```
3. Update `.env`:
```env
DATABASE_URL="postgresql://your_username:your_password@localhost:5432/shioso?schema=public"
```

### Option 2: Cloud Database (Supabase, Neon, etc.)

1. Create a free account at [Supabase](https://supabase.com) or [Neon](https://neon.tech)
2. Get your connection string
3. Update `.env` with the connection string
4. Run migrations:
```bash
npm run db:migrate
npm run db:seed
```

## Troubleshooting

### Error: "Prisma Client not generated"
```bash
npm run db:generate
```

### Error: "DATABASE_URL not found"
Make sure `.env` file exists in the root directory and has `DATABASE_URL` set.

### Error: "NEXTAUTH_SECRET not found"
Add `NEXTAUTH_SECRET` to your `.env` file. Generate a secure secret:
```bash
openssl rand -base64 32
```

### App loads but shows errors
Check the browser console and terminal for specific error messages. Most common issues:
- Missing environment variables
- Prisma client not generated
- Database connection issues (if using database features)

## Current Status

✅ Frontend pages work without database
✅ Prisma client generation fixed
✅ NextAuth configured (works without database for frontend)
⚠️ Admin features require database
⚠️ API routes require database

