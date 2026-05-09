import axios from "axios";

const API = "http://localhost:5000/api/transactions";

export const createTransaction = async (payload, token) => {
  const res = await axios.post(API, payload, {
    headers: {
      Authorization: `Bearer ${token}`,
    },
  });

  return res.data;
};

export const getTransactions = async (token) => {
  const res = await axios.get(API, {
    headers: {
      Authorization: `Bearer ${token}`,
    },
  });

  return res.data;
};