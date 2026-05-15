
// import { motion } from "framer-motion";

// const ReportsFilters = ({ range, setRange }) => {
//   const options = ["week", "month", "year"];

//   return (
//     <div className="w-full flex justify-start">

//       <div className="
//         relative flex items-center
//         rounded-2xl border border-gray-200
//         bg-white p-1 shadow-sm
//       ">

//         {/* BACKGROUND INDICATOR (FINTECH STYLE) */}
//         <motion.div
//           layout
//           transition={{
//             type: "spring",
//             stiffness: 400,
//             damping: 30,
//           }}
//           className="
//             absolute top-1 bottom-1
//             w-1/3
//             rounded-xl
//             bg-gray-900
//           "
//           style={{
//             transform: `translateX(${
//               options.indexOf(range) * 100
//             }%)`,
//           }}
//         />

//         {options.map((item) => (
//           <button
//             key={item}
//             onClick={() => setRange(item)}
//             className={`
//               relative z-10
//               w-24 md:w-28
//               py-2

//               text-sm font-semibold capitalize

//               transition-colors duration-200

//               ${
//                 range === item
//                   ? "text-white"
//                   : "text-gray-500 hover:text-gray-900"
//               }
//             `}
//           >
//             {item}
//           </button>
//         ))}

//       </div>
//     </div>
//   );
// };

// export default ReportsFilters;



import { motion } from "framer-motion";

const ReportsFilters = ({ range, setRange }) => {
  const options = ["week", "month", "year"];

  return (
    <div className="w-full flex justify-start">
      <div className="
        flex items-center
        rounded-2xl
        border border-gray-200
        bg-white
        p-1
        shadow-sm
      ">

        {options.map((item) => {
          const isActive = range === item;

          return (
            <button
              key={item}
              onClick={() => setRange(item)}
              className={`
                relative
                w-24 md:w-28
                py-2

                text-sm font-semibold capitalize

                rounded-xl

                transition-all duration-200

                /* better visibility ALWAYS */
                ${
                  isActive
                    ? "text-gray-900 bg-gray-100 shadow-sm"
                    : "text-gray-600 hover:text-gray-700"
                }

                /* fintech interaction */
                active:scale-[0.97]
                focus:outline-none
              `}
            >
              {item}

              {/* ACTIVE INDICATOR DOT (subtle fintech cue) */}
              {isActive && (
                <motion.div
                  layoutId="activeIndicator"
                  className="
                    absolute bottom-1 left-1/2
                    w-1.5 h-1.5
                    -translate-x-1/2
                    rounded-full
                    bg-gray-900
                  "
                />
              )}
            </button>
          );
        })}

      </div>
    </div>
  );
};

export default ReportsFilters;