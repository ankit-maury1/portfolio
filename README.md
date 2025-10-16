# Portfolio Website

This is a personal portfolio website built with Next.js, TypeScript, and MongoDB.

## Getting Started

First, set up your environment variables:

```bash
# Copy the example environment file
cp .env.example .env.local

# Edit .env.local and add your credentials
# - MONGODB_URI: Your MongoDB connection string
# - AUTH_SECRET: Generate with: openssl rand -base64 32
```

Make sure you have MongoDB set up. This project uses MongoDB Atlas.

Then, seed the MongoDB database with initial data:

```bash
# On Windows
.\seed-mongodb.ps1

# On Linux/Mac
MONGODB_URI=your_mongodb_uri node scripts/seed-mongodb.js
```

Finally, run the development server:

```bash
npm run dev
# or
yarn dev
# or
pnpm dev
# or
bun dev
```

Open [http://localhost:3000](http://localhost:3000) with your browser to see the result.

You can start editing the page by modifying `app/page.tsx`. The page auto-updates as you edit the file.

This project uses [`next/font`](https://nextjs.org/docs/app/building-your-application/optimizing/fonts) to automatically optimize and load [Geist](https://vercel.com/font), a new font family for Vercel.

## Learn More

To learn more about Next.js, take a look at the following resources:

- [Next.js Documentation](https://nextjs.org/docs) - learn about Next.js features and API.
- [Learn Next.js](https://nextjs.org/learn) - an interactive Next.js tutorial.

You can check out [the Next.js GitHub repository](https://github.com/vercel/next.js) - your feedback and contributions are welcome!

## Deploy on Vercel

The easiest way to deploy your Next.js app is to use the [Vercel Platform](https://vercel.com/new?utm_medium=default-template&filter=next.js&utm_source=create-next-app&utm_campaign=create-next-app-readme) from the creators of Next.js.

### Deployment Steps

1. **Prepare Environment Variables**
   - Copy `.env.example` to `.env.local` for local development
   - In Vercel dashboard, add the following environment variables:
     - `MONGODB_URI` - Your MongoDB connection string
     - `AUTH_SECRET` - Generate with `openssl rand -base64 32`

2. **Deploy**
   - Connect your GitHub repository to Vercel
   - Vercel will automatically detect Next.js and configure build settings
   - Click "Deploy" and wait for the build to complete

3. **Verify**
   - Visit your deployed site
   - Test authentication and database connectivity

For detailed information about recent deployment fixes, see [DEPLOYMENT_FIXES.md](./DEPLOYMENT_FIXES.md).

Check out our [Next.js deployment documentation](https://nextjs.org/docs/app/building-your-application/deploying) for more details.
