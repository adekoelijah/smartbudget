// import api from "./api"; 
import api from "../../../services/api";// your axios instance

/* =========================
   NORMALIZER (CRITICAL)
========================= */
const normalizeResponse = (res) => {
  if (!res) return [];

  // axios standard
  if (Array.isArray(res?.data?.transactions)) return res.data.transactions;

  if (Array.isArray(res?.data)) return res.data;

  if (Array.isArray(res?.transactions)) return res.transactions;

  if (Array.isArray(res)) return res;

  return [];
};


//new 

export const exportTransactionsCSV = (
  transactions = []
) => {
  if (!transactions.length) return;

  const headers = [
    "Title",
    "Category",
    "Type",
    "Amount",
    "Date",
  ];

  const rows = transactions.map((t) => [
    t.title,
    t.category,
    t.type,
    t.amount,
    new Date(
      t.date || t.createdAt
    ).toLocaleDateString(),
  ]);

  const csvContent = [
    headers.join(","),
    ...rows.map((r) =>
      r.join(",")
    ),
  ].join("\n");

  const blob = new Blob(
    [csvContent],
    {
      type: "text/csv;charset=utf-8;",
    }
  );

  const url =
    window.URL.createObjectURL(blob);

  const link =
    document.createElement("a");

  link.href = url;

  link.setAttribute(
    "download",
    `transactions-${Date.now()}.csv`
  );

  document.body.appendChild(link);

  link.click();

  document.body.removeChild(link);
};

/* =========================
   ERROR HANDLER
========================= */
const handleError = (error) => {
  console.error("Transaction Service Error:", error);

  return {
    success: false,
    message:
      error?.response?.data?.message ||
      error.message ||
      "Something went wrong",
    data: [],
  };
};

/* =========================
   GET TRANSACTIONS
========================= */
export const getTransactions = async (params = {}) => {
  try {
    const res = await api.get("/transactions", { params });

    return {
      success: true,
      data: normalizeResponse(res),
    };
  } catch (error) {
    return handleError(error);
  }
};

/* =========================
   CREATE TRANSACTION
========================= */
export const createTransaction = async (payload) => {
  try {
    const res = await api.post("/transactions", payload);

    return {
      success: true,
      data: res?.data?.transaction || res?.data || payload,
    };
  } catch (error) {
    return handleError(error);
  }
};

/* =========================
   UPDATE TRANSACTION
========================= */
export const updateTransaction = async (id, payload) => {
  try {
    const res = await api.put(`/transactions/${id}`, payload);

    return {
      success: true,
      data: res?.data?.transaction || res?.data || payload,
    };
  } catch (error) {
    return handleError(error);
  }
};

/* =========================
   DELETE TRANSACTION
========================= */
export const deleteTransaction = async (id) => {
  try {
    await api.delete(`/transactions/${id}`);

    return {
      success: true,
      data: id,
    };
  } catch (error) {
    return handleError(error);
  }
};

/* =========================
   BULK IMPORT (OPTIONAL)
========================= */
export const importTransactions = async (file) => {
  try {
    const formData = new FormData();
    formData.append("file", file);

    const res = await api.post("/transactions/import", formData, {
      headers: { "Content-Type": "multipart/form-data" },
    });

    return {
      success: true,
      data: normalizeResponse(res),
    };
  } catch (error) {
    return handleError(error);
  }
};

/* =========================
   FILTER HELPERS (OPTIONAL)
========================= */
export const buildQuery = (filters = {}) => {
  const query = {};

  if (filters.type) query.type = filters.type;
  if (filters.category) query.category = filters.category;
  if (filters.startDate) query.startDate = filters.startDate;
  if (filters.endDate) query.endDate = filters.endDate;

  return query;
};