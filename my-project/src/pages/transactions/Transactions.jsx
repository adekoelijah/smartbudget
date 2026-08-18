import {
  ArrowDownRight,
  ArrowUpRight,
  ChevronLeft,
  ChevronRight,
  Download,
  FileText,
  Plus,
  RotateCcw,
  Search,
  SlidersHorizontal,
  WalletCards,
  X,
} from "lucide-react";

import jsPDF from "jspdf";
import autoTable from "jspdf-autotable";

import {
  useCallback,
  useEffect,
  useMemo,
  useState,
} from "react";

import TransactionList from "./components/TransactionList";
import TransactionEmptyState from "./components/TransactionEmptyState";

import {
  createTransaction,
  deleteTransaction,
  getTransactions,
} from "../../services/transactionService";

import { useBudgets } from "../../hooks/useBudgets";
import { computeFinancialInsights } from "../../utils/financeAI";

/* =========================================================
   CONSTANTS
========================================================= */

const PAGE_SIZE = 10;

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

const INITIAL_FORM = {
  title: "",
  amount: "",
  type: "expense",
  category: "Other",
  date: new Date().toISOString().split("T")[0],
};

const INITIAL_FILTERS = {
  search: "",
  type: "all",
  category: "all",
  dateRange: "all",
};
const EMPTY_BUDGETS = Object.freeze([]);
/* =========================================================
   HELPERS
========================================================= */

const formatCurrency = (value) =>
  `₦${Number(value || 0).toLocaleString()}`;

const getTransactionId = (transaction) =>
  transaction?._id ?? transaction?.id ?? null;

const getTransactionDate = (transaction) =>
  transaction?.date ?? transaction?.createdAt ?? null;

const normalizeTransactionsResponse = (response) => {
  if (Array.isArray(response)) {
    return response;
  }

  if (Array.isArray(response?.transactions)) {
    return response.transactions;
  }

  if (Array.isArray(response?.data)) {
    return response.data;
  }

  if (Array.isArray(response?.data?.transactions)) {
    return response.data.transactions;
  }

  return [];
};

const getErrorMessage = (
  error,
  fallback = "Something went wrong. Please try again."
) => {
  return (
    error?.response?.data?.message ||
    error?.response?.data?.error ||
    error?.message ||
    fallback
  );
};

const createInitialForm = () => ({
  ...INITIAL_FORM,
  date: new Date().toISOString().split("T")[0],
});

/* =========================================================
   DATE HELPERS
========================================================= */

const isWithinDateRange = (transaction, range) => {
  if (range === "all") {
    return true;
  }

  const rawDate = getTransactionDate(transaction);

  if (!rawDate) {
    return false;
  }

  const transactionDate = new Date(rawDate);

  if (Number.isNaN(transactionDate.getTime())) {
    return false;
  }

  const now = new Date();

  /*
   * Compare calendar timestamps rather than relying
   * exclusively on milliseconds from "now".
   */
  const startDate = new Date(now);
  startDate.setHours(0, 0, 0, 0);

  const days = Number(range);

  startDate.setDate(startDate.getDate() - days);

  return transactionDate >= startDate && transactionDate <= now;
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
            className={`mt-2 truncate text-lg font-bold tracking-tight sm:text-xl ${valueClassName}`}
          >
            {value}
          </p>
        </div>

        <div
          className={`flex h-9 w-9 shrink-0 items-center justify-center rounded-xl ${iconClassName}`}
        >
          <Icon size={17} />
        </div>
      </div>
    </div>
  );
};

/* =========================================================
   LOADING STATE
========================================================= */

const TransactionsLoading = () => {
  return (
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
  );
};

/* =========================================================
   ERROR STATE
========================================================= */

const TransactionsError = ({
  message,
  onRetry,
}) => {
  return (
    <div
      className="
        flex justify-center items-center
        min-h-[280px]
        px-5 py-12
      "
    >
      <div
        className="
          max-w-md
          text-center
        "
      >
        <div
          className="
            flex justify-center items-center
            w-10 h-10
            mx-auto
            text-rose-600
            bg-rose-50
            rounded-full
          "
        >
          <X size={18} />
        </div>

        <h3
          className="
            mt-3
            font-bold text-slate-900
          "
        >
          Unable to load transactions
        </h3>

        <p
          className="
            mt-1
            text-slate-500 text-sm leading-relaxed
          "
        >
          {message}
        </p>

        <button
          type="button"
          onClick={onRetry}
          className="
            inline-flex items-center
            mt-4 px-4 py-2.5
            font-semibold text-white text-xs
            bg-slate-950 hover:bg-slate-800
            rounded-xl
            transition
            gap-2
          "
        >
          <RotateCcw size={14} />
          Try again
        </button>
      </div>
    </div>
  );
};

/* =========================================================
   MAIN COMPONENT
========================================================= */

const Transactions = () => {
  /* =======================================================
     DATA STATE
  ======================================================= */

  const [transactions, setTransactions] = useState([]);

  const [loading, setLoading] = useState(true);
  const [refreshing, setRefreshing] = useState(false);
  const [creating, setCreating] = useState(false);
  const [deletingId, setDeletingId] = useState(null);

  const [error, setError] = useState("");

  /* =======================================================
     UI STATE
  ======================================================= */

  const [showFilters, setShowFilters] = useState(false);

  const [filters, setFilters] = useState(
    INITIAL_FILTERS
  );

  const [currentPage, setCurrentPage] = useState(1);

  const [form, setForm] = useState(
    createInitialForm
  );

  /* =======================================================
     BUDGET DATA
  ======================================================= */

  const budgetState = useBudgets();

  const budgets = Array.isArray(budgetState?.budgets)
  ? budgetState.budgets
  : EMPTY_BUDGETS;

  /* =======================================================
     FILTER SETTERS
  ======================================================= */

  const updateFilter = useCallback(
    (key, value) => {
      setFilters((previous) => ({
        ...previous,
        [key]: value,
      }));

      /*
       * Reset pagination immediately when the user
       * changes the dataset being viewed.
       */
      setCurrentPage(1);
    },
    []
  );

  /* =======================================================
     FETCH TRANSACTIONS
  ======================================================= */

  const fetchTransactions = useCallback(
    async ({ silent = false } = {}) => {
      try {
        if (silent) {
          setRefreshing(true);
        } else {
          setLoading(true);
        }

        setError("");

        const response = await getTransactions();

        const normalized =
          normalizeTransactionsResponse(
            response
          );

        setTransactions(normalized);
      } catch (fetchError) {
        console.error(
          "GET_TRANSACTIONS_ERROR:",
          fetchError
        );

        setError(
          getErrorMessage(
            fetchError,
            "We could not retrieve your transactions."
          )
        );
      } finally {
        setLoading(false);
        setRefreshing(false);
      }
    },
    []
  );

  useEffect(() => {
    let active = true;

    const load = async () => {
      try {
        setLoading(true);
        setError("");

        const response =
          await getTransactions();

        if (!active) {
          return;
        }

        setTransactions(
          normalizeTransactionsResponse(
            response
          )
        );
      } catch (fetchError) {
        if (!active) {
          return;
        }

        console.error(
          "GET_TRANSACTIONS_ERROR:",
          fetchError
        );

        setError(
          getErrorMessage(
            fetchError,
            "We could not retrieve your transactions."
          )
        );
      } finally {
        if (active) {
          setLoading(false);
        }
      }
    };

    load();

    return () => {
      active = false;
    };
  }, []);

  /* =======================================================
     FILTERED TRANSACTIONS
  ======================================================= */

  const filteredTransactions = useMemo(() => {
    const normalizedSearch =
      filters.search.trim().toLowerCase();

    return transactions.filter(
      (transaction) => {
        const title = String(
          transaction?.title ?? ""
        ).toLowerCase();

        const category = String(
          transaction?.category ?? ""
        ).toLowerCase();

        /* SEARCH */

        if (
          normalizedSearch &&
          !title.includes(normalizedSearch) &&
          !category.includes(normalizedSearch)
        ) {
          return false;
        }

        /* TYPE */

        if (
          filters.type !== "all" &&
          transaction?.type !== filters.type
        ) {
          return false;
        }

        /* CATEGORY */

        if (
          filters.category !== "all" &&
          transaction?.category !==
            filters.category
        ) {
          return false;
        }

        /* DATE RANGE */

        if (
          !isWithinDateRange(
            transaction,
            filters.dateRange
          )
        ) {
          return false;
        }

        return true;
      }
    );
  }, [transactions, filters]);

  /* =======================================================
     PAGINATION
  ======================================================= */

  const totalPages = useMemo(() => {
    return Math.max(
      1,
      Math.ceil(
        filteredTransactions.length /
          PAGE_SIZE
      )
    );
  }, [filteredTransactions.length]);

  /*
   * IMPORTANT:
   *
   * We intentionally do NOT use an effect to continuously
   * synchronize currentPage with totalPages.
   *
   * Instead, derive the safe page value.
   *
   * This prevents the common:
   *
   * render -> effect -> setState -> render
   *
   * cascade.
   */

  const safeCurrentPage = Math.min(
    currentPage,
    totalPages
  );

  const paginatedTransactions = useMemo(() => {
    const start =
      (safeCurrentPage - 1) * PAGE_SIZE;

    return filteredTransactions.slice(
      start,
      start + PAGE_SIZE
    );
  }, [
    filteredTransactions,
    safeCurrentPage,
  ]);

  const paginationStart =
    filteredTransactions.length === 0
      ? 0
      : (safeCurrentPage - 1) *
          PAGE_SIZE +
        1;

  const paginationEnd = Math.min(
    safeCurrentPage * PAGE_SIZE,
    filteredTransactions.length
  );

  /* =======================================================
     SUMMARY
  ======================================================= */

  const summary = useMemo(() => {
    return transactions.reduce(
      (result, transaction) => {
        const amount =
          Number(transaction?.amount) || 0;

        if (transaction?.type === "income") {
          result.income += amount;
        } else if (
          transaction?.type === "expense"
        ) {
          result.expense += amount;
        }

        return result;
      },
      {
        income: 0,
        expense: 0,
      }
    );
  }, [transactions]);

  const balance =
    summary.income - summary.expense;

  /* =======================================================
     ACTIVE FILTERS
  ======================================================= */

  const hasActiveFilters =
    filters.search.trim() !== "" ||
    filters.type !== "all" ||
    filters.category !== "all" ||
    filters.dateRange !== "all";

  const clearFilters = useCallback(() => {
    setFilters(INITIAL_FILTERS);
    setCurrentPage(1);
  }, []);

  /* =======================================================
     AI INSIGHTS
  ======================================================= */

  const aiInsights = useMemo(() => {
    if (!transactions.length) {
      return null;
    }

    try {
      return computeFinancialInsights(
        transactions,
        budgets
      );
    } catch (insightError) {
      console.error(
        "FINANCIAL_INSIGHTS_ERROR:",
        insightError
      );

      return null;
    }
  }, [transactions, budgets]);

  /* =======================================================
     FORM HANDLER
  ======================================================= */

  const updateForm = useCallback(
    (key, value) => {
      setForm((previous) => ({
        ...previous,
        [key]: value,
      }));
    },
    []
  );

  /* =======================================================
     CREATE TRANSACTION
  ======================================================= */

  const handleCreate = async (event) => {
    event.preventDefault();

    const title = form.title.trim();

    const amount = Number(form.amount);

    if (!title) {
      return;
    }

    if (
      !Number.isFinite(amount) ||
      amount <= 0
    ) {
      return;
    }

    try {
      setCreating(true);
      setError("");

      const response =
        await createTransaction({
          title,
          amount,
          type: form.type,
          category: form.category,
          date: form.date,
        });

      /*
       * Normalize possible service response shapes.
       */
      const createdTransaction =
        response?.transaction ??
        response?.data?.transaction ??
        response?.data ??
        response;

      if (!createdTransaction) {
        throw new Error(
          "The transaction was created but the server returned no transaction data."
        );
      }

      setTransactions((previous) => [
        createdTransaction,
        ...previous,
      ]);

      setForm(createInitialForm());

      setCurrentPage(1);
    } catch (createError) {
      console.error(
        "CREATE_TRANSACTION_ERROR:",
        createError
      );

      setError(
        getErrorMessage(
          createError,
          "We could not create this transaction."
        )
      );
    } finally {
      setCreating(false);
    }
  };

  /* =======================================================
     DELETE TRANSACTION
  ======================================================= */

  const handleDelete = async (id) => {
    if (!id || deletingId) {
      return;
    }

    try {
      setDeletingId(id);
      setError("");

      await deleteTransaction(id);

      setTransactions((previous) =>
        previous.filter(
          (transaction) =>
            getTransactionId(transaction) !== id
        )
      );
    } catch (deleteError) {
      console.error(
        "DELETE_TRANSACTION_ERROR:",
        deleteError
      );

      setError(
        getErrorMessage(
          deleteError,
          "We could not delete this transaction."
        )
      );
    } finally {
      setDeletingId(null);
    }
  };

  /* =======================================================
     CSV EXPORT
  ======================================================= */

  const handleExportCSV = useCallback(() => {
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
        transaction?.title ?? "",
        transaction?.amount ?? 0,
        transaction?.type ?? "",
        transaction?.category ?? "",
        getTransactionDate(transaction) ?? "",
      ]
    );

    const csv = [headers, ...rows]
      .map((row) =>
        row
          .map((value) => {
            const normalizedValue =
              String(value).replaceAll(
                '"',
                '""'
              );

            return `"${normalizedValue}"`;
          })
          .join(",")
      )
      .join("\n");

    const blob = new Blob([csv], {
      type: "text/csv;charset=utf-8;",
    });

    const url =
      URL.createObjectURL(blob);

    const link =
      document.createElement("a");

    link.href = url;

    link.download = `smartbudget-transactions-${
      new Date().toISOString().split("T")[0]
    }.csv`;

    document.body.appendChild(link);

    link.click();

    link.remove();

    URL.revokeObjectURL(url);
  }, [filteredTransactions]);

  /* =======================================================
     PDF EXPORT
  ======================================================= */

  const handleExportPDF = useCallback(() => {
    if (!filteredTransactions.length) {
      return;
    }

    try {
      const pdf = new jsPDF({
        orientation: "landscape",
        unit: "mm",
        format: "a4",
      });

      const generatedDate =
        new Date().toLocaleString();

      const totalIncome =
        filteredTransactions.reduce(
          (total, transaction) =>
            transaction?.type === "income"
              ? total +
                (Number(
                  transaction?.amount
                ) || 0)
              : total,
          0
        );

      const totalExpenses =
        filteredTransactions.reduce(
          (total, transaction) =>
            transaction?.type === "expense"
              ? total +
                (Number(
                  transaction?.amount
                ) || 0)
              : total,
          0
        );

      const netBalance =
        totalIncome - totalExpenses;

      /* HEADER */

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

      /* SUMMARY */

      pdf.setFont("helvetica", "bold");
      pdf.setFontSize(10);
      pdf.setTextColor(15, 23, 42);

      pdf.text(
        `Income: ${formatCurrency(
          totalIncome
        )}`,
        14,
        39
      );

      pdf.text(
        `Expenses: ${formatCurrency(
          totalExpenses
        )}`,
        75,
        39
      );

      pdf.text(
        `Balance: ${formatCurrency(
          netBalance
        )}`,
        145,
        39
      );

      /* TABLE */

      const tableRows =
        filteredTransactions.map(
          (transaction) => {
            const rawDate =
              getTransactionDate(
                transaction
              );

            let formattedDate = "-";

            if (rawDate) {
              const parsedDate =
                new Date(rawDate);

              if (
                !Number.isNaN(
                  parsedDate.getTime()
                )
              ) {
                formattedDate =
                  parsedDate.toLocaleDateString();
              }
            }

            return [
              transaction?.title ?? "-",
              transaction?.category ?? "-",
              transaction?.type
                ? transaction.type
                    .charAt(0)
                    .toUpperCase() +
                  transaction.type.slice(1)
                : "-",
              formatCurrency(
                transaction?.amount
              ),
              formattedDate,
            ];
          }
        );

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
            pageWidth - 14,
            pageHeight - 10,
            {
              align: "right",
            }
          );
        },
      });

      const date = new Date()
        .toISOString()
        .split("T")[0];

      pdf.save(
        `smartbudget-transactions-${date}.pdf`
      );
    } catch (pdfError) {
      console.error(
        "PDF_EXPORT_ERROR:",
        pdfError
      );

      setError(
        "We could not generate the PDF report."
      );
    }
  }, [filteredTransactions]);

  /* =======================================================
     PAGE NAVIGATION
  ======================================================= */

  const goToPreviousPage = () => {
    setCurrentPage((previous) =>
      Math.max(1, previous - 1)
    );
  };

  const goToNextPage = () => {
    setCurrentPage((previous) =>
      Math.min(totalPages, previous + 1)
    );
  };

  const pageNumbers = useMemo(() => {
    if (totalPages <= 5) {
      return Array.from(
        { length: totalPages },
        (_, index) => index + 1
      );
    }

    const pages = new Set([
      1,
      totalPages,
      safeCurrentPage - 1,
      safeCurrentPage,
      safeCurrentPage + 1,
    ]);

    return Array.from(pages)
      .filter(
        (page) =>
          page >= 1 && page <= totalPages
      )
      .sort((a, b) => a - b);
  }, [totalPages, safeCurrentPage]);

  /* =======================================================
     RENDER
  ======================================================= */

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
            GLOBAL ERROR
        ================================================= */}

        {error && (
          <div
            className="
              flex justify-between items-start
              mb-5 px-4 py-3
              bg-rose-50
              border border-rose-200 rounded-2xl
              gap-3
            "
          >
            <div>
              <p
                className="
                  font-bold text-rose-700 text-xs
                "
              >
                Transaction error
              </p>

              <p
                className="
                  mt-1
                  text-rose-600 text-xs leading-relaxed
                "
              >
                {error}
              </p>
            </div>

            <button
              type="button"
              onClick={() => setError("")}
              className="hover:bg-rose-100 p-1 rounded-lg text-rose-500 hover:text-rose-700 transition"
              aria-label="Dismiss error"
            >
              <X size={15} />
            </button>
          </div>
        )}

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
                  filteredTransactions.length ===
                  0
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
                  filteredTransactions.length ===
                  0
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
            value={formatCurrency(
              summary.income
            )}
            icon={ArrowUpRight}
            iconClassName="bg-emerald-50 text-emerald-600"
            valueClassName="text-emerald-700"
          />

          <SummaryCard
            label="Total expenses"
            value={formatCurrency(
              summary.expense
            )}
            icon={ArrowDownRight}
            iconClassName="bg-rose-50 text-rose-600"
            valueClassName="text-rose-700"
          />

          <SummaryCard
            label="Net balance"
            value={formatCurrency(balance)}
            icon={WalletCards}
            iconClassName="bg-slate-100 text-slate-700"
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
                  updateForm(
                    "title",
                    event.target.value
                  )
                }
                placeholder="e.g. Monthly salary"
                disabled={creating}
                className="bg-white disabled:bg-slate-50 px-3.5 border border-slate-200 focus:border-slate-400 rounded-xl outline-none focus:ring-2 focus:ring-slate-100 w-full h-11 text-slate-900 placeholder:text-slate-400 text-sm transition disabled:cursor-not-allowed"
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
                  updateForm(
                    "amount",
                    event.target.value
                  )
                }
                placeholder="0.00"
                disabled={creating}
                className="bg-white disabled:bg-slate-50 px-3.5 border border-slate-200 focus:border-slate-400 rounded-xl outline-none focus:ring-2 focus:ring-slate-100 w-full h-11 text-slate-900 placeholder:text-slate-400 text-sm transition disabled:cursor-not-allowed"
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
                  updateForm(
                    "type",
                    event.target.value
                  )
                }
                disabled={creating}
                className="bg-white disabled:bg-slate-50 px-3.5 border border-slate-200 focus:border-slate-400 rounded-xl outline-none focus:ring-2 focus:ring-slate-100 w-full h-11 font-medium text-slate-700 text-sm transition disabled:cursor-not-allowed"
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
                  updateForm(
                    "category",
                    event.target.value
                  )
                }
                disabled={creating}
                className="bg-white disabled:bg-slate-50 px-3.5 border border-slate-200 focus:border-slate-400 rounded-xl outline-none focus:ring-2 focus:ring-slate-100 w-full h-11 font-medium text-slate-700 text-sm transition disabled:cursor-not-allowed"
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
            LEDGER
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
                  value={filters.search}
                  onChange={(event) =>
                    updateFilter(
                      "search",
                      event.target.value
                    )
                  }
                  placeholder="Search transactions..."
                  className="bg-slate-50 focus:bg-white pr-10 pl-10 border border-slate-200 focus:border-slate-400 rounded-xl outline-none focus:ring-2 focus:ring-slate-100 w-full h-11 text-sm transition"
                />

                {filters.search && (
                  <button
                    type="button"
                    onClick={() =>
                      updateFilter(
                        "search",
                        ""
                      )
                    }
                    className="top-1/2 right-2 absolute flex justify-center items-center hover:bg-slate-200 rounded-lg w-7 h-7 text-slate-400 hover:text-slate-700 transition -translate-y-1/2"
                    aria-label="Clear search"
                  >
                    <X size={14} />
                  </button>
                )}
              </div>
            </div>

            {/* FILTER TOGGLE */}

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
                className={`mt-2 grid grid-cols-1 gap-2 sm:mt-0 sm:flex sm:flex-wrap ${
                  showFilters
                    ? "grid"
                    : "hidden sm:flex"
                }`}
              >
                {/* TYPE */}

                <select
                  value={filters.type}
                  onChange={(event) =>
                    updateFilter(
                      "type",
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
                  value={filters.category}
                  onChange={(event) =>
                    updateFilter(
                      "category",
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
                  value={filters.dateRange}
                  onChange={(event) =>
                    updateFilter(
                      "dateRange",
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

          {/* =================================================
              CONTENT
          ================================================= */}

          <div
            className="
              min-h-[280px]
            "
          >
            {loading ? (
              <TransactionsLoading />
            ) : error && !transactions.length ? (
              <TransactionsError
                message={error}
                onRetry={() =>
                  fetchTransactions()
                }
              />
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
                deletingId={deletingId}
              />
            )}
          </div>

          {/* =================================================
              PAGINATION
          ================================================= */}

          {!loading &&
            !error &&
            filteredTransactions.length >
              0 && (
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
                    disabled={
                      safeCurrentPage === 1
                    }
                    onClick={
                      goToPreviousPage
                    }
                    className="
                      inline-flex justify-center items-center
                      w-9 h-9
                      text-slate-600
                      bg-white hover:bg-slate-50
                      border border-slate-200 rounded-lg
                      disabled:opacity-40 transition
                      disabled:cursor-not-allowed
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
                    {pageNumbers.map(
                      (page, index) => {
                        const previous =
                          pageNumbers[
                            index - 1
                          ];

                        const showEllipsis =
                          previous &&
                          page - previous > 1;

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
                              className={`flex h-9 min-w-9 items-center justify-center rounded-lg px-2 text-xs font-semibold transition ${
                                safeCurrentPage ===
                                page
                                  ? "bg-slate-950 text-white"
                                  : "border border-slate-200 bg-white text-slate-600 hover:bg-slate-50"
                              }`}
                            >
                              {page}
                            </button>
                          </div>
                        );
                      }
                    )}
                  </div>

                  {/* NEXT */}

                  <button
                    type="button"
                    disabled={
                      safeCurrentPage ===
                      totalPages
                    }
                    onClick={goToNextPage}
                    className="
                      inline-flex justify-center items-center
                      w-9 h-9
                      text-slate-600
                      bg-white hover:bg-slate-50
                      border border-slate-200 rounded-lg
                      disabled:opacity-40 transition
                      disabled:cursor-not-allowed
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
            REFRESH
        ================================================= */}

        <div
          className="
            flex justify-end
            mt-4
          "
        >
          <button
            type="button"
            onClick={() =>
              fetchTransactions({
                silent: true,
              })
            }
            disabled={refreshing || loading}
            className="inline-flex items-center gap-2 hover:bg-white disabled:opacity-50 px-3 py-2 rounded-xl font-semibold text-slate-500 hover:text-slate-900 text-xs transition disabled:cursor-not-allowed"
          >
            <RotateCcw
              size={14}
              className={
                refreshing
                  ? "animate-spin"
                  : ""
              }
            />

            {refreshing
              ? "Refreshing..."
              : "Refresh"}
          </button>
        </div>

        {/* =================================================
            FINANCIAL INSIGHT
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