# Supabase Auth Migration Guide

## ✅ Migration Complete

The application has been migrated from NextAuth to Supabase Auth. Here's what changed:

## Changes Made

### 1. **New Supabase Client Utilities**
- `lib/supabase/client.ts` - Browser client for client components
- `lib/supabase/server.ts` - Server client for server components
- `lib/supabase/middleware.ts` - Middleware for session management

### 2. **Updated Authentication Flow**
- Login page now uses `supabase.auth.signInWithPassword()`
- Session management handled by Supabase Auth
- User roles checked from Prisma User table (synced with Supabase Auth)

### 3. **Updated Files**
- `app/admin/(auth)/login/page.tsx` - Uses Supabase Auth
- `lib/auth.ts` - Uses Supabase Auth for session management
- `proxy.ts` - Uses Supabase middleware for session refresh
- `app/api/auth/check-role/route.ts` - New API route to check user roles

## Required Environment Variables

Add these to your `.env.local` file:

```env
# Supabase Auth (Required)
NEXT_PUBLIC_SUPABASE_URL=your-supabase-project-url
NEXT_PUBLIC_SUPABASE_ANON_KEY=your-supabase-anon-key

# Database (Still required for Prisma)
DATABASE_URL=your-supabase-database-url
```

**Where to find these:**
1. Go to your Supabase project dashboard
2. Navigate to **Settings** → **API**
3. Copy:
   - **Project URL** → `NEXT_PUBLIC_SUPABASE_URL`
   - **anon/public key** → `NEXT_PUBLIC_SUPABASE_ANON_KEY`

## Setting Up Admin Users

### Option 1: Create User via Supabase Dashboard

1. Go to Supabase Dashboard → **Authentication** → **Users**
2. Click **Add user** → **Create new user**
3. Enter:
   - Email: `admin@example.com`
   - Password: `admin123` (or your preferred password)
   - Auto Confirm User: ✅ (checked)
4. Click **Create user**

5. **Sync user to your database:**
   ```bash
   npx tsx scripts/sync-supabase-user.ts admin@example.com ADMIN
   ```

### Option 2: Create User via API (Recommended)

Run the seed script which will:
1. Create user in Supabase Auth
2. Sync user to your Prisma User table with admin role

```bash
npm run db:seed
```

**Note:** The seed script needs to be updated to create users in Supabase Auth first.

## How It Works

### Authentication Flow

1. **User logs in** → `supabase.auth.signInWithPassword()`
2. **Supabase Auth** → Validates credentials and creates session
3. **Role Check** → API checks Prisma User table for admin role
4. **Session** → Stored in cookies, managed by Supabase
5. **Middleware** → Refreshes session on each request

### User Sync

Supabase Auth users are stored in Supabase's `auth.users` table. Your Prisma `User` table stores additional data like `role`. Users are matched by email.

**Important:** When creating users:
1. Create in Supabase Auth first
2. Then sync/create in your Prisma User table with the same email

## Migration Steps

### 1. Install Dependencies (Already Done)
```bash
npm install @supabase/ssr
```

### 2. Set Environment Variables
Add Supabase Auth credentials to `.env.local`

### 3. Create Admin User in Supabase Auth
Use Supabase Dashboard or API

### 4. Sync User to Database
Run seed script or manual sync

### 5. Test Login
- Go to `/admin/login`
- Use Supabase Auth credentials
- Should redirect to `/admin` if user has admin role

## Troubleshooting

### "Invalid login credentials"
- User doesn't exist in Supabase Auth
- Create user in Supabase Dashboard first

### "Access denied. Admin privileges required."
- User exists in Supabase Auth but not in Prisma User table
- Or user doesn't have ADMIN/SUPER_ADMIN role
- Run sync script: `npx tsx scripts/sync-supabase-user.ts <email> ADMIN`

### "NEXT_PUBLIC_SUPABASE_URL is not defined"
- Add environment variables to `.env.local`
- Restart dev server after adding variables

### Session not persisting
- Check that middleware is running (check `proxy.ts`)
- Verify cookies are being set (check browser DevTools)

## Next Steps

1. ✅ Update seed script to create users in Supabase Auth
2. ✅ Create user sync utility script
3. ✅ Test login flow
4. ✅ Update any other auth-dependent code

## Benefits of Supabase Auth

- ✅ Built-in password hashing and security
- ✅ Email verification support
- ✅ Password reset functionality
- ✅ OAuth providers (Google, GitHub, etc.)
- ✅ Session management
- ✅ Row Level Security (RLS) support
- ✅ Better security practices

