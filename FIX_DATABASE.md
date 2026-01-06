# Fix Database Connection Issues

## Issue 1: Database Connection Failed

The error shows it's trying to connect to: `db.jdddchjbglilkfrlenci.supabase.co`

This might be:
1. A different Supabase project
2. An incorrect connection string
3. Network/firewall blocking the connection

## Solution: Update DATABASE_URL

### Option A: Use the Correct Supabase Project

If you have the project `tmhtljxhmtkrwpmyneal`, use this format:

```env
DATABASE_URL="postgresql://postgres:[YOUR-PASSWORD]@db.tmhtljxhmtkrwpmyneal.supabase.co:5432/postgres"
```

### Option B: Get the Correct Connection String

1. Go to your Supabase dashboard
2. Navigate to: **Settings** → **Database**
3. Find **Connection string** → **URI**
4. Copy the full connection string
5. It should look like:
   ```
   postgresql://postgres.[PROJECT-REF]:[PASSWORD]@aws-0-[REGION].pooler.supabase.com:6543/postgres
   ```

### Option C: Use Connection Pooling (Recommended)

For better reliability, use the connection pooling URL:

```env
DATABASE_URL="postgresql://postgres.[PROJECT-REF]:[PASSWORD]@aws-0-[REGION].pooler.supabase.com:6543/postgres?pgbouncer=true"
```

## Issue 2: Prisma Client Path

The Prisma client output path has been fixed. After updating DATABASE_URL, run:

```bash
npm run db:generate
npm run db:migrate
npm run db:seed
```

## Quick Fix Steps

1. **Check your .env file** - Make sure DATABASE_URL is correct
2. **Verify Supabase project** - Ensure the project is active
3. **Test connection** - Try connecting via Supabase dashboard SQL editor
4. **Update connection string** - Use the exact format from Supabase dashboard
5. **Run migrations** - After fixing DATABASE_URL, run the setup commands

