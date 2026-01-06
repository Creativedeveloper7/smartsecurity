# Quick Database Setup Guide

## 🚀 Step-by-Step Setup

### Step 1: Get Your Supabase Database Password

1. Go to: https://supabase.com/dashboard/project/tmhtljxhmtkrwpmyneal/settings/database
2. Scroll to **Connection string** section
3. Find your database password (or reset it if needed)
4. Copy the **URI** connection string

### Step 2: Update Your .env File

Open your `.env` file and add/update these lines:

```env
# Database - Supabase PostgreSQL
# Replace [YOUR-PASSWORD] with your actual Supabase database password
DATABASE_URL="postgresql://postgres:[YOUR-PASSWORD]@db.tmhtljxhmtkrwpmyneal.supabase.co:5432/postgres?pgbouncer=true&connection_limit=1"

# NextAuth Configuration
NEXTAUTH_URL="http://localhost:3000"
NEXTAUTH_SECRET="agrlfTqjkh5+tjXTSwzgP6S9bME81JGPcigNkQWR7qQ="

# Supabase (you already have these)
VITE_SUPABASE_URL=https://tmhtljxhmtkrwpmyneal.supabase.co
VITE_SUPABASE__KEY=ETKFc0bKfd6puxzdPbH35w_h8OLVLBl
```

**⚠️ Important**: Replace `[YOUR-PASSWORD]` with your actual Supabase database password!

### Step 3: Run Database Setup Commands

After updating `.env`, run these commands in order:

```bash
# 1. Generate Prisma Client
npm run db:generate

# 2. Run database migrations (creates all tables)
npm run db:migrate

# 3. Seed database (creates admin user and sample data)
npm run db:seed
```

### Step 4: Start Your Development Server

```bash
npm run dev
```

### Step 5: Log In to Admin Dashboard

1. Navigate to: **http://localhost:3000/admin/login**
2. **Email**: `admin@example.com`
3. **Password**: Any password (authentication is disabled for development)

## ✅ What Gets Created

After running `npm run db:seed`:
- ✅ Admin user: `admin@example.com` (SUPER_ADMIN role)
- ✅ Sample categories (Security, Intelligence, Protection, Criminal Justice)
- ✅ Sample services (Consultation, Training, etc.)
- ✅ Site settings

## 🔧 Troubleshooting

### "Cannot connect to database"
- Check your `DATABASE_URL` in `.env`
- Make sure you replaced `[YOUR-PASSWORD]` with your actual password
- Verify your Supabase project is active

### "Prisma Client not found"
```bash
npm run db:generate
```

### "Migration failed"
- Make sure your database is accessible
- Check if tables already exist (you might need to reset)

### "User not found" when logging in
- Make sure you ran `npm run db:seed`
- Check that the user was created in your database

## 📝 Next Steps

Once logged in, you can:
- View and manage bookings
- Create and edit articles
- Add videos
- Manage products
- View dashboard statistics

