// import api from "../api/api";





// const SECURITY_ENDPOINTS = {

//   changePassword:
//     "/users/change-password",

//   enable2FA:
//     "/users/security/2fa/enable",

//   disable2FA:
//     "/users/security/2fa/disable",

//   sessions:
//     "/users/security/activity",

//   logoutSession:
//     "/users/security/session",

//   logoutAll:
//     "/users/security/logout-all",

// };








// /*
// ========================================
// CHANGE PASSWORD
// ========================================
// */

// export const changePasswordRequest = async(
//   payload
// )=>{


// const response =
// await api.put(
// SECURITY_ENDPOINTS.changePassword,
// payload
// );


// return response.data;

// };










// /*
// ========================================
// ENABLE TWO FACTOR
// ========================================
// */

// export const enableTwoFactorRequest =
// async()=>{


// const response =
// await api.post(
// SECURITY_ENDPOINTS.enable2FA
// );


// return response.data;

// };










// /*
// ========================================
// DISABLE TWO FACTOR
// ========================================
// */

// export const disableTwoFactorRequest =
// async()=>{


// const response =
// await api.post(
// SECURITY_ENDPOINTS.disable2FA
// );


// return response.data;

// };









// /*
// ========================================
// GET LOGIN SESSIONS
// ========================================
// */

// export const getLoginSessions =
// async()=>{


// const response =
// await api.get(
// SECURITY_ENDPOINTS.sessions
// );


// return response.data?.sessions || [];

// };










// /*
// ========================================
// REVOKE SINGLE SESSION
// ========================================
// */

// export const revokeSessionRequest =
// async(sessionId)=>{


// const response =
// await api.delete(
// `${SECURITY_ENDPOINTS.logoutSession}/${sessionId}`
// );


// return response.data;

// };









// /*
// ========================================
// LOGOUT ALL DEVICES
// ========================================
// */

// export const logoutAllDevicesRequest =
// async()=>{


// const response =
// await api.post(
// SECURITY_ENDPOINTS.logoutAll
// );


// return response.data;

// };










// /*
// ========================================
// SECURITY ERROR NORMALIZER
// ========================================
// */

// export const getSecurityError =
// (error)=>{


// return (

// error?.response?.data?.message

// ||

// error?.message

// ||

// "Security request failed"

// );


// };



import api from "./api";

/*
==================================================
SECURITY API ENDPOINTS
==================================================
*/

const SECURITY_ENDPOINTS = {
  changePassword: "/auth/change-password",

  sessions: "/auth/sessions",

  revokeSession: "/auth/sessions",

  logoutAll: "/auth/logout-all",

  enable2FA: "/auth/2fa/enable",

  verify2FA: "/auth/2fa/verify",

  disable2FA: "/auth/2fa/disable",
};

/*
==================================================
CHANGE PASSWORD
==================================================
*/

export const changePasswordRequest = async ({
  currentPassword,
  newPassword,
}) => {
  const { data } = await api.put(
    SECURITY_ENDPOINTS.changePassword,
    {
      currentPassword,
      newPassword,
    }
  );

  return data;
};

/*
==================================================
GET ACTIVE SESSIONS
==================================================
*/

export const getLoginSessions = async () => {
  const { data } = await api.get(
    SECURITY_ENDPOINTS.sessions
  );

  return data;
};

/*
==================================================
REVOKE SINGLE SESSION
==================================================
*/

export const revokeSessionRequest = async (
  sessionId
) => {
  const { data } = await api.delete(
    `${SECURITY_ENDPOINTS.revokeSession}/${sessionId}`
  );

  return data;
};

/*
==================================================
LOGOUT ALL OTHER DEVICES
==================================================
*/

export const logoutAllDevicesRequest =
  async () => {
    const { data } = await api.post(
      SECURITY_ENDPOINTS.logoutAll
    );

    return data;
  };

/*
==================================================
ENABLE TWO FACTOR AUTHENTICATION
==================================================
*/

export const enableTwoFactorRequest =
  async () => {
    const { data } = await api.post(
      SECURITY_ENDPOINTS.enable2FA
    );

    return data;
  };

/*
==================================================
VERIFY TWO FACTOR SETUP
==================================================
*/

export const verifyTwoFactorRequest =
  async (code) => {
    const { data } = await api.post(
      SECURITY_ENDPOINTS.verify2FA,
      {
        code,
      }
    );

    return data;
  };

/*
==================================================
DISABLE TWO FACTOR AUTHENTICATION
==================================================
*/

export const disableTwoFactorRequest =
  async (code) => {
    const { data } = await api.post(
      SECURITY_ENDPOINTS.disable2FA,
      {
        code,
      }
    );

    return data;
  };

/*
==================================================
ERROR NORMALIZER
==================================================
*/

export const getSecurityError = (
  error
) => {
  if (error?.response?.data?.message) {
    return error.response.data.message;
  }

  if (error?.message) {
    return error.message;
  }

  return "Something went wrong. Please try again.";
};

/*
==================================================
DEFAULT EXPORT
==================================================
*/

const securityService = {
  changePasswordRequest,
  getLoginSessions,
  revokeSessionRequest,
  logoutAllDevicesRequest,
  enableTwoFactorRequest,
  verifyTwoFactorRequest,
  disableTwoFactorRequest,
  getSecurityError,
};

export default securityService;