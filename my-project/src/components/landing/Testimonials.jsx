

// import { useEffect, useState } from "react";
// import { motion, AnimatePresence } from "framer-motion";
// import { getTestimonials } from "../../services/testimonialService";

// const Testimonials = () => {
//   const [data, setData] = useState([]);
//   const [index, setIndex] = useState(0);

//   useEffect(() => {
//     let mounted = true;

//     const fetchData = async () => {
//       try {
//         const res = await getTestimonials();

//         if (mounted && Array.isArray(res) && res.length) {
//           setData(res);
//         } else {
//           throw new Error("No data");
//         }
//       } catch {
//         setData([
//           {
//             name: "David O.",
//             role: "Freelancer",
//             text: "SmartBudget gave me full visibility into my cash flow. I now save consistently every month.",
//             verified: true,
//             avatar: "https://i.pravatar.cc/150?img=12",
//             company: "Upwork",
//           },
//           {
//             name: "Sarah K.",
//             role: "Business Owner",
//             text: "The clean dashboard and spending insights helped me control business expenses faster than spreadsheets.",
//             verified: true,
//             avatar: "https://i.pravatar.cc/150?img=5",
//             company: "Shopify",
//           },
//           {
//             name: "John M.",
//             role: "Developer",
//             text: "Minimal interface, powerful reporting, and smooth performance. Exactly what I wanted.",
//             verified: true,
//             avatar: "https://i.pravatar.cc/150?img=32",
//             company: "GitHub",
//           },
//           {
//             name: "Grace A.",
//             role: "Consultant",
//             text: "I use it daily for planning budgets and tracking subscriptions. Brilliant experience.",
//             verified: true,
//             avatar: "https://i.pravatar.cc/150?img=20",
//             company: "Deloitte",
//           },
//           {
//             name: "Michael T.",
//             role: "Startup Founder",
//             text: "It feels like a premium fintech product. Smart alerts saved us from unnecessary spending.",
//             verified: true,
//             avatar: "https://i.pravatar.cc/150?img=15",
//             company: "Stripe",
//           },
//           {
//             name: "Ada N.",
//             role: "Product Manager",
//             text: "Beautiful UI, reliable analytics, and smooth onboarding. Highly recommended.",
//             verified: true,
//             avatar: "https://i.pravatar.cc/150?img=25",
//             company: "Notion",
//           },
//         ]);
//       }
//     };

//     fetchData();

//     return () => {
//       mounted = false;
//     };
//   }, []);

//   // Auto rotate
//   useEffect(() => {
//     if (!data.length) return;

//     const interval = setInterval(() => {
//       setIndex((prev) => (prev + 1) % data.length);
//     }, 5000);

//     return () => clearInterval(interval);
//   }, [data]);

//   const current = data[index];

//   return (
//     <section
//       id="testimonials"
//       className="relative py-28 overflow-hidden bg-white dark:bg-gray-950"
//     >
//       {/* Background Glow */}
//       <div className="absolute inset-0 -z-10">
//         <div className="absolute top-[-220px] left-1/2 -translate-x-1/2 w-[900px] h-[900px] rounded-full bg-gradient-to-r from-indigo-500/10 via-violet-500/10 to-cyan-500/10 blur-3xl" />
//       </div>

//       <div className="max-w-6xl mx-auto px-4">
//         {/* Header */}
//         <motion.div
//           initial={{ opacity: 0, y: 35 }}
//           whileInView={{ opacity: 1, y: 0 }}
//           viewport={{ once: true }}
//           transition={{ duration: 0.55 }}
//           className="text-center max-w-3xl mx-auto"
//         >
//           <div className="inline-flex items-center gap-2 px-4 py-1.5 rounded-full border border-indigo-100 dark:border-indigo-500/20 bg-indigo-50 dark:bg-indigo-500/10 text-xs font-medium text-indigo-600 dark:text-indigo-300">
//             Trusted Worldwide
//           </div>

//           <h2 className="mt-5 text-3xl md:text-5xl font-bold tracking-tight text-gray-900 dark:text-white">
//             The Finance Platform 
//             <span className="block bg-gradient-to-r from-indigo-600 via-violet-600 to-cyan-500 bg-clip-text text-transparent">
//               Users Trust Daily
//             </span>
//           </h2>

//           <p className="mt-4 text-gray-600 dark:text-gray-400 md:text-lg">
//             Real people using SmartBudget to save more, spend smarter, and gain
//             financial clarity.
//           </p>
//         </motion.div>

//         {/* Main Card */}
//         <div className="mt-16 relative">
//           <div className="absolute inset-0 blur-3xl bg-gradient-to-r from-indigo-500/10 via-violet-500/10 to-cyan-500/10 rounded-[40px]" />

//           <div className="relative max-w-4xl mx-auto">
//             <AnimatePresence mode="wait">
//               {current && (
//                 <motion.div
//                   key={index}
//                   initial={{ opacity: 0, y: 30, scale: 0.96 }}
//                   animate={{ opacity: 1, y: 0, scale: 1 }}
//                   exit={{ opacity: 0, y: -20, scale: 0.96 }}
//                   transition={{ duration: 0.45 }}
//                   className="rounded-3xl border border-gray-200/70 dark:border-gray-800 bg-white/90 dark:bg-gray-900/90 backdrop-blur-xl shadow-2xl p-8 md:p-10"
//                 >
//                   {/* Quote Icon */}
//                   <div className="mb-6 text-5xl leading-none text-indigo-500/30">
//                     "
//                   </div>

//                   {/* Testimonial */}
//                   <p className="text-lg md:text-2xl leading-relaxed font-medium text-gray-900 dark:text-white">
//                     {current.text}
//                   </p>

//                   {/* Footer */}
//                   <div className="mt-8 flex flex-col sm:flex-row sm:items-center sm:justify-between gap-5">
//                     <div className="flex items-center gap-4">
//                       <img
//                         src={current.avatar}
//                         alt={current.name}
//                         className="w-14 h-14 rounded-2xl object-cover ring-2 ring-indigo-100 dark:ring-indigo-500/20"
//                       />

//                       <div>
//                         <div className="flex items-center gap-2">
//                           <h4 className="font-semibold text-gray-900 dark:text-white">
//                             {current.name}
//                           </h4>

//                           {current.verified && (
//                             <span className="text-xs px-2 py-1 rounded-full bg-emerald-100 text-emerald-700 dark:bg-emerald-500/10 dark:text-emerald-300">
//                               Verified
//                             </span>
//                           )}
//                         </div>

//                         <p className="text-sm text-gray-500 dark:text-gray-400">
//                           {current.role} • {current.company}
//                         </p>
//                       </div>
//                     </div>

//                     {/* Rating */}
//                     <div className="flex gap-1 text-yellow-400 text-lg">
//                       ★★★★★
//                     </div>
//                   </div>
//                 </motion.div>
//               )}
//             </AnimatePresence>
//           </div>
//         </div>

//         {/* Indicators */}
//         <div className="mt-10 flex justify-center gap-3 flex-wrap">
//           {data.map((item, i) => (
//             <button
//               key={i}
//               onClick={() => setIndex(i)}
//               className="group"
//               aria-label={item.name}
//             >
//               <div
//                 className={`transition-all duration-300 rounded-full ${
//                   i === index
//                     ? "w-10 h-2 bg-gradient-to-r from-indigo-600 to-violet-600"
//                     : "w-2 h-2 bg-gray-300 dark:bg-gray-700 group-hover:bg-gray-400"
//                 }`}
//               />
//             </button>
//           ))}
//         </div>

//         {/* Bottom Stats */}
//         <motion.div
//           initial={{ opacity: 0, y: 25 }}
//           whileInView={{ opacity: 1, y: 0 }}
//           viewport={{ once: true }}
//           transition={{ delay: 0.15 }}
//           className="grid grid-cols-2 md:grid-cols-4 gap-4 mt-16"
//         >
//           {[
//             ["12k+", "Happy Users"],
//             ["₦50M+", "Money Managed"],
//             ["4.9/5", "Average Rating"],
//             ["99.9%", "Uptime"],
//           ].map(([value, label], i) => (
//             <div
//               key={i}
//               className="rounded-2xl border border-gray-200 dark:border-gray-800 bg-white dark:bg-gray-900 p-5 text-center"
//             >
//               <p className="text-2xl font-bold text-gray-900 dark:text-white">
//                 {value}
//               </p>
//               <p className="mt-1 text-sm text-gray-500 dark:text-gray-400">
//                 {label}
//               </p>
//             </div>
//           ))}
//         </motion.div>
//       </div>
//     </section>
//   );
// };

// export default Testimonials;



import { useState } from "react";
import { motion, AnimatePresence } from "framer-motion";
import {
  ShieldCheck,
  CheckCircle2,
  ArrowRight,
  Sparkles,
  TrendingUp,
} from "lucide-react";

/* =========================
   DATA
========================= */
const testimonials = [
  {
    id: 1,
    name: "David O.",
    role: "Independent Consultant",
    company: "Upwork",
    statement:
      "SmartBudget gives structured visibility into monthly cashflow. Everything is now intentional and traceable.",
    impact: "Savings discipline improved by 38%",
  },
  {
    id: 2,
    name: "Sarah K.",
    role: "E-commerce Founder",
    company: "Shopify Merchant",
    statement:
      "Expense governance became proactive. We now detect financial leaks before they scale.",
    impact: "Overspending reduced by 42%",
  },
  {
    id: 3,
    name: "John M.",
    role: "Software Engineer",
    company: "GitHub",
    statement:
      "The system feels engineered like infrastructure, not a budgeting app.",
    impact: "Stable monthly savings achieved",
  },
  {
    id: 4,
    name: "Grace A.",
    role: "Financial Consultant",
    company: "Deloitte",
    statement:
      "Reporting clarity is enterprise-grade. It matches institutional financial tools.",
    impact: "Reporting accuracy +64%",
  },
  {
    id: 5,
    name: "Michael T.",
    role: "Startup Founder",
    company: "Stripe Ecosystem",
    statement:
      "We use SmartBudget for internal financial governance across teams.",
    impact: "Burn rate reduced significantly",
  },
  {
    id: 6,
    name: "Ada N.",
    role: "Product Manager",
    company: "Notion",
    statement:
      "Forecasting became reliable. Financial planning is now structured and predictable.",
    impact: "Forecast accuracy improved",
  },
];

/* =========================
   CARD
========================= */
const Card = ({ item }) => {
  return (
    <motion.div
      initial={{ opacity: 0, y: 18 }}
      whileInView={{ opacity: 1, y: 0 }}
      viewport={{ once: true }}
      transition={{ duration: 0.4 }}
      className="
        relative
        rounded-2xl
        border border-slate-200
        bg-white
        p-6
        hover:shadow-lg
        transition
      "
    >
      {/* header */}
      <div className="flex items-start justify-between">
        <div>
          <h3 className="text-sm font-semibold text-slate-900">
            {item.name}
          </h3>
          <p className="text-xs text-slate-500">
            {item.role} · {item.company}
          </p>
        </div>

        <CheckCircle2 size={16} className="text-emerald-500" />
      </div>

      {/* statement */}
      <p className="mt-5 text-sm leading-6 text-slate-600">
        {item.statement}
      </p>

      {/* impact */}
      <div className="mt-6 flex items-center justify-between border-t pt-4">
        <span className="text-xs text-slate-500">
          Financial impact
        </span>

        <span className="text-xs font-semibold text-slate-900">
          {item.impact}
        </span>
      </div>
    </motion.div>
  );
};

/* =========================
   SECTION
========================= */
const Testimonials = () => {
  const [visibleCount, setVisibleCount] = useState(3);

  const visible = testimonials.slice(0, visibleCount);

  const loadMore = () => {
    setVisibleCount((prev) =>
      Math.min(prev + 3, testimonials.length)
    );
  };

  const canLoadMore = visibleCount < testimonials.length;

  return (
    <section className="py-28 bg-slate-50">
      <div className="max-w-7xl mx-auto px-6">

        {/* HEADER */}
        <div className="max-w-3xl">
          <div className="inline-flex items-center gap-2 px-3 py-1 rounded-full border bg-white text-xs font-medium text-slate-600">
            <ShieldCheck size={14} />
            Verified Financial Outcomes
          </div>

          <h2 className="mt-6 text-4xl font-semibold tracking-tight text-slate-900">
            Real users,
            <br />
            real financial control
          </h2>

          <p className="mt-4 text-slate-600">
            SmartBudget is used for structured financial
            planning, disciplined spending, and operational
            cashflow visibility.
          </p>
        </div>

        {/* GRID */}
        <motion.div
          layout
          className="mt-14 grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-6"
        >
          <AnimatePresence>
            {visible.map((item) => (
              <motion.div
                key={item.id}
                layout
                initial={{ opacity: 0, scale: 0.98 }}
                animate={{ opacity: 1, scale: 1 }}
                exit={{ opacity: 0 }}
              >
                <Card item={item} />
              </motion.div>
            ))}
          </AnimatePresence>
        </motion.div>

        {/* LOAD MORE */}
        {canLoadMore && (
          <div className="mt-12 flex justify-center">
            <button
              onClick={loadMore}
              className="
                flex items-center gap-2
                px-6 py-3
                rounded-xl
                border
                bg-white
                hover:bg-slate-100
                transition
                text-sm font-medium
                text-slate-700
              "
            >
              Load more testimonials
              <ArrowRight size={16} />
            </button>
          </div>
        )}
      </div>
    </section>
  );
};

export default Testimonials;