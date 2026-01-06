# Fix Your .env File

## Current Issue

Your `.env` file has:
```
DATABASE_URL="postgresql://postgres:[YOUR-PASSWORD]@..."
```

You need to replace `[YOUR-PASSWORD]` with your **actual Supabase database password**.

## Step-by-Step Fix

### Step 1: Get Your Supabase Database Password

1. Go to: **https://supabase.com/dashboard**
2. Select your project (the one with reference `jdddchjbglilkfrlenci` or `tmhtljxhmtkrwpmyneal`)
3. Go to: **Settings** → **Database**
4. Scroll to **Connection string** section
5. You'll see your password there, OR click **Reset database password** if you don't know it

### Step 2: Get the Full Connection String

In the **Connection string** section:
- Select the **URI** tab
- Copy the **entire connection string**
- It should look like one of these:

**Option A - Connection Pooling (Recommended):**
```
postgresql://postgres.jdddchjbglilkfrlenci:[PASSWORD]@aws-0-us-east-1.pooler.supabase.com:6543/postgres?pgbouncer=true
```

**Option B - Direct Connection:**
```
postgresql://postgres:[PASSWORD]@db.jdddchjbglilkfrlenci.supabase.co:5432/postgres
```

### Step 3: Update Your .env File

Open your `.env` file and replace the `DATABASE_URL` line with the connection string you copied.

**Make sure:**
- ✅ Replace `[PASSWORD]` with your actual password
- ✅ Keep the quotes around the connection string
- ✅ No extra spaces
- ✅ The entire connection string is on one line

### Step 4: Test the Connection

After updating `.env`, test it:

```bash
npx tsx scripts/test-db-connection.ts
```

If it says "✅ Database connection successful!", proceed to Step 5.

### Step 5: Run Migrations

```bash
npm run db:migrate
npm run db:seed
```

## Example .env File

Your `.env` should look like this (with real values):

```env
DATABASE_URL="postgresql://postgres.jdddchjbglilkfrlenci:your_actual_password_here@aws-0-us-east-1.pooler.supabase.com:6543/postgres?pgbouncer=true"

NEXTAUTH_URL="http://localhost:3000"
NEXTAUTH_SECRET="agrlfTqjkh5+tjXTSwzgP6S9bME81JGPcigNkQWR7qQ="

VITE_SUPABASE_URL=https://tmhtljxhmtkrwpmyneal.supabase.co
VITE_SUPABASE__KEY=ETKFc0bKfd6puxzdPbH35w_h8OLVLBl
```

## Still Can't Connect?

1. **Check if project is paused**: Free Supabase projects pause after inactivity
2. **Verify password**: Make sure you copied the password correctly
3. **Try connection pooling URL**: Use port 6543 instead of 5432
4. **Check network**: Make sure you're not behind a firewall blocking the connection

