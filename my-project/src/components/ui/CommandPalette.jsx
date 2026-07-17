
import { useEffect, useMemo, useState } from "react";
import { createPortal } from "react-dom";
import Fuse from "fuse.js";
import { navItems } from "../../data/navItems";
import { useNavigate } from "react-router-dom";
import { motion, AnimatePresence } from "framer-motion";

const CommandPalette = ({ open, setOpen }) => {
  const navigate = useNavigate();
  const [query, setQuery] = useState("");

  const fuse = useMemo(
    () =>
      new Fuse(navItems, {
        keys: ["label"],
        threshold: 0.3,
      }),
    []
  );

  const results = query
    ? fuse.search(query).map((r) => r.item)
    : navItems;

  useEffect(() => {
    const handleKey = (e) => {
      if (e.key === "Escape") setOpen(false);
    };

    window.addEventListener("keydown", handleKey);
    return () => window.removeEventListener("keydown", handleKey);
  }, [setOpen]);

  if (!open) return null;

  const handleSelect = (item) => {
    setOpen(false);
    setQuery("");

    if (item.path) {
      navigate(item.path);
    } else {
      document.getElementById(item.id)?.scrollIntoView({
        behavior: "smooth",
      });
    }
  };

  return createPortal(
    <AnimatePresence>
      {/* BACKDROP */}
      <motion.div
        initial={{ opacity: 0 }}
        animate={{ opacity: 1 }}
        exit={{ opacity: 0 }}
        className="fixed inset-0 bg-black/40 backdrop-blur-md flex items-start justify-center pt-28 z-[999]"
      >

        {/* PALETTE */}
        <motion.div
          initial={{ scale: 0.95, opacity: 0, y: 20 }}
          animate={{ scale: 1, opacity: 1, y: 0 }}
          exit={{ scale: 0.95, opacity: 0, y: 20 }}
          transition={{ duration: 0.25 }}
          className="w-full max-w-2xl rounded-3xl overflow-hidden border border-white/10 bg-gradient-to-b from-gray-900/95 to-gray-950/95 shadow-[0_20px_80px_rgba(0,0,0,0.6)]"
        >

          {/* HEADER INPUT */}
          <div className="relative">

            <div className="absolute inset-0 bg-gradient-to-r from-indigo-500/10 via-cyan-500/10 to-teal-500/10 blur-xl" />

            <input
              autoFocus
              value={query}
              onChange={(e) => setQuery(e.target.value)}
              placeholder="Search navigation, actions, pages..."
              className="relative w-full px-5 py-4 bg-transparent text-white placeholder:text-gray-400 outline-none border-b border-white/10"
            />
          </div>

          {/* RESULTS */}
          <div className="max-h-80 overflow-y-auto p-2">

            {results.length === 0 && (
              <div className="text-sm text-gray-400 px-4 py-6 text-center">
                No results found
              </div>
            )}

            {results.map((item, i) => (
              <motion.button
                key={i}
                onClick={() => handleSelect(item)}
                whileHover={{ x: 4 }}
                className="w-full flex items-center justify-between px-4 py-3 rounded-xl text-left text-gray-200 hover:bg-white/5 transition"
              >
                <span className="text-sm font-medium">
                  {item.label}
                </span>

                <span className="text-xs text-gray-500">
                  ↵
                </span>
              </motion.button>
            ))}

          </div>

          {/* FOOTER HINT */}
          <div className="px-4 py-3 border-t border-white/10 text-xs text-gray-500 flex justify-between">
            <span>ESC to close</span>
            <span>Navigate instantly</span>
          </div>

        </motion.div>
      </motion.div>
    </AnimatePresence>,
    document.body
  );
};

export default CommandPalette;