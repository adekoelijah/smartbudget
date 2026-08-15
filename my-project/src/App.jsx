import {
  Routes,
  Route,
} from "react-router-dom";

import {
  lazy,
  Suspense,
} from "react";

import AppLayout from "./layouts/AppLayout";

import ProtectedRoute from "./routes/ProtectedRoute";

/* =========================================================
   PUBLIC PAGES
========================================================= */

import Landing from "./pages/Landing";
import Login from "./pages/auth/Login";
import Signup from "./pages/auth/Signup";
import VerifyEmail from "./pages/auth/VerifyEmail.jsx";
import EmailVerificationSuccess from "./pages/auth/EmailVerificationSuccess.jsx";
import ForgotPassword from "./pages/auth/ForgotPassword.jsx";
import ResetPassword from "./pages/auth/ResetPassword.jsx";
import AuthSuccess from "./pages/auth/AuthSuccess.jsx";

/* =========================================================
   PRIVATE PAGES
========================================================= */

const Dashboard = lazy(
  () =>
    import(
      "./pages/dashboard/Dashboard.jsx"
    )
);

const NotificationsPage = lazy(
  () =>
    import(
      "./pages/notification/NotificationsPage.jsx"
    )
);

const Budgets = lazy(
  () =>
    import(
      "./pages/budgets/Budgets.jsx"
    )
);

const SmartSave = lazy(
  () =>
    import(
      "./pages/SmartSave/SmartSave.jsx"
    )
);

const Transactions = lazy(
  () =>
    import(
      "./pages/transactions/Transactions.jsx"
    )
);

const AddTransaction = lazy(
  () =>
    import(
      "./pages/transactions/AddTransaction.jsx"
    )
);

const Reports = lazy(
  () =>
    import(
      "./pages/reports/Reports.jsx"
    )
);

/* =========================================================
   SMARTSAVE PAGES
========================================================= */

const SavingsGoalsPage = lazy(
  () =>
    import(
      "./pages/SmartSave/components/SavingsGoals/SavingsGoalsPage.jsx"
    )
);

const SavingsActivityPage = lazy(
  () =>
    import(
      "./pages/SmartSave/components/SavingsActivity/SavingsActivityPage.jsx"
    )
);

const SavingsStrategiesPage = lazy(
  () =>
    import(
      "./pages/SmartSave/components/SavingsStrategies/SavingsStrategiesPage.jsx"
    )
);

const SavingsChallengesPage = lazy(
  () =>
    import(
      "./pages/SmartSave/components/SavingsChallenges/SavingsChallengesPage.jsx"
    )
);

const SavingForecastPage = lazy(
  () =>
    import(
      "./pages/SmartSave/components/SavingsForecast/SavingForecastPage.jsx"
    )
);

const SavingsInsightsPage = lazy(
  () =>
    import(
      "./pages/SmartSave/components/SavingsInsights/SavingsInsightsPage.jsx"
    )
);

const EmergencyFundPage = lazy(
  () =>
    import(
      "./pages/SmartSave/components/EmergencyFund/EmergencyFundPage.jsx"
    )
);

/* =========================================================
   SETTINGS
========================================================= */

const Settings = lazy(
  () =>
    import(
      "./pages/settings/Settings.jsx"
    )
);

const ProfileSettings = lazy(
  () =>
    import(
      "./pages/settings/components/sections/ProfileSettings.jsx"
    )
);

const SecuritySettings = lazy(
  () =>
    import(
      "./pages/settings/components/sections/SecuritySettings.jsx"
    )
);

const NotificationSettings = lazy(
  () =>
    import(
      "./pages/settings/components/sections/NotificationSettings.jsx"
    )
);

const PreferenceSettings = lazy(
  () =>
    import(
      "./pages/settings/components/sections/PreferenceSettings.jsx"
    )
);

const BillingSettings = lazy(
  () =>
    import(
      "./pages/settings/components/sections/BillingSettings.jsx"
    )
);

/* =========================================================
   APP
========================================================= */

const App = () => {
  return (
    <Routes>

      {/* ===================================================
          PUBLIC ROUTES
      =================================================== */}

      <Route
        path="/"
        element={<Landing />}
      />

      <Route
        path="/login"
        element={<Login />}
      />

      <Route
        path="/signup"
        element={<Signup />}
      />

      <Route
        path="/verify-email"
        element={<VerifyEmail />}
      />

      <Route
        path="/email-verified"
        element={
          <EmailVerificationSuccess />
        }
      />

      <Route
        path="/forgot-password"
        element={<ForgotPassword />}
      />

      <Route
        path="/reset-password/:token"
        element={<ResetPassword />}
      />

      <Route
        path="/auth/success"
        element={<AuthSuccess />}
      />

      {/* ===================================================
          PROTECTED ROUTES
      =================================================== */}

      <Route element={<ProtectedRoute />}>

        <Route
          path="/app"
          element={<AppLayout />}
        >

          {/* ===============================================
              DASHBOARD
          =============================================== */}

          <Route
            index
            element={<Dashboard />}
          />

          {/* ===============================================
              NOTIFICATIONS
          =============================================== */}

          <Route
            path="notifications"
            element={
              <NotificationsPage />
            }
          />

          {/* ===============================================
              TRANSACTIONS
          =============================================== */}

          <Route
            path="transactions"
            element={<Transactions />}
          />

          <Route
            path="add"
            element={<AddTransaction />}
          />

          {/* ===============================================
              SMARTSAVE
          =============================================== */}

          <Route
            path="smart-save"
            element={<SmartSave />}
          >

            {/* SmartSave Overview */}

            <Route
              index
              element={<SmartSave />}
            />

            {/* Goals */}

            <Route
              path="goals"
              element={
                <SavingsGoalsPage />
              }
            />

            {/* Activity */}

            <Route
              path="activity"
              element={
                <SavingsActivityPage />
              }
            />

            {/* Strategies */}

            <Route
              path="strategies"
              element={
                <SavingsStrategiesPage />
              }
            />

            {/* Challenges */}

            <Route
              path="challenges"
              element={
                <SavingsChallengesPage />
              }
            />

            {/* Forecast */}

            <Route
              path="forecast"
              element={
                <SavingForecastPage />
              }
            />

            {/* Insights */}

            <Route
              path="insights"
              element={
                <SavingsInsightsPage />
              }
            />

            {/* Emergency Fund */}

            <Route
              path="emergency-fund"
              element={
                <EmergencyFundPage />
              }
            />

          </Route>

          {/* ===============================================
              BUDGETS
          =============================================== */}

          <Route
            path="budgets"
            element={<Budgets />}
          />

          {/* ===============================================
              REPORTS
          =============================================== */}

          <Route
            path="reports"
            element={<Reports />}
          />

          {/* ===============================================
              SETTINGS
          =============================================== */}

          <Route
            path="settings"
            element={<Settings />}
          >

            <Route
              index
              element={
                <ProfileSettings />
              }
            />

            <Route
              path="profile"
              element={
                <ProfileSettings />
              }
            />

            <Route
              path="security"
              element={
                <SecuritySettings />
              }
            />

            <Route
              path="notifications"
              element={
                <NotificationSettings />
              }
            />

            <Route
              path="preferences"
              element={
                <PreferenceSettings />
              }
            />

            <Route
              path="billing"
              element={
                <BillingSettings />
              }
            />

          </Route>

        </Route>

      </Route>

    </Routes>
  );
};

export default App;