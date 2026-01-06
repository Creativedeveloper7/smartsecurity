# Quick Start Guide

## Prerequisites

- Node.js 18+ installed
- PostgreSQL database (local or cloud)
- npm or yarn package manager

## Step 1: Install Dependencies

```bash
npm install
```

## Step 2: Set Up Environment Variables

1. Copy the example environment file:
```bash
cp .env.example .env
```

2. Edit `.env` and configure:
   - `DATABASE_URL`: Your PostgreSQL connection string
   - `NEXTAUTH_SECRET`: Generate with `openssl rand -base64 32`
   - `NEXTAUTH_URL`: Your app URL (http://localhost:3000 for dev)
   - Stripe keys (if using payments)
   - Email credentials (if using notifications)

## Step 3: Set Up Database

1. Generate Prisma Client:
```bash
npm run db:generate
```

2. Run migrations:
```bash
npm run db:migrate
```

3. Seed the database (optional):
```bash
npm run db:seed
```

This creates:
- An admin user (email: `admin@example.com`)
- Sample categories
- Sample services
- Site settings

## Step 4: Start Development Server

```bash
npm run dev
```

Open [http://localhost:3000](http://localhost:3000) in your browser.

## Step 5: Access Admin Dashboard

1. Navigate to `/admin/login`
2. Use the admin credentials (you'll need to set up password authentication)
3. Access the dashboard at `/admin`

## Creating Your First Admin User

Since password authentication needs to be configured, you can create an admin user via Prisma Studio:

```bash
npm run db:studio
```

Or use a database client to insert a user directly.

## Next Steps

1. **Add Content**:
   - Create articles via admin panel
   - Add videos
   - Add products to shop
   - Configure services

2. **Customize**:
   - Update site settings
   - Add your logo and branding
   - Customize colors if needed

3. **Test Features**:
   - Test blog functionality
   - Test booking system
   - Test shop (when Stripe is configured)

## Troubleshooting

### Database Connection Issues
- Verify `DATABASE_URL` is correct
- Ensure PostgreSQL is running
- Check database credentials

### Authentication Issues
- Verify `NEXTAUTH_SECRET` is set
- Check `NEXTAUTH_URL` matches your app URL
- Ensure Prisma Client is generated

### Build Errors
- Run `npm run db:generate` before building
- Clear `.next` folder and rebuild
- Check TypeScript errors

## Production Deployment

1. Set all environment variables in your hosting platform
2. Run `npm run build` to test the build
3. Run `npm run db:migrate` to apply migrations
4. Deploy to your hosting platform (Vercel, Netlify, etc.)

## Support

For issues or questions, refer to:
- `README.md` for detailed documentation
- `PROJECT_SUMMARY.md` for feature overview
- Prisma docs: https://www.prisma.io/docs
- Next.js docs: https://nextjs.org/docs

