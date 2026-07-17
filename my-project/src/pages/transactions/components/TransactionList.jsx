import TransactionCard from "./TransactionCard";

const TransactionList = ({ transactions, onDelete }) => {
  return (
    <div className="space-y-3">

      {transactions.map((t) => (
        <TransactionCard
          key={t._id}
          transaction={t}
          onDelete={onDelete}
        />
      ))}

    </div>
  );
};

export default TransactionList;