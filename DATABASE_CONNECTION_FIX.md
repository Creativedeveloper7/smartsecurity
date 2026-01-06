# Database Connection Fix

## ✅ Progress Made

1. ✅ Prisma client generation - **FIXED**
2. ✅ Module resolution - **FIXED**  
3. ✅ DATABASE_URL is being read - **WORKING**
4. ❌ Database server connection - **NEEDS FIXING**

## Current Error

```
Error: P1001: Can't reach database server at `db.tmhtljxhmtkrwpmyneal.supabase.co:5432`
```

This means Prisma can read your connection string, but can't actually connect to the database.

## Solutions

### Solution 1: Use Supabase Connection Pooler (Recommended)

Supabase provides a connection pooler that's more reliable. Get the connection string from:

1. Go to: https://supabase.com/dashboard
2. Select your project
3. Go to: **Settings → Database**
4. Scroll to **Connection string** section
5. Select **URI** tab
6. Copy the connection string (it should look like):
   ```
   postgresql://postgres.xxxxx:[YOUR-PASSWORD]@aws-0-us-east-1.pooler.supabase.com:6543/postgres
   ```
7. Replace your `DATABASE_URL` in `.env` with this exact string

**Note:** The pooler uses port **6543** instead of 5432, and the host is different.

### Solution 2: Check if Project is Paused

1. Go to Supabase dashboard
2. Check if your project shows as "Paused"
3. If paused, click "Restore" to activate it

### Solution 3: Verify Password

1. Go to: Settings → Database
2. If you don't know your password, click "Reset database password"
3. Copy the new password
4. Update `DATABASE_URL` in `.env`

### Solution 4: Check Connection String Format

Your connection string should be:
```
postgresql://postgres:[PASSWORD]@[HOST]:[PORT]/postgres
```

Make sure:
- No spaces around `=`
- Password is URL-encoded if it contains special characters
- No extra quotes or characters

## After Fixing

Once you've updated your `.env` file:

```bash
# Test connection
npx tsx scripts/test-db-connection.ts

# If test passes, run migrations
npm run db:migrate

# Then seed the database
npm run db:seed
```

## Quick Test

To verify your connection string format is correct:

```powershell
# Check if DATABASE_URL is set
Select-String -Path .env -Pattern "DATABASE_URL"

# The output should show a valid postgresql:// URL
```

