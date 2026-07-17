/** @type {import('tailwindcss').Config} */
// export default {
//   darkMode: "class", // 🔴 CRITICAL
  
//   content: [
//     "./index.html",
//     "./src/**/*.{js,ts,jsx,tsx}",

//   ],
//   theme: {
//     extend: {
//       colors: {
//         primary: "#1E293B",
//         accent: "#10B981",
//         warning: "#F59E0B",
//         danger: "#EF4444",
//         bg: "#F8FAFC",
        
        
//       },
      
//     },
//   },
//   plugins: [],
// };


export default {
  darkMode: "class",

  content: ["./index.html", "./src/**/*.{js,ts,jsx,tsx}"],

  theme: {
    extend: {
      colors: {
        primary: "#6366f1",
        accent: "#10B981",
        danger: "#EF4444",
      },
    },
  },

  plugins: [],
};



