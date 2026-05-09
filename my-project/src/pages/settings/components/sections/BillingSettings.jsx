// import { useState } from "react";

// const plans = [
//   {
//     id: "starter",
//     name: "Starter",
//     priceMonthly: 0,
//     priceYearly: 0,
//     features: ["Basic tracking", "Limited reports"],
//   },
//   {
//     id: "pro",
//     name: "Pro",
//     priceMonthly: 10,
//     priceYearly: 100,
//     features: ["Advanced analytics", "AI insights", "Unlimited budgets"],
//   },
//   {
//     id: "business",
//     name: "Business",
//     priceMonthly: 25,
//     priceYearly: 250,
//     features: ["Team access", "Priority support", "Advanced reports"],
//   },
// ];

// const BillingSettings = () => {
//   const [billingCycle, setBillingCycle] = useState("monthly");
//   const [currentPlan, setCurrentPlan] = useState("starter");
//   const [loading, setLoading] = useState(false);
//   const [message, setMessage] = useState("");

//   // 💳 HANDLE PLAN CHANGE
//   const handlePlanChange = async (planId) => {
//     if (planId === currentPlan) return;

//     setMessage("");

//     try {
//       setLoading(true);

//       // 🔌 Replace with Stripe checkout session
//       // const { url } = await createCheckoutSession(planId);

//       // 🚨 React-safe redirect
//       window.location.assign("/checkout"); // replace with real URL

//       setCurrentPlan(planId);
//     } catch {
//       setMessage("Failed to change plan");
//     } finally {
//       setLoading(false);
//     }
//   };

//   return (
//     <div className="space-y-6">

//       {/* CURRENT PLAN */}
//       <div className="p-6 border rounded-xl dark:border-gray-800 bg-white dark:bg-gray-900">

//         <h2 className="font-semibold text-gray-900 dark:text-white">
//           Current Plan
//         </h2>

//         <p className="mt-2 text-sm text-gray-500">
//           You are currently on the{" "}
//           <span className="font-medium capitalize">
//             {currentPlan}
//           </span>{" "}
//           plan
//         </p>

//       </div>

//       {/* BILLING TOGGLE */}
//       <div className="flex items-center justify-between">

//         <h2 className="font-semibold text-gray-900 dark:text-white">
//           Plans
//         </h2>

//         <div className="flex items-center gap-2 text-sm">

//           <button
//             onClick={() => setBillingCycle("monthly")}
//             className={`px-3 py-1 rounded-lg ${
//               billingCycle === "monthly"
//                 ? "bg-black text-white dark:bg-white dark:text-black"
//                 : "border dark:border-gray-700"
//             }`}
//           >
//             Monthly
//           </button>

//           <button
//             onClick={() => setBillingCycle("yearly")}
//             className={`px-3 py-1 rounded-lg ${
//               billingCycle === "yearly"
//                 ? "bg-black text-white dark:bg-white dark:text-black"
//                 : "border dark:border-gray-700"
//             }`}
//           >
//             Yearly
//           </button>

//         </div>

//       </div>

//       {/* PLAN CARDS */}
//       <div className="grid md:grid-cols-3 gap-6">

//         {plans.map((plan) => {
//           const price =
//             billingCycle === "monthly"
//               ? plan.priceMonthly
//               : plan.priceYearly;

//           return (
//             <div
//               key={plan.id}
//               className={`p-6 border rounded-xl dark:border-gray-800 bg-white dark:bg-gray-900 flex flex-col justify-between ${
//                 currentPlan === plan.id
//                   ? "border-black dark:border-white"
//                   : ""
//               }`}
//             >

//               <div>
//                 <h3 className="font-semibold text-lg">
//                   {plan.name}
//                 </h3>

//                 <p className="text-2xl font-bold mt-2">
//                   {price === 0 ? "Free" : `$${price}`}
//                 </p>

//                 <ul className="mt-4 space-y-2 text-sm text-gray-500">
//                   {plan.features.map((f, i) => (
//                     <li key={i}>• {f}</li>
//                   ))}
//                 </ul>
//               </div>

//               <button
//                 onClick={() => handlePlanChange(plan.id)}
//                 disabled={loading}
//                 className={`mt-6 px-4 py-2 rounded-lg ${
//                   currentPlan === plan.id
//                     ? "bg-gray-200 dark:bg-gray-700 cursor-not-allowed"
//                     : "bg-black text-white dark:bg-white dark:text-black"
//                 }`}
//               >
//                 {currentPlan === plan.id
//                   ? "Current Plan"
//                   : loading
//                   ? "Processing..."
//                   : "Choose Plan"}
//               </button>

//             </div>
//           );
//         })}

//       </div>

//       {/* PAYMENT METHOD */}
//       <div className="p-6 border rounded-xl dark:border-gray-800 bg-white dark:bg-gray-900">

//         <h2 className="font-semibold text-gray-900 dark:text-white">
//           Payment Method
//         </h2>

//         <p className="text-sm text-gray-500 mt-2">
//           No payment method added yet
//         </p>

//         <button className="mt-4 px-4 py-2 border rounded-lg">
//           Add Payment Method
//         </button>

//       </div>

//       {/* INVOICES */}
//       <div className="p-6 border rounded-xl dark:border-gray-800 bg-white dark:bg-gray-900">

//         <h2 className="font-semibold text-gray-900 dark:text-white">
//           Billing History
//         </h2>

//         <p className="text-sm text-gray-500 mt-2">
//           No invoices yet
//         </p>

//       </div>

//       {/* FEEDBACK */}
//       {message && (
//         <p className="text-sm text-center text-gray-600 dark:text-gray-300">
//           {message}
//         </p>
//       )}

//     </div>
//   );
// };

// export default BillingSettings;


import { useState } from "react";
import { Check, Sparkles, CreditCard } from "lucide-react";

const plans = [
  {
    id: "starter",
    name: "Starter",
    priceMonthly: 0,
    priceYearly: 0,
    features: ["Basic tracking", "Limited reports"],
    highlight: false,
  },
  {
    id: "pro",
    name: "Pro",
    priceMonthly: 10,
    priceYearly: 100,
    features: ["Advanced analytics", "AI insights", "Unlimited budgets"],
    highlight: true,
  },
  {
    id: "business",
    name: "Business",
    priceMonthly: 25,
    priceYearly: 250,
    features: ["Team access", "Priority support", "Advanced reports"],
    highlight: false,
  },
];

const BillingSettings = () => {
  const [billingCycle, setBillingCycle] = useState("monthly");
  const [currentPlan, setCurrentPlan] = useState("starter");
  const [loading, setLoading] = useState(false);

  const handlePlanChange = async (planId) => {
    if (planId === currentPlan) return;

    try {
      setLoading(true);
      window.location.assign("/checkout");
      setCurrentPlan(planId);
    } finally {
      setLoading(false);
    }
  };

  return (
    <div className="space-y-8 text-white">

      {/* CURRENT PLAN */}
      <div className="rounded-3xl border border-white/10 bg-[#0f172a] p-6">

        <div className="flex items-center justify-between">

          <div>
            <h2 className="text-lg font-semibold">Current Plan</h2>
            <p className="text-sm text-slate-400 mt-1">
              You are on the{" "}
              <span className="text-white font-medium capitalize">
                {currentPlan}
              </span>{" "}
              plan
            </p>
          </div>

          <div className="flex items-center gap-2 text-emerald-400 text-sm">
            <Sparkles size={16} />
            Active
          </div>

        </div>

      </div>

      {/* BILLING TOGGLE */}
      <div className="flex items-center justify-between">

        <h2 className="text-lg font-semibold">Plans</h2>

        <div className="flex rounded-2xl border border-white/10 bg-[#0f172a] p-1">

          {["monthly", "yearly"].map((cycle) => (
            <button
              key={cycle}
              onClick={() => setBillingCycle(cycle)}
              className={`px-4 py-2 text-sm rounded-xl transition ${
                billingCycle === cycle
                  ? "bg-emerald-500 text-black font-medium"
                  : "text-slate-400 hover:text-white"
              }`}
            >
              {cycle}
            </button>
          ))}

        </div>

      </div>

      {/* PLAN CARDS */}
      <div className="grid md:grid-cols-3 gap-6">

        {plans.map((plan) => {
          const price =
            billingCycle === "monthly"
              ? plan.priceMonthly
              : plan.priceYearly;

          const isCurrent = currentPlan === plan.id;

          return (
            <div
              key={plan.id}
              className={`
                relative rounded-3xl border p-6
                bg-[#0f172a] border-white/10
                transition hover:scale-[1.02]
                ${plan.highlight ? "ring-2 ring-emerald-500/40" : ""}
              `}
            >

              {/* RECOMMENDED BADGE */}
              {plan.highlight && (
                <div className="absolute -top-3 left-4 bg-emerald-500 text-black text-xs px-3 py-1 rounded-full font-medium">
                  Recommended
                </div>
              )}

              <h3 className="text-xl font-semibold">{plan.name}</h3>

              <p className="mt-3 text-3xl font-bold">
                {price === 0 ? "Free" : `$${price}`}
                <span className="text-sm text-slate-400 font-normal">
                  /{billingCycle}
                </span>
              </p>

              {/* FEATURES */}
              <ul className="mt-5 space-y-2 text-sm text-slate-400">
                {plan.features.map((f, i) => (
                  <li key={i} className="flex items-center gap-2">
                    <Check size={14} className="text-emerald-400" />
                    {f}
                  </li>
                ))}
              </ul>

              {/* CTA */}
              <button
                onClick={() => handlePlanChange(plan.id)}
                disabled={loading || isCurrent}
                className={`
                  mt-6 w-full py-3 rounded-2xl text-sm font-medium transition
                  ${
                    isCurrent
                      ? "bg-white/10 text-slate-400 cursor-not-allowed"
                      : plan.highlight
                      ? "bg-emerald-500 text-black hover:opacity-90"
                      : "bg-white/5 text-white hover:bg-white/10"
                  }
                `}
              >
                {isCurrent
                  ? "Current Plan"
                  : loading
                  ? "Processing..."
                  : "Upgrade"}
              </button>

            </div>
          );
        })}

      </div>

      {/* PAYMENT + BILLING INFO */}
      <div className="grid md:grid-cols-2 gap-6">

        <div className="rounded-3xl border border-white/10 bg-[#0f172a] p-6">

          <div className="flex items-center gap-2 mb-3">
            <CreditCard size={16} className="text-slate-400" />
            <h2 className="font-semibold">Payment Method</h2>
          </div>

          <p className="text-sm text-slate-400">
            No payment method added yet
          </p>

          <button className="mt-4 w-full py-3 rounded-2xl bg-white/5 hover:bg-white/10 transition text-sm">
            Add Payment Method
          </button>

        </div>

        <div className="rounded-3xl border border-white/10 bg-[#0f172a] p-6">

          <h2 className="font-semibold mb-3">Billing History</h2>

          <p className="text-sm text-slate-400">
            No invoices yet
          </p>

        </div>

      </div>

    </div>
  );
};

export default BillingSettings;