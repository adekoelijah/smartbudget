import { useMemo } from "react";
import { buildFinancialModel } from "../engine/FinancialEngine";

const TrendChart = ({ transactions = [] }) => {
  const data = useMemo(() => {
    return buildFinancialModel(transactions).trendData;
  }, [transactions]);

  return (
    <div>
      {/* plug into Recharts LineChart */}
      {JSON.stringify(data)}
    </div>
  );
};

export default TrendChart;