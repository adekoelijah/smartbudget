
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
import jsPDF from "jspdf";
import autoTable from "jspdf-autotable";

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
        border border-slate-200 rounded-2xl
        shadow-[0_4px_20px_rgba(15,23,42,0.04)]
      "
    >
      <div
        className="
          flex justify-between items-start
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
              font-medium text-slate-500 text-xs
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

 /* =========================================================
   PDF EXPORT
========================================================= */
const handleExportPDF = () => {
  if (!filteredTransactions.length) {
    return;
  }

  try {
    const pdf = new jsPDF({
      orientation: "landscape",
      unit: "mm",
      format: "a4",
    });

    const generatedDate = new Date().toLocaleString();

    /* =========================
       DOCUMENT HEADER
    ========================= */

    pdf.setFont("helvetica", "bold");
    pdf.setFontSize(20);
    pdf.setTextColor(15, 23, 42);

    pdf.text(
      "SmartBudget Transactions",
      14,
      18
    );

    pdf.setFont("helvetica", "normal");
    pdf.setFontSize(9);
    pdf.setTextColor(100, 116, 139);

    pdf.text(
      "Transaction activity report",
      14,
      25
    );

    pdf.text(
      `Generated: ${generatedDate}`,
      14,
      31
    );

    /* =========================
       SUMMARY
    ========================= */

    const totalIncome = filteredTransactions
      .filter(
        (transaction) =>
          transaction.type === "income"
      )
      .reduce(
        (total, transaction) =>
          total +
          (Number(transaction.amount) || 0),
        0
      );

    const totalExpenses = filteredTransactions
      .filter(
        (transaction) =>
          transaction.type === "expense"
      )
      .reduce(
        (total, transaction) =>
          total +
          (Number(transaction.amount) || 0),
        0
      );

    const netBalance =
      totalIncome - totalExpenses;

    pdf.setFont("helvetica", "bold");
    pdf.setFontSize(10);
    pdf.setTextColor(15, 23, 42);

    pdf.text(
      `Income: ${formatCurrency(totalIncome)}`,
      14,
      39
    );

    pdf.text(
      `Expenses: ${formatCurrency(totalExpenses)}`,
      75,
      39
    );

    pdf.text(
      `Balance: ${formatCurrency(netBalance)}`,
      145,
      39
    );

    /* =========================
       TABLE DATA
    ========================= */

    const tableRows = filteredTransactions.map(
      (transaction) => {
        const transactionDate =
          getDateValue(transaction);

        const formattedDate =
          transactionDate
            ? new Date(
                transactionDate
              ).toLocaleDateString()
            : "-";

        return [
          transaction.title || "-",
          transaction.category || "-",
          transaction.type
            ? transaction.type
                .charAt(0)
                .toUpperCase() +
              transaction.type.slice(1)
            : "-",
          `₦${Number(
            transaction.amount || 0
          ).toLocaleString()}`,
          formattedDate,
        ];
      }
    );

    /* =========================
       TABLE
    ========================= */

    autoTable(pdf, {
      startY: 45,

      head: [
        [
          "Description",
          "Category",
          "Type",
          "Amount",
          "Date",
        ],
      ],

      body: tableRows,

      theme: "grid",

      styles: {
        font: "helvetica",
        fontSize: 9,
        cellPadding: 3,
        textColor: [15, 23, 42],
        lineColor: [226, 232, 240],
        lineWidth: 0.2,
      },

      headStyles: {
        fillColor: [15, 23, 42],
        textColor: [255, 255, 255],
        fontStyle: "bold",
        fontSize: 8,
      },

      alternateRowStyles: {
        fillColor: [248, 250, 252],
      },

      columnStyles: {
        0: {
          cellWidth: 70,
        },
        1: {
          cellWidth: 45,
        },
        2: {
          cellWidth: 30,
        },
        3: {
          cellWidth: 40,
          halign: "right",
        },
        4: {
          cellWidth: 35,
        },
      },

      margin: {
        top: 45,
        right: 14,
        bottom: 20,
        left: 14,
      },

      didDrawPage: (data) => {
        const pageWidth =
          pdf.internal.pageSize.getWidth();

        const pageHeight =
          pdf.internal.pageSize.getHeight();

        /* Footer */

        pdf.setFont(
          "helvetica",
          "normal"
        );

        pdf.setFontSize(8);

        pdf.setTextColor(
          100,
          116,
          139
        );

        pdf.text(
          "SmartBudget — Financial transaction report",
          14,
          pageHeight - 10
        );

        pdf.text(
          `Page ${data.pageNumber}`,
          pageWidth - 25,
          pageHeight - 10,
          {
            align: "right",
          }
        );
      },
    });

    /* =========================
       DOWNLOAD
    ========================= */

    const date = new Date()
      .toISOString()
      .split("T")[0];

    pdf.save(
      `smartbudget-transactions-${date}.pdf`
    );
  } catch (error) {
    console.error(
      "PDF_EXPORT_ERROR:",
      error
    );
  }
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
              flex flex-col lg:flex-row lg:justify-between lg:items-end
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
                  font-bold text-slate-950 text-2xl sm:text-3xl tracking-tight
                "
              >
                Transactions
              </h1>

              <p
                className="
                  max-w-2xl
                  mt-1.5
                  text-slate-500 text-sm leading-relaxed
                "
              >
                Search, review, filter and manage
                your complete financial activity.
              </p>
            </div>

            {/* EXPORT ACTIONS */}

            <div
              className="
                sm:flex grid grid-cols-2
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
                  inline-flex justify-center items-center
                  min-h-10
                  px-4
                  font-semibold text-slate-700 text-xs sm:text-sm
                  bg-white hover:bg-slate-50
                  border border-slate-200 rounded-xl
                  disabled:opacity-50 shadow-sm transition
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
                  inline-flex justify-center items-center
                  min-h-10
                  px-4
                  font-semibold text-white text-xs sm:text-sm
                  bg-slate-950 hover:bg-slate-800
                  rounded-xl
                  disabled:opacity-50 shadow-sm transition
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
            border border-slate-200 rounded-2xl
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
                font-bold text-slate-900 text-base
              "
            >
              Add transaction
            </h2>

            <p
              className="
                mt-1
                text-slate-500 text-xs
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
                  font-semibold text-slate-600 text-xs
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
                className="bg-white px-3.5 border border-slate-200 focus:border-slate-400 rounded-xl outline-none focus:ring-2 focus:ring-slate-100 w-full h-11 text-slate-900 placeholder:text-slate-400 text-sm transition"
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
                  font-semibold text-slate-600 text-xs
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
                className="bg-white px-3.5 border border-slate-200 focus:border-slate-400 rounded-xl outline-none focus:ring-2 focus:ring-slate-100 w-full h-11 text-slate-900 placeholder:text-slate-400 text-sm transition"
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
                  font-semibold text-slate-600 text-xs
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
                className="bg-white px-3.5 border border-slate-200 focus:border-slate-400 rounded-xl outline-none focus:ring-2 focus:ring-slate-100 w-full h-11 font-medium text-slate-700 text-sm transition"
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
                  font-semibold text-slate-600 text-xs
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
                className="bg-white px-3.5 border border-slate-200 focus:border-slate-400 rounded-xl outline-none focus:ring-2 focus:ring-slate-100 w-full h-11 font-medium text-slate-700 text-sm transition"
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
                  inline-flex justify-center items-center
                  w-full h-11
                  px-5
                  font-semibold text-white text-sm
                  bg-slate-950 hover:bg-slate-800
                  rounded-xl
                  disabled:opacity-50 transition
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
            border border-slate-200 rounded-2xl
            shadow-[0_4px_20px_rgba(15,23,42,0.04)]
          "
        >
          {/* LEDGER HEADER */}

          <div
            className="
              p-4 sm:p-5
              border-slate-200 border-b
            "
          >
            <div
              className="
                flex flex-col lg:flex-row lg:justify-between lg:items-center
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
                      font-bold text-slate-900 text-base
                    "
                  >
                    All transactions
                  </h2>

                  <span
                    className="
                      px-2 py-0.5
                      font-bold text-[10px] text-slate-600
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
                    text-slate-500 text-xs
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
                    top-1/2 left-3.5 absolute
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
                  className="bg-slate-50 focus:bg-white pr-10 pl-10 border border-slate-200 focus:border-slate-400 rounded-xl outline-none focus:ring-2 focus:ring-slate-100 w-full h-11 placeholder:text-slate-400 text-sm transition"
                />

                {search && (
                  <button
                    type="button"
                    onClick={() =>
                      setSearch("")
                    }
                    className="top-1/2 right-2 absolute flex justify-center items-center hover:bg-slate-200 rounded-lg w-7 h-7 text-slate-400 hover:text-slate-700 transition -translate-y-1/2"
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
                className="sm:hidden inline-flex items-center gap-2 bg-white px-3.5 border border-slate-200 rounded-xl min-h-10 font-semibold text-slate-700 text-xs"
              >
                <SlidersHorizontal size={15} />

                Filters

                {hasActiveFilters && (
                  <span
                    className="
                      flex justify-center items-center
                      min-w-5 h-5
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
                  className="bg-white px-3 border border-slate-200 focus:border-slate-400 rounded-xl outline-none h-10 font-semibold text-slate-700 text-xs"
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
                  className="bg-white px-3 border border-slate-200 focus:border-slate-400 rounded-xl outline-none h-10 font-semibold text-slate-700 text-xs"
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
                  className="bg-white px-3 border border-slate-200 focus:border-slate-400 rounded-xl outline-none h-10 font-semibold text-slate-700 text-xs"
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
                      inline-flex justify-center items-center
                      h-10
                      px-3
                      font-semibold text-slate-500 hover:text-slate-900 text-xs
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
                  flex justify-center items-center
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
                      w-8 h-8
                      mx-auto
                      border-2 border-slate-200 border-t-slate-900 rounded-full
                      animate-spin
                    "
                    /
                  >

                  <p
                    className="
                      mt-3
                      font-medium text-slate-500 text-sm
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
                  flex flex-col sm:flex-row sm:justify-between sm:items-center
                  p-4 sm:px-5
                  border-slate-200 border-t
                  gap-3
                "
              >
                <div
                  className="
                    text-slate-500 text-xs
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
                    className="inline-flex justify-center items-center bg-white hover:bg-slate-50 disabled:opacity-40 border border-slate-200 rounded-lg w-9 h-9 text-slate-600 transition disabled:cursor-not-allowed"
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
                                  text-slate-400 text-xs
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
                    className="inline-flex justify-center items-center bg-white hover:bg-slate-50 disabled:opacity-40 border border-slate-200 rounded-lg w-9 h-9 text-slate-600 transition disabled:cursor-not-allowed"
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
                border border-slate-200 rounded-2xl
              "
            >
              <div
                className="
                  flex flex-col sm:flex-row sm:justify-between sm:items-center
                  gap-2
                "
              >
                <div>
                  <p
                    className="
                      font-semibold text-slate-400 text-xs uppercase
                      tracking-wider
                    "
                  >
                    Financial insight
                  </p>

                  <p
                    className="
                      mt-1
                      font-medium text-slate-700 text-sm leading-relaxed
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
                      font-bold text-[10px] text-slate-600 uppercase
                      tracking-wide
                      bg-slate-50
                      border border-slate-200 rounded-full
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
