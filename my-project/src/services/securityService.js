import api from "../api/api";





const SECURITY_ENDPOINTS = {

  changePassword:
    "/users/change-password",

  enable2FA:
    "/users/security/2fa/enable",

  disable2FA:
    "/users/security/2fa/disable",

  sessions:
    "/users/security/activity",

  logoutSession:
    "/users/security/session",

  logoutAll:
    "/users/security/logout-all",

};








/*
========================================
CHANGE PASSWORD
========================================
*/

export const changePasswordRequest = async(
  payload
)=>{


const response =
await api.put(
SECURITY_ENDPOINTS.changePassword,
payload
);


return response.data;

};










/*
========================================
ENABLE TWO FACTOR
========================================
*/

export const enableTwoFactorRequest =
async()=>{


const response =
await api.post(
SECURITY_ENDPOINTS.enable2FA
);


return response.data;

};










/*
========================================
DISABLE TWO FACTOR
========================================
*/

export const disableTwoFactorRequest =
async()=>{


const response =
await api.post(
SECURITY_ENDPOINTS.disable2FA
);


return response.data;

};









/*
========================================
GET LOGIN SESSIONS
========================================
*/

export const getLoginSessions =
async()=>{


const response =
await api.get(
SECURITY_ENDPOINTS.sessions
);


return response.data?.sessions || [];

};










/*
========================================
REVOKE SINGLE SESSION
========================================
*/

export const revokeSessionRequest =
async(sessionId)=>{


const response =
await api.delete(
`${SECURITY_ENDPOINTS.logoutSession}/${sessionId}`
);


return response.data;

};









/*
========================================
LOGOUT ALL DEVICES
========================================
*/

export const logoutAllDevicesRequest =
async()=>{


const response =
await api.post(
SECURITY_ENDPOINTS.logoutAll
);


return response.data;

};










/*
========================================
SECURITY ERROR NORMALIZER
========================================
*/

export const getSecurityError =
(error)=>{


return (

error?.response?.data?.message

||

error?.message

||

"Security request failed"

);


};