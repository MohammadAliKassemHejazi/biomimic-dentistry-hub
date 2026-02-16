# API Requirements for Frontend Pages

This document details the API endpoints required by the frontend application, based on an analysis of the existing pages and components.

## Authentication (`src/contexts/AuthContext.tsx`)

| Method | Endpoint | Description | Request Body | Response Shape |
| :--- | :--- | :--- | :--- | :--- |
| POST | `/auth/login` | Sign in a user | `{ email, password }` | `{ user: User, session: Session }` |
| POST | `/auth/register` | Register a new user | `{ email, password, firstName, lastName }` | `{ user: User, session: Session }` |
| POST | `/auth/logout` | Sign out the current user | - | `{ message: "Successfully signed out" }` |
| POST | `/auth/forgot-password` | Send password reset email | `{ email }` | `{ message: "Password reset email sent" }` |
| GET | `/users/profile` | Get current user's profile | - | `{ id, user_id, email, first_name, last_name, role, created_at }` |

## Courses (`src/pages/Courses.tsx`, `src/components/admin/CourseManagement.tsx`)

| Method | Endpoint | Description | Request Body | Response Shape |
| :--- | :--- | :--- | :--- | :--- |
| GET | `/courses` | List all courses | - | `Array<{ id, title, slug, description, price, featured_image, coming_soon, launch_date, access_level, stripe_price_id, created_at }>` |
| POST | `/courses` | Create a new course (Admin) | `{ title, slug, description, price, featured_image, coming_soon, launch_date, access_level, stripe_price_id }` | `{ id, ...courseData }` |
| PUT | `/courses/:id` | Update an existing course (Admin) | `{ title, slug, description, price, featured_image, coming_soon, launch_date, access_level, stripe_price_id }` | `{ id, ...updatedCourseData }` |
| DELETE | `/courses/:id` | Delete a course (Admin) | - | `{ message: "Course deleted successfully" }` |
| POST | `/courses/:id/notify` | Subscribe to course launch notifications | `{ email }` | `{ message: "You will be notified when the course launches" }` |

## Resources (`src/pages/Resources.tsx`, `src/components/admin/ResourceManagement.tsx`)

| Method | Endpoint | Description | Request Body | Response Shape |
| :--- | :--- | :--- | :--- | :--- |
| GET | `/resources` | List all resources | - | `Array<{ id, title, description, file_url, file_name, file_type, access_level, category, tags, download_count, created_at }>` |
| POST | `/resources` | Create a new resource (Admin) | `{ title, description, file_url, file_name, file_type, access_level, category, tags }` | `{ id, ...resourceData }` |
| PUT | `/resources/:id` | Update an existing resource (Admin) | `{ title, description, file_url, file_name, file_type, access_level, category, tags }` | `{ id, ...updatedResourceData }` |
| DELETE | `/resources/:id` | Delete a resource (Admin) | - | `{ message: "Resource deleted successfully" }` |
| POST | `/resources/:id/download` | Increment download count | - | `{ success: true }` |

## Blog (`src/pages/Blog.tsx`)

| Method | Endpoint | Description | Request Body | Response Shape |
| :--- | :--- | :--- | :--- | :--- |
| GET | `/blog/posts` | List published blog posts | Query: `?published=true` | `Array<{ id, title, slug, excerpt, content, featured_image, category, tags, read_time, created_at, profiles: { first_name, last_name } }>` |
| GET | `/blog/posts/:slug` | Get a single blog post | - | `{ id, title, slug, excerpt, content, featured_image, category, tags, read_time, created_at, profiles: { first_name, last_name } }` |

## Subscription (`src/pages/Subscription.tsx`)

| Method | Endpoint | Description | Request Body | Response Shape |
| :--- | :--- | :--- | :--- | :--- |
| GET | `/subscriptions/status` | Check current subscription status | - | `{ subscribed: boolean, product_id: string \| null, subscription_end: string \| null }` |
| POST | `/subscriptions/checkout` | Create Stripe checkout session | `{ price_id: string }` | `{ url: string }` |
| POST | `/subscriptions/portal` | Create Stripe customer portal session | - | `{ url: string }` |

## Contact (`src/pages/Contact.tsx`)

| Method | Endpoint | Description | Request Body | Response Shape |
| :--- | :--- | :--- | :--- | :--- |
| POST | `/contact` | Send a contact message | `{ name, email, subject, message }` | `{ message: "Message sent successfully" }` |

## Ambassadors (`src/pages/Ambassadors.tsx`)

| Method | Endpoint | Description | Request Body | Response Shape |
| :--- | :--- | :--- | :--- | :--- |
| GET | `/ambassadors` | List ambassadors | - | `Array<{ name, country, region, specialization, experience, students, flag }>` |
| POST | `/ambassadors/apply` | Submit ambassador application | `{ name, email, country, experience, bio }` | `{ message: "Application submitted successfully" }` |

## Admin User Management (`src/components/admin/UserManagement.tsx`)

| Method | Endpoint | Description | Request Body | Response Shape |
| :--- | :--- | :--- | :--- | :--- |
| GET | `/admin/users` | List all users with roles | - | `{ users: Array<{ id, user_id, email, first_name, last_name, role, created_at }> }` |
| PATCH | `/admin/users/:userId/role` | Update user role | `{ role: string }` | `{ success: true, message: string }` |

## Admin Analytics (`src/components/admin/AnalyticsDashboard.tsx`)

| Method | Endpoint | Description | Request Body | Response Shape |
| :--- | :--- | :--- | :--- | :--- |
| GET | `/admin/analytics` | Get dashboard analytics | - | `{ totalUsers: number, totalResources: number, totalCourses: number, totalDownloads: number, usersByRole: Record<string, number>, recentActivity: Array<{ type, description, timestamp }> }` |

## User Dashboard (`src/pages/Dashboard.tsx`)

| Method | Endpoint | Description | Request Body | Response Shape |
| :--- | :--- | :--- | :--- | :--- |
| GET | `/users/purchases` | Get user's purchased courses | - | `Array<{ id, course_id, purchase_date, amount, status }>` |
| GET | `/users/stats` | Get user's usage statistics | - | `{ totalDownloads: number, coursesCompleted: number, memberSince: string }` |
