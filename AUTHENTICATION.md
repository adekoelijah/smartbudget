# 🔐 SmartBudget Authentication Setup Guide

## Overview

This guide provides comprehensive instructions for setting up, testing, and deploying the production-ready, SaaS-compatible authentication system for SmartBudget.

---

## 📋 Table of Contents

1. [Architecture](#architecture)
2. [Prerequisites](#prerequisites)
3. [Backend Setup](#backend-setup)
4. [Frontend Setup](#frontend-setup)
5. [Testing Authentication](#testing-authentication)
6. [Production Deployment](#production-deployment)
7. [Security Best Practices](#security-best-practices)
8. [Troubleshooting](#troubleshooting)

---

## 🏗️ Architecture

### Authentication Flow

```
User (Frontend)
    ↓
1. User submits email/password
    ↓
Login/Signup Component
    ↓
2. API call with credentials
    ↓
Backend
    ↓
3. Password validation (bcrypt)
4. JWT token generation
    ↓
5. Token + User data response
    ↓
Frontend Storage
    ↓
6. Store token in localStorage
7. Store user data in localStorage
    ↓
AuthProvider
    ↓
8. Update global auth state
    ↓
Protected Routes
    ↓
9. Access protected features
```

### Key Features

- ✅ **Bcrypt Password Hashing** - Secure password storage
- ✅ **JWT Authentication** - Token-based session management
- ✅ **Rate Limiting** - Protection against brute force attacks
- ✅ **Account Lockout** - Auto-lock after failed attempts
- ✅ **Token Refresh** - Token rotation support
- ✅ **Cross-Tab Sync** - Real-time auth state sync
- ✅ **Error Handling** - Comprehensive error messages
- ✅ **Multi-Tenant Ready** - Organization/tenant support in User model

---

## 📦 Prerequisites

### Required

- **Node.js** >= 16.0.0
- **MongoDB** >= 4.0 (Local or MongoDB Atlas)
- **npm** or **yarn**

### Recommended

- **Postman** - For API testing
- **MongoDB Compass** - For database visualization
- **VS Code** - Code editor

---

## 🚀 Backend Setup

### Step 1: Install Dependencies

```bash
cd smartbudget-backend
npm install
```

### Step 2: Create .env File

Copy the `.env.example` to `.env`:

```bash
cp .env.example .env
```

Edit `.env` with your values:

```env
# Database
MONGO_URI=mongodb://localhost:27017/smartbudget
# OR for MongoDB Atlas:
# MONGO_URI=mongodb+srv://username:password@cluster.mongodb.net/smartbudget?retryWrites=true&w=majority

# Server
PORT=5000
NODE_ENV=development

# JWT
JWT_SECRET=your_super_secret_key_here_change_in_production
JWT_EXPIRE=7d

# CORS
CORS_ORIGINS=http://localhost:5173,http://127.0.0.1:5173
```

### Step 3: Start MongoDB

**Local MongoDB:**
```bash
mongod
```

**Or use MongoDB Atlas** (cloud):
- Create account: https://www.mongodb.com/cloud/atlas
- Create cluster and get connection string
- Add to MONGO_URI in .env

### Step 4: Start Backend Server

```bash
npm run dev
```

Expected output:
```
✅ MongoDB Connected: 127.0.0.1
🚀 Server running in development mode on port 5000
```

### Step 5: Test Backend Endpoints

Use Postman or curl:

**Test Health Check:**
```bash
curl http://localhost:5000/api/health
```

**Test Database Connection:**
```bash
curl http://localhost:5000/api/db-test
```

---

## 🎨 Frontend Setup

### Step 1: Install Dependencies

```bash
cd my-project
npm install
```

### Step 2: Create .env.local File

Copy the `.env.example` to `.env.local`:

```bash
cp .env.example .env.local
```

Edit `.env.local`:

```env
VITE_API_URL=http://localhost:5000/api
VITE_APP_NAME=SmartBudget
VITE_NODE_ENV=development
```

### Step 3: Verify App.jsx or Main Router

Ensure your app is wrapped with `AuthProvider`:

```jsx
import { AuthProvider } from "./context/AuthProvider";
import AppRoutes from "./routes/AppRoutes";

function App() {
  return (
    <AuthProvider>
      <AppRoutes />
    </AuthProvider>
  );
}

export default App;
```

### Step 4: Start Frontend Development Server

```bash
npm run dev
```

Expected output:
```
VITE v5.x.x  ready in xxx ms

➜  Local:   http://localhost:5173/
```

---

## 🧪 Testing Authentication

### Manual Testing Steps

#### 1. Test Signup

1. Navigate to `http://localhost:5173/signup`
2. Fill in the form:
   - Full Name: `John Doe`
   - Email: `john@example.com`
   - Password: `SecurePass123!`
   - Confirm Password: `SecurePass123!`
   - Agree to terms: ✓
3. Click "Sign Up"
4. Expected: Redirected to `/app` with success message

#### 2. Test Login

1. Navigate to `http://localhost:5173/login`
2. Fill in the form:
   - Email: `john@example.com`
   - Password: `SecurePass123!`
3. Click "Login"
4. Expected: Redirected to `/app` with success message

#### 3. Test Token Storage

After login, check browser DevTools:

```javascript
// In Browser Console:
localStorage.getItem("token")      // Should return JWT token
localStorage.getItem("user")       // Should return user object as JSON
```

#### 4. Test Protected Route

Try accessing a protected route (e.g., `/app/dashboard`) without login:
- Expected: Redirected to `/login`

After login:
- Expected: Can access protected routes

#### 5. Test Logout

After login, click logout button:
- Expected: Redirected to `/login`
- localStorage should be cleared

---

## 🔒 API Testing with Postman

### Setup Postman

1. Open Postman
2. Create new Collection: "SmartBudget Auth"
3. Create environment: "Local Dev"

### Test Endpoints

#### Signup
```
POST http://localhost:5000/api/auth/signup
Content-Type: application/json

{
  "name": "John Doe",
  "email": "john@example.com",
  "password": "SecurePass123!",
  "confirmPassword": "SecurePass123!"
}
```

**Expected Response (201):**
```json
{
  "success": true,
  "message": "Account created successfully",
  "token": "eyJhbGc...",
  "user": {
    "id": "...",
    "name": "John Doe",
    "email": "john@example.com",
    "role": "user",
    "status": "active"
  }
}
```

#### Login
```
POST http://localhost:5000/api/auth/login
Content-Type: application/json

{
  "email": "john@example.com",
  "password": "SecurePass123!"
}
```

**Expected Response (200):**
```json
{
  "success": true,
  "message": "Login successful",
  "token": "eyJhbGc...",
  "user": { ... }
}
```

#### Get Current User (Protected)
```
GET http://localhost:5000/api/auth/me
Authorization: Bearer <token>
```

#### Change Password (Protected)
```
PUT http://localhost:5000/api/auth/change-password
Authorization: Bearer <token>
Content-Type: application/json

{
  "currentPassword": "SecurePass123!",
  "newPassword": "NewPassword456!",
  "confirmNewPassword": "NewPassword456!"
}
```

---

## 🛡️ Security Best Practices

### 1. Environment Variables

- **Never commit .env files** - Add to .gitignore
- **Use strong JWT_SECRET** - Minimum 32 characters
- **Rotate secrets regularly** - Change JWT_SECRET in production
- **Keep credentials secure** - Never share or expose

### 2. Password Security

- **Minimum 6 characters** - Enforce in validation
- **Bcrypt hashing** - 10 salt rounds
- **No password in responses** - Excluded from API responses
- **Password strength indicator** - Guide users

### 3. Token Management

- **JWT expiry** - Set to 7 days in development, 1 day in production
- **HttpOnly cookies** - Consider using HttpOnly cookies instead of localStorage in production
- **Token refresh** - Implement refresh token rotation
- **HTTPS only** - Always use HTTPS in production

### 4. Rate Limiting

- **Login attempts** - 5 attempts per 15 minutes
- **Signup attempts** - 3 attempts per hour
- **API requests** - 100 requests per 15 minutes (default)
- **Account lockout** - 15-minute lockout after failed attempts

### 5. Data Protection

- **CORS validation** - Only allow specified origins
- **Input validation** - Sanitize all inputs
- **SQL injection prevention** - Use Mongoose (automatic)
- **XSS prevention** - React handles by default
- **Email verification** - For production, implement email confirmation

### 6. Database

- **Connection security** - Use encrypted connections
- **Access control** - Restrict database access
- **Backups** - Regular automated backups
- **Monitoring** - Monitor suspicious activities

---

## 📱 Frontend Integration

### Using the useAuth Hook

```jsx
import { useAuth } from "../hooks/useAuth";

function MyComponent() {
  const { user, token, login, logout, isAuthenticated, loading } = useAuth();

  if (loading) return <div>Loading...</div>;

  if (!isAuthenticated) {
    return <div>Please log in</div>;
  }

  return (
    <div>
      <h1>Welcome, {user.name}!</h1>
      <button onClick={logout}>Logout</button>
    </div>
  );
}
```

### Making Protected API Calls

```jsx
import api from "../services/api";

async function fetchUserData() {
  try {
    // Token is automatically attached by interceptor
    const response = await api.get("/users/me");
    console.log(response.user);
  } catch (error) {
    console.error(error.response?.data?.message);
  }
}
```

---

## 🚀 Production Deployment

### Backend Deployment (Render, Railway, Heroku)

1. **Push code to GitHub**
   ```bash
   git init
   git add .
   git commit -m "Initial commit"
   git push origin main
   ```

2. **Create account on hosting platform** (Render, Railway, etc.)

3. **Create new service** and connect GitHub repo

4. **Set environment variables** in platform dashboard:
   ```
   MONGO_URI=<production-mongodb-atlas-uri>
   JWT_SECRET=<strong-random-secret>
   PORT=<platform-assigned-port>
   NODE_ENV=production
   CORS_ORIGINS=<your-frontend-domain>
   ```

5. **Deploy** - Platform will automatically build and deploy

### Frontend Deployment (Vercel, Netlify, AWS)

1. **Build production bundle**
   ```bash
   npm run build
   ```

2. **Deploy to Vercel/Netlify**
   - Connect GitHub repo
   - Set environment variables:
     ```
     VITE_API_URL=<your-backend-api-url>
     VITE_NODE_ENV=production
     ```
   - Platform deploys automatically

### Production Checklist

- [ ] Use HTTPS everywhere
- [ ] Set `NODE_ENV=production`
- [ ] Use strong, unique JWT_SECRET
- [ ] Enable CORS for production domain only
- [ ] Configure MongoDB Atlas for production
- [ ] Set up automated backups
- [ ] Enable monitoring and logging
- [ ] Implement email verification
- [ ] Add password reset functionality
- [ ] Set up SSL certificates
- [ ] Configure CDN for static assets
- [ ] Implement rate limiting in production
- [ ] Add error tracking (Sentry)
- [ ] Monitor performance

---

## 🔧 Troubleshooting

### Issue: "CORS policy does not allow access"

**Solution:**
- Check `.env` CORS_ORIGINS includes frontend URL
- Frontend URL must match exactly (include port if local)
- Example: `http://localhost:5173` not `localhost:5173`

### Issue: "Invalid token" on protected routes

**Solution:**
- Token expired - user needs to log in again
- Token corrupted - clear localStorage and log in
- Token not sent - check Authorization header in DevTools

### Issue: "Password validation failed"

**Solution:**
- Ensure password is at least 6 characters
- Confirm passwords match
- Check special characters are allowed

### Issue: "Cannot connect to MongoDB"

**Solution:**
- Check MONGO_URI is correct
- MongoDB service is running (local) or Atlas connection is active
- Check IP whitelist if using MongoDB Atlas
- Test connection: `mongosh` or MongoDB Compass

### Issue: 429 "Too Many Requests"

**Solution:**
- Wait 15 minutes for rate limit to reset
- Or restart backend server

### Issue: Login works but "User not found" on /me

**Solution:**
- Check user was saved to database
- Use MongoDB Compass to verify user exists
- Check JWT token contains correct user ID

### Issue: Token cleared on page refresh

**Solution:**
- This is expected - check localStorage persistence
- Use DevTools → Application → LocalStorage to verify
- Token should persist across page refreshes

---

## 📚 Additional Resources

- **JWT Documentation**: https://jwt.io/
- **Bcrypt**: https://www.npmjs.com/package/bcryptjs
- **MongoDB Atlas**: https://www.mongodb.com/cloud/atlas
- **Express Security**: https://expressjs.com/en/advanced/best-practice-security.html
- **OWASP Security**: https://owasp.org/www-project-top-ten/

---

## 🎯 Next Steps

1. ✅ Implement email verification
2. ✅ Add password reset functionality
3. ✅ Implement refresh token rotation
4. ✅ Add OAuth integration (Google, GitHub)
5. ✅ Implement 2FA (Two-Factor Authentication)
6. ✅ Add subscription/billing system (SaaS)
7. ✅ Multi-tenant organization support
8. ✅ Role-based access control (RBAC)

---

## 📞 Support

For issues or questions:
1. Check the Troubleshooting section
2. Review error messages in browser console and backend logs
3. Check GitHub issues and discussions
4. Contact development team

---

**Last Updated**: April 2026  
**Version**: 1.0.0  
**Status**: Production Ready ✅
