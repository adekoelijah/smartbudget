import { useMemo } from "react";
import { buildFinancialModel } from "../engine/FinancialEngine";

const PieChart = ({ transactions = [] }) => {
  const data = useMemo(() => {
    const model = buildFinancialModel(transactions);

    return [
      { name: "Income", value: model.summary.income },
      { name: "Expense", value: model.summary.expense },
      { name: "Savings", value: model.summary.balance },
    ];
  }, [transactions]);

  return <div>{JSON.stringify(data)}</div>;
};

export default PieChart;