

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
import Onboarding from "./pages/Onboarding";

// ⚡ LAZY LOADED PRIVATE PAGES
const Dashboard = lazy(() => import("./pages/dashboard/Dashboard.jsx"));
const Budgets = lazy(() => import("./pages/Budgets/Budgets.jsx"));
const Transactions = lazy(() => import("./pages/Transactions/Transactions.jsx"));
const AddTransaction = lazy(() => import("./pages/Transactions/AddTransaction.jsx"));
const Reports = lazy(() => import("./pages/Reports/Reports.jsx"));
const Settings = lazy(() => import("./pages/Settings/Settings.jsx"));


//settings import

const ProfileSettings = lazy(() =>
  import("./pages/Settings/components/sections/ProfileSettings.jsx")
);

const SecuritySettings = lazy(() =>
  import("./pages/Settings/components/sections/SecuritySettings.jsx")
);

const NotificationSettings = lazy(() =>
  import("./pages/Settings/components/sections/NotificationSettings.jsx")
);

const PreferenceSettings = lazy(() =>
  import("./pages/Settings/components/sections/PreferenceSettings.jsx")
);

const BillingSettings = lazy(() =>
  import("./pages/Settings/components/sections/BillingSettings.jsx")
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

        {/* =========================
            🔒 PROTECTED APP ROUTES
        ========================== */}
        <Route element={<ProtectedRoute />}>
          
          <Route path="/app" element={<AppLayout />}>
            <Route index element={<Dashboard />} />
            <Route path="transactions" element={<Transactions />} />
            <Route path="add" element={<AddTransaction />} />
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