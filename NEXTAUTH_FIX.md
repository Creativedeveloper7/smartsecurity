# NextAuth Error Fix

## Error: CLIENT_FETCH_ERROR

This error occurs when NextAuth tries to fetch from the API route but gets HTML instead of JSON.

## Solution

1. **Ensure environment variables are set:**
   - `NEXTAUTH_URL=http://localhost:3000` (for development)
   - `NEXTAUTH_SECRET=your-secret-key-here`

2. **The route is properly configured at:**
   - `/app/api/auth/[...nextauth]/route.ts`

3. **If you don't have a database yet:**
   - The auth will fail gracefully
   - You can still use the site without authentication
   - Admin features will redirect to login

## Quick Fix

If you're not using authentication features yet, you can suppress the error by:

1. Making sure `.env` file exists with at least:
   ```
   NEXTAUTH_URL=http://localhost:3000
   NEXTAUTH_SECRET=development-secret-key
   ```

2. Restart the dev server after adding environment variables

The error won't break the site - it's just NextAuth trying to check for a session. The site will work fine without authentication configured.

