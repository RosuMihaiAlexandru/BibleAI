This is a [Next.js](https://nextjs.org) project bootstrapped with [`create-next-app`](https://nextjs.org/docs/app/api-reference/create-next-app).

## Getting Started

Add .env file add the following
KINDE_CLIENT_ID=8cb4cf1c2e184809842865a563501222
KINDE_CLIENT_SECRET=z9eKIInw2j38B3J7eJ95e9qwub223pmulU1Z281r3OalpZLMeG
KINDE_ISSUER_URL=https://genbibleaiapp.kinde.com
KINDE_SITE_URL=http://localhost:3000
KINDE_POST_LOGOUT_REDIRECT_URL=http://localhost:3000
KINDE_POST_LOGIN_REDIRECT_URL=http://localhost:3000/api/auth/creation
DATABASE_URL="postgresql://postgres.khnpedqeammyuawlujoh:Samasams16!@aws-0-eu-west-2.pooler.supabase.com:6543/postgres?pgbouncer=true&connection_limit=1" # Set this to the Transaction connection pooler string you copied in Step 1
DIRECT_URL="postgresql://postgres.khnpedqeammyuawlujoh:Samasams16!@aws-0-eu-west-2.pooler.supabase.com:5432/postgres"  # Set this to the Session connection pooler string you copied in Step 1
UPLOADTHING_SECRET='sk_live_d6e2c67866c3ff5a49e738f4e31d9d70ae0ff288434038d8843d545b0bc06df1'
UPLOADTHING_APP_ID='q3qrirkijv'

First, run the development server:

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

This project uses [`next/font`](https://nextjs.org/docs/app/building-your-application/optimizing/fonts) to automatically optimize and load Inter, a custom Google Font.

## Learn More

To learn more about Next.js, take a look at the following resources:

- [Next.js Documentation](https://nextjs.org/docs) - learn about Next.js features and API.
- [Learn Next.js](https://nextjs.org/learn) - an interactive Next.js tutorial.

You can check out [the Next.js GitHub repository](https://github.com/vercel/next.js) - your feedback and contributions are welcome!

## Deploy on Vercel

The easiest way to deploy your Next.js app is to use the [Vercel Platform](https://vercel.com/new?utm_medium=default-template&filter=next.js&utm_source=create-next-app&utm_campaign=create-next-app-readme) from the creators of Next.js.

Check out our [Next.js deployment documentation](https://nextjs.org/docs/app/building-your-application/deploying) for more details.
