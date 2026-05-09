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

//         if (mounted) setData(res);
//       } catch {
//         setData([
//           {
//             name: "David O.",
//             role: "Freelancer",
//             text: "This tool completely changed my financial habits.",
//             verified: true,
//             avatar: "https://i.pravatar.cc/150?img=12",
//             company: "Upwork",
//           },
//           {
//             name: "Sarah K.",
//             role: "Business Owner",
//             text: "Clean UI and powerful insights. I love it.",
//             verified: true,
//             avatar: "https://i.pravatar.cc/150?img=5",
//             company: "Shopify",
//           },
//           {
//             name: "John M.",
//             role: "Developer",
//             text: "Best budgeting tool I've ever used.",
//             verified: false,
//             avatar: "https://i.pravatar.cc/150?img=32",
//             company: "GitHub",
//           },
//         ]);
//       }
//     };

//     fetchData();

//     return () => {
//       mounted = false;
//     };
//   }, []);

//   // ⏱ Auto-rotate
//   useEffect(() => {
//     if (!data.length) return;

//     const interval = setInterval(() => {
//       setIndex((prev) => (prev + 1) % data.length);
//     }, 5000);

//     return () => clearInterval(interval);
//   }, [data]);

//   const current = data[index];

//   return (
//     <section className="py-24 bg-gray-50 dark:bg-gray-900">
//       <div className="max-w-5xl mx-auto px-4 text-center">

//         {/* HEADER */}
//         <h2 className="text-2xl md:text-4xl font-bold text-gray-900 dark:text-white">
//           Loved by real users worldwide
//         </h2>

//         <p className="mt-3 text-gray-500">
//           Real feedback from people using SmartBudget daily
//         </p>

//         {/* CAROUSEL */}
//         <div className="mt-10 relative h-[260px] flex items-center justify-center">

//           <AnimatePresence mode="wait">
//             {current && (
//               <motion.div
//                 key={index}
//                 initial={{ opacity: 0, x: 40 }}
//                 animate={{ opacity: 1, x: 0 }}
//                 exit={{ opacity: 0, x: -40 }}
//                 transition={{ duration: 0.4 }}
//                 className="w-full max-w-xl p-6 bg-white dark:bg-gray-800 rounded-2xl shadow-lg"
//               >

//                 {/* AVATAR + INFO */}
//                 <div className="flex items-center gap-4">
//                   <img
//                     src={current.avatar}
//                     alt={current.name}
//                     className="w-12 h-12 rounded-full"
//                   />

//                   <div className="text-left">
//                     <div className="flex items-center gap-2">
//                       <h4 className="font-semibold">{current.name}</h4>

//                       {current.verified && (
//                         <span className="text-blue-500 text-xs">
//                           ✔ Verified
//                         </span>
//                       )}
//                     </div>

//                     <p className="text-xs text-gray-500">
//                       {current.role} • {current.company}
//                     </p>
//                   </div>
//                 </div>

//                 {/* TEXT */}
//                 <p className="mt-4 text-gray-600 dark:text-gray-300 text-sm text-left">
//                   “{current.text}”
//                 </p>

//               </motion.div>
//             )}
//           </AnimatePresence>
//         </div>

//         {/* DOT INDICATORS */}
//         <div className="flex justify-center gap-2 mt-6">
//           {data.map((_, i) => (
//             <button
//               key={i}
//               onClick={() => setIndex(i)}
//               className={`w-2 h-2 rounded-full transition ${
//                 i === index ? "bg-black dark:bg-white" : "bg-gray-400"
//               }`}
//             />
//           ))}
//         </div>
//       </div>
//     </section>
//   );
// };

// export default Testimonials;

import { useEffect, useState } from "react";
import { motion, AnimatePresence } from "framer-motion";
import { getTestimonials } from "../../services/testimonialService";

const Testimonials = () => {
  const [data, setData] = useState([]);
  const [index, setIndex] = useState(0);

  useEffect(() => {
    let mounted = true;

    const fetchData = async () => {
      try {
        const res = await getTestimonials();

        if (mounted && Array.isArray(res) && res.length) {
          setData(res);
        } else {
          throw new Error("No data");
        }
      } catch {
        setData([
          {
            name: "David O.",
            role: "Freelancer",
            text: "SmartBudget gave me full visibility into my cash flow. I now save consistently every month.",
            verified: true,
            avatar: "https://i.pravatar.cc/150?img=12",
            company: "Upwork",
          },
          {
            name: "Sarah K.",
            role: "Business Owner",
            text: "The clean dashboard and spending insights helped me control business expenses faster than spreadsheets.",
            verified: true,
            avatar: "https://i.pravatar.cc/150?img=5",
            company: "Shopify",
          },
          {
            name: "John M.",
            role: "Developer",
            text: "Minimal interface, powerful reporting, and smooth performance. Exactly what I wanted.",
            verified: true,
            avatar: "https://i.pravatar.cc/150?img=32",
            company: "GitHub",
          },
          {
            name: "Grace A.",
            role: "Consultant",
            text: "I use it daily for planning budgets and tracking subscriptions. Brilliant experience.",
            verified: true,
            avatar: "https://i.pravatar.cc/150?img=20",
            company: "Deloitte",
          },
          {
            name: "Michael T.",
            role: "Startup Founder",
            text: "It feels like a premium fintech product. Smart alerts saved us from unnecessary spending.",
            verified: true,
            avatar: "https://i.pravatar.cc/150?img=15",
            company: "Stripe",
          },
          {
            name: "Ada N.",
            role: "Product Manager",
            text: "Beautiful UI, reliable analytics, and smooth onboarding. Highly recommended.",
            verified: true,
            avatar: "https://i.pravatar.cc/150?img=25",
            company: "Notion",
          },
        ]);
      }
    };

    fetchData();

    return () => {
      mounted = false;
    };
  }, []);

  // Auto rotate
  useEffect(() => {
    if (!data.length) return;

    const interval = setInterval(() => {
      setIndex((prev) => (prev + 1) % data.length);
    }, 5000);

    return () => clearInterval(interval);
  }, [data]);

  const current = data[index];

  return (
    <section
      id="testimonials"
      className="relative py-28 overflow-hidden bg-white dark:bg-gray-950"
    >
      {/* Background Glow */}
      <div className="absolute inset-0 -z-10">
        <div className="absolute top-[-220px] left-1/2 -translate-x-1/2 w-[900px] h-[900px] rounded-full bg-gradient-to-r from-indigo-500/10 via-violet-500/10 to-cyan-500/10 blur-3xl" />
      </div>

      <div className="max-w-6xl mx-auto px-4">
        {/* Header */}
        <motion.div
          initial={{ opacity: 0, y: 35 }}
          whileInView={{ opacity: 1, y: 0 }}
          viewport={{ once: true }}
          transition={{ duration: 0.55 }}
          className="text-center max-w-3xl mx-auto"
        >
          <div className="inline-flex items-center gap-2 px-4 py-1.5 rounded-full border border-indigo-100 dark:border-indigo-500/20 bg-indigo-50 dark:bg-indigo-500/10 text-xs font-medium text-indigo-600 dark:text-indigo-300">
            Trusted Worldwide
          </div>

          <h2 className="mt-5 text-3xl md:text-5xl font-bold tracking-tight text-gray-900 dark:text-white">
            The Finance Platform 
            <span className="block bg-gradient-to-r from-indigo-600 via-violet-600 to-cyan-500 bg-clip-text text-transparent">
              Users Trust Daily
            </span>
          </h2>

          <p className="mt-4 text-gray-600 dark:text-gray-400 md:text-lg">
            Real people using SmartBudget to save more, spend smarter, and gain
            financial clarity.
          </p>
        </motion.div>

        {/* Main Card */}
        <div className="mt-16 relative">
          <div className="absolute inset-0 blur-3xl bg-gradient-to-r from-indigo-500/10 via-violet-500/10 to-cyan-500/10 rounded-[40px]" />

          <div className="relative max-w-4xl mx-auto">
            <AnimatePresence mode="wait">
              {current && (
                <motion.div
                  key={index}
                  initial={{ opacity: 0, y: 30, scale: 0.96 }}
                  animate={{ opacity: 1, y: 0, scale: 1 }}
                  exit={{ opacity: 0, y: -20, scale: 0.96 }}
                  transition={{ duration: 0.45 }}
                  className="rounded-3xl border border-gray-200/70 dark:border-gray-800 bg-white/90 dark:bg-gray-900/90 backdrop-blur-xl shadow-2xl p-8 md:p-10"
                >
                  {/* Quote Icon */}
                  <div className="mb-6 text-5xl leading-none text-indigo-500/30">
                    "
                  </div>

                  {/* Testimonial */}
                  <p className="text-lg md:text-2xl leading-relaxed font-medium text-gray-900 dark:text-white">
                    {current.text}
                  </p>

                  {/* Footer */}
                  <div className="mt-8 flex flex-col sm:flex-row sm:items-center sm:justify-between gap-5">
                    <div className="flex items-center gap-4">
                      <img
                        src={current.avatar}
                        alt={current.name}
                        className="w-14 h-14 rounded-2xl object-cover ring-2 ring-indigo-100 dark:ring-indigo-500/20"
                      />

                      <div>
                        <div className="flex items-center gap-2">
                          <h4 className="font-semibold text-gray-900 dark:text-white">
                            {current.name}
                          </h4>

                          {current.verified && (
                            <span className="text-xs px-2 py-1 rounded-full bg-emerald-100 text-emerald-700 dark:bg-emerald-500/10 dark:text-emerald-300">
                              Verified
                            </span>
                          )}
                        </div>

                        <p className="text-sm text-gray-500 dark:text-gray-400">
                          {current.role} • {current.company}
                        </p>
                      </div>
                    </div>

                    {/* Rating */}
                    <div className="flex gap-1 text-yellow-400 text-lg">
                      ★★★★★
                    </div>
                  </div>
                </motion.div>
              )}
            </AnimatePresence>
          </div>
        </div>

        {/* Indicators */}
        <div className="mt-10 flex justify-center gap-3 flex-wrap">
          {data.map((item, i) => (
            <button
              key={i}
              onClick={() => setIndex(i)}
              className="group"
              aria-label={item.name}
            >
              <div
                className={`transition-all duration-300 rounded-full ${
                  i === index
                    ? "w-10 h-2 bg-gradient-to-r from-indigo-600 to-violet-600"
                    : "w-2 h-2 bg-gray-300 dark:bg-gray-700 group-hover:bg-gray-400"
                }`}
              />
            </button>
          ))}
        </div>

        {/* Bottom Stats */}
        <motion.div
          initial={{ opacity: 0, y: 25 }}
          whileInView={{ opacity: 1, y: 0 }}
          viewport={{ once: true }}
          transition={{ delay: 0.15 }}
          className="grid grid-cols-2 md:grid-cols-4 gap-4 mt-16"
        >
          {[
            ["12k+", "Happy Users"],
            ["₦50M+", "Money Managed"],
            ["4.9/5", "Average Rating"],
            ["99.9%", "Uptime"],
          ].map(([value, label], i) => (
            <div
              key={i}
              className="rounded-2xl border border-gray-200 dark:border-gray-800 bg-white dark:bg-gray-900 p-5 text-center"
            >
              <p className="text-2xl font-bold text-gray-900 dark:text-white">
                {value}
              </p>
              <p className="mt-1 text-sm text-gray-500 dark:text-gray-400">
                {label}
              </p>
            </div>
          ))}
        </motion.div>
      </div>
    </section>
  );
};

export default Testimonials;