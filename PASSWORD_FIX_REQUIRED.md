# Password Fix Required

## Current Status

✅ Connection string format is **CORRECT**  
❌ Database password is **INCORRECT**

The error "Tenant or user not found" means your password `Foodswings2025` is not the correct password for your Supabase database.

## Quick Fix (Recommended)

### Get Connection String from Supabase Dashboard

1. **Go to Supabase Dashboard**
   - Visit: https://supabase.com/dashboard
   - Sign in

2. **Select Your Project**
   - Click on project: `tmhtljxhmtkrwpmyneal`

3. **Get Connection String**
   - Click: **Settings** → **Database**
   - Scroll to **Connection string** section
   - Click the **URI** tab
   - You'll see a connection string like:
     ```
     postgresql://postgres.tmhtljxhmtkrwpmyneal:YOUR_ACTUAL_PASSWORD@aws-0-us-east-1.pooler.supabase.com:6543/postgres
     ```
   - **This string already has your correct password!**
   - Click the **Copy** button

4. **Update Your .env File**
   - Open `.env` in your project
   - Find this line:
     ```
     DATABASE_URL="postgresql://postgres.tmhtljxhmtkrwpmyneal:Foodswings2025@aws-0-us-east-1.pooler.supabase.com:6543/postgres"
     ```
   - Replace the entire line with the copied string from Supabase
   - Make sure to keep the quotes!

5. **Test the Connection**
   ```bash
   npm run db:migrate
   ```

## Alternative: Reset Password

If you don't know your password:

1. Go to: **Settings** → **Database**
2. Find **Database password** section
3. Click **Reset database password**
4. Copy the new password
5. Update your `.env`:
   ```
   DATABASE_URL="postgresql://postgres.tmhtljxhmtkrwpmyneal:NEW_PASSWORD@aws-0-us-east-1.pooler.supabase.com:6543/postgres"
   ```

## Why This Happens

Supabase generates a random password when you create a project. The password in your connection string must match exactly what's stored in Supabase. The easiest way is to copy the connection string directly from the Supabase dashboard, as it has the correct password pre-filled.

## After Fixing

Once you've updated your `.env` with the correct connection string:

```bash
# Run migrations
npm run db:migrate

# Seed the database
npm run db:seed
```

You should see success messages instead of errors!

