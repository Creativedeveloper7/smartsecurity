# Admin Dashboard Login Guide

## Quick Setup

### Step 1: Create an Admin User

Run the seed script to create an admin user:

```bash
npm run db:seed
```

Or create a specific admin user:

```bash
npx tsx scripts/create-admin.ts your-email@example.com "Your Name" ADMIN
```

### Step 2: Log In

1. Navigate to: `http://localhost:3000/admin/login`
2. Enter the admin email (e.g., `admin@example.com`)
3. Enter **any password** (password checking is currently disabled for development)

### Step 3: Access Dashboard

After successful login, you'll be redirected to `/admin` dashboard.

## Important Notes

⚠️ **Security Warning**: Password authentication is currently **disabled** for development purposes. This means:
- Any user that exists in the database can log in with any password
- This is **NOT secure** for production use

## Enabling Password Authentication

To enable proper password authentication:

1. Add a `password` field to the User model in `prisma/schema.prisma`:
```prisma
model User {
  // ... existing fields
  password String? // Add this field
}
```

2. Run migration:
```bash
npm run db:migrate
```

3. Update `app/api/auth/[...nextauth]/route.ts` to uncomment password checking (lines 40-42)

4. Update the seed script to store hashed passwords

## Default Admin User

After running `npm run db:seed`, you'll have:
- **Email**: `admin@example.com`
- **Role**: `SUPER_ADMIN`
- **Password**: Any password works (authentication disabled)

## Troubleshooting

### "Cannot find module" errors
```bash
npm run db:generate
```

### Database connection errors
Make sure your `.env` file has a valid `DATABASE_URL`

### User not found
Run the seed script or create-admin script to create the user first

