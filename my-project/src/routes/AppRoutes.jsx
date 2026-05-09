import { BrowserRouter, Routes, Route } from "react-router-dom";
import Dashboard from "../pages/Dashboard";
import Login from "../pages/auth/Login";
import Signup from "../pages/auth/Signup";
import Insights from "../pages/Insights";
import Budgets from "../pages/Budgets";
import BudgetCard from "../components/ui/BudgetCard";
import Button from "../components/ui/Button";
import ChartCard from "../components/ui/ChartCard";
import Navbar from "../components/layout/Navbar";
import { Sidebar } from "lucide-react";
import MainLayout from "../components/layout/MainLayout";
import TransactionTable from "../components/finance/TransactionTable";
import Input from "../components/ui/Input";
import StatCard from "../components/ui/StatCard";
import Transactions from "../pages/Transactions";
import Reports from "../pages/reports/Reports";
import Settings from "../pages/settings/Settings";

//settings part

import ProfileSettings from "../pages/settings/components/sections/ProfileSettings";
import SecuritySettings from "../pages/settings/components/sections/SecuritySettings";
import NotificationSettings from "../pages/settings/components/sections/NotificationSettings";
import PreferenceSettings from "../pages/settings/components/sections/PreferenceSettings";
import BillingSettings from "../pages/settings/components/sections/BillingSettings";


const AppRoutes = () => {
  return (
    <BrowserRouter>
    
      <Routes>
        <Route path="/" element={<Landing />} />
        <Route path="/dashboard" element={<Dashboard />} />
        <Route path="/login" element={<Login />} />
        <Route path="/signup" element={<Signup />} />


        //settings
        {/* SETTINGS PARENT LAYOUT */}
      <Route path="/app/settings" element={<Settings />}>

        {/* CHILD ROUTES */}
        <Route index element={<ProfileSettings />} />
        <Route path="profile" element={<ProfileSettings />} />
        <Route path="security" element={<SecuritySettings />} />
        <Route path="notifications" element={<NotificationSettings />} />
        <Route path="preferences" element={<PreferenceSettings />} />
        <Route path="billing" element={<BillingSettings />} />
      </Route>
      </Routes>
    </BrowserRouter>
  );
};

export default AppRoutes;