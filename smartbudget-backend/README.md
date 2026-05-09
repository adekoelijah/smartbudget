# SmartBudget Backend

This repository contains the backend API for SmartBudget.

## Setup

1. Copy `.env.example` to `.env`.
2. Set `MONGO_URI`, `JWT_SECRET`, and `PORT` in `.env`.
3. Install dependencies:

   ```bash
   npm install
   ```

4. Start the server in development mode:

   ```bash
   npm run dev
   ```

## API Endpoints

- `GET /api/health` - Check server status
- `POST /api/auth/signup` - Register a new user
- `POST /api/auth/login` - Authenticate a user
- `GET /api/users/me` - Get current user profile (requires `Authorization: Bearer <token>`)

## Notes

- The backend uses MongoDB and JWT authentication.
- If your current `MONGO_URI` is not reachable, replace it with a valid MongoDB connection string.
