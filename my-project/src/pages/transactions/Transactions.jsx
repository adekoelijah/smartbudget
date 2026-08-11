
import {
  Download,
  FileText,
  Plus,
  Search,
  SlidersHorizontal,
  X,
  ArrowDownRight,
  ArrowUpRight,
  WalletCards,
  ChevronLeft,
  ChevronRight,
  RotateCcw,
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
   CONSTANTS
========================================================= */

const TRANSACTION_CATEGORIES = [
  "Rent",
  "Food",
  "Transport",
  "Utilities",
  "Shopping",
  "Healthcare",
  "Education",
  "Entertainment",
  "Salary",
  "Business",
  "Investment",
  "Other",
];

const PAGE_SIZE = 10;

/* =========================================================
   HELPERS
========================================================= */

const formatCurrency = (value) => {
  return `₦${Number(value || 0).toLocaleString()}`;
};

const getDateValue = (transaction) => {
  return transaction?.date || transaction?.createdAt;
};

const getTransactionId = (transaction) => {
  return transaction?._id || transaction?.id;
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

  /* PAGINATION */
  const [currentPage, setCurrentPage] = useState(1);

  /* TRANSACTION FORM */
  const [form, setForm] = useState({
    title: "",
    amount: "",
    type: "expense",
    category: "Other",
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
     FILTER TRANSACTIONS
  ========================================================= */

  const filteredTransactions = useMemo(() => {
    const normalizedSearch =
      search.trim().toLowerCase();

    const now = new Date();

    return transactions.filter((transaction) => {
      /* SEARCH */

      const title =
        transaction.title?.toLowerCase() || "";

      const transactionCategory =
        transaction.category?.toLowerCase() || "";

      const matchesSearch =
        !normalizedSearch ||
        title.includes(normalizedSearch) ||
        transactionCategory.includes(
          normalizedSearch
        );

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
        const transactionDate = new Date(
          getDateValue(transaction)
        );

        if (
          Number.isNaN(
            transactionDate.getTime()
          )
        ) {
          return false;
        }

        const diff =
          now.getTime() -
          transactionDate.getTime();

        const days =
          diff / (1000 * 60 * 60 * 24);

        if (
          dateRange === "7" &&
          (days < 0 || days > 7)
        ) {
          return false;
        }

        if (
          dateRange === "30" &&
          (days < 0 || days > 30)
        ) {
          return false;
        }

        if (
          dateRange === "90" &&
          (days < 0 || days > 90)
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
     RESET PAGINATION WHEN FILTERS CHANGE
  ========================================================= */

  useEffect(() => {
    setCurrentPage(1);
  }, [
    search,
    filter,
    category,
    dateRange,
  ]);

  /* =========================================================
     PAGINATION
  ========================================================= */

  const totalPages = Math.max(
    1,
    Math.ceil(
      filteredTransactions.length / PAGE_SIZE
    )
  );

  useEffect(() => {
    if (currentPage > totalPages) {
      setCurrentPage(totalPages);
    }
  }, [currentPage, totalPages]);

  const paginatedTransactions = useMemo(() => {
    const startIndex =
      (currentPage - 1) * PAGE_SIZE;

    return filteredTransactions.slice(
      startIndex,
      startIndex + PAGE_SIZE
    );
  }, [
    filteredTransactions,
    currentPage,
  ]);

  const paginationStart =
    filteredTransactions.length === 0
      ? 0
      : (currentPage - 1) * PAGE_SIZE + 1;

  const paginationEnd = Math.min(
    currentPage * PAGE_SIZE,
    filteredTransactions.length
  );

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
    setCurrentPage(1);
  };

  /* =========================================================
     AI INSIGHT
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
      !form.amount ||
      Number(form.amount) <= 0
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
        category: "Other",
        date: new Date()
          .toISOString()
          .split("T")[0],
      });

      setCurrentPage(1);
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
            getTransactionId(transaction) !== id
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
     CSV EXPORT
  ========================================================= */

  const handleExportCSV = () => {
    if (!filteredTransactions.length) {
      return;
    }

    const headers = [
      "Description",
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
     PDF EXPORT
     
     Uses browser print-to-PDF so no additional
     dependency is required.
  ========================================================= */

  const handleExportPDF = () => {
    if (!filteredTransactions.length) {
      return;
    }

    const rows = filteredTransactions
      .map((transaction) => {
        const date = getDateValue(transaction)
          ? new Date(
              getDateValue(transaction)
            ).toLocaleDateString()
          : "-";

        return `
          <tr>
            <td>${transaction.title || "-"}</td>
            <td>${transaction.category || "-"}</td>
            <td>${transaction.type || "-"}</td>
            <td>₦${Number(
              transaction.amount || 0
            ).toLocaleString()}</td>
            <td>${date}</td>
          </tr>
        `;
      })
      .join("");

    const printWindow =
      window.open(
        "",
        "_blank",
        "width=1000,height=800"
      );

    if (!printWindow) {
      return;
    }

    printWindow.document.write(`
      <!DOCTYPE html>
      <html>
        <head>
          <title>SmartBudget Transactions</title>

          <style>
            * {
              box-sizing: border-box;
            }

            body {
              margin: 0;
              padding: 40px;
              font-family:
                Arial,
                Helvetica,
                sans-serif;
              color: #0f172a;
              background: #ffffff;
            }

            .header {
              display: flex;
              justify-content: space-between;
              align-items: flex-start;
              margin-bottom: 30px;
              padding-bottom: 20px;
              border-bottom: 1px solid #e2e8f0;
            }

            h1 {
              margin: 0;
              font-size: 26px;
            }

            .subtitle {
              margin-top: 6px;
              color: #64748b;
              font-size: 13px;
            }

            .date {
              color: #64748b;
              font-size: 12px;
            }

            table {
              width: 100%;
              border-collapse: collapse;
              margin-top: 20px;
            }

            th {
              padding: 12px;
              text-align: left;
              background: #f8fafc;
              border-bottom: 1px solid #cbd5e1;
              font-size: 11px;
              text-transform: uppercase;
              letter-spacing: .06em;
            }

            td {
              padding: 12px;
              border-bottom: 1px solid #e2e8f0;
              font-size: 12px;
            }

            .footer {
              margin-top: 25px;
              padding-top: 15px;
              border-top: 1px solid #e2e8f0;
              color: #64748b;
              font-size: 11px;
            }

            @media print {
              body {
                padding: 20px;
              }
            }
          </style>
        </head>

        <body>
          <div
            class="
              header
            "
          >
            <div>
              <h1>SmartBudget Transactions</h1>

              <div
                class="
                  subtitle
                "
              >
                Transaction activity report
              </div>
            </div>

            <div
              class="
                date
              "
            >
              Generated ${new Date().toLocaleString()}
            </div>
          </div>

          <table>
            <thead>
              <tr>
                <th>Description</th>
                <th>Category</th>
                <th>Type</th>
                <th>Amount</th>
                <th>Date</th>
              </tr>
            </thead>

            <tbody>
              ${rows}
            </tbody>
          </table>

          <div
            class="
              footer
            "
          >
            SmartBudget — Financial transaction report
          </div>
        </body>
      </html>
    `);

    printWindow.document.close();

    printWindow.focus();

    setTimeout(() => {
      printWindow.print();
      printWindow.close();
    }, 300);
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

        {/* =================================================
            PAGE HEADER
        ================================================= */}

        <section
          className="
            mb-5 sm:mb-6
          "
        >
          <div
            className="
              flex flex-col lg:flex-row lg:items-end lg:justify-between
              gap-4
            "
          >
            <div
              className="
                min-w-0
              "
            >
              <h1
                className="
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
                your complete financial activity.
              </p>
            </div>

            {/* EXPORT ACTIONS */}

            <div
              className="
                grid grid-cols-2 sm:flex
                sm:w-auto
                gap-2
              "
            >
              <button
                type="button"
                onClick={handleExportCSV}
                disabled={
                  filteredTransactions.length === 0
                }
                className="
                  inline-flex items-center justify-center
                  min-h-10
                  px-4
                  text-xs text-slate-700 sm:text-sm font-semibold
                  bg-white hover:bg-slate-50
                  rounded-xl border border-slate-200
                  shadow-sm transition disabled:opacity-50
                  disabled:cursor-not-allowed
                  gap-2
                "
              >
                <Download size={16} />
                CSV
              </button>

              <button
                type="button"
                onClick={handleExportPDF}
                disabled={
                  filteredTransactions.length === 0
                }
                className="
                  inline-flex items-center justify-center
                  min-h-10
                  px-4
                  text-xs text-white sm:text-sm font-semibold
                  bg-slate-950 hover:bg-slate-800
                  rounded-xl
                  shadow-sm transition disabled:opacity-50
                  disabled:cursor-not-allowed
                  gap-2
                "
              >
                <FileText size={16} />
                PDF
              </button>
            </div>
          </div>
        </section>

        {/* =================================================
            SUMMARY
        ================================================= */}

        <section
          className="
            grid grid-cols-1 sm:grid-cols-3
            mb-5
            gap-3 sm:gap-4
          "
        >
          <SummaryCard
            label="Total income"
            value={formatCurrency(summary.income)}
            icon={ArrowUpRight}
            iconClassName="
              bg-emerald-50
              text-emerald-600
            "
            valueClassName="text-emerald-700"
          />

          <SummaryCard
            label="Total expenses"
            value={formatCurrency(summary.expense)}
            icon={ArrowDownRight}
            iconClassName="
              bg-rose-50
              text-rose-600
            "
            valueClassName="text-rose-700"
          />

          <SummaryCard
            label="Net balance"
            value={formatCurrency(summary.balance)}
            icon={WalletCards}
            iconClassName="
              bg-slate-100
              text-slate-700
            "
          />
        </section>

        {/* =================================================
            ADD TRANSACTION
        ================================================= */}

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
              mb-4
            "
          >
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
              Record income or expenses using the
              categories used across SmartBudget.
            </p>
          </div>

          <form
            onSubmit={handleCreate}
            className="
              grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-12
              gap-3
            "
          >
            {/* DESCRIPTION */}

            <div
              className="
                lg:col-span-4
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
                placeholder="e.g. Monthly salary"
                className="
                  h-11
                  w-full
                  rounded-xl
                  border border-slate-200
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

            {/* AMOUNT */}

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
                  border border-slate-200
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

            {/* TYPE */}

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
                  border border-slate-200
                  bg-white
                  px-3.5
                  text-sm
                  font-medium
                  text-slate-700
                  outline-none
                  transition
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

            {/* CATEGORY */}

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
                Category
              </label>

              <select
                value={form.category}
                onChange={(event) =>
                  setForm((previous) => ({
                    ...previous,
                    category:
                      event.target.value,
                  }))
                }
                className="
                  h-11
                  w-full
                  rounded-xl
                  border border-slate-200
                  bg-white
                  px-3.5
                  text-sm
                  font-medium
                  text-slate-700
                  outline-none
                  transition
                  focus:border-slate-400
                  focus:ring-2
                  focus:ring-slate-100
                "
              >
                {TRANSACTION_CATEGORIES.map(
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
            </div>

            {/* SAVE */}

            <div
              className="
                flex items-end
                sm:col-span-2 lg:col-span-2
              "
            >
              <button
                type="submit"
                disabled={creating}
                className="
                  inline-flex items-center justify-center
                  h-11 w-full
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

        {/* =================================================
            TRANSACTION LEDGER
        ================================================= */}

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
                    : "Complete financial activity."}
                </p>
              </div>

              {/* SEARCH */}

              <div
                className="
                  relative
                  w-full lg:max-w-sm
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
                    border border-slate-200
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
                      transition
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

            {/* FILTERS */}

            <div
              className="
                mt-4
              "
            >
              <button
                type="button"
                onClick={() =>
                  setShowFilters(
                    (previous) => !previous
                  )
                }
                className="
                  inline-flex
                  min-h-10
                  items-center
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
                <SlidersHorizontal size={15} />

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
                  mt-2
                  grid
                  grid-cols-1
                  gap-2
                  sm:mt-0
                  sm:flex
                  sm:flex-wrap
                  ${
                    showFilters
                      ? "grid"
                      : "hidden sm:flex"
                  }
                `}
              >
                {/* TYPE */}

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
                    border border-slate-200
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

                {/* CATEGORY */}

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
                    border border-slate-200
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

                  {TRANSACTION_CATEGORIES.map(
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

                {/* DATE */}

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
                    border border-slate-200
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
                      transition
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

          {/* TRANSACTION CONTENT */}

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
                  paginatedTransactions
                }
                onDelete={handleDelete}
              />
            )}
          </div>

          {/* PAGINATION */}

          {!loading &&
            filteredTransactions.length > 0 && (
              <div
                className="
                  flex flex-col sm:flex-row sm:items-center sm:justify-between
                  p-4 sm:px-5
                  border-t border-slate-200
                  gap-3
                "
              >
                <div
                  className="
                    text-xs text-slate-500
                  "
                >
                  Showing{" "}
                  <span
                    className="
                      font-semibold text-slate-700
                    "
                  >
                    {paginationStart}
                  </span>{" "}
                  to{" "}
                  <span
                    className="
                      font-semibold text-slate-700
                    "
                  >
                    {paginationEnd}
                  </span>{" "}
                  of{" "}
                  <span
                    className="
                      font-semibold text-slate-700
                    "
                  >
                    {filteredTransactions.length}
                  </span>
                </div>

                <div
                  className="
                    flex items-center
                    gap-1.5
                  "
                >
                  {/* PREVIOUS */}

                  <button
                    type="button"
                    disabled={currentPage === 1}
                    onClick={() =>
                      setCurrentPage(
                        (previous) =>
                          Math.max(
                            1,
                            previous - 1
                          )
                      )
                    }
                    className="
                      inline-flex
                      h-9
                      w-9
                      items-center
                      justify-center
                      rounded-lg
                      border
                      border-slate-200
                      bg-white
                      text-slate-600
                      transition
                      hover:bg-slate-50
                      disabled:cursor-not-allowed
                      disabled:opacity-40
                    "
                    aria-label="Previous page"
                  >
                    <ChevronLeft size={16} />
                  </button>

                  {/* PAGE NUMBERS */}

                  <div
                    className="
                      flex items-center
                      gap-1
                    "
                  >
                    {Array.from(
                      {
                        length: totalPages,
                      },
                      (_, index) =>
                        index + 1
                    )
                      .filter((page) => {
                        if (
                          totalPages <= 5
                        ) {
                          return true;
                        }

                        if (page === 1) {
                          return true;
                        }

                        if (
                          page === totalPages
                        ) {
                          return true;
                        }

                        return (
                          Math.abs(
                            page -
                              currentPage
                          ) <= 1
                        );
                      })
                      .map((page, index, pages) => {
                        const previousPage =
                          pages[index - 1];

                        const showEllipsis =
                          previousPage &&
                          page -
                            previousPage >
                            1;

                        return (
                          <div
                            key={page}
                            className="
                              flex items-center
                              gap-1
                            "
                          >
                            {showEllipsis && (
                              <span
                                className="
                                  px-1
                                  text-xs text-slate-400
                                "
                              >
                                …
                              </span>
                            )}

                            <button
                              type="button"
                              onClick={() =>
                                setCurrentPage(
                                  page
                                )
                              }
                              className={`
                                flex
                                h-9
                                min-w-9
                                items-center
                                justify-center
                                rounded-lg
                                px-2
                                text-xs
                                font-semibold
                                transition
                                ${
                                  currentPage ===
                                  page
                                    ? "bg-slate-950 text-white"
                                    : "border border-slate-200 bg-white text-slate-600 hover:bg-slate-50"
                                }
                              `}
                            >
                              {page}
                            </button>
                          </div>
                        );
                      })}
                  </div>

                  {/* NEXT */}

                  <button
                    type="button"
                    disabled={
                      currentPage === totalPages
                    }
                    onClick={() =>
                      setCurrentPage(
                        (previous) =>
                          Math.min(
                            totalPages,
                            previous + 1
                          )
                      )
                    }
                    className="
                      inline-flex
                      h-9
                      w-9
                      items-center
                      justify-center
                      rounded-lg
                      border
                      border-slate-200
                      bg-white
                      text-slate-600
                      transition
                      hover:bg-slate-50
                      disabled:cursor-not-allowed
                      disabled:opacity-40
                    "
                    aria-label="Next page"
                  >
                    <ChevronRight size={16} />
                  </button>
                </div>
              </div>
            )}
        </section>

        {/* =================================================
            SECONDARY FINANCIAL INSIGHT
        ================================================= */}

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
