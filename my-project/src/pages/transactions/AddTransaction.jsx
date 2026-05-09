// import { useMemo, useState } from "react";
// import { motion, AnimatePresence } from "framer-motion";
// import api from "../../services/api";
// import { useNavigate } from "react-router-dom";

// /**
//  * Fintech Category Model
//  */
// const CATEGORIES = [
//   { label: "Food", icon: "🍔" },
//   { label: "Transport", icon: "🚗" },
//   { label: "Rent", icon: "🏠" },
//   { label: "Utilities", icon: "💡" },
//   { label: "Shopping", icon: "🛍️" },
//   { label: "Health", icon: "🏥" },
//   { label: "Salary", icon: "💰" },
//   { label: "Business", icon: "📊" },
//   { label: "Other", icon: "📦" },
// ];

// const steps = ["details", "category", "confirm"];

// const AddTransaction = () => {
//   const navigate = useNavigate();

//   const [step, setStep] = useState(0);

//   const [form, setForm] = useState({
//     title: "",
//     amount: "",
//     type: "expense",
//     category: "Food",
//     note: "",
//   });

//   const [loading, setLoading] = useState(false);
//   const [error, setError] = useState("");

//   const formattedAmount = useMemo(() => {
//     const val = Number(form.amount || 0);

//     return new Intl.NumberFormat("en-NG", {
//       style: "currency",
//       currency: "NGN",
//       minimumFractionDigits: 2,
//     }).format(val);
//   }, [form.amount]);

//   const handleChange = (e) => {
//     setForm((prev) => ({
//       ...prev,
//       [e.target.name]: e.target.value,
//     }));
//   };

//   const validate = () => {
//     if (!form.title.trim()) return "Title is required";
//     if (!form.amount || Number(form.amount) <= 0) {
//       return "Enter a valid amount";
//     }
//     return null;
//   };

//   const nextStep = () => {
//     const err = validate();

//     if (step === 0 && err) {
//       setError(err);
//       return;
//     }

//     setError("");
//     setStep((prev) => prev + 1);
//   };

//   const prevStep = () => {
//     setError("");
//     setStep((prev) => prev - 1);
//   };

//   const handleSubmit = async () => {
//     const err = validate();

//     if (err) {
//       setError(err);
//       return;
//     }

//     try {
//       setLoading(true);

//       await api.post("/transactions", {
//         ...form,
//         amount: Number(form.amount),
//       });

//       navigate("/app/transactions");
//     } catch (error) {
//       setError(
//         error?.response?.data?.message ||
//           "Failed to add transaction"
//       );
//     } finally {
//       setLoading(false);
//     }
//   };

//   const progress = ((step + 1) / steps.length) * 100;

//   return (
//     <div className="min-h-screen bg-slate-50 px-4 py-6 md:px-6 lg:px-8">
//       <div className="max-w-7xl mx-auto grid gap-6 xl:grid-cols-[1.1fr_0.9fr]">

//         {/* LEFT PANEL */}
//         <motion.div
//           initial={{ opacity: 0, y: 18 }}
//           animate={{ opacity: 1, y: 0 }}
//           className="rounded-3xl border border-slate-200 bg-white p-5 md:p-8 shadow-sm"
//         >
//           {/* Header */}
//           <div className="pb-6 border-b border-slate-100">
//             <div className="flex flex-col gap-3 sm:flex-row sm:items-center sm:justify-between">
//               <div>
//                 <p className="text-xs font-semibold tracking-[0.18em] uppercase text-slate-400">
//                   SmartBudget
//                 </p>

//                 <h1 className="mt-2 text-2xl md:text-3xl font-semibold text-slate-900">
//                   Add Transaction
//                 </h1>

//                 <p className="mt-2 text-sm text-slate-500">
//                   Capture income and expenses with a clean workflow.
//                 </p>
//               </div>

//               <div className="rounded-2xl bg-slate-50 px-4 py-3 border border-slate-200 min-w-[130px]">
//                 <p className="text-xs text-slate-500">
//                   Progress
//                 </p>
//                 <p className="mt-1 text-lg font-semibold text-slate-900">
//                   {Math.round(progress)}%
//                 </p>
//               </div>
//             </div>

//             {/* Progress bar */}
//             <div className="mt-5">
//               <div className="flex justify-between text-xs text-slate-500 mb-2">
//                 <span>
//                   Step {step + 1} of {steps.length}
//                 </span>
//                 <span>{steps[step]}</span>
//               </div>

//               <div className="h-2 rounded-full bg-slate-100 overflow-hidden">
//                 <div
//                   className="h-full rounded-full bg-slate-900 transition-all duration-300"
//                   style={{ width: `${progress}%` }}
//                 />
//               </div>
//             </div>
//           </div>

//           {/* FORM BODY */}
//           <div className="pt-6">
//             <AnimatePresence mode="wait">

//               {/* STEP 1 */}
//               {step === 0 && (
//                 <motion.div
//                   key="step1"
//                   initial={{ opacity: 0, x: 12 }}
//                   animate={{ opacity: 1, x: 0 }}
//                   exit={{ opacity: 0, x: -12 }}
//                   className="space-y-5"
//                 >
//                   <div>
//                     <label className="text-sm font-medium text-slate-700">
//                       Transaction Title
//                     </label>

//                     <input
//                       name="title"
//                       value={form.title}
//                       onChange={handleChange}
//                       placeholder="Salary, Rent, Fuel..."
//                       className="mt-2 w-full rounded-2xl border border-slate-200 px-4 py-3 text-slate-900 placeholder:text-slate-400 focus:border-slate-400 focus:outline-none"
//                     />
//                   </div>

//                   <div>
//                     <label className="text-sm font-medium text-slate-700">
//                       Amount
//                     </label>

//                     <input
//                       name="amount"
//                       type="number"
//                       value={form.amount}
//                       onChange={handleChange}
//                       placeholder="0.00"
//                       className="mt-2 w-full rounded-2xl border border-slate-200 px-4 py-3 text-slate-900 placeholder:text-slate-400 focus:border-slate-400 focus:outline-none"
//                     />
//                   </div>

//                   <div>
//                     <label className="text-sm font-medium text-slate-700 block mb-3">
//                       Transaction Type
//                     </label>

//                     <div className="grid grid-cols-2 gap-3">
//                       <button
//                         type="button"
//                         onClick={() =>
//                           setForm((p) => ({
//                             ...p,
//                             type: "income",
//                           }))
//                         }
//                         className={`rounded-2xl py-3 font-medium transition ${
//                           form.type === "income"
//                             ? "bg-slate-900 text-white"
//                             : "border border-slate-200 text-slate-700 bg-white"
//                         }`}
//                       >
//                         Income
//                       </button>

//                       <button
//                         type="button"
//                         onClick={() =>
//                           setForm((p) => ({
//                             ...p,
//                             type: "expense",
//                           }))
//                         }
//                         className={`rounded-2xl py-3 font-medium transition ${
//                           form.type === "expense"
//                             ? "bg-slate-900 text-white"
//                             : "border border-slate-200 text-slate-700 bg-white"
//                         }`}
//                       >
//                         Expense
//                       </button>
//                     </div>
//                   </div>
//                 </motion.div>
//               )}

//               {/* STEP 2 */}
//               {step === 1 && (
//                 <motion.div
//                   key="step2"
//                   initial={{ opacity: 0, x: 12 }}
//                   animate={{ opacity: 1, x: 0 }}
//                   exit={{ opacity: 0, x: -12 }}
//                 >
//                   <h3 className="text-sm font-medium text-slate-700 mb-4">
//                     Select Category
//                   </h3>

//                   <div className="grid grid-cols-2 sm:grid-cols-3 gap-3">
//                     {CATEGORIES.map((cat) => (
//                       <button
//                         key={cat.label}
//                         type="button"
//                         onClick={() =>
//                           setForm((p) => ({
//                             ...p,
//                             category: cat.label,
//                           }))
//                         }
//                         className={`rounded-2xl border p-4 transition text-center ${
//                           form.category === cat.label
//                             ? "border-slate-900 bg-slate-900 text-white"
//                             : "border-slate-200 bg-white text-slate-700"
//                         }`}
//                       >
//                         <div className="text-xl mb-1">
//                           {cat.icon}
//                         </div>
//                         <span className="text-sm font-medium">
//                           {cat.label}
//                         </span>
//                       </button>
//                     ))}
//                   </div>
//                 </motion.div>
//               )}

//               {/* STEP 3 */}
//               {step === 2 && (
//                 <motion.div
//                   key="step3"
//                   initial={{ opacity: 0, x: 12 }}
//                   animate={{ opacity: 1, x: 0 }}
//                   exit={{ opacity: 0, x: -12 }}
//                   className="space-y-5"
//                 >
//                   <div>
//                     <label className="text-sm font-medium text-slate-700">
//                       Note (Optional)
//                     </label>

//                     <textarea
//                       rows="5"
//                       name="note"
//                       value={form.note}
//                       onChange={handleChange}
//                       placeholder="Additional details..."
//                       className="mt-2 w-full resize-none rounded-2xl border border-slate-200 px-4 py-3 text-slate-900 placeholder:text-slate-400 focus:border-slate-400 focus:outline-none"
//                     />
//                   </div>

//                   <div className="rounded-2xl border border-slate-200 bg-slate-50 p-5">
//                     <p className="text-sm font-medium text-slate-700">
//                       Summary
//                     </p>

//                     <div className="mt-4 space-y-3 text-sm">
//                       <div className="flex justify-between">
//                         <span className="text-slate-500">
//                           Title
//                         </span>
//                         <span className="font-medium text-slate-900">
//                           {form.title}
//                         </span>
//                       </div>

//                       <div className="flex justify-between">
//                         <span className="text-slate-500">
//                           Type
//                         </span>
//                         <span className="font-medium capitalize text-slate-900">
//                           {form.type}
//                         </span>
//                       </div>

//                       <div className="flex justify-between">
//                         <span className="text-slate-500">
//                           Category
//                         </span>
//                         <span className="font-medium text-slate-900">
//                           {form.category}
//                         </span>
//                       </div>

//                       <div className="flex justify-between">
//                         <span className="text-slate-500">
//                           Amount
//                         </span>
//                         <span className="font-semibold text-slate-900">
//                           {formattedAmount}
//                         </span>
//                       </div>
//                     </div>
//                   </div>
//                 </motion.div>
//               )}

//             </AnimatePresence>

//             {/* ERROR */}
//             {error && (
//               <div className="mt-5 rounded-2xl border border-red-200 bg-red-50 px-4 py-3 text-sm text-red-600">
//                 {error}
//               </div>
//             )}

//             {/* ACTIONS */}
//             <div className="mt-8 flex flex-col-reverse sm:flex-row gap-3">
//               {step > 0 && (
//                 <button
//                   onClick={prevStep}
//                   className="w-full sm:flex-1 rounded-2xl border border-slate-200 py-3 font-medium text-slate-700"
//                 >
//                   Back
//                 </button>
//               )}

//               {step < 2 ? (
//                 <button
//                   onClick={nextStep}
//                   className="w-full sm:flex-1 rounded-2xl bg-slate-900 py-3 font-medium text-white"
//                 >
//                   Continue
//                 </button>
//               ) : (
//                 <button
//                   onClick={handleSubmit}
//                   disabled={loading}
//                   className="w-full sm:flex-1 rounded-2xl bg-slate-900 py-3 font-medium text-white disabled:opacity-60"
//                 >
//                   {loading
//                     ? "Saving..."
//                     : "Create Transaction"}
//                 </button>
//               )}
//             </div>
//           </div>
//         </motion.div>

//         {/* RIGHT PANEL */}
//         <motion.div
//           initial={{ opacity: 0, y: 18 }}
//           animate={{ opacity: 1, y: 0 }}
//           className="rounded-3xl border border-slate-200 bg-white p-5 md:p-8 shadow-sm"
//         >
//           <div className="flex items-start justify-between gap-4 mb-6">
//             <div>
//               <p className="text-sm text-slate-500">
//                 Live Preview
//               </p>

//               <h2 className="mt-1 text-xl font-semibold text-slate-900">
//                 Transaction Card
//               </h2>
//             </div>

//             <span className="rounded-full bg-slate-100 px-3 py-1 text-xs font-medium capitalize text-slate-700">
//               {form.type}
//             </span>
//           </div>

//           <div className="rounded-3xl border border-slate-200 bg-slate-50 p-6">
//             <p className="text-sm text-slate-500">
//               {form.category}
//             </p>

//             <h3 className="mt-2 text-2xl font-semibold text-slate-900">
//               {form.title || "Transaction Title"}
//             </h3>

//             <p className="mt-5 text-3xl font-semibold text-slate-900">
//               {formattedAmount}
//             </p>

//             <p className="mt-6 text-sm leading-6 text-slate-500">
//               {form.note ||
//                 "No additional note provided for this transaction."}
//             </p>
//           </div>

//           <div className="grid grid-cols-2 gap-4 mt-6">
//             <div className="rounded-2xl border border-slate-200 bg-white p-4">
//               <p className="text-xs text-slate-500">
//                 Processing
//               </p>
//               <p className="mt-1 font-semibold text-slate-900">
//                 Instant
//               </p>
//             </div>

//             <div className="rounded-2xl border border-slate-200 bg-white p-4">
//               <p className="text-xs text-slate-500">
//                 Status
//               </p>
//               <p className="mt-1 font-semibold text-slate-900">
//                 Ready
//               </p>
//             </div>
//           </div>
//         </motion.div>

//       </div>
//     </div>
//   );
// };

// export default AddTransaction;


// import { useMemo, useState } from "react";
// import { motion, AnimatePresence } from "framer-motion";
// //import api from "../../services/api";
// import { useNavigate } from "react-router-dom";
// import { createTransaction } from "../../services/transactionService";

// const CATEGORIES = [
//   { label: "Food", icon: "🍔" },
//   { label: "Transport", icon: "🚗" },
//   { label: "Rent", icon: "🏠" },
//   { label: "Utilities", icon: "💡" },
//   { label: "Shopping", icon: "🛍️" },
//   { label: "Health", icon: "🏥" },
//   { label: "Salary", icon: "💰" },
//   { label: "Business", icon: "📊" },
//   { label: "Other", icon: "📦" },
// ];

// const steps = ["details", "category", "confirm"];

// const AddTransaction = () => {
//   const navigate = useNavigate();

//   const [step, setStep] = useState(0);

//   const [form, setForm] = useState({
//     title: "",
//     amount: "",
//     type: "expense",
//     category: "Food",
//     note: "",
//   });

//   const [loading, setLoading] = useState(false);
//   const [error, setError] = useState("");

//   /* ================= FORMAT AMOUNT ================= */
//   const formattedAmount = useMemo(() => {
//     const val = Number(form.amount || 0);
//     return new Intl.NumberFormat("en-NG", {
//       style: "currency",
//       currency: "NGN",
//     }).format(val);
//   }, [form.amount]);

//   const handleChange = (e) => {
//     setForm((prev) => ({
//       ...prev,
//       [e.target.name]: e.target.value,
//     }));
//   };

//   const validate = () => {
//     if (!form.title.trim()) return "Title is required";
//     if (!form.amount || Number(form.amount) <= 0)
//       return "Enter a valid amount";
//     return null;
//   };

//   const nextStep = () => {
//     const err = validate();
//     if (step === 0 && err) {
//       setError(err);
//       return;
//     }
//     setError("");
//     setStep((s) => s + 1);
//   };

//   const prevStep = () => {
//     setError("");
//     setStep((s) => s - 1);
//   };


//   const handleSubmit = async () => {
//   const err = validate();
//   if (err) return setError(err);

//   try {
//     setLoading(true);

//     // const res = await api.post("/transactions", {
//     //   ...form,
//     //   amount: Number(form.amount),
//     // });
//     await createTransaction({
//   ...form,
//   amount: Number(form.amount),
// });

//   const handleSubmit = async () => {
//   const err = validate();
//   if (err) return setError(err);

//   try {
//     setLoading(true);

//     await createTransaction({
//       ...form,
//       amount: Number(form.amount),
//     });

//     navigate("/app/transactions");
//   } catch (err) {
//     setError(
//       err?.response?.data?.message || "Failed to add transaction"
//     );
//   } finally {
//     setLoading(false);
//   }
// };

//     navigate("/app/transactions");
//   } catch (err) {
//     console.error("Add transaction error:", err);
//     setError(
//       err?.response?.data?.message || "Failed to add transaction"
//     );
//   } finally {
//     setLoading(false);
//   }
// };

//   // const handleSubmit = async () => {
//   //   const err = validate();
//   //   if (err) return setError(err);

//   //   try {
//   //     setLoading(true);

//   //     await api.post("/transactions", {
//   //       ...form,
//   //       amount: Number(form.amount),
//   //     });

//   //     navigate("/app/transactions");
//   //   } catch (err) {
//   //     setError(
//   //       err?.response?.data?.message ||
//   //         "Failed to add transaction"
//   //     );
//   //   } finally {
//   //     setLoading(false);
//   //   }
//   // };

//   const progress = ((step + 1) / steps.length) * 100;

//   return (
//     <div className="min-h-screen bg-slate-50 px-4 py-8">
//       <div className="max-w-6xl mx-auto grid lg:grid-cols-2 gap-8">

//         {/* ================= LEFT PANEL ================= */}
//         <motion.div
//           initial={{ opacity: 0, y: 20 }}
//           animate={{ opacity: 1, y: 0 }}
//           className="bg-white border border-slate-200 rounded-3xl shadow-sm p-6 md:p-8"
//         >

//           {/* HEADER */}
//           <div className="border-b border-slate-100 pb-6">
//             <p className="text-xs uppercase tracking-widest text-slate-400">
//               SmartBudget
//             </p>

//             <h1 className="text-2xl font-semibold text-slate-900 mt-2">
//               Add Transaction
//             </h1>

//             <p className="text-sm text-slate-500 mt-1">
//               Record income and expenses with precision
//             </p>

//             {/* PROGRESS */}
//             <div className="mt-5">
//               <div className="flex justify-between text-xs text-slate-500 mb-2">
//                 <span>Step {step + 1} of {steps.length}</span>
//                 <span>{Math.round(progress)}%</span>
//               </div>

//               <div className="h-2 bg-slate-100 rounded-full overflow-hidden">
//                 <div
//                   className="h-full bg-slate-900 transition-all"
//                   style={{ width: `${progress}%` }}
//                 />
//               </div>
//             </div>
//           </div>

//           {/* BODY */}
//           <div className="pt-6">
//             <AnimatePresence mode="wait">

//               {/* STEP 1 */}
//               {step === 0 && (
//                 <motion.div
//                   key="step1"
//                   initial={{ opacity: 0, x: 15 }}
//                   animate={{ opacity: 1, x: 0 }}
//                   exit={{ opacity: 0, x: -15 }}
//                   className="space-y-5"
//                 >
//                   <div>
//                     <label className="text-sm text-slate-600">
//                       Title
//                     </label>
//                     <input
//                       name="title"
//                       value={form.title}
//                       onChange={handleChange}
//                       placeholder="Salary, Rent, Food..."
//                       className="mt-2 w-full rounded-xl border border-slate-200 px-4 py-3 text-slate-900 focus:outline-none focus:ring-2 focus:ring-slate-900"
//                     />
//                   </div>

//                   <div>
//                     <label className="text-sm text-slate-600">
//                       Amount
//                     </label>
//                     <input
//                       name="amount"
//                       type="number"
//                       value={form.amount}
//                       onChange={handleChange}
//                       placeholder="0.00"
//                       className="mt-2 w-full rounded-xl border border-slate-200 px-4 py-3 text-slate-900 focus:outline-none focus:ring-2 focus:ring-slate-900"
//                     />
//                   </div>

//                   <div className="grid grid-cols-2 gap-3">
//                     <button
//                       onClick={() =>
//                         setForm((p) => ({
//                           ...p,
//                           type: "income",
//                         }))
//                       }
//                       className={`py-3 rounded-xl border font-medium ${
//                         form.type === "income"
//                           ? "bg-emerald-600 text-white border-emerald-600"
//                           : "border-slate-200 text-slate-700"
//                       }`}
//                     >
//                       Income
//                     </button>

//                     <button
//                       onClick={() =>
//                         setForm((p) => ({
//                           ...p,
//                           type: "expense",
//                         }))
//                       }
//                       className={`py-3 rounded-xl border font-medium ${
//                         form.type === "expense"
//                           ? "bg-rose-600 text-white border-rose-600"
//                           : "border-slate-200 text-slate-700"
//                       }`}
//                     >
//                       Expense
//                     </button>
//                   </div>
//                 </motion.div>
//               )}

//               {/* STEP 2 */}
//               {step === 1 && (
//                 <motion.div
//                   key="step2"
//                   initial={{ opacity: 0, x: 15 }}
//                   animate={{ opacity: 1, x: 0 }}
//                   exit={{ opacity: 0, x: -15 }}
//                 >
//                   <h3 className="text-sm font-medium text-slate-600 mb-4">
//                     Choose Category
//                   </h3>

//                   <div className="grid grid-cols-3 gap-3">
//                     {CATEGORIES.map((cat) => (
//                       <button
//                         key={cat.label}
//                         onClick={() =>
//                           setForm((p) => ({
//                             ...p,
//                             category: cat.label,
//                           }))
//                         }
//                         className={`p-4 rounded-2xl border text-center transition ${
//                           form.category === cat.label
//                             ? "bg-slate-900 text-white border-slate-900"
//                             : "bg-white text-slate-700 border-slate-200 hover:border-slate-400"
//                         }`}
//                       >
//                         <div className="text-xl">
//                           {cat.icon}
//                         </div>
//                         <p className="text-sm mt-1">
//                           {cat.label}
//                         </p>
//                       </button>
//                     ))}
//                   </div>
//                 </motion.div>
//               )}

//               {/* STEP 3 */}
//               {step === 2 && (
//                 <motion.div
//                   key="step3"
//                   initial={{ opacity: 0, x: 15 }}
//                   animate={{ opacity: 1, x: 0 }}
//                   exit={{ opacity: 0, x: -15 }}
//                   className="space-y-5"
//                 >
//                   <textarea
//                     name="note"
//                     value={form.note}
//                     onChange={handleChange}
//                     placeholder="Add note (optional)"
//                     className="w-full rounded-xl border border-slate-200 p-4 text-slate-900 focus:outline-none focus:ring-2 focus:ring-slate-900"
//                   />

//                   <div className="bg-slate-50 border border-slate-200 rounded-2xl p-5">
//                     <p className="text-sm text-slate-500">
//                       Summary
//                     </p>

//                     <div className="mt-3 space-y-2 text-sm">
//                       <p>
//                         <span className="text-slate-500">
//                           Title:
//                         </span>{" "}
//                         {form.title}
//                       </p>

//                       <p>
//                         <span className="text-slate-500">
//                           Type:
//                         </span>{" "}
//                         {form.type}
//                       </p>

//                       <p>
//                         <span className="text-slate-500">
//                           Category:
//                         </span>{" "}
//                         {form.category}
//                       </p>

//                       <p className="font-semibold">
//                         {formattedAmount}
//                       </p>
//                     </div>
//                   </div>
//                 </motion.div>
//               )}

//             </AnimatePresence>

//             {/* ERROR */}
//             {error && (
//               <p className="text-sm text-rose-600 mt-4">
//                 {error}
//               </p>
//             )}

//             {/* ACTIONS */}
//             <div className="flex gap-3 mt-8 ">
//               {step > 0 && (
//                 <button
//                   onClick={prevStep}
//                   className="flex-1 py-3 rounded-xl border border-slate-200"
//                 >
//                   Back
//                 </button>
//               )}

//               {step < 2 ? (
//                 <button
//                   onClick={nextStep}
//                   className="flex-1 py-3 rounded-xl bg-slate-900 text-white"
//                 >
//                   Continue
//                 </button>
//               ) : (
//                 <button
//                   onClick={handleSubmit}
//                   disabled={loading}
//                   className="flex-1 py-3 rounded-xl bg-slate-900 text-white"
//                 >
//                   {loading ? "Saving..." : "Create"}
//                 </button>
//               )}
//             </div>

//           </div>
//         </motion.div>

//         {/* ================= RIGHT PANEL ================= */}
//         <div className="bg-white border border-slate-200 rounded-3xl p-6 shadow-sm">

//           <p className="text-sm text-slate-500">
//             Live Preview
//           </p>

//           <h2 className="text-xl font-semibold text-muted mt-1">
//             Transaction
//           </h2>

//           <div className="mt-6 p-6 rounded-2xl bg-slate-50 border border-slate-200">
//             <p className="text-slate-500 text-sm">
//               {form.category}
//             </p>

//             <h3 className="text-2xl font-semibold text-slate-900 mt-2">
//               {form.title || "Title"}
//             </h3>

//             <p className="text-2xl font-bold mt-4 text-slate-900">
//               {formattedAmount}
//             </p>

//             <p className="text-sm text-slate-500 mt-4">
//               {form.note || "No note added"}
//             </p>
//           </div>

//         </div>

//       </div>
//     </div>
//   );
// };

// export default AddTransaction;
import { useMemo, useState } from "react";
import { motion, AnimatePresence } from "framer-motion";
import { useNavigate } from "react-router-dom";
import { createTransaction } from "../../services/transactionService";

const CATEGORIES = [
  { label: "Food", icon: "🍔", key: "food" },
  { label: "Transport", icon: "🚗", key: "transport" },
  { label: "Rent", icon: "🏠", key: "rent" },
  { label: "Utilities", icon: "💡", key: "utilities" },
  { label: "Shopping", icon: "🛍️", key: "shopping" },
  { label: "Health", icon: "🏥", key: "health" },
  { label: "Salary", icon: "💰", key: "salary" },
  { label: "Business", icon: "📊", key: "business" },
  { label: "Other", icon: "📦", key: "other" },
];

const CATEGORY_MAP = Object.fromEntries(
  CATEGORIES.map((c) => [c.label, c.key])
);

const steps = ["details", "category", "confirm"];

const AddTransaction = () => {
  const navigate = useNavigate();

  const [step, setStep] = useState(0);
  const [loading, setLoading] = useState(false);
  const [error, setError] = useState("");

  const [form, setForm] = useState({
    title: "",
    amount: "",
    type: "expense",
    category: "Food",
    categoryKey: "food",
    note: "",
  });

  /* ================= FORMAT AMOUNT ================= */
  const formattedAmount = useMemo(() => {
    const val = Number(form.amount || 0);
    return new Intl.NumberFormat("en-NG", {
      style: "currency",
      currency: "NGN",
    }).format(val);
  }, [form.amount]);

  /* ================= HANDLERS ================= */
  const handleChange = (e) => {
    setForm((prev) => ({
      ...prev,
      [e.target.name]: e.target.value,
    }));
  };

  const validate = () => {
    if (!form.title.trim()) return "Title is required";
    if (!form.amount || Number(form.amount) <= 0)
      return "Enter a valid amount";
    return null;
  };

  const nextStep = () => {
    if (step === 0) {
      const err = validate();
      if (err) return setError(err);
    }
    setError("");
    setStep((s) => s + 1);
  };

  const prevStep = () => {
    setError("");
    setStep((s) => s - 1);
  };

  /* ================= SUBMIT (FIXED BUDGET SYNC READY) ================= */
  const handleSubmit = async () => {
    const err = validate();
    if (err) return setError(err);

    try {
      setLoading(true);

      const payload = {
        title: form.title,
        amount: Number(form.amount),
        type: form.type,
        category: form.category,
        categoryKey: form.categoryKey,
        note: form.note,
      };

      await createTransaction(payload);

      navigate("/app/transactions");
    } catch (err) {
      console.error("Add transaction error:", err);
      setError(
        err?.response?.data?.message || "Failed to add transaction"
      );
    } finally {
      setLoading(false);
    }
  };

  const progress = ((step + 1) / steps.length) * 100;

  return (
    <div className="min-h-screen bg-slate-50 px-4 py-8">
      <div className="max-w-6xl mx-auto grid lg:grid-cols-2 gap-8">

        {/* ================= LEFT PANEL ================= */}
        <motion.div
          initial={{ opacity: 0, y: 20 }}
          animate={{ opacity: 1, y: 0 }}
          className="bg-white border border-slate-200 rounded-3xl shadow-sm p-6 md:p-8"
        >

          {/* HEADER */}
          <div className="border-b border-slate-100 pb-6">
            <p className="text-xs uppercase tracking-widest text-slate-400">
              SmartBudget
            </p>

            <h1 className="text-2xl font-semibold text-slate-900 mt-2">
              Add Transaction
            </h1>

            <p className="text-sm text-slate-500 mt-1">
              Record income and expenses with precision
            </p>

            {/* PROGRESS */}
            <div className="mt-5">
              <div className="flex justify-between text-xs text-slate-500 mb-2">
                <span>Step {step + 1} of {steps.length}</span>
                <span>{Math.round(progress)}%</span>
              </div>

              <div className="h-2 bg-slate-100 rounded-full overflow-hidden">
                <div
                  className="h-full bg-slate-900 transition-all"
                  style={{ width: `${progress}%` }}
                />
              </div>
            </div>
          </div>

          {/* BODY */}
          <div className="pt-6">
            <AnimatePresence mode="wait">

              {/* STEP 1 */}
              {step === 0 && (
                <motion.div
                  key="step1"
                  initial={{ opacity: 0, x: 15 }}
                  animate={{ opacity: 1, x: 0 }}
                  exit={{ opacity: 0, x: -15 }}
                  className="space-y-5"
                >
                  <input
                    name="title"
                    value={form.title}
                    onChange={handleChange}
                    placeholder="Title"
                    className="w-full rounded-xl border border-slate-200 px-4 py-3"
                  />

                  <input
                    name="amount"
                    type="number"
                    value={form.amount}
                    onChange={handleChange}
                    placeholder="Amount"
                    className="w-full rounded-xl border border-slate-200 px-4 py-3"
                  />

                  <div className="grid grid-cols-2 gap-3">
                    <button
                      onClick={() =>
                        setForm((p) => ({
                          ...p,
                          type: "income",
                        }))
                      }
                      className={`py-3 rounded-xl border ${
                        form.type === "income"
                          ? "bg-emerald-600 text-white border-emerald-600"
                          : ""
                      }`}
                    >
                      Income
                    </button>

                    <button
                      onClick={() =>
                        setForm((p) => ({
                          ...p,
                          type: "expense",
                        }))
                      }
                      className={`py-3 rounded-xl border ${
                        form.type === "expense"
                          ? "bg-rose-600 text-white border-rose-600"
                          : ""
                      }`}
                    >
                      Expense
                    </button>
                  </div>
                </motion.div>
              )}

              {/* STEP 2 - FIXED CATEGORY UI */}
              {step === 1 && (
                <motion.div
                  key="step2"
                  className="grid grid-cols-3 gap-3"
                >
                  {CATEGORIES.map((cat) => {
                    const isActive =
                      form.categoryKey === cat.key;

                    return (
                      <button
                        key={cat.key}
                        onClick={() =>
                          setForm((p) => ({
                            ...p,
                            category: cat.label,
                            categoryKey: cat.key,
                          }))
                        }
                        className={`flex flex-col items-center gap-2 p-4 rounded-2xl border transition ${
                          isActive
                            ? "bg-slate-900 text-white border-slate-900 scale-[1.02]"
                            : "bg-white text-slate-700 border-slate-200 hover:border-slate-400"
                        }`}
                      >
                        <span className="text-2xl">{cat.icon}</span>
                        <span className="text-sm font-medium">
                          {cat.label}
                        </span>
                      </button>
                    );
                  })}
                </motion.div>
              )}

              {/* STEP 3 */}
              {step === 2 && (
                <motion.div className="space-y-5">
                  <textarea
                    name="note"
                    value={form.note}
                    onChange={handleChange}
                    placeholder="Note"
                    className="w-full rounded-xl border border-slate-200 p-4"
                  />

                  <div className="bg-slate-50 p-5 rounded-2xl">
                    <p>{form.category}</p>
                    <h3 className="text-xl font-semibold">
                      {form.title}
                    </h3>
                    <p className="text-2xl font-bold">
                      {formattedAmount}
                    </p>
                  </div>
                </motion.div>
              )}

            </AnimatePresence>

            {error && (
              <p className="text-rose-600 text-sm mt-4">
                {error}
              </p>
            )}

            {/* ACTIONS */}
            <div className="flex gap-3 mt-8">
              {step > 0 && (
                <button
                  onClick={prevStep}
                  className="flex-1 py-3 border rounded-xl"
                >
                  Back
                </button>
              )}

              {step < 2 ? (
                <button
                  onClick={nextStep}
                  className="flex-1 py-3 bg-slate-900 text-white rounded-xl"
                >
                  Continue
                </button>
              ) : (
                <button
                  onClick={handleSubmit}
                  disabled={loading}
                  className="flex-1 py-3 bg-slate-900 text-white rounded-xl"
                >
                  {loading ? "Saving..." : "Create"}
                </button>
              )}
            </div>
          </div>
        </motion.div>

        {/* ================= RIGHT PANEL ================= */}
        <div className="bg-white border rounded-3xl p-6">
          <p className="text-sm text-slate-500">Live Preview</p>

          <h2 className="text-xl font-semibold">Transaction</h2>

          <div className="mt-6 p-5 bg-slate-50 rounded-2xl">
            <p>{form.category}</p>
            <h3 className="text-2xl font-semibold">
              {form.title || "Title"}
            </h3>
            <p className="text-2xl font-bold">
              {formattedAmount}
            </p>
          </div>
        </div>

      </div>
    </div>
  );
};

export default AddTransaction;