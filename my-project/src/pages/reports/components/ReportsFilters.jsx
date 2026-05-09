// const ReportsFilters = ({ range, setRange }) => {
//   return (
//     <div className="flex flex-col md:flex-row items-center justify-center gap-3 text-center md:justify-between mb-6">

//       {/* TIME RANGE FILTER */}
//       <div className="flex gap-2">

//         <button
//           onClick={() => setRange("week")}
//           className={`px-3 py-1 rounded-lg text-sm border ${
//             range === "week"
//               ? "bg-black text-white dark:bg-white dark:text-black"
//               : "text-gray-600 dark:text-gray-300"
//           }`}
//         >
//           Week
//         </button>

//         <button
//           onClick={() => setRange("month")}
//           className={`px-3 py-1 rounded-lg text-sm border ${
//             range === "month"
//               ? "bg-black text-white dark:bg-white dark:text-black"
//               : "text-gray-600 dark:text-gray-300"
//           }`}
//         >
//           Month
//         </button>

//         <button
//           onClick={() => setRange("year")}
//           className={`px-3 py-1 rounded-lg text-sm border ${
//             range === "year"
//               ? "bg-black text-white dark:bg-white dark:text-black"
//               : "text-gray-600 dark:text-gray-300"
//           }`}
//         >
//           Year
//         </button>

//       </div>

//     </div>
//   );
// };

// export default ReportsFilters;


import { motion } from "framer-motion";

const ReportsFilters = ({ range, setRange }) => {
  const options = ["week", "month", "year"];

  return (
    <div className="mb-6 flex justify-center md:justify-between">

      {/* SEGMENTED CONTROL */}
      <div className="relative flex items-center rounded-2xl border border-white/10 bg-[#0f172a] p-1 shadow-xl">

        {/* ACTIVE SLIDER */}
        <motion.div
          layout
          transition={{ type: "spring", stiffness: 400, damping: 30 }}
          className={`absolute top-1 bottom-1 w-1/3 rounded-xl bg-gradient-to-r from-emerald-500 to-cyan-500`}
          style={{
            left:
              range === "week"
                ? "4px"
                : range === "month"
                ? "33%"
                : "66%",
          }}
        />

        {options.map((item) => (
          <button
            key={item}
            onClick={() => setRange(item)}
            className={`relative z-10 w-24 py-2 text-sm font-medium capitalize transition ${
              range === item
                ? "text-white"
                : "text-slate-400 hover:text-white"
            }`}
          >
            {item}
          </button>
        ))}

      </div>
    </div>
  );
};

export default ReportsFilters;