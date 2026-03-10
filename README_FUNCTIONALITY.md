# Biomimetic Dentistry Club - Exhaustive Application & Functionality Documentation

Welcome to the definitive, exhaustive documentation for the **Biomimetic Dentistry Club** application. This document leaves no stone unturned. It describes every single page, every navigation element, every button, the exact user flows, and the underlying technical logic (states, hooks, API calls) that power the platform.

---

## Table of Contents
1. [Global Architecture & Technology Stack](#global-architecture--technology-stack)
2. [Role-Based Access Control (RBAC)](#role-based-access-control-rbac)
3. [Global Navigation (`Navigation.tsx`)](#global-navigation)
4. [Page-by-Page Exhaustive Breakdown](#page-by-page-exhaustive-breakdown)
   - [Public Pages](#public-pages)
   - [Authentication Pages](#authentication-pages)
   - [User Dashboard & Account](#user-dashboard--account)
   - [Content Library & Education](#content-library--education)
   - [Admin Control Center](#admin-control-center)

---

## Global Architecture & Technology Stack
- **Frontend Environment:** Next.js (App Router paradigm), React 18.
- **Styling:** Tailwind CSS combined with Radix UI primitives and `lucide-react` for consistent, accessible iconography.
- **State Management:** React local state (`useState`, `useReducer`), Context API, and custom hooks (`useAuth`, `useSubscription`, `useResources`, etc.) for managing global user states.
- **API Communication:** A centralized Axios-like utility located at `client/src/lib/api.ts`. It intelligently detects `FormData` payloads to seamlessly handle file uploads (e.g., CVs, PDFs, Images) without requiring manual `Content-Type: multipart/form-data` headers.
- **Backend:** Express.js with TypeScript and Sequelize ORM connecting to a PostgreSQL database.

---

## Role-Based Access Control (RBAC)
The application strictly governs what a user can see and do based on their assigned role and flags:
- **Public / Unauthenticated:** Can view Home, About, Contact, Partnership, Courses (read-only), and Blog (read-only).
- **Authenticated (Base User):** Gains access to `/dashboard`, the ability to apply for Ambassador status, and manage their `/subscription`.
- **Bronze VIP (`bronze`):** Unlocks the `/bronze` exclusive content area.
- **Silver VIP (`silver`):** Unlocks both `/bronze` and `/silver` exclusive content areas.
- **Gold VIP (`gold` / `vip`):** The highest paid tier. Unlocks all VIP areas (`/bronze`, `/silver`, `/vip`).
- **Ambassador:** A special add-on flag (`is_ambassador: true`). Grants access to `/ambassador`, allowing the user to draft Blog Posts (`/blog/create`) and submit Resources (`/resources/submit`).
- **Admin (`admin`):** Superuser access. Has full CRUD capabilities over all system data via the `/admin` dashboard.

---

## Global Navigation
**File Path:** `client/src/components/Navigation.tsx`

The navigation bar is a sticky/fixed header that persists across the entire application. It conditionally renders links and buttons based on the user's authentication state and RBAC profile.

### Visual Layout
- **Left Side:** The organization Logo (clickable, routes to `/`).
- **Center:** Main public routing links.
- **Right Side:** Authentication controls, User Avatar/Dropdown menu.
- **Mobile:** A hamburger menu (`lucide-react` Menu icon) that expands to show a vertical list of links.

### Links & Buttons in the Navigation Bar:
- **`Home` Link:** Routes to `/`. Always visible.
- **`About` Link:** Routes to `/about`. Always visible.
- **`Resources` Link:** Routes to `/resources`. Always visible, but internal resource downloads are gated.
- **`Blog` Link:** Routes to `/blog`. Always visible.
- **`Courses` Link:** Routes to `/courses`. Always visible.
- **`Partnership` Link:** Routes to `/partnership`. Always visible.
- **`Contact` Link:** Routes to `/contact`. Always visible.

### Conditional Navigation Elements (Role-Dependent):
- **If User is `bronze`, `silver`, `gold`, or `admin`:**
  - **`Bronze VIP` Link:** Routes to `/bronze`.
- **If User is `silver`, `gold`, or `admin`:**
  - **`Silver VIP` Link:** Routes to `/silver`.
- **If User is `gold` or `admin`:**
  - **`VIP Area` Link:** Routes to `/vip`.
- **If User has `is_ambassador: true` or is `admin`:**
  - **`Ambassador` Link:** Routes to `/ambassador`.

### User Menu / Authentication Controls:
- **If Unauthenticated:**
  - **`Sign In` Button (Ghost variant):** Routes to `/login`.
  - **`Sign Up` Button (Solid variant):** Routes to `/signup`.
- **If Authenticated:**
  - Displays a **User Avatar Menu** (using standard UI Dropdown components).
  - Clicking the Avatar opens a dropdown with:
    - **`Dashboard` Button:** Routes to `/dashboard`.
    - **`Subscription` Button:** Routes to `/subscription`.
    - *(If Ambassador)* **`Ambassador Portal` Button:** Routes to `/ambassador`.
    - *(If Admin)* **`Admin Dashboard` Button:** Routes to `/admin`.
    - **`Sign Out` Button:** Triggers the `logout()` function from the `useAuth` hook, clears local storage/cookies, and redirects to `/login`.

---

## Page-by-Page Exhaustive Breakdown

### Public Pages

#### 1. Home Page (`/`)
- **Visual Description:** A bold, engaging landing page designed to convert visitors into members.
- **Components:**
  - **`HeroSection`:** The top fold. Contains a large headline, subheadline, and primary Call-to-Action (CTA) buttons (likely "Join Now" or "Explore").
  - **`SponsorsSection`:** A horizontal, potentially scrolling carousel of logos from trusted partners. *Technical:* Uses `"use client"` to manage the loading state of images. If a partner logo fails to load or is missing, it falls back to an automatically generated text/emoji representation.
  - **`VIPSection`:** Showcases the Leadership Members or top-tier members. *Technical:* Similar to Sponsors, handles missing images gracefully.
  - **`Footer`:** Standard footer with links to terms, privacy policy, and social media icons.
- **Interactions:** Clicking CTA buttons in the Hero section typically routes to `/signup` or `/subscription`.

#### 2. About Us (`/about`)
- **Visual Description:** Tells the story of the Biomimetic Dentistry Club. Contains text blocks explaining the mission and vision, followed by a grid of team members.
- **State/Logic:** Uses `useState` to manage a `team` array (either static or fetched) to map out team member cards.
- **Buttons & Actions:**
  - **`Explore Courses` Button:** Routes the user to `/courses` to view educational material.
  - **`Become an Ambassador` Button:** Routes the user to `/ambassador` (or `/dashboard` if they need to apply).

#### 3. Partnership (`/partnership`)
- **Visual Description:** Dedicated to B2B relations. Explains the benefits of becoming a trusted partner or sponsor.
- **Buttons & Actions:**
  - **`Become a Partner` Button:** Opens an email draft or scrolls to a specific contact form section.
  - **`Contact Our Team` Button:** Routes to the `/contact` page.
- **Admin Note:** The Partnership Kit PDF downloaded from this page is managed via the `/admin` dashboard.

#### 4. Contact Us (`/contact`)
- **Visual Description:** A standard contact form with fields for Name, Email, Subject, and Message.
- **State/Logic:**
  - `loading` (boolean): Disables the submit button while sending.
- **Buttons & Actions:**
  - **`Send Message` Button:** When clicked, validates the form fields. If valid, triggers an API call (`POST /contact` or similar) with the payload. Shows a loading spinner during the request. Upon success, triggers a `toast` notification ("Message sent successfully!").

---

### Authentication Pages

#### 5. Login (`/login`)
- **Visual Description:** A clean, centered card containing the login form.
- **State/Logic:**
  - `email` (string): Bound to the Email input field.
  - `password` (string): Bound to the Password input field.
  - `loading` (boolean): Controls the UI state of the submit button.
- **Hooks:** `useAuth`
- **Buttons & Actions:**
  - **`Sign In` Button:** Triggers the `login(email, password)` function. If the API returns a 401 (Unauthorized), a red toast error appears. If successful, stores the JWT and user object, then redirects to `/dashboard`.
  - **`Don't have an account? Sign up` Link:** Text link routing to `/signup`.

#### 6. Registration (`/signup`)
- **Visual Description:** A longer form requiring detailed user information to tailor the experience.
- **State/Logic:**
  - `loading` (boolean): Controls UI state.
  - Uses native form submission (`onSubmit` event handler attached to the `<form>` element).
- **Buttons & Actions:**
  - **`Sign Up` Button:** Packages the form inputs (`email`, `password`, `first_name`, `last_name`, `specialty`, `country`) into a `FormData` or JSON object. Sends a `POST /auth/register` request. Upon success, logs the user in automatically and redirects.
  - **`Login` Link:** Text link routing to `/login` for existing users.

---

### User Dashboard & Account

#### 7. User Dashboard (`/dashboard`)
- **Visual Description:** The personalized control center for logged-in users. Displays a welcome message ("Welcome back, [First Name]!"), current subscription tier prominently (e.g., a shiny Gold badge), and a grid of quick-action cards.
- **State/Logic:**
  - `openAppDialog` (boolean): Toggles the visibility of the "Apply for Ambassador" modal window.
  - `appData` (object): A state object capturing the inputs from the ambassador application form (`country`, `experience`, `bio`, `social_media_links`, `cv`).
  - `appLoading` (boolean): Controls the loading state of the application submission button.
  - `recentActivity` (array): Fetches and displays the user's latest actions (e.g., "Favorited a post", "Downloaded a resource").
- **Hooks:** `useAuth` (to get user data), `useSubscription` (to get tier details), `useRouter`.
- **Buttons & Actions:**
  - **`Upgrade Plan` / `View Plans` Button:** Routes the user directly to `/subscription`.
  - **`Resource Library` Button:** Quick link routing to `/resources`.
  - **`Browse Courses` Button:** Quick link routing to `/courses`.
  - **`Get Support` Button:** Quick link routing to `/contact`.
  - **`Apply Now` Button:** Opens the `openAppDialog` modal.
  - **`Submit Application` Button (Inside Modal):** Takes the `appData` state, constructs a `FormData` object (crucial for attaching the `cv` file), and calls `POST /ambassador/apply`. Shows a success toast and closes the modal on completion.

#### 8. Subscription & Billing (`/subscription`)
- **Visual Description:** A pricing table layout showcasing the available tiers (Bronze, Silver, Gold).
- **State/Logic:**
  - `subscriptionTiers` (array): Fetches the pricing, features, and `stripe_price_id` for each tier from the backend (`GET /plans`).
  - `loadingAction` (string | null): Stores the `stripe_price_id` of the button currently being clicked to show a targeted loading spinner without disabling the whole page.
- **Hooks:** `useSubscription`.
- **Buttons & Actions:**
  - **`Get Plan` / `Upgrade` Button (per tier):**
    - *Logic:* Calls the backend endpoint to generate a Stripe Checkout Session URL using the specific `stripe_price_id`.
    - *Action:* Redirects the browser entirely to `checkout.stripe.com`.
  - **`Manage Billing` Button:**
    - *Visibility:* Only visible to users who already have an active subscription.
    - *Logic:* Calls the backend to generate a Stripe Customer Portal session URL.
    - *Action:* Redirects to the Stripe portal where users can update credit cards or cancel.
  - **`Contact our team` Button:** For enterprise or custom inquiries, routes to `/contact`.

---

### Content Library & Education

#### 9. Resources Library (`/resources`)
- **Visual Description:** A searchable, filterable grid or list of downloadable documents, PDFs, and videos. Each resource card shows a title, description, category, and a required access badge.
- **State/Logic:**
  - `searchTerm` (string): Real-time text filtering of the resources array.
  - `selectedCategory` (string): Dropdown/pill filter for categories.
- **Hooks:** `useResources` (fetches the list from `GET /resources`), `useAuth` (to determine user's current tier).
- **Buttons & Actions:**
  - **`Download` Button:**
    - *Logic:* Evaluates `canAccessResource(resource)`. If the user's role weight (e.g., Bronze=1, Silver=2, Gold=3) is greater than or equal to the resource's required tier weight, the button is active.
    - *Action:* Triggers the file download.
  - **`Upgrade Required` Button:**
    - *Logic:* Rendered if `canAccessResource` is false. Disabled stylistically.
    - *Action:* Clicking it routes the user to `/subscription` to upsell them.

#### 10. Courses Catalog (`/courses`)
- **Visual Description:** A showcase of educational programs. Shows course title, instructor, price, and status (e.g., "Available", "Coming Soon").
- **State/Logic:**
  - `notifyEmails` (object mapping `{ courseId: emailString }`): Keeps track of the email input for "Coming Soon" courses independently.
- **Buttons & Actions:**
  - **`Enroll Now - $[Price]` Button:** For active courses. Routes to a checkout flow or Stripe session.
  - **`Notify Me` Button:** For upcoming courses. Takes the email from `notifyEmails[course.id]` and submits it to a backend waitlist endpoint. Shows a success toast upon completion.

#### 11. Blog List (`/blog`)
- **Visual Description:** Standard blog layout. Featured post at the top, grid of older posts below. Sidebar with category filters.
- **State/Logic:**
  - `searchTerm` (string)
  - `selectedCategory` (string | null)
- **Buttons & Actions:**
  - **Category Filter Pills (e.g., `All Categories`, `Clinical Tips`):** Updates the `selectedCategory` state, instantly filtering the visible posts.
  - **`Create Post` Button:** *Visibility:* Only renders if `user.is_ambassador === true` or `user.role === 'admin'`. *Action:* Routes to `/blog/create`.
  - **Post Cards (Links):** Entire card is usually wrapped in a `<Link>` routing to `/blog/[slug]`.

#### 12. Blog Post Detail (`/blog/[slug]`)
- **Visual Description:** Long-form article reading view. Shows author info, publish date, hero image, and rich text content.
- **State/Logic:**
  - `post` (object): Fetched via `GET /blog/posts/:slug`.
  - `favorited` (boolean): Checks if the post ID exists in the user's favorites array.
  - `viewRecorded` (boolean): `useEffect` runs once on mount. If `false`, calls a backend endpoint to increment the view count, then sets to `true` to prevent duplicate counting during React re-renders.
- **Hooks:** `useParams` (to extract the `slug` from the URL).
- **Buttons & Actions:**
  - **`Favorite` / `Favorited` Button:** Toggles the state. Sends a `POST` or `DELETE` to `/blog/posts/:id/favorite`. Updates UI instantly (optimistic update).
  - **`Share` Button:** Opens the native Web Share API (if supported) or copies the current `window.location.href` to the clipboard with a "Link copied!" toast.

#### 13. VIP Tier Pages (`/bronze`, `/silver`, `/vip`)
- **Visual Description:** Highly exclusive content areas. Often contain embedded premium video players, exclusive download links, or private community chat widgets.
- **Logic:** Protected entirely by Next.js middleware or a higher-order component checking `user.role`. Unauthorized access attempts are immediately redirected to `/subscription`.

---

### Ambassador & Admin Workflows

#### 14. Ambassador Portal (`/ambassador`)
- **Visual Description:** A streamlined dashboard focused purely on content creation.
- **Buttons & Actions:**
  - **`Start Writing` Button:** Routes to `/blog/create`.
  - **`Upload Resource` Button:** Routes to `/resources/submit`.

#### 15. Create Blog Post (`/blog/create`)
- **Visual Description:** A complex form with a rich text editor (or large textarea), title input, category selector, tags input, and a file upload zone for the featured image.
- **State/Logic:**
  - `file` (File | null): Holds the selected image.
  - `loading` (boolean): Disables form during upload.
- **Buttons & Actions:**
  - **`Submit for Review` Button:** Packages all text fields and the `file` into a `FormData` object. Calls `POST /blog/posts`. *Backend Note:* Ambassador submissions are automatically marked as `status: 'PENDING'` and are not visible on `/blog` until an Admin approves them. Redirects back to `/ambassador` on success.

#### 16. Submit Resource (`/resources/submit`)
- **Visual Description:** Form to upload PDFs/files. Fields for Title, Description, Category, and Required Access Level (Bronze, Silver, Gold).
- **State/Logic:**
  - `file` (File | null): Holds the document.
- **Buttons & Actions:**
  - **`Submit Resource` Button:** Constructs `FormData` and calls `POST /resources`. Like blogs, requires Admin approval if submitted by an Ambassador.

#### 17. Admin Control Center (`/admin`)
- **Visual Description:** A heavily tabbed interface (`<Tabs>` component) dividing management into logical sections: Users, Applications, Content Review, Partners, Leadership, and Plans.
- **State/Logic (Massive):**
  - Maintains separate arrays for `users`, `applications`, `pendingContent`, `partners`, `members`, and `plans`.
  - Maintains separate boolean toggles for multiple dialogs (`partnerDialogOpen`, `memberDialogOpen`, etc.).
  - `editingItem` (object | null): A generic state holder. When an Admin clicks "Edit" on a specific Partner, that Partner's object is loaded into `editingItem`, and the Dialog opens. The form inside the Dialog populates its default values from `editingItem`.
- **API Architecture Note:** The Admin page relies on manual `FormData` construction for almost all `POST`/`PUT` requests because almost every entity (Partner, Member, Resource) involves uploading an image or file.
- **Tabs & Their Buttons/Actions:**
  - **Settings Tab:**
    - **`Upload Partnership Kit` Button:** Triggers a hidden `<input type="file">`. On change, immediately uploads the PDF via `POST /admin/settings/partnership-kit`.
    - **`View Kit` Button:** Opens the uploaded PDF URL in a new browser tab.
  - **Partners / Leadership Tabs:**
    - **`Add Partner` / `Add Member` Button:** Clears `editingItem` to `null` and opens the creation modal.
    - **`Edit` (Pencil Icon) Button:** Sets `editingItem` to the selected row's data and opens the modal.
    - **`Delete` (Trash Icon) Button (Destructive):** Prompts for confirmation, then calls `DELETE /partners/:id`.
    - **`Save` Button (Inside Modal):** If `editingItem` has an ID, calls `PUT /endpoint/:id`. If no ID, calls `POST /endpoint`.
  - **Review/Applications Tab:**
    - **`Approve` Button (Green):** Calls `PATCH /admin/applications/:id/status` with payload `{ status: 'approved' }`. This triggers backend logic to add the `is_ambassador` flag to the user.
    - **`Reject` Button (Red):** Calls the same endpoint with `{ status: 'rejected' }`.
  - **Content Review Tab:**
    - **`Approve` Button:** For pending blogs/resources. Calls `PATCH /admin/content/:type/:id/status`.
  - **Plans Tab:**
    - **`Seed Default Plans` Button (Outline):** A developer utility. Calls `POST /plans/seed` to rapidly populate the database with Stripe tiers if they were accidentally deleted.
