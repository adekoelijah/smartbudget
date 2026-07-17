


// import {
//   Wallet,
//   ArrowUpRight,
//   ShieldCheck,
// } from "lucide-react";

// import Button from "../../../components/ui/Button";
// import Input from "../../../components/ui/Input";

// const TransactionHeader = ({
//   total = 0,
//   form,
//   setForm,
//   onSubmit,
// }) => {
//   /* =========================
//      SAFE CHANGE HANDLER
//   ========================= */
//   const handleChange = (e) => {
//     const { name, value } = e.target;

//     setForm((prev) => ({
//       ...prev,
//       [name]: value,
//     }));
//   };

//   /* =========================
//      FORMATTERS
//   ========================= */
//   const formattedBalance =
//     Number(total || 0).toLocaleString();

//   return (
//     <div
//       className="
//         relative overflow-hidden
//         rounded-[32px]
//         border border-slate-200/80
//         bg-white/95
//         backdrop-blur-xl
//         shadow-[0_10px_40px_rgba(15,23,42,0.06)]
//       "
//     >
//       {/* BACKGROUND ACCENT */}
//       <div className="absolute inset-0 pointer-events-none">
//         <div className="absolute top-0 right-0 h-40 w-40 rounded-full bg-emerald-100/40 blur-3xl" />
//         <div className="absolute bottom-0 left-0 h-40 w-40 rounded-full bg-slate-100 blur-3xl" />
//       </div>

//       <div className="relative z-10 p-5 md:p-7 space-y-7">

//         {/* =========================================
//             TOP HEADER
//         ========================================= */}
//         <div className="flex flex-col gap-5 lg:flex-row lg:items-center lg:justify-between">

//           {/* LEFT */}
//           <div className="space-y-3">

//             {/* BADGE */}
//             <div
//               className="
//                 inline-flex items-center gap-2
//                 rounded-full border border-emerald-100
//                 bg-emerald-50
//                 px-3 py-1
//               "
//             >
//               <ShieldCheck
//                 size={14}
//                 className="text-emerald-600"
//               />

//               <span className="text-[11px] font-semibold tracking-wide text-emerald-700 uppercase">
//                 Bank-grade Transaction Ledger
//               </span>
//             </div>

//             {/* TITLE */}
//             <div>
//               <h1 className="text-2xl md:text-3xl font-bold tracking-tight text-slate-900">
//                 Transaction Command Center
//               </h1>

//               <p className="mt-2 text-sm text-slate-500 leading-relaxed max-w-2xl">
//                 Monitor, record, and manage financial
//                 activity with secure real-time transaction
//                 processing.
//               </p>
//             </div>
//           </div>

//           {/* RIGHT CARD */}
//           <div
//             className="
//               w-full sm:w-auto
//               min-w-[250px]
//               rounded-3xl
//               border border-slate-200
//               bg-gradient-to-br
//               from-slate-950
//               via-slate-900
//               to-slate-800
//               p-5
//               text-white
//               shadow-xl
//             "
//           >
//             <div className="flex items-start justify-between">

//               <div>
//                 <p className="text-xs uppercase tracking-[0.2em] text-slate-400">
//                   Total Transactions
//                 </p>

//                 <h2 className="mt-3 text-3xl font-bold tracking-tight">
//                   {formattedBalance}
//                 </h2>
//               </div>

//               <div
//                 className="
//                   flex h-11 w-11 items-center justify-center
//                   rounded-2xl
//                   bg-white/10
//                   backdrop-blur-sm
//                 "
//               >
//                 <Wallet size={20} />
//               </div>
//             </div>

//             <div className="mt-6 flex items-center gap-2 text-xs text-emerald-300">
//               <ArrowUpRight size={14} />
//               Financial operations active
//             </div>
//           </div>
//         </div>

//         {/* =========================================
//             QUICK TRANSACTION FORM
//         ========================================= */}
//         <form
//           onSubmit={onSubmit}
//           className="
//             rounded-3xl
//             border border-slate-200/80
//             bg-slate-50/70
//             p-4 md:p-5
//           "
//         >
//           {/* FORM TITLE */}
//           <div className="mb-5">
//             <h3 className="text-sm font-semibold text-slate-900">
//               Quick Transaction Entry
//             </h3>

//             <p className="mt-1 text-xs text-slate-500">
//               Add income or expense records instantly.
//             </p>
//           </div>

//           {/* FORM GRID */}
//           <div className="grid grid-cols-1 xl:grid-cols-12 gap-4">

//             {/* TITLE */}
//             <div className="xl:col-span-4">
//               <label className="mb-2 block text-xs font-medium text-slate-600">
//                 Transaction Title
//               </label>

//               <Input
//                 name="title"
//                 placeholder="e.g Salary payment"
//                 value={form.title}
//                 onChange={handleChange}
//                 className="
//                   h-12 rounded-2xl border-slate-200
//                   bg-white
//                   focus:border-slate-900
//                   focus:ring-2 focus:ring-slate-900/10
//                 "
//               />
//             </div>

//             {/* AMOUNT */}
//             <div className="xl:col-span-3">
//               <label className="mb-2 block text-xs font-medium text-slate-600">
//                 Amount
//               </label>

//               <Input
//                 name="amount"
//                 type="number"
//                 placeholder="0.00"
//                 value={form.amount}
//                 onChange={handleChange}
//                 className="
//                   h-12 rounded-2xl border-slate-200
//                   bg-white
//                   focus:border-slate-900
//                   focus:ring-2 focus:ring-slate-900/10
//                 "
//               />
//             </div>

//             {/* TYPE */}
//             <div className="xl:col-span-2">
//               <label className="mb-2 block text-xs font-medium text-slate-600">
//                 Type
//               </label>

//               <select
//                 name="type"
//                 value={form.type}
//                 onChange={handleChange}
//                 className="
//                   h-12 w-full
//                   rounded-2xl
//                   border border-slate-200
//                   bg-white
//                   px-4
//                   text-sm font-medium
//                   text-slate-700
//                   outline-none
//                   transition-all
//                   focus:border-slate-900
//                   focus:ring-2
//                   focus:ring-slate-900/10
//                 "
//               >
//                 <option value="expense">
//                   Expense
//                 </option>

//                 <option value="income">
//                   Income
//                 </option>
//               </select>
//             </div>

//             {/* SUBMIT */}
//             <div className="xl:col-span-3 flex items-end">
//               <Button
//                 type="submit"
//                 className="
//                   h-12 w-full
//                   rounded-2xl
//                   bg-slate-950
//                   text-white
//                   font-semibold
//                   transition-all
//                   hover:bg-slate-800
//                   active:scale-[0.99]
//                   shadow-lg
//                   shadow-slate-900/10
//                 "
//               >
//                 Add Transaction
//               </Button>
//             </div>

//           </div>
//         </form>

//       </div>
//     </div>
//   );
// };
// export default TransactionHeader;




import {
  Wallet,
  ArrowUpRight,
  ShieldCheck,
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

  const formattedBalance =
    Number(total || 0).toLocaleString();

  return (
    <div className="
      relative overflow-hidden
      rounded-2xl sm:rounded-[32px]
      border border-slate-200/80
      bg-white/95
      backdrop-blur-xl
      shadow-[0_10px_40px_rgba(15,23,42,0.06)]
    ">

      {/* BACKGROUND */}
      <div className="absolute inset-0 pointer-events-none">
        <div className="absolute top-0 right-0 h-32 w-32 sm:h-40 sm:w-40 rounded-full bg-emerald-100/40 blur-3xl" />
        <div className="absolute bottom-0 left-0 h-32 w-32 sm:h-40 sm:w-40 rounded-full bg-slate-100 blur-3xl" />
      </div>

      <div className="relative z-10 p-4 sm:p-6 lg:p-7 space-y-6 sm:space-y-7">

        {/* ================= HEADER ================= */}
        <div className="flex flex-col lg:flex-row gap-6 lg:items-center lg:justify-between">

          {/* LEFT */}
          <div className="space-y-3">

            <div className="
              inline-flex items-center gap-2
              rounded-full border border-emerald-100
              bg-emerald-50
              px-3 py-1
            ">
              <ShieldCheck size={14} className="text-emerald-600" />

              <span className="text-[10px] sm:text-[11px] font-semibold tracking-wide text-emerald-700 uppercase">
                Bank-grade Transaction Ledger
              </span>
            </div>

            <div>
              <h1 className="text-xl sm:text-2xl lg:text-3xl font-bold tracking-tight text-slate-900">
                Transaction Command Center
              </h1>

              <p className="mt-2 text-sm text-slate-500 leading-relaxed max-w-2xl">
                Monitor, record, and manage financial activity with secure real-time processing.
              </p>
            </div>

          </div>

          {/* RIGHT CARD */}
          <div className="
            w-full lg:w-auto
            rounded-2xl sm:rounded-3xl
            border border-slate-200
            bg-gradient-to-br from-slate-950 via-slate-900 to-slate-800
            p-4 sm:p-5
            text-white
            shadow-xl
          ">

            <div className="flex items-start justify-between gap-4">

              <div>
                <p className="text-[10px] sm:text-xs uppercase tracking-[0.2em] text-slate-400">
                  Total Transactions
                </p>

                <h2 className="mt-2 sm:mt-3 text-2xl sm:text-3xl font-bold tracking-tight break-words">
                  {formattedBalance}
                </h2>
              </div>

              <div className="
                flex h-10 w-10 sm:h-11 sm:w-11 items-center justify-center
                rounded-2xl bg-white/10
              ">
                <Wallet size={18} />
              </div>

            </div>

            <div className="mt-4 sm:mt-6 flex items-center gap-2 text-[11px] sm:text-xs text-emerald-300">
              <ArrowUpRight size={14} />
              Financial operations active
            </div>

          </div>
        </div>

        {/* ================= FORM ================= */}
        <form
          onSubmit={onSubmit}
          className="
            rounded-2xl sm:rounded-3xl
            border border-slate-200/80
            bg-slate-50/70
            p-4 sm:p-5
          "
        >

          <div className="mb-5">
            <h3 className="text-sm font-semibold text-slate-900">
              Quick Transaction Entry
            </h3>

            <p className="mt-1 text-xs text-slate-500">
              Add income or expense records instantly.
            </p>
          </div>

          {/* RESPONSIVE GRID */}
          <div className="grid grid-cols-1 sm:grid-cols-2 xl:grid-cols-12 gap-4">

            {/* TITLE */}
            <div className="xl:col-span-4">
              <label className="mb-2 block text-xs font-medium text-slate-600">
                Transaction Title
              </label>

              <Input
                name="title"
                value={form.title}
                onChange={handleChange}
                placeholder="e.g Salary payment"
                className="h-11 sm:h-12 rounded-2xl border-slate-200 bg-white"
              />
            </div>

            {/* AMOUNT */}
            <div className="xl:col-span-3">
              <label className="mb-2 block text-xs font-medium text-slate-600">
                Amount
              </label>

              <Input
                name="amount"
                type="number"
                value={form.amount}
                onChange={handleChange}
                placeholder="0.00"
                className="h-11 sm:h-12 rounded-2xl border-slate-200 bg-white"
              />
            </div>

            {/* TYPE */}
            <div className="xl:col-span-2">
              <label className="mb-2 block text-xs font-medium text-slate-600">
                Type
              </label>

              <select
                name="type"
                value={form.type}
                onChange={handleChange}
                className="
                  h-11 sm:h-12 w-full
                  rounded-2xl border border-slate-200
                  bg-white px-4 text-sm
                  outline-none
                "
              >
                <option value="expense">Expense</option>
                <option value="income">Income</option>
              </select>
            </div>

            {/* BUTTON */}
            <div className="xl:col-span-3 flex items-end">
              <Button
                type="submit"
                className="
                  h-11 sm:h-12 w-full
                  rounded-2xl bg-slate-950 text-white
                  font-semibold
                "
              >
                Add Transaction
              </Button>
            </div>

          </div>

        </form>

      </div>
    </div>
  );
};

export default TransactionHeader;