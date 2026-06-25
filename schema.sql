-- Database Schema Definition for PostgreSQL / Cloud SQL
-- HealthFit Gym & Health-Tracking Website Application
-- Generated on: 2026-06-17

-- 1. Users table supporting standard credential authentication and Firebase Auth integration
CREATE TABLE users (
    id SERIAL PRIMARY KEY,
    uid VARCHAR(255) UNIQUE DEFAULT NULL, -- Firebase UID linked during Google sign-in
    name VARCHAR(255) NOT NULL,
    email VARCHAR(255) UNIQUE NOT NULL,
    phone VARCHAR(20) DEFAULT NULL,
    password VARCHAR(255) DEFAULT NULL, -- Salted PBKDF2 hashed password for email signups
    membership_type VARCHAR(100) DEFAULT 'None',
    created_at TIMESTAMP WITH TIME ZONE DEFAULT CURRENT_TIMESTAMP
);

-- 2. System administrators login credentials (Default username: admin, password: admin123)
CREATE TABLE admin (
    id SERIAL PRIMARY KEY,
    username VARCHAR(100) UNIQUE NOT NULL,
    password VARCHAR(255) NOT NULL -- Salted PBKDF2 hashed administrative password
);

-- 3. Daily Workout logs and Health metrics tracking
CREATE TABLE workouts (
    id SERIAL PRIMARY KEY,
    user_id INTEGER NOT NULL REFERENCES users(id) ON DELETE CASCADE,
    date VARCHAR(10) NOT NULL, -- Date formatted: YYYY-MM-DD
    exercise VARCHAR(150) NOT NULL,
    duration INTEGER NOT NULL, -- Recorded in minutes
    calories INTEGER NOT NULL, -- Burned in Kcal
    weight INTEGER DEFAULT NULL, -- Logged weight in kg
    created_at TIMESTAMP WITH TIME ZONE DEFAULT CURRENT_TIMESTAMP
);

-- 4. Subscription logs and purchase ledger records
CREATE TABLE subscriptions (
    id SERIAL PRIMARY KEY,
    user_id INTEGER NOT NULL REFERENCES users(id) ON DELETE CASCADE,
    plan_name VARCHAR(100) NOT NULL,
    price INTEGER NOT NULL, -- Saved in INR (₹)
    start_date VARCHAR(10) NOT NULL, -- Date formatted: YYYY-MM-DD
    end_date VARCHAR(10) NOT NULL, -- Date formatted: YYYY-MM-DD
    created_at TIMESTAMP WITH TIME ZONE DEFAULT CURRENT_TIMESTAMP
);

-- Index triggers for high performance auditing
CREATE INDEX idx_workouts_user_id ON workouts(user_id);
CREATE INDEX idx_subscriptions_user_id ON subscriptions(user_id);
CREATE INDEX idx_users_email ON users(email);
