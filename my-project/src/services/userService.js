// import api from "./api";

// /*
// =========================================
// HELPERS
// =========================================
// */

// const normalizeUserResponse = (response) => {
//   return (
//     response?.data?.user ??
//     response?.data ??
//     response?.user ??
//     response ??
//     null
//   );
// };

// /*
// =========================================
// GET CURRENT USER
// GET /auth/me
// =========================================
// */

// export const getCurrentUser = async () => {
//   const response = await api.get("/auth/me");

//   return normalizeUserResponse(response);
// };

// /*
// =========================================
// UPDATE USER PROFILE
// PUT /auth/profile
// =========================================
// */

// export const updateUserProfile = async (profileData) => {
//   const response = await api.put(
//     "/auth/profile",
//     profileData
//   );

//   return normalizeUserResponse(response);
// };

// /*
// =========================================
// UPDATE USER AVATAR
// PATCH /auth/avatar
// =========================================
// */

// export const updateUserAvatar = async (file) => {
//   const formData = new FormData();

//   formData.append("avatar", file);

//   const response = await api.patch(
//     "/auth/avatar",
//     formData,
//     {
//       headers: {
//         "Content-Type": "multipart/form-data",
//       },
//     }
//   );

//   return normalizeUserResponse(response);
// };

// /*
// =========================================
// UPDATE USER NOTIFICATIONS
// PUT /users/notifications

// Replace the endpoint if your backend
// uses a different route.
// =========================================
// */

// export const updateUserNotifications = async (settings) => {
//   const response = await api.put(
//     "/users/notifications",
//     settings
//   );

//   return normalizeUserResponse(response);
// };

// /*
// =========================================
// CHANGE PASSWORD
// PUT /auth/change-password
// =========================================
// */

// export const changeUserPassword = async (passwordData) => {
//   const response = await api.put(
//     "/auth/change-password",
//     passwordData
//   );

//   return response.data;
// };

// /*
// =========================================
// DELETE ACCOUNT
// DELETE /users/account
// =========================================
// */

// export const deleteUserAccount = async () => {
//   const response = await api.delete(
//     "/users/account"
//   );

//   return response.data;
// };

// /*
// =========================================
// ACTIVE SESSIONS
// GET /auth/sessions
// =========================================
// */

// export const getActiveSessions = async () => {
//   const response = await api.get(
//     "/auth/sessions"
//   );

//   return response.data;
// };

// /*
// =========================================
// LOGOUT OTHER DEVICES
// POST /auth/logout-all
// =========================================
// */

// export const logoutOtherDevices = async () => {
//   const response = await api.post(
//     "/auth/logout-all"
//   );

//   return response.data;
// };

import api from "./api";

/*
=========================================
UPDATE USER PROFILE
=========================================
*/

export const updateUserProfile = async (profileData) => {
  const response = await api.put(
    "/users/profile",
    profileData
  );

  return response.data;
};

/*
=========================================
UPDATE USER AVATAR
=========================================
*/

export const updateUserAvatar = async (formData) => {
  const response = await api.patch(
    "/users/avatar",
    formData,
    {
      headers: {
        "Content-Type": "multipart/form-data",
      },
    }
  );

  return response.data;
};

/*
=========================================
UPDATE NOTIFICATION SETTINGS
=========================================
*/

export const updateNotificationSettings = async (settings) => {
  const response = await api.put(
    "/users/notifications",
    settings
  );

  return response.data;
};

/*
=========================================
CHANGE PASSWORD
=========================================
*/

export const changePassword = async (passwordData) => {
  const response = await api.patch(
    "/users/change-password",
    passwordData
  );

  return response.data;
};

/*
=========================================
DELETE ACCOUNT
=========================================
*/

export const deleteAccount = async () => {
  const response = await api.delete(
    "/users/account"
  );

  return response.data;
};