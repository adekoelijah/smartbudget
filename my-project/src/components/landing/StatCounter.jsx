import { useEffect, useState } from "react";

const StatCounter = ({ value, label, prefix = "", suffix = "", loading }) => {
  const [count, setCount] = useState(0);

  useEffect(() => {
    if (loading) return;

    let start = 0;
    const duration = 1200;
    const increment = value / (duration / 16);

    const animate = () => {
      start += increment;
      if (start < value) {
        setCount(Math.floor(start));
        requestAnimationFrame(animate);
      } else {
        setCount(value);
      }
    };

    animate();
  }, [value, loading]);

  return (
    <div>
      <h3 className="text-xl font-bold text-gray-900 dark:text-white">
        {loading ? "—" : `${prefix}${count.toLocaleString()}${suffix}`}
      </h3>
      <p className="text-xs text-gray-500">{label}</p>
    </div>
  );
};

export default StatCounter;