#1-Security
- NEVER expose secret keys on the client-side. `STRIPE_SECRET_KEY`, `RESEND_API_KEY`, and `SUPABASE_SERVICE_ROLE_KEY` must ONLY be used in Server Components, Server Actions, or Route Handlers.
   - All sensitive operations (payment processing, database writes, generating secure download links) MUST occur on the server.
   - ALWAYS validate Stripe webhook signatures using the `stripe.webhooks.constructEvent` method before processing the event.
   - ALL data received from the client (forms, API requests) MUST be validated using a Zod schema before being processed or saved to the database.

#2-Architecture-and-file-structure
- Strictly follow Next.js App Router conventions (`/app` directory, `page.tsx`, `layout.tsx`, `loading.tsx`, `error.tsx`).
   - Distinguish clearly between Server Components (default) and Client Components (`'use client'`). Fetch data in Server Components whenever possible.
   - Server-side logic should be implemented in **Server Actions** (`/actions.ts`) for form mutations, and **Route Handlers** (`/app/api/.../route.ts`) for webhooks or client-side fetch requests.
   - Place reusable utility functions and Supabase/Stripe client initializations in a `/lib` directory.
   - Organize components into `/components/ui` (for Shadcn components) and `/components/shared` (for application-wide components like Navbar) and `/components/features` (for feature-specific composite components).

   #3-Code-and-component-style
   - Language: **TypeScript**. Be strict with types. Avoid `any` wherever possible. Define clear types/interfaces for all data models (e.g., `Photo`, `Order`).
   - Components: Build small, single-responsibility components. Use Shadcn/UI as the base for all UI elements.
   - Styling: Use **Tailwind CSS**. ALWAYS use `clsx` for conditional classes and `tailwind-merge` to handle class conflicts, especially when extending Shadcn components. The `cn` utility from `/lib/utils.ts` must be used for this.
   - Forms: Use **React Hook Form** with the **Zod resolver** for all forms. This is non-negotiable.
   - Environment Variables: Use `.env.local`. All environment variables exposed to the browser MUST be prefixed with `NEXT_PUBLIC_`. All others should not have the prefix.

   #4-Data-handling
   - Database: Interact with Supabase using its JavaScript client. Leverage Supabase Row Level Security (RLS) as an additional layer of data protection.
   - Data Fetching: In Server Components, use native `fetch` with Next.js caching and revalidation tags (`next: { tags: [...] }`) for efficient data retrieval.
   - API Responses: Route Handlers should return `NextResponse` objects with appropriate status codes and typed JSON bodies.

   #5-Error-handling
- Use `try/catch` blocks for all async operations (API calls, DB queries).
   - Implement custom error pages using `error.tsx` in the App Router to provide a good user experience on failure.
   - For forms, provide clear, user-friendly error messages tied to specific fields.

   #6-Project-overview
   1. High-Level Goal
Build a web application for "Arode Studio" to sell photos to surf students in La Torche, Brittany. The core business is capturing students during their lessons and selling them high-quality digital and physical photos moments after they finish.

2. Core User Personas & Workflows

    A) The Customer (Surf Student):

        Goal: To easily find, view, and purchase photos of themselves from their surf session.

        Workflow:

            Scans a QR code or types a URL seen at the surf shop.

            Lands on a gallery page, likely filtered by date/time (e.g., .../gallery/2024-07-15-10am).

            Browses low-resolution, watermarked photos.

            Selects photos to purchase (as digital downloads or physical prints).

            Pays securely via a Stripe checkout.

            Instantly receives an email (via Resend) with secure, time-limited download links for their digital photos.

            Is notified when physical prints are ready for pickup.

    B) The Admin (Photographer):

        Goal: To quickly upload photos from a session and manage orders efficiently.

        Workflow:

           Logs into a secure /admin section of the website.

            He then uploads separately the original file with the high-quality photos. And in another file, he uploads the watermarked photos that will be available for the customers to see on the website. 

            There are therefore two separate upload buttons in the admin page. 


            Views a dashboard of all orders (digital and print).

3. Technical Architecture & Stack (The "Canon")

    Framework: Next.js 15 (with App Router).

    Language: TypeScript. Strict typing is mandatory. Avoid any.

    Hosting & CI/CD: Vercel.

    Database & Auth: Supabase (Postgres).

    File Storage: Amazon S3 (or Supabase Storage, which uses S3).

        originals bucket (Private, for purchased photos).

        web-previews bucket (Public, for watermarked gallery images).

    UI Library: React 19.

    Styling: Tailwind CSS.

    Component Toolkit: Shadcn/UI. Always use the cn utility function (/lib/utils.ts) for combining and overriding classes.

    Payments: Stripe. Use Stripe Checkout for simplicity and security.

    Form Management: React Hook Form + Zod for validation. This is the required pattern for all forms.

    Email: Resend for sending transactional emails (order confirmations, download links). Use React Email to build the templates.

    Analytics: Vercel Analytics & Speed Insights.

    Package Manager: pnpm.

4. CRITICAL RULES & GUIDELINES (NON-NEGOTIABLE)

    RULE #1: SECURITY IS THE HIGHEST PRIORITY.

        Secret Management: ALL secret keys (STRIPE_SECRET_KEY, SUPABASE_SERVICE_ROLE_KEY, RESEND_API_KEY, etc.) MUST ONLY be used on the server (in Server Actions, Route Handlers, or Server Components). They MUST NEVER be exposed to the client. Use .env.local and Vercel environment variables.

        Server Logic: All sensitive operations (creating a Stripe session, fulfilling an order, generating a pre-signed S3 URL, writing to the database) MUST be executed in Server Actions or API Route Handlers.

        Input Validation: Every piece of data received from the client (e.g., form submissions) MUST be validated with a Zod schema before processing.

        Webhook Verification: The Stripe webhook endpoint (/api/stripe-webhook) MUST verify the request signature to ensure it's from Stripe.

    RULE #2: ADHERE TO NEXT.JS APP ROUTER PATTERNS.

        Component Types: Default to Server Components for data fetching and server-side rendering. Use the 'use client' directive only when interactivity is required (e.g., forms, buttons with onClick handlers).

        Data Fetching: Fetch data in Server Components where possible. Use Next.js caching and revalidateTag for cache invalidation (e.g., revalidate a gallery page after new photos are uploaded).

        Structure: Use page.tsx, layout.tsx, loading.tsx, and error.tsx files as intended by the framework.

    RULE #3: DATABASE SCHEMA & INTERACTION

        Use the Supabase JS client for all database interactions.

        The database structure is relational. Key tables include:

            galleries: (id, name, date)

            photos: (id, gallery_id, original_s3_key, preview_s3_url)

            orders: (id, customer_email, stripe_checkout_id, status)

            order_items: (id, order_id, photo_id, product_type, price)

        Leverage Supabase Row Level Security (RLS) for data access control as a second layer of defense.