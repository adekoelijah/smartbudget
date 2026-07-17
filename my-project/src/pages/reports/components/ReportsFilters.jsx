



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