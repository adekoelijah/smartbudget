import { useState } from "react";

export const useGoals = () => {
  const [goals, setGoals] = useState([
    {
      id: 1,
      title: "Emergency Fund",
      target: 500000,
      saved: 120000,
    },
  ]);

  const addSavings = (id, amount) => {
    setGoals((prev) =>
      prev.map((g) =>
        g.id === id
          ? { ...g, saved: g.saved + amount }
          : g
      )
    );
  };

  return { goals, addSavings };
};