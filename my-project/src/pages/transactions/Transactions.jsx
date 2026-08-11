
import {
  Download,
  Plus,
  Search,
  SlidersHorizontal,
  X,
  ArrowDownRight,
  ArrowUpRight,
  WalletCards,
} from "lucide-react";

import { useEffect, useMemo, useState } from "react";

import TransactionList from "./components/TransactionList";
import TransactionEmptyState from "./components/TransactionEmptyState";

import {
  getTransactions,
  createTransaction,
  deleteTransaction,
} from "../../services/transactionService";

import { useBudgets } from "../../hooks/useBudgets";
import { computeFinancialInsights } from "../../utils/financeAI";


/* =========================================================
   HELPERS
========================================================= */

const formatCurrency = (value) => {
  return `₦${Number(value || 0).toLocaleString()}`;
};

const getDateValue = (transaction) => {
  return transaction?.date || transaction?.createdAt;
};


/* =========================================================
   SUMMARY CARD
========================================================= */

const SummaryCard = ({
  label,
  value,
  icon: Icon,
  iconClassName,
  valueClassName = "text-slate-900",
}) => {
  return (
    <div
      className="
        min-w-0
        p-4 sm:p-5
        bg-white
        rounded-2xl border border-slate-200
        shadow-[0_4px_20px_rgba(15,23,42,0.04)]
      "
    >
      <div
        className="
          flex items-start justify-between
          gap-3
        "
      >
        <div
          className="
            min-w-0
          "
        >
          <p
            className="
              text-xs text-slate-500 font-medium
            "
          >
            {label}
          </p>

          <p
            className={`
              mt-2
              truncate
              text-lg sm:text-xl
              font-bold
              tracking-tight
              ${valueClassName}
            `}
          >
            {value}
          </p>
        </div>

        <div
          className={`
            flex h-9 w-9 shrink-0
            items-center justify-center
            rounded-xl
            ${iconClassName}
          `}
        >
          <Icon size={17} />
        </div>
      </div>
    </div>
  );
};


/* =========================================================
   TRANSACTIONS
========================================================= */

const Transactions = () => {
  const [transactions, setTransactions] = useState([]);

  const [loading, setLoading] = useState(true);
  const [creating, setCreating] = useState(false);

  /* SEARCH */
  const [search, setSearch] = useState("");

  /* FILTERS */
  const [filter, setFilter] = useState("all");
  const [category, setCategory] = useState("all");
  const [dateRange, setDateRange] = useState("all");

  /* MOBILE FILTER PANEL */
  const [showFilters, setShowFilters] = useState(false);

  /* TRANSACTION FORM */
  const [form, setForm] = useState({
    title: "",
    amount: "",
    type: "expense",
    category: "general",
    date: new Date().toISOString().split("T")[0],
  });

  const { budgets } = useBudgets?.() || {
    budgets: [],
  };


  /* =========================================================
     FETCH TRANSACTIONS
  ========================================================= */

  useEffect(() => {
    let mounted = true;

    const fetchTransactions = async () => {
      try {
        setLoading(true);

        const data = await getTransactions();

        if (mounted) {
          setTransactions(
            Array.isArray(data)
              ? data
              : data?.transactions || []
          );
        }
      } catch (error) {
        console.error(
          "GET_TRANSACTIONS_ERROR:",
          error
        );
      } finally {
        if (mounted) {
          setLoading(false);
        }
      }
    };

    fetchTransactions();

    return () => {
      mounted = false;
    };
  }, []);


  /* =========================================================
     CATEGORY OPTIONS
  ========================================================= */

  const categories = useMemo(() => {
    const values = transactions
      .map((transaction) => transaction.category)
      .filter(Boolean);

    return [...new Set(values)].sort();
  }, [transactions]);


  /* =========================================================
     FILTER TRANSACTIONS
  ========================================================= */

  const filteredTransactions = useMemo(() => {
    const normalizedSearch =
      search.trim().toLowerCase();

    const now = new Date();

    return transactions.filter((transaction) => {
      /* SEARCH */

      const matchesSearch =
        !normalizedSearch ||
        transaction.title
          ?.toLowerCase()
          .includes(normalizedSearch) ||
        transaction.category
          ?.toLowerCase()
          .includes(normalizedSearch);

      if (!matchesSearch) {
        return false;
      }


      /* TYPE */

      if (
        filter !== "all" &&
        transaction.type !== filter
      ) {
        return false;
      }


      /* CATEGORY */

      if (
        category !== "all" &&
        transaction.category !== category
      ) {
        return false;
      }


      /* DATE */

      if (dateRange !== "all") {
        const transactionDate =
          new Date(getDateValue(transaction));

        if (Number.isNaN(transactionDate.getTime())) {
          return false;
        }

        const diff =
          now.getTime() -
          transactionDate.getTime();

        const days =
          diff / (1000 * 60 * 60 * 24);

        if (
          dateRange === "7" &&
          days > 7
        ) {
          return false;
        }

        if (
          dateRange === "30" &&
          days > 30
        ) {
          return false;
        }

        if (
          dateRange === "90" &&
          days > 90
        ) {
          return false;
        }
      }

      return true;
    });
  }, [
    transactions,
    search,
    filter,
    category,
    dateRange,
  ]);


  /* =========================================================
     SUMMARY
  ========================================================= */

  const summary = useMemo(() => {
    let income = 0;
    let expense = 0;

    transactions.forEach((transaction) => {
      const amount =
        Number(transaction.amount) || 0;

      if (transaction.type === "income") {
        income += amount;
      } else {
        expense += amount;
      }
    });

    return {
      income,
      expense,
      balance: income - expense,
    };
  }, [transactions]);


  /* =========================================================
     ACTIVE FILTERS
  ========================================================= */

  const hasActiveFilters =
    search.trim() !== "" ||
    filter !== "all" ||
    category !== "all" ||
    dateRange !== "all";


  const clearFilters = () => {
    setSearch("");
    setFilter("all");
    setCategory("all");
    setDateRange("all");
  };


  /* =========================================================
     AI INSIGHTS
     
     Kept available for future analytics surfaces.
     It should not dominate the transaction ledger.
  ========================================================= */

  const aiInsights = useMemo(() => {
    return computeFinancialInsights(
      transactions,
      budgets
    );
  }, [transactions, budgets]);


  /* =========================================================
     CREATE TRANSACTION
  ========================================================= */

  const handleCreate = async (event) => {
    event.preventDefault();

    if (
      !form.title?.trim() ||
      !form.amount
    ) {
      return;
    }

    try {
      setCreating(true);

      const created =
        await createTransaction({
          ...form,
          title: form.title.trim(),
          amount: Number(form.amount),
        });

      setTransactions((previous) => [
        created,
        ...previous,
      ]);

      setForm({
        title: "",
        amount: "",
        type: "expense",
        category: "general",
        date: new Date()
          .toISOString()
          .split("T")[0],
      });
    } catch (error) {
      console.error(
        "CREATE_TRANSACTION_ERROR:",
        error
      );
    } finally {
      setCreating(false);
    }
  };


  /* =========================================================
     DELETE TRANSACTION
  ========================================================= */

  const handleDelete = async (id) => {
    try {
      await deleteTransaction(id);

      setTransactions((previous) =>
        previous.filter(
          (transaction) =>
            transaction._id !== id
        )
      );
    } catch (error) {
      console.error(
        "DELETE_TRANSACTION_ERROR:",
        error
      );
    }
  };


  /* =========================================================
     EXPORT
  ========================================================= */

  const handleExport = () => {
    if (!filteredTransactions.length) {
      return;
    }

    const headers = [
      "Title",
      "Amount",
      "Type",
      "Category",
      "Date",
    ];

    const rows = filteredTransactions.map(
      (transaction) => [
        transaction.title || "",
        transaction.amount || 0,
        transaction.type || "",
        transaction.category || "",
        getDateValue(transaction) || "",
      ]
    );

    const csv = [
      headers,
      ...rows,
    ]
      .map((row) =>
        row
          .map((value) =>
            `"${String(value).replaceAll(
              '"',
              '""'
            )}"`
          )
          .join(",")
      )
      .join("\n");

    const blob = new Blob(
      [csv],
      {
        type: "text/csv;charset=utf-8;",
      }
    );

    const url =
      URL.createObjectURL(blob);

    const link =
      document.createElement("a");

    link.href = url;

    link.download =
      `smartbudget-transactions-${new Date()
        .toISOString()
        .split("T")[0]}.csv`;

    document.body.appendChild(link);

    link.click();

    link.remove();

    URL.revokeObjectURL(url);
  };


  /* =========================================================
     UI
  ========================================================= */

  return (
    <main
      className="
        min-h-screen
        bg-slate-50
      "
    >
      <div
        className="
          w-full max-w-[1500px]
          mx-auto px-3 sm:px-5 lg:px-8 py-4 sm:py-6 lg:py-8
        "
      >

        {/* ===================================================
            PAGE HEADER
        =================================================== */}

        <section
          className="
            flex flex-col lg:flex-row lg:items-center lg:justify-between
            mb-5 sm:mb-6
            gap-4
          "
        >
          <div
            className="
              min-w-0
            "
          >
            <div
              className="
                flex items-center
                gap-2
              "
            >
              <div
                className="
                  flex items-center justify-center
                  h-9 w-9
                  text-white
                  bg-slate-900
                  rounded-xl
                  shrink-0
                "
              >
                <WalletCards size={17} />
              </div>

              <p
                className="
                  text-xs text-slate-500 font-semibold uppercase
                  tracking-[0.18em]
                "
              >
                Financial ledger
              </p>
            </div>

            <h1
              className="
                mt-3
                text-2xl text-slate-950 sm:text-3xl font-bold tracking-tight
              "
            >
              Transactions
            </h1>

            <p
              className="
                max-w-2xl
                mt-1.5
                text-sm text-slate-500 leading-relaxed
              "
            >
              Search, review, filter and manage
              every income and expense recorded
              in your account.
            </p>
          </div>


          {/* HEADER ACTIONS */}

          <div
            className="
              flex flex-col sm:flex-row
              w-full lg:w-auto
              gap-2
            "
          >
            <button
              type="button"
              onClick={handleExport}
              disabled={
                filteredTransactions.length === 0
              }
              className="
                inline-flex flex-1 sm:flex-none items-center justify-center
                min-h-11
                px-4
                text-sm text-slate-700 font-semibold
                bg-white hover:bg-slate-50
                rounded-xl border border-slate-200
                shadow-sm transition disabled:opacity-50
                disabled:cursor-not-allowed
                gap-2
              "
            >
              <Download size={16} />
              Export
            </button>

            <button
              type="button"
              onClick={() => {
                document
                  .getElementById(
                    "transaction-entry"
                  )
                  ?.scrollIntoView({
                    behavior: "smooth",
                    block: "center",
                  });
              }}
              className="
                inline-flex
                min-h-11
                flex-1
                items-center
                justify-center
                gap-2
                rounded-xl
                bg-slate-950
                px-4
                text-sm
                font-semibold
                text-white
                shadow-sm
                transition
                hover:bg-slate-800
                sm:flex-none
              "
            >
              <Plus size={17} />
              Add transaction
            </button>
          </div>
        </section>


        {/* ===================================================
            SUMMARY
        =================================================== */}

        <section
          className="
            grid grid-cols-1 sm:grid-cols-3
            mb-5
            gap-3 sm:gap-4
          "
        >
          <SummaryCard
            label="Total income"
            value={formatCurrency(
              summary.income
            )}
            icon={ArrowUpRight}
            iconClassName="
              bg-emerald-50
              text-emerald-600
            "
            valueClassName="
              text-emerald-700
            "
          />

          <SummaryCard
            label="Total expenses"
            value={formatCurrency(
              summary.expense
            )}
            icon={ArrowDownRight}
            iconClassName="
              bg-rose-50
              text-rose-600
            "
            valueClassName="
              text-rose-700
            "
          />

          <SummaryCard
            label="Net balance"
            value={formatCurrency(
              summary.balance
            )}
            icon={WalletCards}
            iconClassName="
              bg-slate-100
              text-slate-700
            "
          />
        </section>


        {/* ===================================================
            TRANSACTION ENTRY
        =================================================== */}

        <section
          id="transaction-entry"
          className="
            mb-5 p-4 sm:p-5
            bg-white
            rounded-2xl border border-slate-200
            shadow-[0_4px_20px_rgba(15,23,42,0.04)]
          "
        >
          <div
            className="
              flex flex-col sm:flex-row sm:items-end sm:justify-between
              mb-4
              gap-1
            "
          >
            <div>
              <h2
                className="
                  text-base text-slate-900 font-bold
                "
              >
                Add transaction
              </h2>

              <p
                className="
                  mt-1
                  text-xs text-slate-500
                "
              >
                Record an income or expense
                directly into your ledger.
              </p>
            </div>
          </div>

          <form
            onSubmit={handleCreate}
            className="
              grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-5
              gap-3
            "
          >
            <div
              className="
                lg:col-span-2
              "
            >
              <label
                className="
                  block
                  mb-1.5
                  text-xs text-slate-600 font-semibold
                "
              >
                Description
              </label>

              <input
                type="text"
                value={form.title}
                onChange={(event) =>
                  setForm((previous) => ({
                    ...previous,
                    title:
                      event.target.value,
                  }))
                }
                placeholder="e.g. Salary payment"
                className="
                  h-11
                  w-full
                  rounded-xl
                  border
                  border-slate-200
                  bg-white
                  px-3.5
                  text-sm
                  text-slate-900
                  outline-none
                  transition
                  placeholder:text-slate-400
                  focus:border-slate-400
                  focus:ring-2
                  focus:ring-slate-100
                "
              />
            </div>

            <div>
              <label
                className="
                  block
                  mb-1.5
                  text-xs text-slate-600 font-semibold
                "
              >
                Amount
              </label>

              <input
                type="number"
                min="0"
                step="0.01"
                value={form.amount}
                onChange={(event) =>
                  setForm((previous) => ({
                    ...previous,
                    amount:
                      event.target.value,
                  }))
                }
                placeholder="0.00"
                className="
                  h-11
                  w-full
                  rounded-xl
                  border
                  border-slate-200
                  bg-white
                  px-3.5
                  text-sm
                  text-slate-900
                  outline-none
                  transition
                  placeholder:text-slate-400
                  focus:border-slate-400
                  focus:ring-2
                  focus:ring-slate-100
                "
              />
            </div>

            <div>
              <label
                className="
                  block
                  mb-1.5
                  text-xs text-slate-600 font-semibold
                "
              >
                Type
              </label>

              <select
                value={form.type}
                onChange={(event) =>
                  setForm((previous) => ({
                    ...previous,
                    type:
                      event.target.value,
                  }))
                }
                className="
                  h-11
                  w-full
                  rounded-xl
                  border
                  border-slate-200
                  bg-white
                  px-3.5
                  text-sm
                  font-medium
                  text-slate-700
                  outline-none
                  focus:border-slate-400
                  focus:ring-2
                  focus:ring-slate-100
                "
              >
                <option value="expense">
                  Expense
                </option>

                <option value="income">
                  Income
                </option>
              </select>
            </div>

            <div>
              <label
                className="
                  block
                  mb-1.5
                  text-xs text-slate-600 font-semibold
                "
              >
                Category
              </label>

              <input
                type="text"
                value={form.category}
                onChange={(event) =>
                  setForm((previous) => ({
                    ...previous,
                    category:
                      event.target.value,
                  }))
                }
                placeholder="General"
                className="
                  h-11
                  w-full
                  rounded-xl
                  border
                  border-slate-200
                  bg-white
                  px-3.5
                  text-sm
                  text-slate-900
                  outline-none
                  transition
                  placeholder:text-slate-400
                  focus:border-slate-400
                  focus:ring-2
                  focus:ring-slate-100
                "
              />
            </div>

            <div
              className="
                lg:flex lg:justify-end
                sm:col-span-2 lg:col-span-5
              "
            >
              <button
                type="submit"
                disabled={creating}
                className="
                  inline-flex items-center justify-center
                  min-h-11 w-full lg:w-auto
                  px-5
                  text-sm text-white font-semibold
                  bg-slate-950 hover:bg-slate-800
                  rounded-xl
                  transition disabled:opacity-50
                  disabled:cursor-not-allowed
                  gap-2
                "
              >
                <Plus size={16} />

                {creating
                  ? "Saving..."
                  : "Save transaction"}
              </button>
            </div>
          </form>
        </section>


        {/* ===================================================
            LEDGER
        =================================================== */}

        <section
          className="
            overflow-hidden
            bg-white
            rounded-2xl border border-slate-200
            shadow-[0_4px_20px_rgba(15,23,42,0.04)]
          "
        >

          {/* LEDGER HEADER */}

          <div
            className="
              p-4 sm:p-5
              border-b border-slate-200
            "
          >
            <div
              className="
                flex flex-col lg:flex-row lg:items-center lg:justify-between
                gap-4
              "
            >

              <div>
                <div
                  className="
                    flex items-center
                    gap-2
                  "
                >
                  <h2
                    className="
                      text-base text-slate-900 font-bold
                    "
                  >
                    All transactions
                  </h2>

                  <span
                    className="
                      px-2 py-0.5
                      text-[10px] text-slate-600 font-bold
                      bg-slate-100
                      rounded-full
                    "
                  >
                    {filteredTransactions.length}
                  </span>
                </div>

                <p
                  className="
                    mt-1
                    text-xs text-slate-500
                  "
                >
                  {hasActiveFilters
                    ? "Showing transactions matching your filters."
                    : "Your complete financial activity."}
                </p>
              </div>


              {/* DESKTOP SEARCH */}

              <div
                className="
                  relative
                  w-full lg:max-w-xs
                "
              >
                <Search
                  size={16}
                  className="
                    absolute left-3.5 top-1/2
                    text-slate-400
                    pointer-events-none
                    -translate-y-1/2
                  "
                  /
                >

                <input
                  type="search"
                  value={search}
                  onChange={(event) =>
                    setSearch(
                      event.target.value
                    )
                  }
                  placeholder="Search transactions..."
                  className="
                    h-11
                    w-full
                    rounded-xl
                    border
                    border-slate-200
                    bg-slate-50
                    pl-10
                    pr-10
                    text-sm
                    outline-none
                    transition
                    placeholder:text-slate-400
                    focus:border-slate-400
                    focus:bg-white
                    focus:ring-2
                    focus:ring-slate-100
                  "
                />

                {search && (
                  <button
                    type="button"
                    onClick={() =>
                      setSearch("")
                    }
                    className="
                      absolute
                      right-2
                      top-1/2
                      flex
                      h-7
                      w-7
                      -translate-y-1/2
                      items-center
                      justify-center
                      rounded-lg
                      text-slate-400
                      hover:bg-slate-200
                      hover:text-slate-700
                    "
                    aria-label="Clear search"
                  >
                    <X size={14} />
                  </button>
                )}
              </div>
            </div>


            {/* FILTER BAR */}

            <div
              className="
                flex flex-col sm:flex-row sm:flex-wrap sm:items-center
                mt-4
                gap-2
              "
            >
              {/* MOBILE FILTER BUTTON */}

              <button
                type="button"
                onClick={() =>
                  setShowFilters(
                    (previous) =>
                      !previous
                  )
                }
                className="
                  inline-flex
                  min-h-10
                  items-center
                  justify-center
                  gap-2
                  rounded-xl
                  border
                  border-slate-200
                  bg-white
                  px-3.5
                  text-xs
                  font-semibold
                  text-slate-700
                  sm:hidden
                "
              >
                <SlidersHorizontal
                  size={15}
                />

                Filters

                {hasActiveFilters && (
                  <span
                    className="
                      flex items-center justify-center
                      h-5 min-w-5
                      px-1
                      text-[10px] text-white
                      bg-slate-900
                      rounded-full
                    "
                  >
                    !
                  </span>
                )}
              </button>


              <div
                className={`
                  grid
                  grid-cols-1
                  gap-2
                  sm:flex
                  sm:flex-wrap
                  ${
                    showFilters
                      ? "grid"
                      : "hidden sm:flex"
                  }
                `}
              >
                <select
                  value={filter}
                  onChange={(event) =>
                    setFilter(
                      event.target.value
                    )
                  }
                  className="
                    h-10
                    rounded-xl
                    border
                    border-slate-200
                    bg-white
                    px-3
                    text-xs
                    font-semibold
                    text-slate-700
                    outline-none
                    focus:border-slate-400
                  "
                >
                  <option value="all">
                    All types
                  </option>

                  <option value="income">
                    Income
                  </option>

                  <option value="expense">
                    Expenses
                  </option>
                </select>


                <select
                  value={category}
                  onChange={(event) =>
                    setCategory(
                      event.target.value
                    )
                  }
                  className="
                    h-10
                    rounded-xl
                    border
                    border-slate-200
                    bg-white
                    px-3
                    text-xs
                    font-semibold
                    text-slate-700
                    outline-none
                    focus:border-slate-400
                  "
                >
                  <option value="all">
                    All categories
                  </option>

                  {categories.map(
                    (item) => (
                      <option
                        key={item}
                        value={item}
                      >
                        {item}
                      </option>
                    )
                  )}
                </select>


                <select
                  value={dateRange}
                  onChange={(event) =>
                    setDateRange(
                      event.target.value
                    )
                  }
                  className="
                    h-10
                    rounded-xl
                    border
                    border-slate-200
                    bg-white
                    px-3
                    text-xs
                    font-semibold
                    text-slate-700
                    outline-none
                    focus:border-slate-400
                  "
                >
                  <option value="all">
                    Any date
                  </option>

                  <option value="7">
                    Last 7 days
                  </option>

                  <option value="30">
                    Last 30 days
                  </option>

                  <option value="90">
                    Last 90 days
                  </option>
                </select>


                {hasActiveFilters && (
                  <button
                    type="button"
                    onClick={clearFilters}
                    className="
                      inline-flex items-center justify-center
                      h-10
                      px-3
                      text-xs text-slate-500 hover:text-slate-900 font-semibold
                      hover:bg-slate-100
                      rounded-xl
                      gap-1.5
                    "
                  >
                    <X size={14} />
                    Clear filters
                  </button>
                )}
              </div>
            </div>
          </div>


          {/* =================================================
              TRANSACTION CONTENT
          ================================================= */}

          <div
            className="
              min-h-[280px]
            "
          >
            {loading ? (
              <div
                className="
                  flex items-center justify-center
                  min-h-[280px]
                  px-5 py-12
                "
              >
                <div
                  className="
                    text-center
                  "
                >
                  <div
                    className="
                      h-8 w-8
                      mx-auto
                      rounded-full border-2 border-slate-200 border-t-slate-900
                      animate-spin
                    "
                    /
                  >

                  <p
                    className="
                      mt-3
                      text-sm text-slate-500 font-medium
                    "
                  >
                    Loading transactions...
                  </p>
                </div>
              </div>
            ) : filteredTransactions.length ===
              0 ? (
              <div
                className="
                  p-5 sm:p-8
                "
              >
                <TransactionEmptyState />
              </div>
            ) : (
              <TransactionList
                transactions={
                  filteredTransactions
                }
                onDelete={handleDelete}
              />
            )}
          </div>
        </section>


        {/* ===================================================
            SMALL FINANCIAL INSIGHT
            Secondary — NOT THE MAIN PAGE
        =================================================== */}

        {aiInsights?.message &&
          transactions.length > 0 && (
            <section
              className="
                mt-5 p-4 sm:p-5
                bg-white
                rounded-2xl border border-slate-200
              "
            >
              <div
                className="
                  flex flex-col sm:flex-row sm:items-center sm:justify-between
                  gap-2
                "
              >
                <div>
                  <p
                    className="
                      text-xs text-slate-400 font-semibold uppercase
                      tracking-wider
                    "
                  >
                    Financial insight
                  </p>

                  <p
                    className="
                      mt-1
                      text-sm text-slate-700 font-medium leading-relaxed
                    "
                  >
                    {aiInsights.message}
                  </p>
                </div>

                {aiInsights.riskLevel && (
                  <span
                    className="
                      w-fit
                      px-3 py-1
                      text-[10px] text-slate-600 font-bold uppercase
                      tracking-wide
                      bg-slate-50
                      rounded-full border border-slate-200
                    "
                  >
                    {aiInsights.riskLevel} risk
                  </span>
                )}
              </div>
            </section>
          )}

      </div>
    </main>
  );
};

export default Transactions;
