
import {
  Wallet,
  ArrowUpRight,
  ArrowDownRight,
  ShieldCheck,
  Plus,
  Activity,
} from "lucide-react";

import Button from "../../../components/ui/Button";
import Input from "../../../components/ui/Input";

const TransactionHeader = ({
  total = 0,
  form,
  setForm,
  onSubmit,
}) => {
  const handleChange = (e) => {
    const { name, value } = e.target;

    setForm((prev) => ({
      ...prev,
      [name]: value,
    }));
  };

  const formattedBalance = Number(
    total || 0
  ).toLocaleString("en-NG");

  const isExpense =
    form?.type === "expense";

  return (
    <section
      className="relative bg-white shadow-[0_18px_60px_rgba(15,23,42,0.07)] border border-slate-200 rounded-[28px] overflow-hidden"
    >
      {/* =====================================================
          SUBTLE BACKGROUND
      ====================================================== */}

      <div
        className="absolute inset-0 overflow-hidden pointer-events-none"
      >
        <div
          className="-top-24 -right-24 absolute bg-blue-50 blur-3xl rounded-full w-64 h-64"
          /
        >

        <div
          className="-bottom-24 -left-24 absolute bg-slate-100 blur-3xl rounded-full w-64 h-64"
          /
        >
      </div>

      <div
        className="z-10 relative p-4 sm:p-6 lg:p-7"
      >
        {/* ===================================================
            TOP HEADER
        ==================================================== */}

        <div
          className="flex xl:flex-row flex-col xl:justify-between xl:items-center gap-6"
        >
          {/* LEFT: BRAND / TITLE */}

          <div
            className="flex-1 min-w-0"
          >
            {/* STATUS BADGE */}

            <div
              className="inline-flex items-center gap-2 bg-emerald-50 px-3 py-1.5 border border-emerald-200 rounded-full"
            >
              <span
                className="bg-emerald-500 rounded-full w-1.5 h-1.5"
                /
              >

              <ShieldCheck
                size={13}
                className="text-emerald-600"
                /
              >

              <span
                className="font-semibold text-[10px] text-emerald-700 sm:text-[11px] uppercase tracking-[0.12em]"
              >
                Secure Financial Ledger
              </span>
            </div>

            {/* TITLE */}

            <h1
              className="mt-4 font-bold text-slate-950 lg:text-[34px] text-2xl sm:text-3xl tracking-[-0.03em]"
            >
              Transactions
            </h1>

            <p
              className="mt-2 max-w-2xl text-slate-500 text-sm leading-6"
            >
              Record and manage your income and
              expenses from one secure financial
              ledger.
            </p>

            {/* SYSTEM STATUS */}

            <div
              className="flex flex-wrap items-center gap-x-4 gap-y-2 mt-4 text-slate-500 text-xs"
            >
              <span
                className="inline-flex items-center gap-1.5"
              >
                <Activity
                  size={13}
                  className="text-emerald-500"
                  /
                >

                Real-time processing
              </span>

              <span
                className="hidden sm:block text-slate-300"
              >
                •
              </span>

              <span>
                Secure ledger environment
              </span>
            </div>
          </div>

          {/* =================================================
              BALANCE CARD
          ================================================== */}

          <div
            className="w-full xl:w-[330px] shrink-0"
          >
            <div
              className="relative bg-slate-950 shadow-[0_16px_40px_rgba(15,23,42,0.18)] p-5 sm:p-6 border border-slate-800 rounded-3xl overflow-hidden text-white"
            >
              {/* subtle glow */}

              <div
                className="-top-10 -right-10 absolute bg-blue-500/10 blur-2xl rounded-full w-32 h-32 pointer-events-none"
                /
              >

              <div
                className="z-10 relative flex justify-between items-start gap-4"
              >
                <div>
                  <p
                    className="font-semibold text-[10px] text-slate-400 uppercase tracking-[0.18em]"
                  >
                    Total Transactions
                  </p>

                  <div
                    className="flex items-baseline gap-2 mt-2"
                  >
                    <span
                      className="font-medium text-slate-500 text-xs"
                    >
                      NGN
                    </span>

                    <h2
                      className="min-w-0 font-bold text-white text-2xl sm:text-3xl break-all tracking-tight"
                    >
                      {formattedBalance}
                    </h2>
                  </div>
                </div>

                <div
                  className="flex justify-center items-center bg-white/5 border border-white/10 rounded-2xl w-11 h-11 shrink-0"
                >
                  <Wallet
                    size={19}
                    className="text-slate-200"
                    /
                  >
                </div>
              </div>

              {/* CARD FOOTER */}

              <div
                className="z-10 relative flex justify-between items-center mt-5 pt-4 border-white/10 border-t"
              >
                <span
                  className="text-[11px] text-slate-400"
                >
                  Ledger status
                </span>

                <span
                  className="inline-flex items-center gap-1.5 font-medium text-[11px] text-emerald-400"
                >
                  <span
                    className="bg-emerald-400 rounded-full w-1.5 h-1.5"
                    /
                  >

                  Active
                </span>
              </div>
            </div>
          </div>
        </div>

        {/* ===================================================
            TRANSACTION ENTRY
        ==================================================== */}

        <div
          className="bg-slate-50/80 mt-7 border border-slate-200 rounded-3xl overflow-hidden"
        >
          {/* FORM HEADER */}

          <div
            className="flex sm:flex-row flex-col sm:justify-between sm:items-center gap-3 bg-white px-4 sm:px-5 py-4 border-slate-200 border-b"
          >
            <div
              className="flex items-center gap-3"
            >
              <div
                className="flex justify-center items-center bg-slate-950 rounded-xl w-9 h-9 text-white shrink-0"
              >
                <Plus size={17} />
              </div>

              <div>
                <h2
                  className="font-semibold text-slate-900 text-sm"
                >
                  Add transaction
                </h2>

                <p
                  className="mt-0.5 text-[11px] text-slate-500"
                >
                  Record a new financial activity
                </p>
              </div>
            </div>

            <span
              className="self-start sm:self-auto bg-slate-50 px-2.5 py-1 border border-slate-200 rounded-full font-medium text-[10px] text-slate-500"
            >
              Secure entry
            </span>
          </div>

          {/* FORM */}

          <form
            onSubmit={onSubmit}
            className="p-4 sm:p-5"
          >
            <div
              className="gap-4 grid grid-cols-1 sm:grid-cols-2 xl:grid-cols-12"
            >
              {/* TITLE */}

              <div
                className="xl:col-span-4"
              >
                <label
                  className="block mb-2 font-semibold text-slate-600 text-xs"
                >
                  Transaction title
                </label>

                <Input
                  name="title"
                  value={form.title}
                  onChange={handleChange}
                  placeholder="e.g. Salary payment"
                  className="bg-white shadow-sm border-slate-200 focus:border-slate-400 rounded-2xl h-12"
                  /
                >
              </div>

              {/* AMOUNT */}

              <div
                className="xl:col-span-3"
              >
                <label
                  className="block mb-2 font-semibold text-slate-600 text-xs"
                >
                  Amount
                </label>

                <div
                  className="relative"
                >
                  <span
                    className="top-1/2 left-4 absolute font-semibold text-slate-400 text-xs -translate-y-1/2 pointer-events-none"
                  >
                    ₦
                  </span>

                  <Input
                    name="amount"
                    type="number"
                    min="0"
                    step="0.01"
                    value={form.amount}
                    onChange={handleChange}
                    placeholder="0.00"
                    className="bg-white shadow-sm pl-9 border-slate-200 focus:border-slate-400 rounded-2xl h-12"
                    /
                  >
                </div>
              </div>

              {/* TYPE */}

              <div
                className="xl:col-span-2"
              >
                <label
                  className="block mb-2 font-semibold text-slate-600 text-xs"
                >
                  Type
                </label>

                <div
                  className="relative"
                >
                  <select
                    name="type"
                    value={form.type}
                    onChange={handleChange}
                    className="bg-white shadow-sm px-4 pr-9 border border-slate-200 focus:border-slate-400 rounded-2xl outline-none focus:ring-2 focus:ring-slate-200 w-full h-12 font-medium text-slate-700 text-sm transition appearance-none"
                  >
                    <option value="expense">
                      Expense
                    </option>

                    <option value="income">
                      Income
                    </option>
                  </select>

                  <div
                    className="top-1/2 right-3 absolute -translate-y-1/2 pointer-events-none"
                  >
                    {isExpense ? (
                      <ArrowDownRight
                        size={16}
                        className="text-rose-500"
                        /
                      >
                    ) : (
                      <ArrowUpRight
                        size={16}
                        className="text-emerald-500"
                        /
                      >
                    )}
                  </div>
                </div>
              </div>

              {/* SUBMIT */}

              <div
                className="flex items-end xl:col-span-3"
              >
                <Button
                  type="submit"
                  className="flex justify-center items-center gap-2 bg-slate-950 hover:bg-slate-800 shadow-sm rounded-2xl w-full h-12 font-semibold text-white active:scale-[0.99] transition"
                >
                  <Plus size={17} />

                  Add transaction
                </Button>
              </div>
            </div>
          </form>
        </div>
      </div>
    </section>
  );
};

export default TransactionHeader;