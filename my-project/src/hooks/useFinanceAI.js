import { useMemo } from "react";
import { computeFinancialInsights } from "../utils/financeAI";

export const useFinanceAI = (transactions, budgets) => {
  return useMemo(() => {
    return computeFinancialInsights(transactions, budgets);
  }, [transactions, budgets]);
};