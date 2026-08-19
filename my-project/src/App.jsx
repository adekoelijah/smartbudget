import {
  lazy,
  Suspense,
} from "react";

import {
  Route,
  Routes,
} from "react-router-dom";

import AppLayout from "./layouts/AppLayout";
import ProtectedRoute from "./routes/ProtectedRoute";
import SmartSaveLayout from "./pages/SmartSave/SmartSaveLayout.jsx";

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
   SMARTSAVE
========================================================= */

/*
 * SmartSave overview page.
 *
 * IMPORTANT:
 * This is the overview page only.
 * Child SmartSave pages are registered separately below.
 */
const SmartSaveOverviewPage = lazy(
  () =>
    import(
      "./pages/SmartSave/SmartSave.jsx"
    )
);

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

const SavingsForecastPage = lazy(
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
   LOADING FALLBACK
========================================================= */

const RouteLoadingFallback = () => (
  <div
    className="
      flex justify-center items-center
      w-full min-h-[60vh]
      bg-slate-50
    "
    role="status"
    aria-live="polite"
    aria-label="Loading page"
  >
    <div
      className="
        flex items-center
        text-slate-500 text-sm
        gap-3
      "
    >
      <span
        className="
          block
          w-5 h-5
          border-2 border-slate-300 border-t-slate-800 rounded-full
          animate-spin
        "
        aria-hidden="true"
      /
      >

      Loading...
    </div>
  </div>
);

/* =========================================================
   ROUTER
========================================================= */

const App = () => {
  return (
    <Suspense
      fallback={
        <RouteLoadingFallback />
      }
    >
      <Routes>

        {/* =================================================
            PUBLIC ROUTES
        ================================================= */}

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

        {/* =================================================
            PROTECTED APPLICATION
        ================================================= */}

        <Route
          element={<ProtectedRoute />}
        >
          <Route
            path="/app"
            element={<AppLayout />}
          >

            {/* =============================================
                DASHBOARD
            ============================================= */}

            <Route
              index
              element={<Dashboard />}
            />

            {/* =============================================
                NOTIFICATIONS
            ============================================= */}

            <Route
              path="notifications"
              element={
                <NotificationsPage />
              }
            />

            {/* =============================================
                TRANSACTIONS
            ============================================= */}

            <Route
              path="transactions"
              element={
                <Transactions />
              }
            />

            <Route
              path="add"
              element={
                <AddTransaction />
              }
            />

            {/* =============================================
    SMARTSAVE
    Canonical route:
    /app/smart-save
============================================= */}

<Route
  path="smart-save"
  element={<SmartSaveLayout />}
>
  {/* -----------------------------------------
      SmartSave Overview

      /app/smart-save
  ----------------------------------------- */}
  <Route
    index
    element={<SmartSaveOverviewPage />}
  />

  {/* -----------------------------------------
      Savings Goals

      /app/smart-save/goals
  ----------------------------------------- */}
  <Route
    path="goals"
    element={<SavingsGoalsPage />}
  />

  {/* -----------------------------------------
      Savings Activity

      /app/smart-save/activity
  ----------------------------------------- */}
  <Route
    path="activity"
    element={<SavingsActivityPage />}
  />

  {/* -----------------------------------------
      Savings Strategies

      /app/smart-save/strategies
  ----------------------------------------- */}
  <Route
    path="strategies"
    element={<SavingsStrategiesPage />}
  />

  {/* -----------------------------------------
      Savings Challenges

      /app/smart-save/challenges
  ----------------------------------------- */}
  <Route
    path="challenges"
    element={<SavingsChallengesPage />}
  />

  {/* -----------------------------------------
      Savings Forecast

      /app/smart-save/forecast
  ----------------------------------------- */}
  <Route
    path="forecast"
    element={<SavingsForecastPage />}
  />

  {/* -----------------------------------------
      Savings Insights

      /app/smart-save/insights
  ----------------------------------------- */}
  <Route
    path="insights"
    element={<SavingsInsightsPage />}
  />

  {/* -----------------------------------------
      Emergency Fund

      /app/smart-save/emergency-fund
  ----------------------------------------- */}
  <Route
    path="emergency-fund"
    element={<EmergencyFundPage />}
  />
</Route>

            {/* =============================================
                BUDGETS
            ============================================= */}

            <Route
              path="budgets"
              element={<Budgets />}
            />

            {/* =============================================
                REPORTS
            ============================================= */}

            <Route
              path="reports"
              element={<Reports />}
            />

            {/* =============================================
                SETTINGS
            ============================================= */}

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
    </Suspense>
  );
};

export default App;