# Database Connection Troubleshooting

## Current Error
```
Can't reach database server at `db.jdddchjbglilkfrlenci.supabase.co:5432`
```

## Quick Fix Steps

### Step 1: Verify Your Supabase Project

1. Go to: https://supabase.com/dashboard
2. Check if your project is **active** (not paused)
3. Note your project reference ID

### Step 2: Get the Correct Connection String

1. In Supabase dashboard, go to: **Settings** → **Database**
2. Scroll to **Connection string** section
3. Select **URI** tab
4. Copy the connection string - it should look like:

```
postgresql://postgres.[PROJECT-REF]:[YOUR-PASSWORD]@aws-0-[REGION].pooler.supabase.com:6543/postgres?pgbouncer=true
```

OR for direct connection:

```
postgresql://postgres:[YOUR-PASSWORD]@db.[PROJECT-REF].supabase.co:5432/postgres
```

### Step 3: Update Your .env File

Replace the `DATABASE_URL` line in your `.env` file with the correct connection string.

**Important**: 
- Replace `[YOUR-PASSWORD]` with your actual database password
- Make sure there are no extra spaces or quotes issues
- The password might contain special characters - make sure they're URL-encoded

### Step 4: Test the Connection

Run this to test if the connection works:

```bash
npx tsx scripts/test-db-connection.ts
```

### Step 5: Run Migrations

If connection test passes:

```bash
npm run db:migrate
npm run db:seed
```

## Common Issues

### Issue 1: Wrong Project Reference
- The error shows: `db.jdddchjbglilkfrlenci.supabase.co`
- Make sure this matches your actual Supabase project

### Issue 2: Password with Special Characters
If your password has special characters, they need to be URL-encoded:
- `@` becomes `%40`
- `#` becomes `%23`
- `$` becomes `%24`
- etc.

### Issue 3: Project Paused
- Free Supabase projects pause after inactivity
- Go to dashboard and resume the project

### Issue 4: Using Wrong Port
- Connection pooling: port `6543`
- Direct connection: port `5432`
- Make sure you're using the correct one

## Alternative: Use Supabase SQL Editor

If migrations fail, you can manually create tables using Supabase SQL Editor:

1. Go to Supabase dashboard → SQL Editor
2. Run the SQL from your Prisma migrations
3. Then run `npm run db:seed` to populate data

## Still Having Issues?

1. Check Supabase project status
2. Verify DATABASE_URL format
3. Test connection with: `npx tsx scripts/test-db-connection.ts`
4. Check Supabase logs for connection attempts

