import {
  Bell,
  ArrowUpRight,
  ArrowDownRight,
  AlertTriangle,
  Info,
  ShieldAlert,
  CheckCircle2,
} from "lucide-react";

import { motion, AnimatePresence } from "framer-motion";
import { useMemo } from "react";

/* =========================
   SAFE HELPERS
========================= */
const safeDate = (d) => {
  const date = new Date(d);
  return isNaN(date.getTime()) ? null : date;
};

const safeNumber = (v) => Number(v || 0);

/* =========================
   EVENT INTENSITY (BANK-GRADE)
========================= */
const severityMap = {
  success: "text-emerald-600 bg-emerald-50 border-emerald-100",
  info: "text-blue-600 bg-blue-50 border-blue-100",
  warning: "text-amber-600 bg-amber-50 border-amber-100",
  danger: "text-rose-600 bg-rose-50 border-rose-100",
  critical: "text-red-700 bg-red-100 border-red-200",
  default: "text-slate-600 bg-slate-50 border-slate-200",
};

/* =========================
   ICON MAP (FUNCTIONAL)
========================= */
const getIcon = (type) => {
  switch (type) {
    case "transaction:created":
      return <Info size={16} />;
    case "income:received":
      return <ArrowUpRight size={16} />;
    case "expense:high":
      return <ArrowDownRight size={16} />;
    case "budget:warning":
      return <AlertTriangle size={16} />;
    case "security:alert":
      return <ShieldAlert size={16} />;
    case "system:success":
      return <CheckCircle2 size={16} />;
    default:
      return <Info size={16} />;
  }
};

/* =========================
   NORMALIZER (SAFE)
========================= */
const normalizeEvent = (e = {}) => ({
  id: e.id || e._id || `${e.type}-${e.timestamp}-${Math.random()}`,
  type: e.type || "info",
  message: e.message || "New notification",
  amount: safeNumber(e.amount),
  timestamp: safeDate(e.timestamp) || new Date(),
});

/* =========================
   COMPONENT
========================= */
const NotificationCenter = ({ events = [] }) => {
  /* =========================
     CLEAN + DEDUP + SORT
  ========================= */
  const processedEvents = useMemo(() => {
    const map = new Map();

    events.forEach((e) => {
      const n = normalizeEvent(e);

      // dedupe by id
      if (!map.has(n.id)) {
        map.set(n.id, n);
      }
    });

    return Array.from(map.values()).sort(
      (a, b) => new Date(b.timestamp) - new Date(a.timestamp)
    );
  }, [events]);

  return (
    <div className="bg-white border border-slate-200 rounded-3xl p-5 shadow-sm">

      {/* HEADER */}
      <div className="flex items-center justify-between mb-4">
        <div>
          <h2 className="text-sm font-semibold text-slate-900">
            Notification Center
          </h2>
          <p className="text-xs text-slate-500">
            Real-time financial intelligence alerts
          </p>
        </div>

        <Bell size={18} className="text-slate-400" />
      </div>

      {/* LIST */}
      <div className="space-y-3 max-h-[340px] overflow-y-auto pr-1">

        <AnimatePresence>
          {processedEvents.length === 0 ? (
            <p className="text-sm text-slate-400 text-center py-6">
              No alerts yet
            </p>
          ) : (
            processedEvents.map((event) => {
              const tone =
                severityMap[event.type] || severityMap.default;

              return (
                <motion.div
                  key={event.id}
                  initial={{ opacity: 0, y: 8 }}
                  animate={{ opacity: 1, y: 0 }}
                  exit={{ opacity: 0 }}
                  transition={{ duration: 0.2 }}
                  className={`p-3 rounded-2xl border flex items-start gap-3 ${tone}`}
                >

                  {/* ICON */}
                  <div className="mt-1 opacity-80">
                    {getIcon(event.type)}
                  </div>

                  {/* CONTENT */}
                  <div className="flex-1">
                    <p className="text-sm font-medium text-slate-800">
                      {event.message}
                    </p>

                    {event.amount > 0 && (
                      <p className="text-xs text-slate-500 mt-1">
                        ₦{event.amount.toLocaleString()}
                      </p>
                    )}
                  </div>

                  {/* TIME */}
                  <span className="text-[10px] text-slate-400 whitespace-nowrap">
                    {event.timestamp
                      ? new Date(event.timestamp).toLocaleTimeString([], {
                          hour: "2-digit",
                          minute: "2-digit",
                        })
                      : "--:--"}
                  </span>

                </motion.div>
              );
            })
          )}
        </AnimatePresence>

      </div>
    </div>
  );
};

export default NotificationCenter;