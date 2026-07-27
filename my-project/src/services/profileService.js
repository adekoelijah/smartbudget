


import api from "./api";

const unwrap = (res) => res.data || res;

/* GET USER */
// export const getUser = async () => {
//   const res = await api.get("/users/me");
//   return unwrap(res);
// };
/* GET USER */
export const getUser = async () => {
  const res = await api.get("/auth/me");
  return unwrap(res);
};

/* UPDATE PROFILE */

// updated to auth instead of user
export const updateProfile = async (payload) => {
  const res = await api.put("/auth/me", payload);
  return unwrap(res);
};

/* UPLOAD AVATAR */
export const uploadAvatar = async (file) => {
  const form = new FormData();
  form.append("avatar", file);


  // updated to auth insteade of user
  const res = await api.post("/auth/avatar", form, {
    headers: { "Content-Type": "multipart/form-data" },
  });

  return unwrap(res);
};