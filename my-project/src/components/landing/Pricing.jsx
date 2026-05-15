// import { createCheckoutSession } from "../../services/billingService";

// const plans = [
//   {
//     name: "Free",
//     price: "₦0",
//     plan: "free",
//     features: ["Basic tracking", "Limited insights"],
//   },
//   {
//     name: "Pro",
//     price: "₦5,000/mo",
//     plan: "pro",
//     features: ["Unlimited tracking", "AI insights", "Reports"],
//   },
// ];

// const Pricing = () => {
//   const handleCheckout = async (plan) => {
//     try {
//       const { url } = await createCheckoutSession(plan);
//        window.location.assign(url);
//     } catch {
//       alert("Payment failed");
//     }
//   };

//   return (
//     <section className="py-20">
//       <div className="max-w-5xl mx-auto px-4 text-center">

//         <h2 className="text-2xl font-bold text-gray-900 dark:text-white">
//           Simple Pricing
//         </h2>

//         <div className="mt-10 grid md:grid-cols-2 gap-6">
//           {plans.map((p, i) => (
//             <div key={i} className="p-6 border dark:border-gray-800 rounded-2xl">
//               <h3 className="text-lg font-semibold">{p.name}</h3>
//               <p className="text-2xl font-bold mt-2">{p.price}</p>

//               <ul className="mt-4 text-sm text-gray-500 space-y-2">
//                 {p.features.map((f, idx) => (
//                   <li key={idx}>✔ {f}</li>
//                 ))}
//               </ul>

//               <button
//                 onClick={() => handleCheckout(p.plan)}
//                 className="mt-6 w-full py-2 rounded-lg bg-black text-white"
//               >
//                 Choose Plan
//               </button>
//             </div>
//           ))}
//         </div>

//       </div>
//     </section>
//   );
// };

// export default Pricing;



import { createCheckoutSession } from "../../services/billingService";
import { motion } from "framer-motion";

const plans = [
  {
    name: "Basic Access",
    subtitle: "Personal financial tracking layer",
    price: "₦0",
    plan: "free",
    description:
      "Core budgeting system for individual expense visibility and manual tracking.",
    features: [
      "Expense tracking system",
      "Basic financial reports",
      "Manual budget control",
      "Single account access",
    ],
    type: "entry",
  },
  {
    name: "Financial Control Pro",
    subtitle: "Automated financial intelligence layer",
    price: "₦5,000 / month",
    plan: "pro",
    description:
      "Advanced automation layer with insights, analytics, and structured financial intelligence.",
    features: [
      "Real-time transaction tracking",
      "AI-powered financial insights",
      "Advanced reporting engine",
      "Automated budget enforcement",
      "Multi-account linking",
    ],
    type: "core",
  },
];

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
    <section className="relative py-28 bg-white overflow-hidden">

      {/* =========================
         BACKGROUND SYSTEM LAYER
      ========================= */}
      <div className="absolute inset-0 -z-10">
        <div className="absolute inset-0 bg-[linear-gradient(to_right,#0f172a05_1px,transparent_1px),linear-gradient(to_bottom,#0f172a05_1px,transparent_1px)] bg-[size:80px_80px]" />
      </div>

      <div className="max-w-6xl mx-auto px-4">

        {/* =========================
           HEADER (CLARITY-FIRST)
        ========================= */}
        <div className="text-center max-w-3xl mx-auto">
          <h2 className="text-[42px] font-semibold tracking-tight text-slate-950">
            Financial access tiers
            <br />
            built for structured control
          </h2>

          <p className="mt-5 text-slate-600 text-[15px] leading-7">
            SmartBudget operates on a layered financial system.
            Each tier defines the level of control, automation, and
            intelligence available to the user.
          </p>
        </div>

        {/* =========================
           PRICING GRID (2 COL ONLY)
        ========================= */}
        <div className="mt-16 grid grid-cols-1 md:grid-cols-2 gap-8">

          {plans.map((plan, i) => (
            <motion.div
              key={i}
              initial={{ opacity: 0, y: 20 }}
              whileInView={{ opacity: 1, y: 0 }}
              viewport={{ once: true, amount: 0.3 }}
              transition={{ duration: 0.45 }}
              className={`
                relative rounded-2xl border p-8
                transition
                ${
                  plan.type === "core"
                    ? "border-slate-900 shadow-xl"
                    : "border-slate-200"
                }
              `}
            >

              {/* PLAN LABEL */}
              <div className="flex items-center justify-between">
                <div>
                  <h3 className="text-[18px] font-semibold text-slate-950">
                    {plan.name}
                  </h3>

                  <p className="text-sm text-slate-500 mt-1">
                    {plan.subtitle}
                  </p>
                </div>

                {plan.type === "core" && (
                  <span className="text-[11px] px-3 py-1 rounded-full bg-slate-900 text-white">
                    Recommended
                  </span>
                )}
              </div>

              {/* PRICE */}
              <div className="mt-6">
                <p className="text-[34px] font-semibold tracking-tight text-slate-950">
                  {plan.price}
                </p>

                <p className="text-xs text-slate-500 mt-1">
                  Transparent billing • Cancel anytime
                </p>
              </div>

              {/* DESCRIPTION */}
              <p className="mt-5 text-sm text-slate-600 leading-6">
                {plan.description}
              </p>

              {/* FEATURES */}
              <div className="mt-6 space-y-3">
                {plan.features.map((f, idx) => (
                  <div
                    key={idx}
                    className="flex items-start gap-2 text-sm text-slate-600"
                  >
                    <span className="mt-1 h-1.5 w-1.5 rounded-full bg-slate-900" />
                    <span>{f}</span>
                  </div>
                ))}
              </div>

              {/* CTA */}
              <button
                onClick={() => handleCheckout(plan.plan)}
                className={`
                  mt-8 w-full py-3 rounded-xl text-sm font-medium transition
                  ${
                    plan.type === "core"
                      ? "bg-slate-900 text-white hover:bg-slate-800"
                      : "bg-white border border-slate-200 text-slate-900 hover:border-slate-400"
                  }
                `}
              >
                {plan.type === "core"
                  ? "Activate Financial Control"
                  : "Start Basic Access"}
              </button>
            </motion.div>
          ))}
        </div>

        {/* =========================
           TRUST DISCLAIMER
        ========================= */}
        <div className="mt-14 text-center text-xs text-slate-500">
          All transactions are processed securely. SmartBudget does not act as a bank or financial institution.
        </div>

      </div>
    </section>
  );
};

export default Pricing;