# Admin Login Flow Audit - Supabase Integration

## Current Status

### ✅ What's Working

1. **Database Connection**: 
   - Prisma is configured to connect to Supabase via `DATABASE_URL`
   - Connection pooling is set up for Vercel deployments
   - Database queries are working (as seen in other API routes)

2. **NextAuth Setup**:
   - NextAuth is configured with Prisma adapter
   - Credentials provider is set up
   - Session management (JWT strategy) is working
   - Role-based access control is implemented

3. **Login UI**:
   - Login page at `/admin/login` is functional
   - Form validation is in place
   - Error handling is implemented

### ❌ Critical Issues Found

1. **Password Authentication is DISABLED**
   - Location: `app/api/auth/[...nextauth]/route.ts` lines 49-51
   - Issue: Password verification is commented out
   - Impact: **ANY password will work** if the email exists in the database
   - Security Risk: **CRITICAL** - This is a major security vulnerability

2. **No Password Field in Database**
   - Location: `prisma/schema.prisma` - User model
   - Issue: User model doesn't have a `password` field
   - Impact: Passwords cannot be stored or verified
   - Current State: Seed script hashes password but doesn't store it

3. **Seed Script Doesn't Store Passwords**
   - Location: `prisma/seed.ts` line 24
   - Issue: Password is hashed but not stored in database
   - Impact: No way to verify passwords even if field existed

## Current Authentication Flow

```
1. User submits login form → signIn("credentials", { email, password })
2. NextAuth calls authorize() function
3. authorize() queries Supabase via Prisma: prisma.user.findUnique({ email })
4. If user exists → returns user object (WITHOUT password check)
5. Session is created with user role
6. User is redirected to /admin
```

**Problem**: Step 4 skips password verification, so any password works.

## Required Fixes

### Fix 1: Add Password Field to User Model

```prisma
model User {
  id            String    @id @default(cuid())
  name          String?
  email         String    @unique
  password      String?   // ADD THIS FIELD
  emailVerified DateTime?
  image         String?
  role          Role      @default(USER)
  // ... rest of fields
}
```

### Fix 2: Update Auth Route to Verify Passwords

Uncomment and fix password verification in `app/api/auth/[...nextauth]/route.ts`:

```typescript
// Uncomment lines 49-51 and fix:
const isPasswordValid = await bcrypt.compare(credentials.password, user.password || "");
if (!isPasswordValid || !user.password) return null;
```

### Fix 3: Update Seed Script to Store Passwords

Update `prisma/seed.ts` to store the hashed password:

```typescript
create: {
  email: adminEmail,
  name: "Admin User",
  role: "SUPER_ADMIN",
  password: adminPassword, // ADD THIS LINE
},
```

### Fix 4: Run Migration

After schema changes:
```bash
npx prisma migrate dev --name add_password_to_user
npx prisma generate
```

## Testing the Connection

To verify Supabase connection is working:

1. **Check Database Connection**:
   ```bash
   npx prisma db pull
   ```
   Should connect and fetch schema from Supabase.

2. **Test User Query**:
   ```bash
   npx prisma studio
   ```
   Open Prisma Studio and check if users exist in the database.

3. **Test Login Flow**:
   - Navigate to `/admin/login`
   - Try logging in with an existing user email
   - Check browser console and server logs for errors

## Current Workaround

**For Development Only**: 
- Any password works if the email exists
- This is documented in `ADMIN_LOGIN.md`
- **DO NOT use in production**

## Next Steps

1. ✅ Document current state (this file)
2. ⏳ Add password field to User model
3. ⏳ Enable password verification in auth route
4. ⏳ Update seed script to store passwords
5. ⏳ Run migration
6. ⏳ Test login flow with password verification


