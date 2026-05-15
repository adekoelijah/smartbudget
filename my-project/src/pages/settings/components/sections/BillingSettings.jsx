


// import { useState } from "react";
// import { Check, Sparkles, CreditCard } from "lucide-react";

// const plans = [
//   {
//     id: "starter",
//     name: "Starter",
//     priceMonthly: 0,
//     priceYearly: 0,
//     features: ["Basic tracking", "Limited reports"],
//     highlight: false,
//   },
//   {
//     id: "pro",
//     name: "Pro",
//     priceMonthly: 10,
//     priceYearly: 100,
//     features: ["Advanced analytics", "AI insights", "Unlimited budgets"],
//     highlight: true,
//   },
//   {
//     id: "business",
//     name: "Business",
//     priceMonthly: 25,
//     priceYearly: 250,
//     features: ["Team access", "Priority support", "Advanced reports"],
//     highlight: false,
//   },
// ];

// const BillingSettings = () => {
//   const [billingCycle, setBillingCycle] = useState("monthly");
//   const [currentPlan, setCurrentPlan] = useState("starter");
//   const [loading, setLoading] = useState(false);

//   const handlePlanChange = async (planId) => {
//     if (planId === currentPlan) return;

//     try {
//       setLoading(true);
//       window.location.assign("/checkout");
//       setCurrentPlan(planId);
//     } finally {
//       setLoading(false);
//     }
//   };

//   return (
//     <div className="space-y-8 text-white">

//       {/* CURRENT PLAN */}
//       <div className="rounded-3xl border border-white/10 bg-[#0f172a] p-6">

//         <div className="flex items-center justify-between">

//           <div>
//             <h2 className="text-lg font-semibold">Current Plan</h2>
//             <p className="text-sm text-slate-400 mt-1">
//               You are on the{" "}
//               <span className="text-white font-medium capitalize">
//                 {currentPlan}
//               </span>{" "}
//               plan
//             </p>
//           </div>

//           <div className="flex items-center gap-2 text-emerald-400 text-sm">
//             <Sparkles size={16} />
//             Active
//           </div>

//         </div>

//       </div>

//       {/* BILLING TOGGLE */}
//       <div className="flex items-center justify-between">

//         <h2 className="text-lg font-semibold">Plans</h2>

//         <div className="flex rounded-2xl border border-white/10 bg-[#0f172a] p-1">

//           {["monthly", "yearly"].map((cycle) => (
//             <button
//               key={cycle}
//               onClick={() => setBillingCycle(cycle)}
//               className={`px-4 py-2 text-sm rounded-xl transition ${
//                 billingCycle === cycle
//                   ? "bg-emerald-500 text-black font-medium"
//                   : "text-slate-400 hover:text-white"
//               }`}
//             >
//               {cycle}
//             </button>
//           ))}

//         </div>

//       </div>

//       {/* PLAN CARDS */}
//       <div className="grid md:grid-cols-3 gap-6">

//         {plans.map((plan) => {
//           const price =
//             billingCycle === "monthly"
//               ? plan.priceMonthly
//               : plan.priceYearly;

//           const isCurrent = currentPlan === plan.id;

//           return (
//             <div
//               key={plan.id}
//               className={`
//                 relative rounded-3xl border p-6
//                 bg-[#0f172a] border-white/10
//                 transition hover:scale-[1.02]
//                 ${plan.highlight ? "ring-2 ring-emerald-500/40" : ""}
//               `}
//             >

//               {/* RECOMMENDED BADGE */}
//               {plan.highlight && (
//                 <div className="absolute -top-3 left-4 bg-emerald-500 text-black text-xs px-3 py-1 rounded-full font-medium">
//                   Recommended
//                 </div>
//               )}

//               <h3 className="text-xl font-semibold">{plan.name}</h3>

//               <p className="mt-3 text-3xl font-bold">
//                 {price === 0 ? "Free" : `$${price}`}
//                 <span className="text-sm text-slate-400 font-normal">
//                   /{billingCycle}
//                 </span>
//               </p>

//               {/* FEATURES */}
//               <ul className="mt-5 space-y-2 text-sm text-slate-400">
//                 {plan.features.map((f, i) => (
//                   <li key={i} className="flex items-center gap-2">
//                     <Check size={14} className="text-emerald-400" />
//                     {f}
//                   </li>
//                 ))}
//               </ul>

//               {/* CTA */}
//               <button
//                 onClick={() => handlePlanChange(plan.id)}
//                 disabled={loading || isCurrent}
//                 className={`
//                   mt-6 w-full py-3 rounded-2xl text-sm font-medium transition
//                   ${
//                     isCurrent
//                       ? "bg-white/10 text-slate-400 cursor-not-allowed"
//                       : plan.highlight
//                       ? "bg-emerald-500 text-black hover:opacity-90"
//                       : "bg-white/5 text-white hover:bg-white/10"
//                   }
//                 `}
//               >
//                 {isCurrent
//                   ? "Current Plan"
//                   : loading
//                   ? "Processing..."
//                   : "Upgrade"}
//               </button>

//             </div>
//           );
//         })}

//       </div>

//       {/* PAYMENT + BILLING INFO */}
//       <div className="grid md:grid-cols-2 gap-6">

//         <div className="rounded-3xl border border-white/10 bg-[#0f172a] p-6">

//           <div className="flex items-center gap-2 mb-3">
//             <CreditCard size={16} className="text-slate-400" />
//             <h2 className="font-semibold">Payment Method</h2>
//           </div>

//           <p className="text-sm text-slate-400">
//             No payment method added yet
//           </p>

//           <button className="mt-4 w-full py-3 rounded-2xl bg-white/5 hover:bg-white/10 transition text-sm">
//             Add Payment Method
//           </button>

//         </div>

//         <div className="rounded-3xl border border-white/10 bg-[#0f172a] p-6">

//           <h2 className="font-semibold mb-3">Billing History</h2>

//           <p className="text-sm text-slate-400">
//             No invoices yet
//           </p>

//         </div>

//       </div>

//     </div>
//   );
// };

// export default BillingSettings;


import { useMemo, useState } from "react";
import {
  Check,
  Sparkles,
  CreditCard,
  ShieldCheck,
  Receipt,
} from "lucide-react";

import { usePreferences } from "../../hooks/usePreferences";

/* =========================================
   TRANSLATIONS
========================================= */
const translations = {
  en: {
    currentPlan: "Current Plan",
    active: "Active",
    plans: "Plans",
    monthly: "monthly",
    yearly: "yearly",
    recommended: "Recommended",
    free: "Free",
    currentPlanBtn: "Current Plan",
    processing: "Processing...",
    upgrade: "Upgrade",
    paymentMethod: "Payment Method",
    addPaymentMethod: "Add Payment Method",
    noPaymentMethod: "No payment method added yet",
    billingHistory: "Billing History",
    noInvoices: "No invoices yet",
    starter: "Starter",
    pro: "Premium",
    business: "Business",
    starterDesc: "Basic budgeting & expense tracking",
    proDesc: "Advanced fintech analytics & automation",
    businessDesc: "Enterprise-grade finance management",
    securePayments: "Secure bank-grade billing",
    yearlyDiscount: "Save more yearly",
  },

  yo: {
    currentPlan: "Ètò Tó Wà Lọ́wọ́",
    active: "Ń Ṣiṣẹ́",
    plans: "Àwọn Ètò",
    monthly: "oṣooṣu",
    yearly: "lọ́dọọdún",
    recommended: "A Ṣeduro",
    free: "Ọfẹ",
    currentPlanBtn: "Ètò Tó Wà",
    processing: "Ń Ṣiṣẹ́...",
    upgrade: "Ṣe Igbesoke",
    paymentMethod: "Ọ̀nà Ìsanwó",
    addPaymentMethod: "Fi Ọ̀nà Ìsanwó Kún",
    noPaymentMethod: "Kò sí ọ̀nà ìsanwó tí a fi kún",
    billingHistory: "Ìtàn Ìsanwó",
    noInvoices: "Kò sí invoice kankan",
    starter: "Básíkì",
    pro: "Pírémíọ́mù",
    business: "Iṣòwò",
    starterDesc: "Ìṣàkóso inawo ipilẹ",
    proDesc: "Ìtúpalẹ̀ fintech tó gíga",
    businessDesc: "Ìṣàkóso owó ipele ilé-ifowopamọ",
    securePayments: "Ìsanwó tó ni aabo bi banki",
    yearlyDiscount: "Fipamọ diẹ sii lọ́dọọdún",
  },
};

/* =========================================
   COMPONENT
========================================= */
const BillingSettings = () => {
  const { prefs } = usePreferences();

  const language = prefs?.language || "en";
  const currency = prefs?.currency || "NGN";

  const t = translations[language];

  const [billingCycle, setBillingCycle] =
    useState("monthly");

  const [currentPlan, setCurrentPlan] =
    useState("starter");

  const [loading, setLoading] = useState(false);

  /* =========================================
     FINTECH PLAN CONFIG
  ========================================= */
  const plans = useMemo(
    () => [
      {
        id: "starter",
        name: t.starter,
        description: t.starterDesc,
        priceMonthly: 0,
        priceYearly: 0,
        highlight: false,

        features: [
          "Budget tracking",
          "Expense monitoring",
          "Basic reports",
        ],
      },

      {
        id: "pro",
        name: t.pro,
        description: t.proDesc,
        priceMonthly: 1000,
        priceYearly: 10000,
        highlight: true,

        features: [
          "AI financial insights",
          "Unlimited budgets",
          "Advanced analytics",
          "Priority notifications",
        ],
      },

      {
        id: "business",
        name: t.business,
        description: t.businessDesc,
        priceMonthly: 2000,
        priceYearly: 20000,
        highlight: false,

        features: [
          "Team collaboration",
          "Bank-grade reports",
          "Priority support",
          "Enterprise analytics",
        ],
      },
    ],
    [t]
  );

  /* =========================================
     CURRENCY FORMATTER
  ========================================= */
  const formatPrice = (amount) => {
    if (amount === 0) return t.free;

    return new Intl.NumberFormat(
      language === "yo" ? "yo-NG" : "en-NG",
      {
        style: "currency",
        currency,
        maximumFractionDigits: 0,
      }
    ).format(amount);
  };

  /* =========================================
     PLAN SWITCH
  ========================================= */
  const handlePlanChange = async (planId) => {
    if (planId === currentPlan) return;

    try {
      setLoading(true);

      /**
       * TODO:
       * Replace with:
       * - Paystack
       * - Flutterwave
       * - Stripe
       * Checkout Flow
       */

      setTimeout(() => {
        setCurrentPlan(planId);
        window.location.assign("/checkout");
      }, 800);
    } finally {
      setLoading(false);
    }
  };

  return (
    <div className="space-y-8 text-white">

      {/* CURRENT PLAN */}
      <div
        className="
          rounded-3xl
          border border-white/10
          bg-[#0f172a]
          p-6
          shadow-xl
        "
      >
        <div className="flex items-center justify-between">

          <div>
            <h2 className="text-lg font-semibold">
              {t.currentPlan}
            </h2>

            <p className="mt-1 text-sm text-slate-400">
              {language === "yo"
                ? "O wa lori eto"
                : "You are currently on the"}{" "}

              <span className="font-semibold text-white capitalize">
                {currentPlan}
              </span>
            </p>
          </div>

          <div
            className="
              flex items-center gap-2
              rounded-full
              border border-emerald-500/20
              bg-emerald-500/10
              px-3 py-2
              text-sm text-emerald-400
            "
          >
            <Sparkles size={16} />
            {t.active}
          </div>

        </div>
      </div>

      {/* BILLING TOGGLE */}
      <div className="flex items-center justify-between">

        <div>
          <h2 className="text-xl font-semibold">
            {t.plans}
          </h2>

          <p className="mt-1 text-sm text-slate-400">
            {t.securePayments}
          </p>
        </div>

        <div
          className="
            flex items-center
            rounded-2xl
            border border-white/10
            bg-[#0f172a]
            p-1
          "
        >
          {["monthly", "yearly"].map((cycle) => (
            <button
              key={cycle}
              onClick={() =>
                setBillingCycle(cycle)
              }
              className={`
                px-4 py-2 rounded-xl text-sm transition-all
                ${
                  billingCycle === cycle
                    ? "bg-emerald-500 text-black font-semibold"
                    : "text-slate-400 hover:text-white"
                }
              `}
            >
              {cycle === "monthly"
                ? t.monthly
                : t.yearly}
            </button>
          ))}
        </div>

      </div>

      {/* PLANS */}
      <div className="grid gap-6 lg:grid-cols-3">

        {plans.map((plan) => {
          const isCurrent =
            currentPlan === plan.id;

          const price =
            billingCycle === "monthly"
              ? plan.priceMonthly
              : plan.priceYearly;

          return (
            <div
              key={plan.id}
              className={`
                relative overflow-hidden
                rounded-3xl
                border border-white/10
                bg-[#0f172a]
                p-6
                transition-all duration-300
                hover:-translate-y-1
                hover:border-emerald-500/30
                hover:shadow-2xl
                ${
                  plan.highlight
                    ? "ring-2 ring-emerald-500/30"
                    : ""
                }
              `}
            >

              {/* BADGE */}
              {plan.highlight && (
                <div
                  className="
                    absolute left-5 top-5
                    rounded-full
                    bg-emerald-500
                    px-3 py-1
                    text-xs font-semibold
                    text-black
                  "
                >
                  {t.recommended}
                </div>
              )}

              <div className="pt-8">

                <h3 className="text-2xl font-bold">
                  {plan.name}
                </h3>

                <p className="mt-2 text-sm text-slate-400">
                  {plan.description}
                </p>

                <div className="mt-6">
                  <h2 className="text-4xl font-bold tracking-tight">
                    {formatPrice(price)}
                  </h2>

                  <p className="mt-1 text-sm text-slate-400">
                    /{billingCycle === "monthly"
                      ? t.monthly
                      : t.yearly}
                  </p>
                </div>

                {/* FEATURES */}
                <ul className="mt-6 space-y-3">
                  {plan.features.map(
                    (feature, index) => (
                      <li
                        key={index}
                        className="
                          flex items-start gap-3
                          text-sm text-slate-300
                        "
                      >
                        <Check
                          size={16}
                          className="
                            mt-0.5
                            text-emerald-400
                          "
                        />

                        <span>{feature}</span>
                      </li>
                    )
                  )}
                </ul>

                {/* CTA */}
                <button
                  onClick={() =>
                    handlePlanChange(plan.id)
                  }
                  disabled={loading || isCurrent}
                  className={`
                    mt-8
                    w-full
                    rounded-2xl
                    py-3
                    text-sm
                    font-semibold
                    transition-all
                    ${
                      isCurrent
                        ? `
                          cursor-not-allowed
                          bg-white/10
                          text-slate-500
                        `
                        : plan.highlight
                        ? `
                          bg-emerald-500
                          text-black
                          hover:opacity-90
                        `
                        : `
                          bg-white/5
                          text-white
                          hover:bg-white/10
                        `
                    }
                  `}
                >
                  {isCurrent
                    ? t.currentPlanBtn
                    : loading
                    ? t.processing
                    : t.upgrade}
                </button>

              </div>
            </div>
          );
        })}

      </div>

      {/* PAYMENT + HISTORY */}
      <div className="grid gap-6 md:grid-cols-2">

        {/* PAYMENT */}
        <div
          className="
            rounded-3xl
            border border-white/10
            bg-[#0f172a]
            p-6
          "
        >
          <div className="mb-5 flex items-center gap-3">

            <div
              className="
                rounded-xl
                bg-white/5
                p-3
              "
            >
              <CreditCard
                size={18}
                className="text-slate-300"
              />
            </div>

            <div>
              <h2 className="font-semibold">
                {t.paymentMethod}
              </h2>

              <p className="text-sm text-slate-400">
                {t.securePayments}
              </p>
            </div>

          </div>

          <div
            className="
              rounded-2xl
              border border-dashed border-white/10
              bg-white/[0.02]
              p-5
            "
          >
            <p className="text-sm text-slate-400">
              {t.noPaymentMethod}
            </p>

            <button
              className="
                mt-5
                w-full
                rounded-2xl
                bg-white/5
                py-3
                text-sm font-medium
                transition
                hover:bg-white/10
              "
            >
              {t.addPaymentMethod}
            </button>
          </div>

        </div>

        {/* BILLING HISTORY */}
        <div
          className="
            rounded-3xl
            border border-white/10
            bg-[#0f172a]
            p-6
          "
        >
          <div className="mb-5 flex items-center gap-3">

            <div
              className="
                rounded-xl
                bg-white/5
                p-3
              "
            >
              <Receipt
                size={18}
                className="text-slate-300"
              />
            </div>

            <div>
              <h2 className="font-semibold">
                {t.billingHistory}
              </h2>

              <p className="text-sm text-slate-400">
                Transaction invoices & receipts
              </p>
            </div>

          </div>

          <div
            className="
              flex min-h-[140px]
              items-center justify-center
              rounded-2xl
              border border-dashed border-white/10
              bg-white/[0.02]
            "
          >
            <div className="text-center">

              <ShieldCheck
                size={26}
                className="
                  mx-auto mb-3
                  text-emerald-400
                "
              />

              <p className="text-sm text-slate-400">
                {t.noInvoices}
              </p>

            </div>
          </div>

        </div>

      </div>

    </div>
  );
};

export default BillingSettings;