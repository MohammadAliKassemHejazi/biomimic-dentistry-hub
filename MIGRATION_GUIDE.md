# Migration Guide: Vite/Supabase to Next.js (Client) + Express (Server) Monorepo

This guide outlines the step-by-step process to migrate the current application into a monorepo structure with a Next.js frontend (App Router) and an Express.js backend (TypeScript), using a local PostgreSQL database and JWT authentication.

## 1. Project Restructuring

**Goal:** Create a monorepo structure with `client` and `server` directories.

1.  **Create Root Folders:**
    *   Create a `client` folder.
    *   Create a `server` folder.
    *   *(Note: For now, we will work within the existing repo, eventually moving current source code into `client` or rewriting it there.)*

2.  **Initialize Client (Next.js):**
    *   Inside the `client` folder, initialize a new Next.js app:
        ```bash
        npx create-next-app@latest . --typescript --tailwind --eslint
        ```
    *   **Configuration Choices:**
        *   TypeScript: Yes
        *   ESLint: Yes
        *   Tailwind CSS: Yes
        *   `src/` directory: Yes
        *   App Router: **Yes** (as requested)
        *   Import alias: `@/*`

3.  **Initialize Server (Express):**
    *   Inside the `server` folder, initialize a `package.json`:
        ```bash
        npm init -y
        ```
    *   Install core dependencies:
        ```bash
        npm install express cors dotenv pg bcryptjs jsonwebtoken helmet
        ```
    *   Install dev dependencies:
        ```bash
        npm install -D typescript ts-node @types/node @types/express @types/cors @types/bcryptjs @types/jsonwebtoken nodemon
        ```
    *   Initialize TypeScript:
        ```bash
        npx tsc --init
        ```

## 2. Database Setup (PostgreSQL)

**Goal:** Replace Supabase with a local or hosted PostgreSQL instance using Prisma ORM.

1.  **Install Prisma (in `server`):**
    ```bash
    npm install prisma --save-dev
    npx prisma init
    ```
2.  **Configure Database:**
    *   Update `server/.env` with your PostgreSQL connection string (`DATABASE_URL`).
3.  **Define Schema (`prisma/schema.prisma`):**
    *   Replicate the current Supabase schema (User, Course, Purchase, Resource).
    *   *Example User Model:*
        ```prisma
        model User {
          id        String   @id @default(uuid())
          email     String   @unique
          password  String   // Hashed password
          firstName String?
          lastName  String?
          role      String   @default("user") // "admin" or "user"
          createdAt DateTime @default(now())
          updatedAt DateTime @updatedAt
        }
        ```
4.  **Migrate:**
    *   Run `npx prisma migrate dev --name init` to create tables in your local DB.

## 3. Server Development (Express API)

**Goal:** Create API endpoints to replace Supabase functions.

1.  **Authentication (JWT):**
    *   Create `auth.controller.ts`:
        *   `register`: Hash password, create user in DB.
        *   `login`: Verify password, generate JWT (access token).
    *   Create `auth.middleware.ts`:
        *   Verify JWT from `Authorization` header.
        *   Attach user to request object.

2.  **API Routes:**
    *   Create routes mirroring your current data needs:
        *   `GET /api/courses`
        *   `GET /api/resources`
        *   `GET /api/users/profile`
    *   Implement controllers using Prisma Client to fetch data.

## 4. Client Migration (Next.js)

**Goal:** Recreate the UI in Next.js, keeping the design exactly the same.

1.  **Install Dependencies:**
    *   Install `shadcn-ui` in the `client` folder:
        ```bash
        npx shadcn-ui@latest init
        ```
    *   Install `lucide-react` and other UI libraries used in the original project (check existing `package.json`).

2.  **Migrate Components:**
    *   Copy components from `src/components` (original) to `client/src/components`.
    *   Update image imports (Next.js uses `next/image`).
    *   Update link tags (Next.js uses `next/link`).

3.  **Migrate Pages:**
    *   Convert `src/pages/*.tsx` to Next.js App Router structure:
        *   `src/pages/Index.tsx` -> `client/src/app/page.tsx`
        *   `src/pages/Login.tsx` -> `client/src/app/login/page.tsx`
        *   `src/pages/Dashboard.tsx` -> `client/src/app/dashboard/page.tsx`

4.  **State Management & Data Fetching:**
    *   Replace Supabase client calls with `fetch` or `axios` calls to your new Express API (`http://localhost:port/api/...`).
    *   Use `React Query` (TanStack Query) for data fetching, just like in the original project, but pointing to your new API.

5.  **Authentication Context:**
    *   Create a React Context (`AuthProvider`) to store the JWT.
    *   On app load, check for a stored token.
    *   Redirect to `/login` if a protected route is accessed without a token.

## 5. Final Integration & Cleanup

1.  **Environment Variables:**
    *   Ensure `client` has `NEXT_PUBLIC_API_URL` pointing to the Express server.
    *   Ensure `server` has `DATABASE_URL` and `JWT_SECRET`.
2.  **Run Both Apps:**
    *   Use `concurrently` or separate terminals to run both the Client (port 3000) and Server (port 4000/5000).
3.  **Testing:**
    *   Verify login flow (JWT generation & storage).
    *   Verify data fetching (Courses, Resources).
    *   **Crucial:** Compare visually with the original Vite app to ensure design is identical.

## 6. Deprecation

1.  Once verified, remove the original `src`, `vite.config.ts`, and root `index.html`.
