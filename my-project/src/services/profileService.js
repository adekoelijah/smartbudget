


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