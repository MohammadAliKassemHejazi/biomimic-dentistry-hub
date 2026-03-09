# Biomimetic Dentistry Club - Application Functionality Documentation

This README provides a comprehensive overview of all pages and functionalities within the Biomimetic Dentistry Club application. It outlines the purpose of each page, the specific actions users can take, and the roles required to access them.

## User Roles and Access Levels
- **Public:** Accessible to anyone.
- **Authenticated (User):** Logged in users. Can access basic dashboard, update profile.
- **Bronze VIP:** Tier 1 paid subscription. Access to `/bronze` exclusive content.
- **Silver VIP:** Tier 2 paid subscription. Access to `/silver` exclusive content.
- **Gold VIP:** Tier 3 paid subscription. Full access to VIP features.
- **Ambassador:** Special status for contributors. Can create blogs and submit resources. Access to `/ambassador`.
- **Admin:** System administrators. Full access to `/admin` dashboard for managing content, users, and settings.

## Global Navigation Menu
The main navigation menu varies based on the user's role and authentication status.

### Common Navigation Links:
- **Home (`/`)**: Navigates to the landing page.
- **About (`/about`)**: Information about the organization.
- **Resources (`/resources`)**: Access to educational materials (access varies by tier).
- **Blog (`/blog`)**: Articles and updates.
- **Courses (`/courses`)**: Available training programs.
- **Partnership (`/partnership`)**: Information on partnering with the organization.
- **Contact (`/contact`)**: Contact form.

### Role-Specific Links (Visible when applicable):
- **Bronze VIP (`/bronze`)**: Exclusive content for Bronze members.
- **Silver VIP (`/silver`)**: Exclusive content for Silver members.
- **VIP Area (`/vip`)**: Exclusive area for higher tiers (likely Gold).
- **Ambassador (`/ambassador`)**: Tools for ambassadors (create post, submit resource).
- **Admin Dashboard (`/admin`)**: Management console for administrators.

### User Menu (Authenticated):
- **Dashboard (`/dashboard`)**: User profile and application status.
- **Subscription (`/subscription`)**: Manage billing and upgrade plans.
- **Sign Out**: Logs the user out.

---

## Page-by-Page Breakdown

### 1. Home Page (`/`)
**Purpose:** The main landing page of the application. Introduces the Biomimetic Dentistry Club, showcases sponsors, and highlights VIP members or features.
**Key Sections:** Hero Section, Sponsors Section, VIP Section.

### 2. Login Page (`/login`)
**Purpose:** Allows existing users to authenticate and access their accounts.
**Buttons & Actions:**
- **`Sign In`**: Authenticates the user with the provided credentials.
**Links:**
- **`Don't have an account? Sign up`**: Navigates to the signup page (`/signup`).

### 3. Signup Page (`/signup`)
**Purpose:** Registration page for new users to create an account.
**Buttons & Actions:**
- **`Sign Up`**: Submits the registration form to create a new user account.
**Links:**
- **`Login`**: Navigates to the login page (`/login`).

### 4. Dashboard (`/dashboard`)
**Purpose:** The central hub for authenticated users. Displays user profile information, current subscription status, ambassador application status, and quick links to relevant areas based on their role.
**Buttons & Actions:**
- **`Upgrade Plan`** / **`View Plans`**: Redirects to the subscription page (`/subscription`) to view or change membership tiers.
- **`Apply Now`** / **`Submit Application`**: Submits an application for Ambassador status.
- **`Resource Library`**: Navigates to the resources page (`/resources`).
- **`Browse Courses`**: Navigates to the courses page (`/courses`).
- **`Get Support`**: Navigates to the contact page (`/contact`).

### 5. Admin Dashboard (`/admin`)
**Purpose:** The administration console. Restricted to users with the `admin` role. Used for managing site content, partnerships, leadership members, subscription plans, and approving/rejecting user submissions (blogs, resources, ambassador applications).
**Buttons & Actions:**
- **`Upload Partnership Kit`**: Opens a form or modal to upload a new partnership kit PDF.
- **`View Kit`**: Opens the currently uploaded partnership kit in a new tab.
- **`Add Partner`** / **`Add Member`**: Opens a dialog to add a new Trusted Partner or Leadership Member.
- **`Add Resource`** / **`Create Resource`**: Opens a modal to submit a new file or resource to the platform.
- **`Save`**: Saves changes made in any admin form or dialog.
- **`Seed Default Plans`**: A development utility to populate the database with default Stripe subscription plans.
- **`Approve`**: Approves a pending submission (blog, resource, or ambassador application).
- **`Reject`**: Rejects a pending application.

### 6. Resources Library (`/resources`)
**Purpose:** A library of educational resources, files, and materials. Access to specific resources is gated based on the user's subscription tier.
**Buttons & Actions:**
- **`Download`**: Initiates the download of a selected resource (if the user has the required access tier).
- **`Upgrade Required`**: Redirects the user to the subscription page if they do not have sufficient access to download the resource.

### 7. Submit Resource (`/resources/submit`)
**Purpose:** Allows authorized users (Ambassadors, Admins) to upload and submit new resources to the library. Resources submitted by Ambassadors typically require Admin approval.
**Buttons & Actions:**
- **`Submit Resource`**: Submits the uploaded file and associated details for review or direct publishing.

### 8. Blog (`/blog`)
**Purpose:** The public blog displaying articles, updates, and educational content. Users can view posts and filter by category.
**Buttons & Actions:**
- **`Create Post`**: Visible to Ambassadors and Admins, navigates to the blog post creation page (`/blog/create`).

### 9. Create Blog Post (`/blog/create`)
**Purpose:** Allows authorized users (Ambassadors, Admins) to draft and submit new blog posts. Posts require Admin approval before becoming public.
**Buttons & Actions:**
- **`Submit for Review`**: Submits the drafted blog post to the admin team for review and publishing.

### 10. Blog Post Detail (`/blog/[slug]`)
**Purpose:** Displays the full content of a specific blog post.
**Buttons & Actions:**
- **`Favorite`**: Toggles the favorite status for the current blog post for the logged-in user.
- **`Share`**: Opens a sharing dialog or copies the link to the post to the user's clipboard.

### 11. Subscription & Billing (`/subscription`)
**Purpose:** Displays available membership tiers (Bronze, Silver, Gold). Allows users to upgrade their plan via Stripe integration or manage their existing billing.
**Buttons & Actions:**
- **`Get Plan`** / **`Upgrade`**: Redirects the user to Stripe Checkout to purchase or upgrade to the selected subscription tier.
- **`Manage Billing`**: Redirects the user to the Stripe Customer Portal to manage their existing subscription, update payment methods, or cancel.
- **`Contact our team`**: Navigates to the contact page (`/contact`) for customized or enterprise inquiries.

### 12. Ambassador Portal (`/ambassador`)
**Purpose:** A dedicated portal for users with Ambassador status. Provides quick access to tools for contributing content to the platform.
**Buttons & Actions:**
- **`Start Writing`**: Navigates to the blog post creation page (`/blog/create`).
- **`Upload Resource`**: Navigates to the resource submission page (`/resources/submit`).

### 13. Partnership (`/partnership`)
**Purpose:** Information page for organizations or individuals interested in partnering with the club.
**Buttons & Actions:**
- **`Become a Partner`**: Navigates the user to a partnership inquiry section or form.
- **`Contact Our Team`**: Navigates to the contact page (`/contact`) to get in touch.

### 14. Courses (`/courses`)
**Purpose:** Displays available educational courses or training programs. Users can express interest or enroll depending on course availability.
**Buttons & Actions:**
- **`Enroll Now`**: Navigates to course enrollment or checkout (if available).
- **`Notify Me`**: Allows users to register their interest and be notified when the course becomes available.

### 15. About (`/about`)
**Purpose:** Provides background information about the Biomimetic Dentistry Club's mission, vision, and team.
**Buttons & Actions:**
- **`Explore Courses`**: Navigates to the courses page (`/courses`).
- **`Become an Ambassador`**: Navigates to the ambassador portal (`/ambassador`) or dashboard to apply.

### 16. Contact (`/contact`)
**Purpose:** A contact form for users to send inquiries to the support team.
**Buttons & Actions:**
- **`Send Message`**: Submits the contact form data to the backend system.

### 17. Tier-Exclusive Pages (`/bronze`, `/silver`, `/vip`)
**Purpose:** Exclusive content areas restricted to users with the specific `bronze`, `silver`, or higher subscription tiers.
**Features:** Contains premium content, videos, or specialized materials only accessible to members holding that tier or higher.
