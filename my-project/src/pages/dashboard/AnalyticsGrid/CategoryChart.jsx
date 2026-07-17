import { useMemo } from "react";
import { buildFinancialModel } from "../engine/FinancialEngine";

const CategoryChart = ({ transactions = [] }) => {
  const data = useMemo(() => {
    return buildFinancialModel(transactions).categoryData;
  }, [transactions]);

  return <div>{JSON.stringify(data)}</div>;
};

export default CategoryChart;