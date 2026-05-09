// import { useTheme } from "../../context/ThemeContext";

// const themes = [
//   "indigo",
//   "emerald",
//   "rose",
//   "amber",
// ];

// const ColorPalette = () => {
//   const { accent, setAccent } = useTheme();

//   return (
//     <div className="flex gap-3">
//       {themes.map((color) => (
//         <button
//           key={color}
//           onClick={() => setAccent(color)}
//           className={`w-8 h-8 rounded-full border-2 ${
//             accent === color
//               ? "border-black dark:border-white"
//               : "border-transparent"
//           } ${color}`}
//         />
//       ))}
//     </div>
//   );
// };

// export default ColorPalette;

import { useTheme } from "../../context/ThemeContext";

const colors = [
  { name: "indigo", class: "palette-indigo" },
  { name: "emerald", class: "palette-emerald" },
  { name: "rose", class: "palette-rose" },
  { name: "amber", class: "palette-amber" },
  { name: "slate", class: "palette-slate" },
];

const ColorPalette = () => {
  const { color, changeColor } = useTheme();

  return (
    <div className="flex gap-2">
      {colors.map((c) => (
        <button
          key={c.name}
          onClick={() => changeColor(c.name)}
          className={`w-6 h-6 rounded-full ${c.class} ${
            color === c.name ? "ring-2 ring-black dark:ring-white" : ""
          }`}
        />
      ))}
    </div>
  );
};

export default ColorPalette;