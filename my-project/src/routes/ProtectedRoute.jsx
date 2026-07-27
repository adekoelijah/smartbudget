

import {
  Navigate,
  Outlet,
  useLocation,
} from "react-router-dom";

import { useAuth } from "../hooks/useAuth";

import AuthLoading from "../pages/auth/AuthLoading"



const ProtectedRoute = ({
  allowedRoles,
}) => {


  const {
    user,
    isAuthenticated,
    initializing,
  } = useAuth();


  const location = useLocation();



  /*
  =========================================
  SESSION RESTORATION
  =========================================
  */

  if (initializing) {
  return (
    <AuthLoading
      message="Loading your financial dashboard..."
    />
  );
}



  /*
  =========================================
  NOT AUTHENTICATED
  =========================================
  */

  if (!isAuthenticated) {


    return (

      <Navigate
        to="/login"
        replace
        state={{
          from: location,
        }}
      />

    );

  }




  /*
  =========================================
  ROLE PROTECTION
  =========================================
  */

  if (
    allowedRoles &&
    !allowedRoles.includes(user?.role)
  ) {


    return (

      <Navigate
        to="/unauthorized"
        replace
      />

    );

  }



  return <Outlet />;


};


export default ProtectedRoute;