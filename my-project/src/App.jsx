


// import { Navigate, Outlet } from "react-router-dom";
// import { lazy, Suspense } from "react";

// import Navbar from "./components/landing/Navbar";
// import ProtectedRoute from "./routes/ProtectedRoute";

// // 🌐 PUBLIC PAGES
// import Landing from "./pages/Landing";
// import Login from "./pages/auth/Login";
// import Signup from "./pages/auth/Signup";
// import Onboarding from "./pages/Onboarding";

// // ⚡ LAZY LOADED PRIVATE PAGES
// const Dashboard = lazy(() => import("./pages/dashboard/Dashboard"));
// const Budgets = lazy(() => import("./pages/Budgets/Budgets"));
// const Transactions = lazy(() => import("./pages/Transactions/Transactions.jsx"));
// const Reports = lazy(() => import("./pages/Reports/Reports"));
// const Settings = lazy(() => import("./pages/Settings/Settings"));

// /**
//  * 🧠 PUBLIC LAYOUT (Landing, Auth pages)
//  */
// const PublicLayout = () => (
//   <>
//     <Navbar />
//     <main className="pt-20">
//       <Outlet />
//     </main>
//   </>
// );

// /**
//  * 🔐 APP LAYOUT (Dashboard pages)
//  * SaaS-style container system
//  */
// const AppLayout = () => (
//   <>
//     <Navbar />

//     <main className="pt-18 px-4 sm:px-6 lg:px-8 bg-gray-50 dark:bg-black min-h-screen">
//       <div className="max-w-7xl mx-auto">
//         <Outlet />
//       </div>
//     </main>
//   </>
// );

// const App = () => {
//   const isOnboarded = localStorage.getItem("onboarded");

//   return (
//     <Suspense
//       fallback={
//         <div className="h-screen flex items-center justify-center text-sm text-gray-500">
//           Loading...
//         </div>
//       }
//     >
//       <Routes>

//         {/* 🌍 PUBLIC ROUTES */}
//         <Route element={<PublicLayout />}>
//           <Route path="/" element={<Landing />} />
//           <Route path="/login" element={<Login />} />
//           <Route path="/signup" element={<Signup />} />

//           <Route
//             path="/onboarding"
//             element={
//               isOnboarded ? (
//                 <Navigate to="/app" />
//               ) : (
//                 <Onboarding />
//               )
//             }
//           />
//         </Route>

//         {/* 🔐 PROTECTED ROUTES */}
//         <Route
//           element={
//             <ProtectedRoute>
//               <AppLayout />
//             </ProtectedRoute>
//           }
//         >
//           <Route path="/app" element={<Dashboard />} />
//           <Route path="/app/budgets" element={<Budgets />} />
//           <Route path="/app/transactions" element={<Transactions />} />
//           <Route path="/app/reports" element={<Reports />} />
//           <Route path="/app/settings" element={<Settings />} />
//         </Route>

//         {/* 🔁 FALLBACK */}
//         <Route path="*" element={<Navigate to="/" />} />

//       </Routes>
//     </Suspense>
//   );
// };

// export default App;

import { BrowserRouter, Routes, Route } from "react-router-dom";


// import ProtectedRoute from "./routes/ProtectedRoute";

// // 🌍 PUBLIC

// import Landing from "./pages/landing";
// import Login from "./pages/auth/Login";
// import Signup from "./pages/auth/Signup";

// // 📊 PROTECTED PAGES
// import Dashboard from "./pages/dashboard/Dashboard";
// import Transactions from "./pages/transactions/Transactions";
// import AddTransaction from "./pages/transactions/AddTransaction";
// import Budgets from "./pages/budgets/Budgets";
// import Reports from "./pages/reports/Reports";
// import Settings from "./pages/settings/Settings";

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
const Dashboard = lazy(() => import("./pages/dashboard/Dashboard"));
const Budgets = lazy(() => import("./pages/Budgets/Budgets"));
const Transactions = lazy(() => import("./pages/Transactions/Transactions.jsx"));
const AddTransaction = lazy(() => import("./pages/Transactions/AddTransaction.jsx"));
const Reports = lazy(() => import("./pages/Reports/Reports"));
const Settings = lazy(() => import("./pages/Settings/Settings"));


//settings import

const ProfileSettings = lazy(() =>
  import("./pages/Settings/components/sections/ProfileSettings")
);

const SecuritySettings = lazy(() =>
  import("./pages/Settings/components/sections/SecuritySettings")
);

const NotificationSettings = lazy(() =>
  import("./pages/Settings/components/sections/NotificationSettings")
);

const PreferenceSettings = lazy(() =>
  import("./pages/Settings/components/sections/PreferenceSettings")
);

const BillingSettings = lazy(() =>
  import("./pages/Settings/components/sections/BillingSettings")
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