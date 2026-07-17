// import api from "./api.js";

// export const getTransactions = async () => {
//   const res = await api.get("/transactions");
//   return res.data;
// };


// export const createTransaction = async (data) => {
//   const res = await api.post("/transactions", data);
//   return res.data;
// };

// export const createExpenseTransaction = async (data) => {
//   // 1. create transaction
//   const transaction = await api.post("/transactions", data);

//   // 2. sync budget ONLY for expenses
//   if (data.type === "expense") {
//     await api.patch("/budgets/sync", {
//       category: data.category,
//       amount: Number(data.amount),
//     });
//   }

//   return transaction.data;
// };

// export const updateTransaction = async (id, data) => {
//   const res = await api.put(`/transactions/${id}`, data);
//   return res.data;
// };

// export const deleteTransaction = async (id) => {
//   const res = await api.delete(`/transactions/${id}`);
//   return res.data;
// };


import api from "./api.js";

/**
 * Normalize any API response into an array
 */
const extractArray = (response) => {
  if (Array.isArray(response)) return response;

  if (Array.isArray(response?.data)) return response.data;

  if (Array.isArray(response?.transactions)) return response.transactions;

  if (Array.isArray(response?.data?.transactions))
    return response.data.transactions;

  return [];
};

/**
 * Normalize any API response into an object
 */
const extractObject = (response) => {
  if (!response || typeof response !== "object") return {};

  if (response.data && typeof response.data === "object") {
    return response.data;
  }

  return response;
};

/* ================================
   GET TRANSACTIONS
================================ */

export const getTransactions = async () => {
  try {
    const res = await api.get("/transactions");

    return extractArray(res.data);
  } catch (error) {
    console.error("Failed to fetch transactions:", error);

    return [];
  }
};

/* ================================
   CREATE TRANSACTION
================================ */

export const createTransaction = async (data) => {
  try {
    const res = await api.post("/transactions", data);

    return extractObject(res.data);
  } catch (error) {
    console.error("Failed to create transaction:", error);
    throw error;
  }
};

/* ================================
   CREATE EXPENSE + SYNC BUDGET
================================ */

export const createExpenseTransaction = async (data) => {
  try {
    const transaction = await api.post("/transactions", data);

    if (data.type === "expense") {
      await api.patch("/budgets/sync", {
        category: data.category,
        amount: Number(data.amount),
      });
    }

    return extractObject(transaction.data);
  } catch (error) {
    console.error("Failed to create expense:", error);
    throw error;
  }
};

/* ================================
   UPDATE TRANSACTION
================================ */

export const updateTransaction = async (id, data) => {
  try {
    const res = await api.put(`/transactions/${id}`, data);

    return extractObject(res.data);
  } catch (error) {
    console.error("Failed to update transaction:", error);
    throw error;
  }
};

/* ================================
   DELETE TRANSACTION
================================ */

export const deleteTransaction = async (id) => {
  try {
    await api.delete(`/transactions/${id}`);

    return true;
  } catch (error) {
    console.error("Failed to delete transaction:", error);
    throw error;
  }
};