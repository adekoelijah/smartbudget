
// import { Navigate } from "react-router-dom";
// //import { useAuth } from "../context/AuthContext";
// import { useAuth } from "../hooks/useAuth";

// const ProtectedRoute = ({ children }) => {
//   const { isAuthenticated, initializing } = useAuth();

//   if (initializing) {
//     return (
//       <div className="h-screen flex items-center justify-center">
//         Loading...
//       </div>
//     );
//   }

//   if (!isAuthenticated) {
//     return <Navigate to="/login" replace />;
//   }

//   return children;
// };

// export default ProtectedRoute;

import { Navigate, Outlet } from "react-router-dom";
import { useAuth } from "../hooks/useAuth";

const ProtectedRoute = () => {
  const { isAuthenticated, initializing } = useAuth();

  if (initializing) {
    return (
      <div className="h-screen flex items-center justify-center text-sm text-gray-500">
        Loading account...
      </div>
    );
  }

  if (!isAuthenticated) {
    return <Navigate to="/login" replace />;
  }

  return <Outlet />;
};

export default ProtectedRoute;