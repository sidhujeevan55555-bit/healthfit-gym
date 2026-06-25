# HealthFit Gym & Health-Tracking Club Web Application

HealthFit Gym is a modern full-stack gym management and health tracker designed for Indian fit-hubs. It is built in React 19, TypeScript, Express v4, Tailwind CSS v4, and Cloud SQL (PostgreSQL, managed cleanly via Drizzle ORM).

## Features

- **User Authentication**: Supports 100% passwordless, secure, third-party authentication via **Google Sign-In (Firebase Auth)** as well as robust **Email & Password registration** secured with cryptographic **PBKDF2 salt-hashes**.
- **Interactive Health Tracking**: Log workouts, track exercise duration, compute calories burned, and log weights with interactive trend graphs modeled in **Recharts**.
- **Admin Dashboard**: Comprehensive separate system admin console supporting aggregated metrics, plan analytics, registration feeds, and delete triggers.
- **Indian Localization**: Real ₹ (INR) priced plans, Indian trainer profiles, and localized contact coordinates in Haryana.

---

## Getting Started Locally

Follow these direct steps to spin up the application on your local machine:

### 1. Prerequisites
Ensure you have **Node.js** (version 18 or above recommended) and a **PostgreSQL** database instance running.

### 2. Configure Environment Variables
Copy `.env.example` to a new `.env` file at the root:
```bash
cp .env.example .env
```
Fill in your database coordinates and JWT secrets:
```env
# PostgreSQL connection strings
SQL_HOST="your-local-postgres-host"
SQL_USER="postgres_user"
SQL_PASSWORD="postgres_password"
SQL_DB_NAME="healthfit_db"
SQL_ADMIN_USER="postgres_user"
SQL_ADMIN_PASSWORD="postgres_password"

# JWT encryption key
JWT_SECRET="a-very-secure-random-phrase"
```

Configure `firebase-applet-config.json` with your Firebase web configuration if you plan to use Google Sign-in.

### 3. Install Dependencies
Run the package manager from the root directory:
```bash
npm install
```

### 4. Push Database Schema
Register tables, foreign key bindings, and index rules on your Postgres instance:
```bash
# Push schema defined in src/db/schema.ts
npx drizzle-kit push
```

### 5. Running in Development Mode
Start the joint Express core and Vite asset pipeline concurrently:
```bash
npm run dev
```
The application will boot and bind to [http://localhost:3000](http://localhost:3000)!

### 6. Production Builds
Compile and bundle the production client files and bundle the backend server:
```bash
npm run build
npm run start
```

---

## Administrative Credentials
The application automatically seeds a default system administrator during server startup:
- **Username**: `admin`
- **Password**: `admin123`
