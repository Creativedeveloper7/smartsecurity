# Vercel Database Setup Guide

## Critical: Database Connection Configuration

For your app to successfully fetch data from Supabase on Vercel, you **MUST** configure the environment variables correctly.

## Step 1: Get Your Supabase Connection String

1. Go to your Supabase project dashboard
2. Navigate to **Settings** → **Database**
3. Scroll down to **Connection string**
4. Select **URI** tab
5. **IMPORTANT**: Use the **Connection Pooler** URL (not the direct connection)

### Connection Pooler URL Format:
```
postgresql://postgres.[PROJECT-REF]:[PASSWORD]@aws-0-[REGION].pooler.supabase.com:6543/postgres?pgbouncer=true
```

**Key differences:**
- Port: `6543` (pooler) instead of `5432` (direct)
- Host: `pooler.supabase.com` instead of `db.supabase.com`
- Includes `?pgbouncer=true` parameter

## Step 2: Set Environment Variables in Vercel

1. Go to your Vercel project dashboard
2. Navigate to **Settings** → **Environment Variables**
3. Add these variables:

### Required Variables:

#### `DATABASE_URL`
- **Value**: Your Supabase connection pooler URL (from Step 1)
- **Example**: `postgresql://postgres.abcdefghijklmnop:your-password@aws-0-us-east-1.pooler.supabase.com:6543/postgres?pgbouncer=true`
- **Environments**: Production, Preview, Development (select all)

#### `NEXTAUTH_URL`
- **Value**: Your Vercel deployment URL
- **Example**: `https://your-app.vercel.app`
- **Environments**: Production, Preview, Development

#### `NEXTAUTH_SECRET`
- **Value**: A random secret string (generate with: `openssl rand -base64 32`)
- **Example**: `aBc123XyZ456...` (32+ character random string)
- **Environments**: Production, Preview, Development

## Step 3: Verify Configuration

After setting environment variables:

1. **Redeploy** your Vercel project (or push a new commit)
2. Check the **Deployment Logs** for any connection errors
3. Visit `/api/health` endpoint to test database connection
4. Check browser console - should see successful API calls

## Troubleshooting

### If you see 503 errors:
- ✅ Check that `DATABASE_URL` is set correctly
- ✅ Verify you're using the **pooler URL** (port 6543)
- ✅ Ensure password doesn't contain special characters that need URL encoding
- ✅ Check Vercel logs for specific error messages

### If you see empty arrays:
- Database connection might be working but tables are empty
- Run migrations: `npx prisma migrate deploy` (in Vercel build or locally)
- Seed the database: `npm run db:seed`

### Common Issues:

1. **Wrong Port**: Using 5432 instead of 6543
   - Fix: Use connection pooler URL

2. **Missing Password**: Password not included in URL
   - Fix: Reset password in Supabase and copy full URL

3. **Special Characters in Password**: Need URL encoding
   - Fix: URL encode special characters or reset password

4. **Environment Variables Not Applied**: Need to redeploy
   - Fix: Push a new commit or manually redeploy

## Testing Locally

To test with the same connection string:

1. Copy your Vercel `DATABASE_URL`
2. Add to `.env.local`:
   ```
   DATABASE_URL="your-pooler-url-here"
   ```
3. Run: `npm run dev`
4. Test API endpoints locally

## Next Steps

Once configured correctly:
- ✅ API routes will successfully fetch data
- ✅ Frontend will display articles, videos, products, etc.
- ✅ Admin dashboard will work properly
- ✅ All database operations will function

