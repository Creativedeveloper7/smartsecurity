# How to Get the Correct Supabase Connection String

## Current Issue

The error "Tenant or user not found" means the password in your connection string is incorrect.

## Step-by-Step Guide

### Option 1: Get Connection String from Supabase Dashboard (Easiest)

1. **Go to Supabase Dashboard**
   - Visit: https://supabase.com/dashboard
   - Sign in to your account

2. **Select Your Project**
   - Click on your project (the one with database `db.tmhtljxhmtkrwpmyneal`)

3. **Get Connection String**
   - Go to: **Settings** → **Database**
   - Scroll down to **Connection string** section
   - Select the **URI** tab
   - You'll see a connection string that looks like:
     ```
     postgresql://postgres.[PROJECT_REF]:[YOUR-PASSWORD]@aws-0-us-east-1.pooler.supabase.com:6543/postgres
     ```
   - **IMPORTANT**: This string already has your password filled in!
   - Click the **Copy** button to copy the entire string

4. **Update Your .env File**
   - Open your `.env` file
   - Find the `DATABASE_URL` line
   - Replace the entire line with:
     ```
     DATABASE_URL="[PASTE_THE_COPIED_STRING_HERE]"
     ```
   - Make sure to keep the quotes!

### Option 2: Reset Database Password

If you don't know your password:

1. Go to: **Settings** → **Database**
2. Find **Database password** section
3. Click **Reset database password**
4. Copy the new password
5. Update your connection string:
   ```
   DATABASE_URL="postgresql://postgres:NEW_PASSWORD_HERE@db.tmhtljxhmtkrwpmyneal.supabase.co:5432/postgres"
   ```

### Option 3: Check if Project is Paused

1. Go to your Supabase dashboard
2. Check if your project shows as "Paused"
3. If paused, click **Restore** to activate it
4. Wait a few minutes for it to become active

## After Updating

Once you've updated your `.env` file with the correct connection string:

```bash
# Test the connection
npx tsx scripts/test-db-connection.ts

# If successful, run migrations
npm run db:migrate

# Then seed the database
npm run db:seed
```

## Connection String Formats

### Direct Connection (Port 5432)
```
postgresql://postgres:PASSWORD@db.tmhtljxhmtkrwpmyneal.supabase.co:5432/postgres
```

### Connection Pooler (Port 6543) - Recommended
```
postgresql://postgres.PROJECT_REF:PASSWORD@aws-0-us-east-1.pooler.supabase.com:6543/postgres
```

**Note**: The pooler format uses `postgres.PROJECT_REF` as the username, where `PROJECT_REF` is your project reference (like `tmhtljxhmtkrwpmyneal`).

## Current Status

Your `.env` currently has:
```
DATABASE_URL="postgresql://postgres:Foodswings2025.@db.tmhtljxhmtkrwpmyneal.supabase.co:5432/postgres"
```

If this password is incorrect, you need to replace it with your actual Supabase database password.

