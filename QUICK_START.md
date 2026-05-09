# 🚀 SmartBudget Authentication - Quick Start (2 Minutes)

## Start Here! 👇

### Option 1: Automated Setup (Recommended)

**MacOS/Linux:**
```bash
cd smartbudget
chmod +x setup.sh
./setup.sh
```

**Windows (PowerShell):**
```powershell
cd smartbudget\smartbudget-backend
npm install
cp .env.example .env
# Edit .env with your values
npm run dev

# In another terminal:
cd smartbudget\my-project
npm install
cp .env.example .env.local
npm run dev
```

---

### Option 2: Manual Setup

#### Terminal 1 - Backend
```bash
cd smartbudget/smartbudget-backend
cp .env.example .env

# Edit .env - set MONGO_URI (local or MongoDB Atlas)
# Then:
npm install
npm run dev
```

#### Terminal 2 - Frontend
```bash
cd smartbudget/my-project
cp .env.example .env.local
npm install
npm run dev
```

---

## Test It! ✅

1. Open browser: **http://localhost:5173**
2. Click "Sign Up" or go to **/signup**
3. Create account:
   - Name: John Doe
   - Email: john@example.com
   - Password: SecurePass123!
4. You'll be logged in! 🎉

---

## What's Included?

✅ User Registration (Signup)
✅ User Login
✅ Password Hashing (Bcrypt)
✅ JWT Token Authentication
✅ Rate Limiting (5 attempts, 15 min lockout)
✅ Protected Routes
✅ Account Lockout Protection
✅ Cross-Tab Sync
✅ Comprehensive Error Handling

---

## Environment Setup

### Backend (.env)
```env
MONGO_URI=mongodb://localhost:27017/smartbudget
JWT_SECRET=any_secret_for_development
PORT=5000
NODE_ENV=development
CORS_ORIGINS=http://localhost:5173
```

### Frontend (.env.local)
```env
VITE_API_URL=http://localhost:5000/api
VITE_NODE_ENV=development
```

---

## API Endpoints

### Public
- `POST /api/auth/signup` - Create account
- `POST /api/auth/login` - Login
- `POST /api/auth/logout` - Logout

### Protected (Need token in header)
- `GET /api/auth/me` - Get current user
- `PUT /api/auth/profile` - Update profile
- `PUT /api/auth/change-password` - Change password
- `POST /api/auth/refresh-token` - Get new token

---

## Testing with Postman

### Signup
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

### Login
```
POST http://localhost:5000/api/auth/login
Content-Type: application/json

{
  "email": "john@example.com",
  "password": "SecurePass123!"
}
```

Copy the returned `token` and use in protected requests:
```
Authorization: Bearer <token>
```

---

## File Changes Summary

**Backend:**
- ✅ `src/models/User.js` - Enhanced with auth fields
- ✅ `src/controllers/authController.js` - NEW - Auth logic
- ✅ `src/middleware/rateLimitMiddleware.js` - NEW - Rate limiting
- ✅ `src/routes/authRoutes.js` - Updated with real endpoints
- ✅ `.env.example` - Updated with all options

**Frontend:**
- ✅ `src/pages/auth/Login.jsx` - Updated
- ✅ `src/pages/auth/Signup.jsx` - Completely rewritten
- ✅ `src/context/AuthProvider.jsx` - Enhanced state management
- ✅ `src/services/api.js` - Added interceptors
- ✅ `.env.example` - Updated

**Documentation:**
- ✅ `AUTHENTICATION.md` - Comprehensive guide
- ✅ `IMPLEMENTATION_SUMMARY.md` - Full details
- ✅ `QUICK_START.md` - This file

---

## Common Issues

**Backend won't connect:**
- Check MongoDB is running: `mongod`
- Check MONGO_URI in .env

**Frontend can't reach backend:**
- Check backend running on 5000
- Check VITE_API_URL in .env.local
- Check CORS_ORIGINS in backend .env

**Login fails:**
- Check email/password are correct
- Check user was created in DB
- Look at console errors

**Rate limited:**
- Wait 15 minutes or restart backend

---

## Next Steps

1. ✅ **Test login/signup** - Follow "Test It!" section
2. ✅ **Integrate to app** - Connect AuthProvider to your routes
3. ✅ **Protect routes** - Use `useAuth()` hook
4. ✅ **Deploy** - See AUTHENTICATION.md for deployment
5. ✅ **Add email verification** - Future enhancement
6. ✅ **Add 2FA** - Future enhancement

---

## Reference Docs

- **Full Setup Guide**: `AUTHENTICATION.md`
- **Implementation Details**: `IMPLEMENTATION_SUMMARY.md`
- **API Docs**: Inside `AUTHENTICATION.md`
- **Troubleshooting**: `AUTHENTICATION.md` → Troubleshooting section

---

## Using Auth in Your Components

```jsx
import { useAuth } from "../hooks/useAuth";

export function MyComponent() {
  const { user, logout, isAuthenticated } = useAuth();
  
  if (!isAuthenticated) return <p>Please log in</p>;
  
  return (
    <>
      <h1>Welcome, {user.name}!</h1>
      <button onClick={logout}>Logout</button>
    </>
  );
}
```

---

## Protected API Calls

```jsx
import api from "../services/api";

const response = await api.get("/users/me");
// Token automatically attached! ✅
// 401 errors automatically redirect to login! ✅
```

---

**Status**: ✅ Production Ready
**Last Updated**: April 2026
**Estimated Setup Time**: 5-10 minutes
