# Fix Database Authentication Error in Vercel

## Error Message
```
Authentication failed against database server, the provided database credentials for `postgres` are not valid.
```

This means Vercel can reach your database, but the username/password in your `DATABASE_URL` is incorrect.

## Step-by-Step Fix

### Step 1: Get Your Correct Supabase Connection String

1. Go to [Supabase Dashboard](https://supabase.com/dashboard)
2. Select your project
3. Navigate to **Settings** → **Database**
4. Scroll to **Connection string** section
5. Select the **URI** tab
6. **IMPORTANT**: Use the **Connection Pooler** (not Direct connection)
   - Look for the tab labeled "Connection Pooler" or "Session mode"
   - Port should be **6543** (not 5432)
   - Host should contain `pooler.supabase.com`

### Step 2: Reset Database Password (If Needed)

If you're not sure about your password:

1. In Supabase Dashboard → **Settings** → **Database**
2. Scroll to **Database Password** section
3. Click **Reset database password**
4. Copy the new password immediately (you won't see it again)
5. Update your connection string with the new password

### Step 3: Build the Connection String

The connection string format should be:
```
postgresql://postgres.[PROJECT-REF]:[PASSWORD]@aws-0-[REGION].pooler.supabase.com:6543/postgres?pgbouncer=true
```

**Example:**
```
postgresql://postgres.abcdefghijklmnop:MySecurePassword123@aws-0-us-east-1.pooler.supabase.com:6543/postgres?pgbouncer=true
```

### Step 4: Handle Special Characters in Password

If your password contains special characters, you need to URL-encode them:

**Common special characters:**
- `@` → `%40`
- `#` → `%23`
- `$` → `%24`
- `%` → `%25`
- `&` → `%26`
- `+` → `%2B`
- `=` → `%3D`
- `?` → `%3F`
- `/` → `%2F`
- ` ` (space) → `%20`

**Example:**
- Password: `MyP@ss#123`
- URL-encoded: `MyP%40ss%23123`
- Full URL: `postgresql://postgres.xxx:MyP%40ss%23123@aws-0-us-east-1.pooler.supabase.com:6543/postgres?pgbouncer=true`

**Or use an online URL encoder:**
- Go to https://www.urlencoder.org/
- Paste your password
- Copy the encoded version

### Step 5: Set Environment Variable in Vercel

1. Go to [Vercel Dashboard](https://vercel.com/dashboard)
2. Select your project
3. Navigate to **Settings** → **Environment Variables**
4. Find `DATABASE_URL` or create it if it doesn't exist
5. **Paste your complete connection string** (from Step 3 or 4)
6. **IMPORTANT**: Select all environments:
   - ✅ Production
   - ✅ Preview
   - ✅ Development
7. Click **Save**

### Step 6: Redeploy Your Application

After updating the environment variable:

1. Go to **Deployments** tab in Vercel
2. Click the **⋯** (three dots) on the latest deployment
3. Click **Redeploy**
4. Or push a new commit to trigger a new deployment

**Note**: Environment variable changes require a redeploy to take effect.

### Step 7: Verify the Fix

1. Wait for the deployment to complete
2. Check the deployment logs for any errors
3. Visit your API endpoint: `https://your-app.vercel.app/api/categories`
4. Should return categories (or empty array `[]` if no categories exist)
5. Check Vercel function logs for any database errors

## Common Issues & Solutions

### Issue 1: Still Getting Authentication Error

**Possible causes:**
- Password not URL-encoded (if it has special characters)
- Using direct connection URL instead of pooler URL
- Wrong password copied
- Environment variable not applied (need to redeploy)

**Solution:**
1. Double-check the connection string format
2. Ensure you're using the **pooler URL** (port 6543)
3. Reset the database password and try again
4. Make sure you redeployed after updating the variable

### Issue 2: Connection String Format Error

**Error:** `Invalid connection string format`

**Solution:**
- Ensure no extra spaces or quotes
- Check that all parts are present: `postgresql://[user]:[password]@[host]:[port]/[database]?[params]`
- Verify the `?pgbouncer=true` parameter is included

### Issue 3: Environment Variable Not Found

**Error:** `DATABASE_URL environment variable is not set`

**Solution:**
1. Verify the variable name is exactly `DATABASE_URL` (case-sensitive)
2. Check that you selected the correct environment (Production/Preview/Development)
3. Redeploy after adding the variable

### Issue 4: Using Direct Connection Instead of Pooler

**Symptoms:**
- Works sometimes, fails other times
- Connection timeouts
- "Too many connections" errors

**Solution:**
- Always use the **Connection Pooler** URL (port 6543)
- Direct connection (port 5432) has connection limits and is not suitable for serverless

## Testing Locally

To test with the same connection string:

1. Copy your Vercel `DATABASE_URL` from Vercel dashboard
2. Add to `.env.local`:
   ```
   DATABASE_URL="your-connection-string-here"
   ```
3. Run: `npm run dev`
4. Test: `curl http://localhost:3000/api/categories`

## Quick Checklist

- [ ] Using Supabase Connection Pooler URL (port 6543)
- [ ] Password is correct (reset if unsure)
- [ ] Special characters in password are URL-encoded
- [ ] Connection string includes `?pgbouncer=true`
- [ ] `DATABASE_URL` is set in Vercel for all environments
- [ ] Application has been redeployed after setting the variable
- [ ] No extra spaces or quotes in the connection string

## Still Having Issues?

1. **Check Vercel Logs:**
   - Go to Vercel Dashboard → Your Project → **Logs**
   - Look for specific error messages

2. **Verify Supabase Project Status:**
   - Ensure your Supabase project is not paused
   - Check if you've exceeded any limits

3. **Test Connection String Locally:**
   - Use the connection string in `.env.local`
   - Run: `npx prisma db pull` to test connection

4. **Contact Support:**
   - If all else fails, check Supabase status page
   - Verify your Supabase project settings


