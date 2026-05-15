

// import api from "./api";

// export const getUser = async () => {
//   const res = await api.get("/auth/me");
//   return res.data;
// };

// export const updateProfile = async (payload) => {
//   const res = await api.put("/auth/me", payload);
//   return res.data;
// };

// export const uploadAvatar = async (file) => {
//   const formData = new FormData();
//   formData.append("avatar", file);

//   const res = await api.post("/auth/avatar", formData);
//   return res.data;
// };








// import api from "./api";

// /* =========================================
//    NORMALIZE API RESPONSE
// ========================================= */
// const normalizeResponse = (response) => {
//   return response?.data || response;
// };

// /* =========================================
//    GET CURRENT AUTHENTICATED USER
// ========================================= */
// export const getUser = async () => {
//   try {
//     const response = await api.get("/users/me");

//     return normalizeResponse(response);
//   } catch (error) {
//     console.error("GET_USER_SERVICE_ERROR:", error);

//     throw (
//       error?.response?.data || {
//         success: false,
//         message: "Failed to fetch user profile",
//       }
//     );
//   }
// };

// /* =========================================
//    UPDATE USER PROFILE
// ========================================= */
// export const updateProfile = async (payload = {}) => {
//   try {
//     const sanitizedPayload = {
//       ...(payload.name !== undefined && {
//         name: payload.name.trim(),
//       }),

//       ...(payload.email !== undefined && {
//         email: payload.email.trim().toLowerCase(),
//       }),

//       ...(payload.avatar !== undefined && {
//         avatar: payload.avatar,
//       }),
//     };

//     const response = await api.put(
//       "/users/me",
//       sanitizedPayload
//     );

//     return normalizeResponse(response);
//   } catch (error) {
//     console.error("UPDATE_PROFILE_SERVICE_ERROR:", error);

//     throw (
//       error?.response?.data || {
//         success: false,
//         message: "Profile update failed",
//       }
//     );
//   }
// };

// /* =========================================
//    UPLOAD USER AVATAR
// ========================================= */
// export const uploadAvatar = async (file) => {
//   try {
//     if (!file) {
//       throw new Error("Avatar file is required");
//     }

//     const allowedTypes = [
//       "image/jpeg",
//       "image/png",
//       "image/webp",
//     ];

//     if (!allowedTypes.includes(file.type)) {
//       throw new Error(
//         "Only JPG, PNG, and WEBP images are allowed"
//       );
//     }

//     // 5MB LIMIT
//     const MAX_SIZE = 5 * 1024 * 1024;

//     if (file.size > MAX_SIZE) {
//       throw new Error(
//         "Avatar size must be less than 5MB"
//       );
//     }

//     const formData = new FormData();

//     formData.append("avatar", file);

//     const response = await api.post(
//       "/users/avatar",
//       formData,
//       {
//         headers: {
//           "Content-Type": "multipart/form-data",
//         },
//       }
//     );

//     return normalizeResponse(response);

//   } catch (error) {
//     console.error("UPLOAD_AVATAR_SERVICE_ERROR:", error);

//     throw (
//       error?.response?.data || {
//         success: false,
//         message:
//           error.message || "Avatar upload failed",
//       }
//     );
//   }
// };


import api from "./api";

const unwrap = (res) => res.data || res;

/* GET USER */
export const getUser = async () => {
  const res = await api.get("/users/me");
  return unwrap(res);
};

/* UPDATE PROFILE */
export const updateProfile = async (payload) => {
  const res = await api.put("/users/me", payload);
  return unwrap(res);
};

/* UPLOAD AVATAR */
export const uploadAvatar = async (file) => {
  const form = new FormData();
  form.append("avatar", file);

  const res = await api.post("/users/avatar", form, {
    headers: { "Content-Type": "multipart/form-data" },
  });

  return unwrap(res);
};