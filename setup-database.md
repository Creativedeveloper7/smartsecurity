# Database Setup Guide

## Step 1: Get Your Supabase Database Connection String

1. Go to your Supabase project: https://supabase.com/dashboard/project/tmhtljxhmtkrwpmyneal
2. Navigate to **Settings** → **Database**
3. Find the **Connection string** section
4. Copy the **URI** connection string (it looks like: `postgresql://postgres:[YOUR-PASSWORD]@db.tmhtljxhmtkrwpmyneal.supabase.co:5432/postgres`)

## Step 2: Update Your .env File

Add these variables to your `.env` file:

```env
# Supabase Database Connection
DATABASE_URL="postgresql://postgres:[YOUR-PASSWORD]@db.tmhtljxhmtkrwpmyneal.supabase.co:5432/postgres?pgbouncer=true&connection_limit=1"

# NextAuth Configuration
NEXTAUTH_URL="http://localhost:3000"
NEXTAUTH_SECRET="your-secret-key-here-generate-with-openssl-rand-base64-32"

# Supabase (already in your .env)
VITE_SUPABASE_URL=https://tmhtljxhmtkrwpmyneal.supabase.co
VITE_SUPABASE__KEY=ETKFc0bKfd6puxzdPbH35w_h8OLVLBl
```

**Important**: Replace `[YOUR-PASSWORD]` with your actual Supabase database password.

## Step 3: Generate NextAuth Secret

Run this command to generate a secure secret:

```bash
openssl rand -base64 32
```

Copy the output and use it as your `NEXTAUTH_SECRET` value.

## Step 4: Run Database Migrations

After updating `.env`, run:

```bash
npm run db:migrate
```

This will create all the database tables.

## Step 5: Seed the Database

Create the admin user and sample data:

```bash
npm run db:seed
```

## Step 6: Log In to Admin Dashboard

1. Go to: http://localhost:3000/admin/login
2. Email: `admin@example.com`
3. Password: Any password (authentication is disabled for development)

## Alternative: Use Supabase Connection Pooling

For better performance, use the connection pooling URL:

```env
DATABASE_URL="postgresql://postgres.[PROJECT-REF]:[YOUR-PASSWORD]@aws-0-[REGION].pooler.supabase.com:6543/postgres?pgbouncer=true"
```

Check your Supabase dashboard for the exact pooling URL.

