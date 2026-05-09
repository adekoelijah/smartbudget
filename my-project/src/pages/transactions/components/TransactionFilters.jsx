import Input from "../../../components/ui/Input";

const TransactionFilters = ({
  filter,
  setFilter,
  search,
  setSearch,
}) => {
  return (
    <div className="bg-white border rounded-3xl p-4 md:p-5 shadow-sm">

      <div className="flex flex-col md:flex-row gap-4 md:items-center">

        {/* SEARCH */}
        <div className="flex-1 col-1">
          <Input
            placeholder="Search transactions..."
            value={search}
            onChange={(e) => setSearch(e.target.value)}
          />
        </div>

        {/* FILTER */}
        <div className="w-full md:w-[220px]">
          <select
            value={filter}
            onChange={(e) => setFilter(e.target.value)}
            className="w-full h-11 px-4 rounded-xl border border-gray-200 bg-white text-sm font-medium text-gray-700 outline-none focus:ring-2 focus:ring-black focus:border-black transition"
          >
            <option value="all">All Transactions</option>
            <option value="income">Income Only</option>
            <option value="expense">Expenses Only</option>
          </select>
        </div>

      </div>

    </div>
  );
};

export default TransactionFilters;