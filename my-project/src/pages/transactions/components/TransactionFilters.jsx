
import {
  Search,
  SlidersHorizontal,
  ChevronDown,
  X,
} from "lucide-react";

import Input from "../../../components/ui/Input";

const TransactionFilters = ({
  filter,
  setFilter,
  search,
  setSearch,
}) => {
  const hasSearch = Boolean(search);

  const clearSearch = () => {
    setSearch("");
  };

  return (
    <section
      className="relative bg-white/95 shadow-[0_10px_40px_rgba(15,23,42,0.05)] backdrop-blur-xl border border-slate-200/80 rounded-2xl sm:rounded-3xl overflow-hidden"
    >
      {/* ================================
          SUBTLE BACKGROUND
      ================================= */}

      <div
        className="absolute inset-0 pointer-events-none"
      >
        <div
          className="-top-16 -right-16 absolute bg-blue-100/40 blur-3xl rounded-full w-36 sm:w-48 h-36 sm:h-48"
          /
        >

        <div
          className="-bottom-20 -left-20 absolute bg-slate-100 blur-3xl rounded-full w-40 sm:w-52 h-40 sm:h-52"
          /
        >
      </div>

      {/* ================================
          CONTENT
      ================================= */}

      <div
        className="z-10 relative p-4 sm:p-5 lg:p-6"
      >
        {/* ================================
            HEADER
        ================================= */}

        <div
          className="flex flex-col gap-1 mb-4 sm:mb-5"
        >
          <div
            className="flex items-center gap-2"
          >
            <div
              className="flex justify-center items-center bg-slate-950 rounded-xl w-8 h-8 text-white shrink-0"
            >
              <SlidersHorizontal size={15} />
            </div>

            <div>
              <h3
                className="font-semibold text-slate-900 text-sm sm:text-base tracking-tight"
              >
                Transaction Controls
              </h3>
            </div>
          </div>

          <p
            className="ml-10 text-[11px] text-slate-500 sm:text-xs leading-relaxed"
          >
            Search and filter your financial activity.
          </p>
        </div>

        {/* ================================
            FILTER GRID
        ================================= */}

        <div
          className="gap-3 sm:gap-4 grid grid-cols-1 lg:grid-cols-[minmax(0,1fr)_240px]"
        >
          {/* ============================
              SEARCH
          ============================= */}

          <div
            className="min-w-0"
          >
            <label
              htmlFor="transaction-search"
              className="flex items-center gap-1.5 mb-2 font-semibold text-[11px] text-slate-600 sm:text-xs"
            >
              <Search size={13} />
              Search transactions
            </label>

            <div
              className="relative"
            >
              {/* SEARCH ICON */}

              <div
                className="top-1/2 left-3.5 absolute flex justify-center items-center text-slate-400 -translate-y-1/2 pointer-events-none"
              >
                <Search size={17} />
              </div>

              <Input
                id="transaction-search"
                placeholder="Search by title, category or amount..."
                value={search}
                onChange={(e) =>
                  setSearch(e.target.value)
                }
                className="bg-white shadow-sm pr-11 pl-11 border-slate-200 focus:border-slate-400 rounded-2xl focus:ring-2 focus:ring-slate-950/10 w-full h-11 sm:h-12 text-slate-900 placeholder:text-slate-400 text-sm transition-all"
              />

              {/* CLEAR */}

              {hasSearch && (
                <button
                  type="button"
                  onClick={clearSearch}
                  aria-label="Clear search"
                  className="top-1/2 right-2 absolute flex justify-center items-center hover:bg-slate-100 rounded-xl w-8 h-8 text-slate-400 hover:text-slate-700 transition -translate-y-1/2"
                >
                  <X size={15} />
                </button>
              )}
            </div>
          </div>

          {/* ============================
              FILTER
          ============================= */}

          <div
            className="min-w-0"
          >
            <label
              htmlFor="transaction-filter"
              className="flex items-center gap-1.5 mb-2 font-semibold text-[11px] text-slate-600 sm:text-xs"
            >
              <SlidersHorizontal size={13} />
              Transaction type
            </label>

            <div
              className="relative"
            >
              <select
                id="transaction-filter"
                value={filter}
                onChange={(e) =>
                  setFilter(e.target.value)
                }
                className="bg-white shadow-sm pr-11 pl-4 border border-slate-200 hover:border-slate-300 focus:border-slate-400 rounded-2xl outline-none focus:ring-2 focus:ring-slate-950/10 w-full h-11 sm:h-12 font-medium text-slate-700 text-sm transition-all appearance-none cursor-pointer"
              >
                <option value="all">
                  All Transactions
                </option>

                <option value="income">
                  Income Only
                </option>

                <option value="expense">
                  Expenses Only
                </option>
              </select>

              <div
                className="top-1/2 right-3.5 absolute text-slate-400 -translate-y-1/2 pointer-events-none"
              >
                <ChevronDown size={17} />
              </div>
            </div>
          </div>
        </div>

        {/* ================================
            ACTIVE FILTER STATUS
        ================================= */}

        {(hasSearch || filter !== "all") && (
          <div
            className="flex flex-wrap items-center gap-2 mt-4 pt-4 border-slate-100 border-t"
          >
            <span
              className="font-semibold text-[10px] text-slate-400 sm:text-[11px] uppercase tracking-wider"
            >
              Active:
            </span>

            {hasSearch && (
              <button
                type="button"
                onClick={clearSearch}
                className="inline-flex items-center gap-1.5 bg-blue-50 hover:bg-blue-100 px-2.5 border border-blue-100 rounded-xl min-h-8 font-medium text-[11px] text-blue-700 transition"
              >
                Search: "{search}"
                <X size={12} />
              </button>
            )}

            {filter !== "all" && (
              <button
                type="button"
                onClick={() => setFilter("all")}
                className="inline-flex items-center gap-1.5 bg-emerald-50 hover:bg-emerald-100 px-2.5 border border-emerald-100 rounded-xl min-h-8 font-medium text-[11px] text-emerald-700 transition"
              >
                {filter === "income"
                  ? "Income"
                  : "Expenses"}

                <X size={12} />
              </button>
            )}
          </div>
        )}
      </div>
    </section>
  );
};

export default TransactionFilters;
