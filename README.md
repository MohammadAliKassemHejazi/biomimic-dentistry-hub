# Docker Development Environment Setup

This project includes a Docker-based development environment that spins up the Client (Next.js), Server (Express), and Database (PostgreSQL) with hot-reloading enabled.

## Prerequisites

- [Docker](https://www.docker.com/get-started) installed on your machine.
- [Docker Compose](https://docs.docker.com/compose/install/) (usually included with Docker Desktop).

## Quick Start

1.  **Start the environment:**

    Run the following command in the root directory of the project:

    ```bash
    docker compose up
    ```

    *Add the `-d` flag to run in detached mode (background):*
    ```bash
    docker compose up -d
    ```

2.  **Access the application:**

    - **Client (Frontend):** [http://localhost:3000](http://localhost:3000)
    - **Server (Backend):** [http://localhost:5000](http://localhost:5000)
    - **Database (PostgreSQL):** `localhost:5432`

3.  **Stop the environment:**

    Press `Ctrl+C` if running in foreground, or run:

    ```bash
    docker compose down
    ```

    *To remove volumes (database data):*
    ```bash
    docker compose down -v
    ```

## Features

### Hot Reloading (Binding)

The `client` and `server` directories are mounted into the containers. This means:
- Any changes you make to the code in your local `client` or `server` folders will be immediately reflected in the running containers.
- The server will automatically restart (via `nodemon`) when backend files change.
- The client will automatically refresh (via Next.js Fast Refresh) when frontend files change.

### Data Persistence

The PostgreSQL database data is stored in a Docker volume named `pgdata`. This ensures that your data persists even if you restart the containers. To reset the database completely, run `docker compose down -v`.

## Configuration

The `docker-compose.yml` file comes with default environment variables for development. You can override them by creating a `.env` file in the root directory or modifying `docker-compose.yml` directly.

**Default Variables:**

- **Database:**
  - `POSTGRES_USER`: postgres
  - `POSTGRES_PASSWORD`: postgres
  - `POSTGRES_DB`: app_db

- **Server:**
  - `DATABASE_URL`: postgres://postgres:postgres@db:5435/app_db
  - `JWT_SECRET`: dev_secret_key_123
  - `STRIPE_SECRET_KEY`: sk_test_placeholder

- **Client:**
  - `NEXT_PUBLIC_API_URL`: http://localhost:5000/api

## Troubleshooting

- **Ports already in use:** Ensure that ports 3000, 5000, and 5435 are not being used by other applications on your host machine.
- **Node Modules:** The setup uses volume tricks to prevent your local `node_modules` from interfering with the container's `node_modules`. If you add a new dependency, you may need to rebuild the containers:
  ```bash
  docker compose up --build
  ```
