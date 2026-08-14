

import { BrowserRouter, Routes, Route } from "react-router-dom";
import { Navigate, Outlet } from "react-router-dom";
import { lazy, Suspense } from "react";
import AppLayout from "./layouts/AppLayout";

import Navbar from "./components/landing/Navbar";
import ProtectedRoute from "./routes/ProtectedRoute";

// 🌐 PUBLIC PAGES 
import Landing from "./pages/Landing";
import Login from "./pages/auth/Login";
import Signup from "./pages/auth/Signup";
import VerifyEmail from "./pages/auth/VerifyEmail.jsx";
import EmailVerificationSuccess from "./pages/auth/EmailVerificationSuccess.jsx";
import ForgotPassword from "./pages/auth/ForgotPassword.jsx";
import ResetPassword from "./pages/auth/ResetPassword.jsx";
import AuthSuccess from "./pages/auth/AuthSuccess.jsx";



// import Onboarding from "./pages/Onboarding";

// ⚡ LAZY LOADED PRIVATE PAGES
const Dashboard = lazy(() => import("./pages/dashboard/Dashboard.jsx"));
const NotificationsPage =lazy(() => import ("./pages/notification/NotificationsPage.jsx"));
const Budgets = lazy(() => import("./pages/budgets/Budgets.jsx"));
const SmartSave = lazy(() => import("./pages/smartSave/SmartSave.jsx"));
const Transactions = lazy(() => import("./pages/transactions/Transactions.jsx"));
const AddTransaction = lazy(() => import("./pages/transactions/AddTransaction.jsx"));
const Reports = lazy(() => import("./pages/reports/Reports.jsx"));
const Settings = lazy(() => import("./pages/settings/Settings.jsx"));


//settings import

const ProfileSettings = lazy(() =>
  import("./pages/settings/components/sections/ProfileSettings.jsx")
);

const SecuritySettings = lazy(() =>
  import("./pages/settings/components/sections/SecuritySettings.jsx")
);

const NotificationSettings = lazy(() =>
  import("./pages/settings/components/sections/NotificationSettings.jsx")
);

const PreferenceSettings = lazy(() =>
  import("./pages/settings/components/sections/PreferenceSettings.jsx")
);

const BillingSettings = lazy(() =>
  import("./pages/settings/components/sections/BillingSettings.jsx")
);

const App = () => {
  return (
   
      <Routes>

        {/* =========================
            🌍 PUBLIC ROUTES
        ========================== */}
        <Route path="/" element={<Landing />} />
        <Route path="/login" element={<Login />} />
        <Route path="/signup" element={<Signup />} />
        <Route path="/verify-email" element ={<VerifyEmail/>}/>
        <Route path="/email-verified" element={<EmailVerificationSuccess />}/>
        <Route path="/forgot-password" element={<ForgotPassword />}/>
        <Route path="/reset-password/:token" element={<ResetPassword />}/>
        <Route path="/auth/success" element={<AuthSuccess />}/>

        {/* =========================
            🔒 PROTECTED APP ROUTES
        ========================== */}
        <Route element={<ProtectedRoute />}>
          
          <Route path="/app" element={<AppLayout />}>
            <Route index element={<Dashboard />} />
            <Route path="/app/notifications" element ={<NotificationsPage/>}/>
            <Route path="transactions" element={<Transactions />} />
            <Route path="add" element={<AddTransaction />} />
            <Route path="smart-save" element={<SmartSave />}/>
            <Route path="budgets" element={<Budgets />} />
            <Route path="reports" element={<Reports />} />



              <Route path="settings/*" element={<Settings />}>
            <Route index element={<ProfileSettings />} />
            <Route path="profile" element={<ProfileSettings />} />
            <Route path="security" element={<SecuritySettings />} />
            <Route path="notifications" element={<NotificationSettings />} />
            <Route path="preferences" element={<PreferenceSettings />} />
            <Route path="billing" element={<BillingSettings />} />
          </Route>
            
          </Route>
        
  

      

        </Route>

      </Routes>
  );
};

export default App;


