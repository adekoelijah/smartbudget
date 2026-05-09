import { useEffect } from "react";
import { animate, inView } from "framer-motion";

export const useScrollReveal = (selector = ".reveal") => {
  useEffect(() => {
    const elements = document.querySelectorAll(selector);

    elements.forEach((el) => {
      inView(el, () => {
        animate(
          el,
          { opacity: [0, 1], y: [40, 0] },
          { duration: 0.6, ease: "easeOut" }
        );
      });
    });
  }, [selector]);
};