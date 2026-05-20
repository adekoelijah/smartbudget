



// import { createCheckoutSession } from "../../services/billingService";
// import { motion } from "framer-motion";

// const plans = [
//   {
//     name: "Basic Access",
//     subtitle: "Personal financial tracking layer",
//     price: "₦0",
//     plan: "free",
//     description:
//       "Core budgeting system for individual expense visibility and manual tracking.",
//     features: [
//       "Expense tracking system",
//       "Basic financial reports",
//       "Manual budget control",
//       "Single account access",
//     ],
//     type: "entry",
//   },
//   {
//     name: "Financial Control Pro",
//     subtitle: "Automated financial intelligence layer",
//     price: "₦5,000 / month",
//     plan: "pro",
//     description:
//       "Advanced automation layer with insights, analytics, and structured financial intelligence.",
//     features: [
//       "Real-time transaction tracking",
//       "AI-powered financial insights",
//       "Advanced reporting engine",
//       "Automated budget enforcement",
//       "Multi-account linking",
//     ],
//     type: "core",
//   },
// ];

// const Pricing = () => {
//   const handleCheckout = async (plan) => {
//     try {
//       const { url } = await createCheckoutSession(plan);
//       window.location.assign(url);
//     } catch {
//       alert("Transaction initialization failed");
//     }
//   };

//   return (
//     <section className="relative py-28 bg-white overflow-hidden">

//       {/* =========================
//          BACKGROUND SYSTEM LAYER
//       ========================= */}
//       <div className="absolute inset-0 -z-10">
//         <div className="absolute inset-0 bg-[linear-gradient(to_right,#0f172a05_1px,transparent_1px),linear-gradient(to_bottom,#0f172a05_1px,transparent_1px)] bg-[size:80px_80px]" />
//       </div>

//       <div className="max-w-6xl mx-auto px-4">

//         {/* =========================
//            HEADER (CLARITY-FIRST)
//         ========================= */}
//         <div className="text-center max-w-3xl mx-auto">
//           <h2 className="text-[42px] font-semibold tracking-tight text-slate-950">
//             Financial access tiers
//             <br />
//             built for structured control
//           </h2>

//           <p className="mt-5 text-slate-600 text-[15px] leading-7">
//             SmartBudget operates on a layered financial system.
//             Each tier defines the level of control, automation, and
//             intelligence available to the user.
//           </p>
//         </div>

//         {/* =========================
//            PRICING GRID (2 COL ONLY)
//         ========================= */}
//         <div className="mt-16 grid grid-cols-1 md:grid-cols-2 gap-8">

//           {plans.map((plan, i) => (
//             <motion.div
//               key={i}
//               initial={{ opacity: 0, y: 20 }}
//               whileInView={{ opacity: 1, y: 0 }}
//               viewport={{ once: true, amount: 0.3 }}
//               transition={{ duration: 0.45 }}
//               className={`
//                 relative rounded-2xl border p-8
//                 transition
//                 ${
//                   plan.type === "core"
//                     ? "border-slate-900 shadow-xl"
//                     : "border-slate-200"
//                 }
//               `}
//             >

//               {/* PLAN LABEL */}
//               <div className="flex items-center justify-between">
//                 <div>
//                   <h3 className="text-[18px] font-semibold text-slate-950">
//                     {plan.name}
//                   </h3>

//                   <p className="text-sm text-slate-500 mt-1">
//                     {plan.subtitle}
//                   </p>
//                 </div>

//                 {plan.type === "core" && (
//                   <span className="text-[11px] px-3 py-1 rounded-full bg-slate-900 text-white">
//                     Recommended
//                   </span>
//                 )}
//               </div>

//               {/* PRICE */}
//               <div className="mt-6">
//                 <p className="text-[34px] font-semibold tracking-tight text-slate-950">
//                   {plan.price}
//                 </p>

//                 <p className="text-xs text-slate-500 mt-1">
//                   Transparent billing • Cancel anytime
//                 </p>
//               </div>

//               {/* DESCRIPTION */}
//               <p className="mt-5 text-sm text-slate-600 leading-6">
//                 {plan.description}
//               </p>

//               {/* FEATURES */}
//               <div className="mt-6 space-y-3">
//                 {plan.features.map((f, idx) => (
//                   <div
//                     key={idx}
//                     className="flex items-start gap-2 text-sm text-slate-600"
//                   >
//                     <span className="mt-1 h-1.5 w-1.5 rounded-full bg-slate-900" />
//                     <span>{f}</span>
//                   </div>
//                 ))}
//               </div>

//               {/* CTA */}
//               <button
//                 onClick={() => handleCheckout(plan.plan)}
//                 className={`
//                   mt-8 w-full py-3 rounded-xl text-sm font-medium transition
//                   ${
//                     plan.type === "core"
//                       ? "bg-slate-900 text-white hover:bg-slate-800"
//                       : "bg-white border border-slate-200 text-slate-900 hover:border-slate-400"
//                   }
//                 `}
//               >
//                 {plan.type === "core"
//                   ? "Activate Financial Control"
//                   : "Start Basic Access"}
//               </button>
//             </motion.div>
//           ))}
//         </div>

//         {/* =========================
//            TRUST DISCLAIMER
//         ========================= */}
//         <div className="mt-14 text-center text-xs text-slate-500">
//           All transactions are processed securely. SmartBudget does not act as a bank or financial institution.
//         </div>

//       </div>
//     </section>
//   );
// };

// export default Pricing;


import { motion } from "framer-motion";
import { createCheckoutSession } from "../../services/billingService";
import { CheckCircle2, ShieldCheck, ArrowRight } from "lucide-react";

/* =========================
   PRICING TIERS (FINTECH MODEL)
========================= */
const plans = [
  {
    name: "Basic Financial Layer",
    subtitle: "Account visibility & manual control layer",
    price: "₦0",
    plan: "free",
    description:
      "Entry-level financial observability for personal expense tracking and structured budgeting.",
    features: [
      "Transaction visibility dashboard",
      "Manual budget controls",
      "Basic financial reports",
      "Single-user financial space",
    ],
    accent: "slate",
  },
  {
    name: "Financial Intelligence Core",
    subtitle: "Automated control + predictive insights layer",
    price: "₦5,000",
    period: "/ month",
    plan: "pro",
    description:
      "Advanced financial intelligence system for automation, forecasting, and structured cashflow governance.",
    features: [
      "Real-time transaction ingestion",
      "Automated budget enforcement engine",
      "Predictive cashflow insights",
      "Advanced reporting & analytics layer",
      "Multi-account financial aggregation",
    ],
    accent: "emerald",
    highlighted: true,
  },
];

/* =========================
   CARD
========================= */
const PricingCard = ({ plan, onSelect }) => {
  const isPro = plan.highlighted;

  return (
    <motion.div
      initial={{ opacity: 0, y: 24 }}
      whileInView={{ opacity: 1, y: 0 }}
      viewport={{ once: true, amount: 0.3 }}
      transition={{ duration: 0.5 }}
      className={`
        relative rounded-3xl p-8 border
        transition-all duration-300

        ${
          isPro
            ? "border-emerald-500/40 bg-gradient-to-b from-white to-emerald-50/40 shadow-xl"
            : "border-slate-200 bg-white"
        }
      `}
    >
      {/* TOP SECURITY STRIP */}
      <div className="absolute inset-x-0 top-0 h-[1px] bg-gradient-to-r from-transparent via-slate-300 to-transparent" />

      {/* HEADER */}
      <div className="flex items-start justify-between">
        <div>
          <h3 className="text-[18px] font-semibold text-slate-950">
            {plan.name}
          </h3>

          <p className="mt-1 text-sm text-slate-500">
            {plan.subtitle}
          </p>
        </div>

        {isPro && (
          <div className="flex items-center gap-1 px-3 py-1 rounded-full bg-emerald-500/10 text-emerald-700 text-[11px] font-semibold">
            <ShieldCheck size={14} />
            CORE SYSTEM
          </div>
        )}
      </div>

      {/* PRICE */}
      <div className="mt-8 flex items-end gap-2">
        <h2 className="text-[42px] font-semibold tracking-tight text-slate-950">
          {plan.price}
        </h2>

        {plan.period && (
          <span className="text-sm text-slate-500 mb-2">
            {plan.period}
          </span>
        )}
      </div>

      <p className="mt-1 text-xs text-slate-500">
        Transparent pricing • No hidden financial fees
      </p>

      {/* DESCRIPTION */}
      <p className="mt-6 text-sm leading-6 text-slate-600">
        {plan.description}
      </p>

      {/* FEATURES */}
      <div className="mt-7 space-y-3">
        {plan.features.map((f, i) => (
          <div key={i} className="flex items-start gap-2">
            <CheckCircle2
              size={15}
              className={
                isPro ? "text-emerald-600" : "text-slate-400"
              }
            />
            <span className="text-sm text-slate-600">{f}</span>
          </div>
        ))}
      </div>

      {/* CTA */}
      <button
        onClick={() => onSelect(plan.plan)}
        className={`
          mt-10 w-full h-12 rounded-xl text-sm font-semibold
          transition flex items-center justify-center gap-2

          ${
            isPro
              ? "bg-slate-950 text-white hover:bg-slate-800"
              : "bg-white border border-slate-200 text-slate-900 hover:border-slate-400"
          }
        `}
      >
        {isPro ? "Activate Financial Core" : "Start Free Layer"}
        <ArrowRight size={16} />
      </button>

      {/* FOOT NOTE */}
      <p className="mt-4 text-[11px] text-slate-400 text-center">
        Financial infrastructure access subject to compliance review
      </p>
    </motion.div>
  );
};

/* =========================
   MAIN SECTION
========================= */
const Pricing = () => {
  const handleCheckout = async (plan) => {
    try {
      const { url } = await createCheckoutSession(plan);
      window.location.assign(url);
    } catch {
      alert("Transaction initialization failed");
    }
  };

  return (
    <section className="relative py-32 bg-slate-50 overflow-hidden">

      {/* BACKGROUND GRID */}
      <div className="absolute inset-0 -z-10">
        <div className="absolute inset-0 bg-[linear-gradient(to_right,#0f172a08_1px,transparent_1px),linear-gradient(to_bottom,#0f172a08_1px,transparent_1px)] bg-[size:80px_80px]" />
      </div>

      <div className="max-w-6xl mx-auto px-6">

        {/* HEADER */}
        <div className="max-w-3xl mx-auto text-center">
          <h2 className="text-[44px] font-semibold tracking-tight text-slate-950">
            Financial access architecture
          </h2>

          <p className="mt-5 text-slate-600 text-[15px] leading-7">
            SmartBudget is structured as a financial control system.
            Each tier defines the depth of financial intelligence,
            automation, and governance available to the user.
          </p>
        </div>

        {/* GRID */}
        <div className="mt-16 grid grid-cols-1 md:grid-cols-2 gap-8">
          {plans.map((p, i) => (
            <PricingCard
              key={i}
              plan={p}
              onSelect={handleCheckout}
            />
          ))}
        </div>

        {/* TRUST FOOTER */}
        <div className="mt-16 text-center">
          <div className="inline-flex items-center gap-2 text-xs text-slate-500">
            <ShieldCheck size={14} />
            Encrypted financial infrastructure • No banking license required
          </div>
        </div>
      </div>
    </section>
  );
};

export default Pricing;