// const BudgetModal = ({ form, setForm, onSubmit, onClose, editing }) => {
//   const handleChange = (e) => {
//     setForm((prev) => ({
//       ...prev,
//       [e.target.name]: e.target.value,
//     }));
//   };

//   return (
//     <div className="fixed inset-0 bg-black/40 flex items-center justify-center">
//       <div className="bg-white dark:bg-gray-900 p-6 rounded-xl w-full max-w-md">

//         <h2 className="text-lg font-semibold mb-4">
//           {editing ? "Edit Budget" : "Create Budget"}
//         </h2>

//         <form onSubmit={onSubmit} className="space-y-4">

//           <input
//             name="name"
//             value={form.name}
//             onChange={handleChange}
//             placeholder="Budget name"
//             className="w-full p-2 border rounded"
//           />

//           <input
//             name="limit"
//             type="number"
//             value={form.limit}
//             onChange={handleChange}
//             placeholder="Limit"
//             className="w-full p-2 border rounded"
//           />

//           <button className="w-full bg-black text-white py-2 rounded">
//             {editing ? "Update" : "Create"}
//           </button>

//           <button
//             type="button"
//             onClick={onClose}
//             className="w-full text-sm text-gray-500"
//           >
//             Cancel
//           </button>

//         </form>
//       </div>
//     </div>
//   );
// };

// export default BudgetModal;


// import { motion, AnimatePresence } from "framer-motion";
// import {
//   Wallet,
//   PencilLine,
//   X,
//   Landmark,
//   ArrowRight,
// } from "lucide-react";

// const BudgetModal = ({
//   form,
//   setForm,
//   onSubmit,
//   onClose,
//   editing,
// }) => {
//   const handleChange = (e) => {
//     setForm((prev) => ({
//       ...prev,
//       [e.target.name]: e.target.value,
//     }));
//   };

//   return (
//     <AnimatePresence>
//       <div className="fixed inset-0 z-50 flex items-center justify-center bg-black/70 px-4 backdrop-blur-sm">

//         {/* Modal */}
//         <motion.div
//           initial={{ opacity: 0, y: 30, scale: 0.95 }}
//           animate={{ opacity: 1, y: 0, scale: 1 }}
//           exit={{ opacity: 0, y: 30, scale: 0.95 }}
//           transition={{ duration: 0.25 }}
//           className="relative w-full max-w-md overflow-hidden rounded-3xl border border-white/10 bg-[#0f172a] shadow-2xl"
//         >
//           {/* Glow Effects */}
//           <div className="absolute -top-10 left-0 h-32 w-32 rounded-full bg-emerald-500/10 blur-3xl"></div>
//           <div className="absolute bottom-0 right-0 h-32 w-32 rounded-full bg-cyan-500/10 blur-3xl"></div>

//           <div className="relative z-10 p-6 sm:p-7">

//             {/* Header */}
//             <div className="flex items-start justify-between">
//               <div>
//                 <div className="mb-3 inline-flex items-center gap-2 rounded-full border border-emerald-400/20 bg-emerald-500/10 px-3 py-1 text-xs text-emerald-400">
//                   {editing ? (
//                     <PencilLine size={14} />
//                   ) : (
//                     <Wallet size={14} />
//                   )}
//                   {editing ? "Update Budget" : "New Budget"}
//                 </div>

//                 <h2 className="text-2xl font-bold text-white">
//                   {editing ? "Edit Budget" : "Create Budget"}
//                 </h2>

//                 <p className="mt-1 text-sm text-slate-400">
//                   {editing
//                     ? "Adjust your financial plan and spending limits."
//                     : "Set a smart spending target and stay in control."}
//                 </p>
//               </div>

//               <button
//                 onClick={onClose}
//                 className="rounded-xl bg-white/5 p-2 text-slate-400 transition hover:bg-white/10 hover:text-white"
//               >
//                 <X size={18} />
//               </button>
//             </div>

//             {/* Form */}
//             <form onSubmit={onSubmit} className="mt-6 space-y-5">

//               {/* Name */}
//               <div>
//                 <label className="mb-2 block text-sm font-medium text-slate-300">
//                   Budget Name
//                 </label>

//                 <input
//                   name="name"
//                   value={form.name}
//                   onChange={handleChange}
//                   placeholder="e.g Food, Transport, Rent"
//                   className="w-full rounded-2xl border border-white/10 bg-white/5 px-4 py-3 text-white outline-none placeholder:text-slate-500 focus:border-emerald-400"
//                 />
//               </div>

//               {/* Limit */}
//               <div>
//                 <label className="mb-2 block text-sm font-medium text-slate-300">
//                   Budget Limit
//                 </label>

//                 <div className="flex items-center rounded-2xl border border-white/10 bg-white/5 px-4">
//                   <Landmark size={18} className="text-slate-500" />

//                   <input
//                     name="limit"
//                     type="number"
//                     value={form.limit}
//                     onChange={handleChange}
//                     placeholder="Enter amount"
//                     className="w-full bg-transparent px-3 py-3 text-white outline-none placeholder:text-slate-500"
//                   />
//                 </div>
//               </div>

//               {/* Submit */}
//               <button
//                 type="submit"
//                 className="group flex w-full items-center justify-center gap-2 rounded-2xl bg-gradient-to-r from-emerald-500 to-cyan-500 px-5 py-3 font-semibold text-white shadow-xl transition hover:scale-[1.02]"
//               >
//                 {editing ? "Update Budget" : "Create Budget"}
//                 <ArrowRight
//                   size={16}
//                   className="transition group-hover:translate-x-1"
//                 />
//               </button>

//               {/* Cancel */}
//               <button
//                 type="button"
//                 onClick={onClose}
//                 className="w-full rounded-2xl border border-white/10 py-3 text-sm font-medium text-slate-400 transition hover:bg-white/5 hover:text-white"
//               >
//                 Cancel
//               </button>
//             </form>
//           </div>
//         </motion.div>
//       </div>
//     </AnimatePresence>
//   );
// };

// export default BudgetModal;

import { motion, AnimatePresence } from "framer-motion";
import {
  Wallet,
  PencilLine,
  X,
  Landmark,
  ArrowRight,
} from "lucide-react";

const BudgetModal = ({
  form,
  setForm,
  onSubmit,
  onClose,
  editing,
}) => {

  const handleChange = (e) => {
    setForm((prev) => ({
      ...prev,
      [e.target.name]: e.target.value,
    }));
  };

  const handleSubmit = async (e) => {
    e.preventDefault(); // 🔥 prevents page refresh

    if (!form.name || !form.limit) return;

    await onSubmit(); // delegated to parent
  };

  return (
    <AnimatePresence>
      <div className="fixed inset-0 z-50 flex items-center justify-center bg-black/70 px-4 backdrop-blur-sm">

        {/* MODAL CARD */}
        <motion.div
          initial={{ opacity: 0, y: 30, scale: 0.95 }}
          animate={{ opacity: 1, y: 0, scale: 1 }}
          exit={{ opacity: 0, y: 30, scale: 0.95 }}
          transition={{ duration: 0.25 }}
          className="relative w-full max-w-md overflow-hidden rounded-3xl border border-white/10 bg-[#0f172a] shadow-2xl"
        >

          {/* Glow Effects */}
          <div className="absolute -top-10 left-0 h-32 w-32 rounded-full bg-emerald-500/10 blur-3xl"></div>
          <div className="absolute bottom-0 right-0 h-32 w-32 rounded-full bg-cyan-500/10 blur-3xl"></div>

          <div className="relative z-10 p-6 sm:p-7">

            {/* HEADER */}
            <div className="flex items-start justify-between">
              <div>

                <div className="mb-3 inline-flex items-center gap-2 rounded-full border border-emerald-400/20 bg-emerald-500/10 px-3 py-1 text-xs text-emerald-400">
                  {editing ? (
                    <PencilLine size={14} />
                  ) : (
                    <Wallet size={14} />
                  )}
                  {editing ? "Update Budget" : "New Budget"}
                </div>

                <h2 className="text-2xl font-bold text-white">
                  {editing ? "Edit Budget" : "Create Budget"}
                </h2>

                <p className="mt-1 text-sm text-slate-400">
                  {editing
                    ? "Adjust your financial plan and spending limits."
                    : "Set a smart spending target and stay in control."}
                </p>

              </div>

              <button
                onClick={onClose}
                className="rounded-xl bg-white/5 p-2 text-slate-400 transition hover:bg-white/10 hover:text-white"
              >
                <X size={18} />
              </button>
            </div>

            {/* FORM */}
            <form onSubmit={handleSubmit} className="mt-6 space-y-5">

              {/* NAME */}
              <div>
                <label className="mb-2 block text-sm font-medium text-slate-300">
                  Budget Name
                </label>

                <input
                  name="name"
                  value={form.name}
                  onChange={handleChange}
                  placeholder="e.g Food, Transport, Rent"
                  className="w-full rounded-2xl border border-white/10 bg-white/5 px-4 py-3 text-white outline-none placeholder:text-slate-500 focus:border-emerald-400"
                />
              </div>

              {/* LIMIT */}
              <div>
                <label className="mb-2 block text-sm font-medium text-slate-300">
                  Budget Limit
                </label>

                <div className="flex items-center rounded-2xl border border-white/10 bg-white/5 px-4">
                  <Landmark size={18} className="text-slate-500" />

                  <input
                    name="limit"
                    type="number"
                    value={form.limit}
                    onChange={handleChange}
                    placeholder="Enter amount"
                    className="w-full bg-transparent px-3 py-3 text-white outline-none placeholder:text-slate-500"
                  />
                </div>
              </div>

              {/* SUBMIT */}
              <button
                type="submit"
                className="group flex w-full items-center justify-center gap-2 rounded-2xl bg-gradient-to-r from-emerald-500 to-cyan-500 px-5 py-3 font-semibold text-white shadow-xl transition hover:scale-[1.02]"
              >
                {editing ? "Update Budget" : "Create Budget"}
                <ArrowRight
                  size={16}
                  className="transition group-hover:translate-x-1"
                />
              </button>

              {/* CANCEL */}
              <button
                type="button"
                onClick={onClose}
                className="w-full rounded-2xl border border-white/10 py-3 text-sm font-medium text-slate-400 transition hover:bg-white/5 hover:text-white"
              >
                Cancel
              </button>

            </form>
          </div>
        </motion.div>
      </div>
    </AnimatePresence>
  );
};

export default BudgetModal;