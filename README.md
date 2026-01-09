# SmartSecurity Consult Website

A complete, production-ready professional website for SmartSecurity Consult - expert security services in Kenya. Built with Next.js 14+, TypeScript, Tailwind CSS, and PostgreSQL.

## Features

- **Landing Page**: Professional hero section, biography, quick links, and trust indicators
- **Blog/Articles**: Full-featured blog system with categories, search, and pagination
- **Videos**: YouTube integration with categories and filtering
- **E-Commerce Shop**: Product listings, shopping cart, and checkout
- **Booking System**: Consultation booking with calendar integration
- **Admin Dashboard**: Complete CRM with content management, analytics, and settings   

## Tech Stack

- **Framework**: Next.js 14+ (App Router)
- **Language**: TypeScript
- **Styling**: Tailwind CSS v4 with custom color palette
- **Database**: PostgreSQL with Prisma ORM
- **Authentication**: NextAuth.js with role-based access
- **Payment**: Stripe integration
- **Email**: Nodemailer for notifications
- **Forms**: React Hook Form with Zod validation

## Getting Started

### Prerequisites

- Node.js 18+ and npm
- PostgreSQL database
- Stripe account (for payments)
- Email service credentials (for notifications)

### Installation

1. Clone the repository:
```bash
git clone <repository-url>
cd shioso
```

2. Install dependencies:
```bash
npm install
```

3. Set up environment variables:
```bash
cp .env.example .env
```

Edit `.env` and fill in your configuration values.

4. Set up the database:
```bash
npx prisma generate
npx prisma migrate dev
```

5. Run the development server:
```bash
npm run dev
```

Open [http://localhost:3000](http://localhost:3000) in your browser.

## Project Structure

```
shioso/
├── app/                    # Next.js app directory
│   ├── api/               # API routes
│   ├── admin/             # Admin dashboard pages
│   ├── blog/              # Blog pages
│   ├── videos/            # Videos page
│   ├── shop/              # E-commerce pages
│   └── bookings/          # Booking pages
├── components/            # React components
│   ├── layout/           # Layout components
│   └── ui/               # UI components
├── lib/                   # Utility functions
├── prisma/               # Prisma schema and migrations
└── public/               # Static assets
```

## Color Palette

- **Primary**: Midnight Navy (#0A1A33), Cool Azure (#007CFF)
- **Secondary**: Deep Teal (#005B6E), Platinum Gray (#F3F4F6), Light Gray (#E5E7EB)
- **Typography**: Dark Charcoal (#1F2937), Graphite Gray (#2D3748), Slate Gray (#4A5768)

## Database Schema

The application uses Prisma ORM with the following main models:
- User (with role-based authentication)
- Article & Category (blog system)
- Video (media content)
- Product & Order (e-commerce)
- Booking & Service (consultation system)
- SiteSettings (configuration)

## Admin Access

Access the admin dashboard at `/admin/login`. Create an admin user through Prisma Studio or a seed script.

## Deployment

1. Set up environment variables on your hosting platform
2. Run database migrations: `npx prisma migrate deploy`
3. Build the application: `npm run build`
4. Start the production server: `npm start`

## License

Private - All rights reserved
