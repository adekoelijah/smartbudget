import { useMemo, useState } from "react";
import clsx from "clsx";
import { ArrowUpDown, Pencil, Trash2 } from "lucide-react";

// 🔢 formatters

const formatCurrency = (value) =>
  new Intl.NumberFormat("en-NG", {
    style: "currency",
    currency: "NGN",
    maximumFractionDigits: 0,
  }).format(value || 0);

const formatDate = (date) =>
  new Intl.DateTimeFormat("en-GB", {
    day: "2-digit",
    month: "short",
    year: "numeric",
  }).format(new Date(date));

const PAGE_SIZE = 8;

const TransactionTable = ({
  data = [],
  loading = false,
  onEdit,
  onDelete,
}) => {
  const [sortKey, setSortKey] = useState("date");
  const [sortDir, setSortDir] = useState("desc");
  const [page, setPage] = useState(1);

  // 🔄 sorting
  const sortedData = useMemo(() => {
    const sorted = [...data].sort((a, b) => {
      if (sortKey === "amount") {
        return sortDir === "asc"
          ? a.amount - b.amount
          : b.amount - a.amount;
      }

      if (sortKey === "date") {
        return sortDir === "asc"
          ? new Date(a.date) - new Date(b.date)
          : new Date(b.date) - new Date(a.date);
      }

      return sortDir === "asc"
        ? String(a[sortKey]).localeCompare(String(b[sortKey]))
        : String(b[sortKey]).localeCompare(String(a[sortKey]));
    });

    return sorted;
  }, [data, sortKey, sortDir]);

  // 📄 pagination
  const totalPages = Math.ceil(sortedData.length / PAGE_SIZE);

  const paginatedData = useMemo(() => {
    const start = (page - 1) * PAGE_SIZE;
    return sortedData.slice(start, start + PAGE_SIZE);
  }, [sortedData, page]);

  // 🔀 sort handler
  const handleSort = (key) => {
    if (key === sortKey) {
      setSortDir((prev) => (prev === "asc" ? "desc" : "asc"));
    } else {
      setSortKey(key);
      setSortDir("asc");
    }
  };

  const isEmpty = !loading && data.length === 0;

  return (
    <div className="bg-white rounded-xl shadow-sm overflow-hidden">
      {/* TABLE */}
      <div className="overflow-x-auto">
        <table className="w-full text-sm">
          <thead className="bg-gray-50 text-gray-600">
            <tr>
              {[
                { label: "Date", key: "date" },
                { label: "Description", key: "description" },
                { label: "Category", key: "category" },
                { label: "Type", key: "type" },
                { label: "Amount", key: "amount" },
              ].map((col) => (
                <th
                  key={col.key}
                  className="px-4 py-3 text-left font-medium cursor-pointer select-none"
                  onClick={() => handleSort(col.key)}
                >
                  <div className="flex items-center gap-1">
                    {col.label}
                    <ArrowUpDown size={14} />
                  </div>
                </th>
              ))}
              <th className="px-4 py-3 text-right">Actions</th>
            </tr>
          </thead>

          <tbody>
            {/* LOADING */}
            {loading &&
              Array.from({ length: 6 }).map((_, i) => (
                <tr key={i} className="border-t">
                  <td colSpan="6" className="px-4 py-4">
                    <div className="h-4 bg-gray-100 animate-pulse rounded" />
                  </td>
                </tr>
              ))}

            {/* EMPTY */}
            {isEmpty && (
              <tr>
                <td
                  colSpan="6"
                  className="text-center py-6 text-gray-400"
                >
                  No transactions found
                </td>
              </tr>
            )}

            {/* DATA */}
            {!loading &&
              paginatedData.map((tx) => (
                <tr
                  key={tx._id}
                  className="border-t hover:bg-gray-50"
                >
                  <td className="px-4 py-3">
                    {formatDate(tx.date)}
                  </td>

                  <td className="px-4 py-3 font-medium">
                    {tx.description}
                  </td>

                  <td className="px-4 py-3 text-gray-500">
                    {tx.category}
                  </td>

                  <td className="px-4 py-3 capitalize">
                    <span
                      className={clsx(
                        "px-2 py-1 rounded text-xs font-medium",
                        tx.type === "income"
                          ? "bg-green-100 text-green-600"
                          : "bg-red-100 text-red-500"
                      )}
                    >
                      {tx.type}
                    </span>
                  </td>

                  <td
                    className={clsx(
                      "px-4 py-3 font-semibold",
                      tx.type === "income"
                        ? "text-green-600"
                        : "text-red-500"
                    )}
                  >
                    {formatCurrency(tx.amount)}
                  </td>

                  {/* ACTIONS */}
                  <td className="px-4 py-3 text-right">
                    <div className="flex justify-end gap-2">
                      {onEdit && (
                        <button
                          onClick={() => onEdit(tx)}
                          className="p-1 hover:bg-gray-100 rounded"
                        >
                          <Pencil size={16} />
                        </button>
                      )}

                      {onDelete && (
                        <button
                          onClick={() => onDelete(tx)}
                          className="p-1 hover:bg-gray-100 rounded text-red-500"
                        >
                          <Trash2 size={16} />
                        </button>
                      )}
                    </div>
                  </td>
                </tr>
              ))}
          </tbody>
        </table>
      </div>

      {/* PAGINATION */}
      {!loading && totalPages > 1 && (
        <div className="flex items-center justify-between px-4 py-3 border-t text-sm">
          <span className="text-gray-500">
            Page {page} of {totalPages}
          </span>

          <div className="flex gap-2">
            <button
              onClick={() => setPage((p) => Math.max(p - 1, 1))}
              className="px-3 py-1 border rounded hover:bg-gray-50"
            >
              Prev
            </button>

            <button
              onClick={() =>
                setPage((p) => Math.min(p + 1, totalPages))
              }
              className="px-3 py-1 border rounded hover:bg-gray-50"
            >
              Next
            </button>
          </div>
        </div>
      )}
    </div>
  );
};

export default TransactionTable;