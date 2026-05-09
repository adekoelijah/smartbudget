const BudgetVsActual = ({ transactions = [], budgets = [] }) => {
  const data = useMemo(() => {
    const model = buildFinancialModel(transactions);

    return budgets.map((b) => {
      const actual =
        model.categoryData.find(
          (c) => c.category === b.category
        )?.expense || 0;

      return {
        category: b.category,
        budget: b.amount,
        actual,
        variance: b.amount - actual,
      };
    });
  }, [transactions, budgets]);

  return <div>{JSON.stringify(data)}</div>;
};