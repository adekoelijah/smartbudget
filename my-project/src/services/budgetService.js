import api from "./api.js";

// 📥 GET ALL
// export const getBudgets = async () => {
//   const res = await api.get("/budgets");
//   return res.data;
// };

export const getBudgets = async () => {
  const res = await api.get("/budgets");

  return Array.isArray(res.data)
    ? res.data
    : res.data?.budgets || [];
};

// ➕ CREATE
export const createBudget = async (data) => {
  const res = await api.post("/budgets", data);
  return res.data;
};

// ✏️ UPDATE
export const updateBudget = async (id, data) => {
  const res = await api.put(`/budgets/${id}`, data);
  return res.data;
};

// 🗑 DELETE
export const deleteBudget = async (id) => {
  const res = await api.delete(`/budgets/${id}`);
  return res.data;
};