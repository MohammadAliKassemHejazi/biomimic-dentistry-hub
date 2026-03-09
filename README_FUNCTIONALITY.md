# Biomimetic Dentistry Club - Technical and Functional Documentation

This document serves as a comprehensive guide to the Biomimetic Dentistry Club application, providing both functional descriptions and technical implementation details (state management, API integrations, hooks) for each page and component.

## Architecture Overview
- **Frontend Framework:** Next.js (App Router)
- **Styling:** Tailwind CSS, `lucide-react` for icons
- **State Management:** React Hooks (`useState`, `useEffect`), Custom Hooks (e.g., `useAuth`, `useSubscription`)
- **API Interactions:** Centralized via `client/src/lib/api.ts` which handles automatic `FormData` payload detection for file uploads.
- **Authentication:** Custom JWT-based authentication interacting with the Express/Sequelize backend. Responses contain `{ user, session }`.
- **Role-Based Access Control:** Routes and UI elements are conditionally rendered based on `user.role` (`bronze`, `silver`, `gold`, `admin`) and the `is_ambassador` boolean flag.

---

## Global Navigation (`client/src/components/Navigation.tsx`)
**Implementation:**
- Fixed navigation bar at the top of the screen.
- Dynamically renders links based on the `user` object retrieved from the `useAuth` hook.
- Requires pages beneath it to have top padding (e.g., `pt-20` or `pt-24`) to prevent content overlap.

---

## Page-by-Page Technical Breakdown

### 1. Home Page (`/`)
- **Purpose:** Landing page highlighting sponsors, VIPs, and a call-to-action.
- **Components Used:** `HeroSection`, `SponsorsSection`, `VIPSection`, `Footer`.
- **Technical Detail:** `VIPSection.tsx` and `SponsorsSection.tsx` are marked as `"use client"` to manage states for image loading. They implement a fallback mechanism that assigns an emoji based on the member's title if no image URL is provided.

### 2. Login Page (`/login`)
- **Purpose:** User authentication.
- **State:**
  - `email` (string): User input for email.
  - `password` (string): User input for password.
  - `loading` (boolean): Disables the submit button while the API request is in flight.
- **Hooks:** `useAuth` (provides the `login` function).
- **Action:**
  - **`Sign In`**: Calls the backend authentication endpoint (`/auth/login`).

### 3. Signup Page (`/signup`)
- **Purpose:** User registration.
- **State:** `loading` (boolean).
- **Hooks:** `useAuth`, `useToast`.
- **Action:**
  - **`Sign Up`**: Submits a `FormData` object with user details (email, password, first/last name, specialty, country) to `/auth/register`. Custom backend validation (`validation.ts`) sanitizes the input.

### 4. Dashboard (`/dashboard`)
- **Purpose:** Central user hub displaying profile, tier, and application status.
- **State:**
  - `recentActivity`: Tracks the user's latest interactions.
  - `openAppDialog` (boolean): Controls the Ambassador Application modal.
  - `appData` (object): Collects `FormData` inputs (`country`, `experience`, `bio`, `social_media_links`, `cv`).
  - `appLoading` (boolean): Submission state.
- **Hooks:** `useAuth`, `useSubscription`, `useRouter`, `useToast`.
- **API Interactions:**
  - `POST /ambassador/apply`: Submits the ambassador application as `FormData` (handles CV file upload).
- **Actions:**
  - **`Apply Now` / `Submit Application`**: Submits the `appData` state to the backend. Approval adds the `AmbassadorProfile` to the user.

### 5. Admin Dashboard (`/admin`)
- **Purpose:** Full administrative control panel for content, users, and settings.
- **State:**
  - Lists for: `users`, `applications`, `pendingContent`, `partners`, `members`, `plans`.
  - `partnershipKitUrl` (string | null): URL to the site-wide partnership document.
  - Dialog toggles: `partnerDialogOpen`, `memberDialogOpen`, `planDialogOpen`, `resourceDialogOpen`.
  - `editingItem`: Holds the current object being created/edited in a modal.
- **Hooks:** `useAuth`, `useToast`.
- **API Interactions:**
  - Data Fetching: `GET` requests to `/admin/users`, `/admin/applications`, `/admin/content/pending`, `/partners`, `/leadership`, `/plans`, `/admin/settings/partnership-kit`.
  - Content Management: `POST` / `PUT` / `DELETE` for `partners`, `leadership`, `resources`.
  - Approvals: `PATCH /admin/applications/:id/status` (approved/rejected).
  - Utility: `POST /plans/seed` (creates default Stripe tiers), `POST /admin/settings/partnership-kit` (uploads PDF).
- **Technical Note:** All dialog forms manually construct `FormData` payloads and bypass libraries like `react-hook-form`. Array fields (e.g., tags) are passed as comma-separated strings to be handled by the backend.

### 6. Resources Library (`/resources`)
- **Purpose:** Gated document and file library.
- **State:**
  - `searchTerm` (string): For filtering resources.
  - `selectedCategory` (string, default: 'all'): Category filter.
- **Hooks:** `useResources`, `useAuth`, `useToast`, `useRouter`.
- **Logic:** Compares the resource's `access_level` against the user's current role (`useAuth().user.role`) to enable/disable the download button.

### 7. Submit Resource (`/resources/submit`)
- **Purpose:** Ambassador/Admin form to upload new resources.
- **State:**
  - `file` (File | null): Stores the selected file.
  - `loading` (boolean): Controls submission state.
- **Hooks:** `useAuth`, `useToast`, `useRouter`.
- **API Interactions:**
  - `POST /resources`: Sends a `FormData` payload containing the `file` and metadata. Note: Ambassador submissions default to `PENDING` status on the backend, while Admin submissions are `APPROVED`.

### 8. Blog List (`/blog`)
- **Purpose:** Displays published blog posts.
- **State:**
  - `searchTerm` (string): Filters posts by title.
  - `selectedCategory` (string | null): Filters posts by category.
- **Hooks:** `useBlogPosts`, `useAuth`.

### 9. Create Blog Post (`/blog/create`)
- **Purpose:** Drafting new blog posts (Ambassadors/Admins only).
- **State:**
  - `file` (File | null): For the `featured_image`.
  - `loading` (boolean).
- **Hooks:** `useAuth`, `useToast`, `useRouter`.
- **API Interactions:**
  - `POST /blog/posts`: Sends `FormData` including the title, content, tags, category, and `file`.

### 10. Blog Post Detail (`/blog/[slug]`)
- **Purpose:** Renders full article and handles engagement.
- **State:**
  - `post` (object): Fetched article data.
  - `loading` (boolean).
  - `favorited` (boolean): Tracks if the current user has favorited the post.
  - `viewRecorded` (boolean): Ensures a view is only counted once per session.
- **Hooks:** `useAuth`, `useToast`, `useParams`.

### 11. Subscription & Billing (`/subscription`)
- **Purpose:** Handles tier upgrades via Stripe.
- **State:**
  - `subscriptionTiers` (array): Fetches available plans from the backend.
  - `loadingAction` (string | null): Tracks which specific tier's checkout session is being initialized.
- **Hooks:** `useSubscription`, `useAuth`, `useToast`.
- **Actions:**
  - **`Get Plan`**: Initiates a Stripe Checkout Session via the backend integration (`STRIPE_SECRET_KEY` required).
  - **`Manage Billing`**: Redirects to the Stripe Customer Portal.

### 12. Ambassador Portal (`/ambassador`)
- **Purpose:** Landing page for approved ambassadors.
- **Hooks:** `useAuth`.
- **Routing:** Contains links to `/blog/create` and `/resources/submit`.

### 13. Courses (`/courses`)
- **Purpose:** Course catalog.
- **State:**
  - `notifyEmails` (object): Tracks the email input state for specific course waitlists (e.g., `{ courseId: emailString }`).
- **Hooks:** `useCourses`, `useAuth`, `useRouter`, `useToast`.
- **Actions:**
  - **`Notify Me`**: Registers interest for unavailable courses.

### 14. Tier-Exclusive Pages (`/bronze`, `/silver`, `/vip`)
- **Purpose:** Protected content areas.
- **Technical Detail:** These routes perform client-side or middleware validation to ensure the user's role array/string includes the required tier before rendering the premium content.

### 15. Other Informational Pages
- **`/about`**: Uses `useState` for static `team` array management.
- **`/partnership`**: Static informational page with mailto/contact links.
- **`/contact`**: Uses `useState` for `loading` state when submitting the contact form.

---
**Note:** All frontend file paths to images and resources uploaded by users are dynamically constructed by prepending the backend `NEXT_PUBLIC_API_URL` (minus the `/api` path) to ensure correct static file serving from the Express `public/uploads` directory.
