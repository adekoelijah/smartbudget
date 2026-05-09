import api from "./api.js";

export const getTransactions = async () => {
  const res = await api.get("/transactions");
  return res.data;
};

// export const createTransaction = async (data) => {
//   const res = await api.post("/transactions", data);
//   return res.data;
// };
export const createTransaction = async (data) => {
  const res = await api.post("/transactions", data);
  return res.data;
};

export const createExpenseTransaction = async (data) => {
  // 1. create transaction
  const transaction = await api.post("/transactions", data);

  // 2. sync budget ONLY for expenses
  if (data.type === "expense") {
    await api.patch("/budgets/sync", {
      category: data.category,
      amount: Number(data.amount),
    });
  }

  return transaction.data;
};

export const updateTransaction = async (id, data) => {
  const res = await api.put(`/transactions/${id}`, data);
  return res.data;
};

export const deleteTransaction = async (id) => {
  const res = await api.delete(`/transactions/${id}`);
  return res.data;
};