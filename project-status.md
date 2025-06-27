# Arode Studio - Project Status Board

**Last Updated:** {{ CURRENT_DATE }}
**Current Focus:** {{ AI, please state the task you are currently working on }}

---

### 📝 To Do

#### Phase 1: Foundation & Core Backend
- [ ] **[BE]** Build the photo upload Server Action:
    - [ ] Takes files and a gallery name as input.
    - [ ] Uploads original image to a **private** S3/Supabase storage bucket.
    - [ ] Resizes and watermarks the image for a web preview.
    - [ ] Uploads the preview to a **public** storage bucket.
    - [ ] Writes photo metadata (URLs, gallery link) to the `photos` table.
- [ ] **[BE]** Create the Stripe webhook Route Handler (`/api/stripe-webhook`):
    - [ ] Verifies the Stripe signature.
    - [ ] Handles the `checkout.session.completed` event.
    - [ ] Writes order data to the `orders` and `order_items` tables.
- [ ] **[BE]** Create the order fulfillment logic triggered by the webhook:
    - [ ] Generates pre-signed S3 URLs for purchased photos.
    - [ ] Uses Resend and React Email to send the download links to the customer.

#### Phase 2: Customer Frontend
- [ ] **[FE]** Build the main gallery page (`/gallery/[slug]`) that fetches and displays watermarked photos from a specific gallery.
- [ ] **[FE]** Implement the shopping cart logic (client-side state management).
- [ ] **[FE]** Create a Server Action to generate a Stripe Checkout session based on the cart contents.
- [ ] **[FE]** Build the UI for the cart and checkout button.
- [ ] **[FE]** Create the "Order Success" and "Order Canceled" pages.
- [ ] **[FE]** Design and build the main landing page.

#### Phase 3: In-Shop Experience & Polish
- [ ] **[FE]** Create the full-screen TV slideshow page (`/tv-display`) that shows the latest gallery.
- [ ] **[FE]** Create the iPad Kiosk view (`/kiosk`) with a touch-friendly UI for photo selection.
- [ ] **[FE]** Implement basic animations with Framer Motion for a smoother UX.
- [ ] **[FE]** Ensure the entire site is responsive and looks great on mobile.

---

### ⏳ In Progress

- *(Move tasks from "To Do" to here when you start working on them)*

---

### ✅ Done

- [✅] **[Setup]** Initialize Next.js 15 project with TypeScript, Tailwind, and Shadcn/UI.
- [✅] **[Setup]** Install all dependencies: pnpm, Supabase, Stripe, React Hook Form, Zod, Resend, Framer Motion.
- [✅] **[Ops]** Set up Vercel project and link to GitHub repository.
- [✅] **[Ops]** Configure `.env.local` with placeholder keys for Supabase, Stripe, and Resend.
- [✅] **[Ops]** Set up Vercel project and link to GitHub repository.
- [✅] **[BE]** Design and create initial Supabase database tables: `galleries`, `photos`, `orders`, `order_items` using SQL schema.
- [✅] **[BE]** Create a secure admin page (`/admin/upload`) protected by Supabase Auth.

- [✅] **[BE]** Build the photo upload Server Action:
    - [✅] Takes files and a gallery name as input.
    - [✅] Uploads original image to a **private** S3/Supabase storage bucket.
    - [ ✅] Resizes and watermarks the image for a web preview.
    - [ ] Uploads the preview to a **public** storage bucket.
    - [ ] Writes photo metadata (URLs, gallery link) to the `photos` table.
