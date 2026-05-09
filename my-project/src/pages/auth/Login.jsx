

// import { useState } from "react";
// import { useNavigate } from "react-router-dom";
// import { motion } from "framer-motion";
// import { loginUser } from "../../services/authService";

// const Login = () => {
//   const navigate = useNavigate();

//   const [loading, setLoading] = useState(false);
//   const [error, setError] = useState("");
//   const [successMessage, setSuccessMessage] = useState("");

//   const [form, setForm] = useState({
//     email: "",
//     password: "",
//   });

//   const [showPassword, setShowPassword] = useState(false);

//   // ✅ Better than useEffect: clear messages directly on typing
//   const handleChange = (e) => {
//     const { name, value } = e.target;

//     setForm((prev) => ({
//       ...prev,
//       [name]: value,
//     }));

//     // clear messages safely
//     if (error) setError("");
//     if (successMessage) setSuccessMessage("");
//   };

//   const validate = () => {
//     if (!form.email.trim()) return "Email is required";
//     if (!form.password.trim()) return "Password is required";

//     if (!form.email.includes("@")) {
//       return "Please enter a valid email";
//     }

//     if (form.password.length < 6) {
//       return "Password must be at least 6 characters";
//     }

//     return null;
//   };

//   const handleSubmit = async (e) => {
//     e.preventDefault();

//     setError("");
//     setSuccessMessage("");

//     const validationError = validate();

//     if (validationError) {
//       setError(validationError);
//       return;
//     }

//     try {
//       setLoading(true);

//       const response = await loginUser({
//         email: form.email.trim().toLowerCase(),
//         password: form.password,
//       });

//       if (response?.token && response?.user) {
//         localStorage.setItem("token", response.token);
//         localStorage.setItem("user", JSON.stringify(response.user));

//         setSuccessMessage("Login successful! Redirecting...");

//         setTimeout(() => {
//           navigate("/app");
//         }, 600);
//       } else {
//         setError("Invalid server response");
//       }
//     } catch (err) {
//       const message =
//         err?.response?.data?.message ||
//         err.message ||
//         "Login failed";

//       setError(message);
//     } finally {
//       setLoading(false);
//     }
//   };

//   return (
//     <div className="min-h-screen flex bg-gray-50 dark:bg-gray-950">
//       {/* LEFT SIDE */}
//       <div className="hidden lg:flex w-1/2 relative items-center justify-center bg-gradient-to-br from-indigo-600 to-purple-700 p-12">
//         <div className="absolute inset-0 bg-black/30" />

//         <motion.div
//           initial={{ opacity: 0, y: 40 }}
//           animate={{ opacity: 1, y: 0 }}
//           transition={{ duration: 0.6 }}
//           className="relative z-10 text-white max-w-md"
//         >
//           <h1 className="text-4xl font-bold leading-tight">
//             Manage Your Money Smarter
//           </h1>

//           <p className="mt-4 text-white/80">
//             SmartBudget helps you track expenses, control spending,
//             and achieve your financial goals effortlessly.
//           </p>

//           <img
//             src="/images/Coins-rafiki.png"
//             alt="Finance"
//             className="mt-10 rounded-xl shadow-2xl"
//           />
//         </motion.div>
//       </div>

//       {/* RIGHT SIDE */}
//       <div className="flex flex-1 items-center justify-center px-4">
//         <motion.div
//           initial={{ opacity: 0, y: 30 }}
//           animate={{ opacity: 1, y: 0 }}
//           transition={{ duration: 0.5 }}
//           className="w-full max-w-md bg-white/80 dark:bg-gray-900/80 backdrop-blur-xl border dark:border-gray-800 rounded-2xl p-8 shadow-xl"
//         >
//           <h2 className="text-2xl font-semibold text-center text-gray-900 dark:text-white">
//             Welcome Back
//           </h2>

//           <p className="text-sm text-center text-gray-500 mt-1">
//             Login to continue to SmartBudget
//           </p>

//           <form onSubmit={handleSubmit} className="mt-6 space-y-5">
//             {/* EMAIL */}
//             <div>
//               <label
//                 htmlFor="email"
//                 className="text-sm text-gray-600 dark:text-gray-300"
//               >
//                 Email
//               </label>

//               <input
//                 id="email"
//                 name="email"
//                 type="email"
//                 autoComplete="email"
//                 value={form.email}
//                 onChange={handleChange}
//                 placeholder="you@example.com"
//                 className="w-full mt-1 px-4 py-2.5 rounded-xl border dark:border-gray-700 bg-transparent outline-none focus:ring-2 focus:ring-indigo-500 transition"
//               />
//             </div>

//             {/* PASSWORD */}
//             <div>
//               <label
//                 htmlFor="password"
//                 className="text-sm text-gray-600 dark:text-gray-300"
//               >
//                 Password
//               </label>

//               <div className="relative">
//                 <input
//                   id="password"
//                   name="password"
//                   type={showPassword ? "text" : "password"}
//                   autoComplete="current-password"
//                   value={form.password}
//                   onChange={handleChange}
//                   placeholder="••••••••"
//                   className="w-full mt-1 px-4 py-2.5 pr-12 rounded-xl border dark:border-gray-700 bg-transparent outline-none focus:ring-2 focus:ring-indigo-500 transition"
//                 />

//                 <button
//                   type="button"
//                   onClick={() => setShowPassword(!showPassword)}
//                   className="absolute right-3 top-1/2 -translate-y-1/2 text-sm text-gray-500"
//                 >
//                   {showPassword ? "Hide" : "Show"}
//                 </button>
//               </div>
//             </div>

//             {/* ERROR */}
//             {error && (
//               <div className="px-4 py-3 rounded-xl bg-red-50 border border-red-200">
//                 <p className="text-sm text-red-600">{error}</p>
//               </div>
//             )}

//             {/* SUCCESS */}
//             {successMessage && (
//               <div className="px-4 py-3 rounded-xl bg-green-50 border border-green-200">
//                 <p className="text-sm text-green-600">
//                   {successMessage}
//                 </p>
//               </div>
//             )}

//             {/* BUTTON */}
//             <button
//               type="submit"
//               disabled={loading}
//               className="w-full py-2.5 rounded-xl bg-indigo-600 text-white font-semibold hover:bg-indigo-700 transition disabled:opacity-60"
//             >
//               {loading ? "Logging in..." : "Login"}
//             </button>
//           </form>

//           <p className="text-sm text-center text-gray-500 mt-6">
//             Don’t have an account?{" "}
//             <span
//               onClick={() => navigate("/signup")}
//               className="text-indigo-600 cursor-pointer underline"
//             >
//               Sign up
//             </span>
//           </p>
//         </motion.div>
//       </div>
//     </div>
//   );
// };

// export default Login;


import { useState } from "react";
import { useNavigate } from "react-router-dom";
import { motion } from "framer-motion";
import { loginUser } from "../../services/authService";

const Login = () => {
  const navigate = useNavigate();

  const [loading, setLoading] = useState(false);
  const [error, setError] = useState("");
  const [successMessage, setSuccessMessage] = useState("");

  const [form, setForm] = useState({
    email: "",
    password: "",
  });

  const [showPassword, setShowPassword] = useState(false);

  const handleChange = (e) => {
    const { name, value } = e.target;

    setForm((prev) => ({
      ...prev,
      [name]: value,
    }));

    if (error) setError("");
    if (successMessage) setSuccessMessage("");
  };

  const validate = () => {
    if (!form.email.trim()) return "Email is required";
    if (!form.password.trim()) return "Password is required";
    if (!form.email.includes("@")) return "Enter a valid email";
    if (form.password.length < 6) return "Password must be at least 6 characters";
    return null;
  };

  const handleSubmit = async (e) => {
    e.preventDefault();

    setError("");
    setSuccessMessage("");

    const validationError = validate();
    if (validationError) return setError(validationError);

    try {
      setLoading(true);

      const response = await loginUser({
        email: form.email.trim().toLowerCase(),
        password: form.password,
      });

      if (response?.token && response?.user) {
        localStorage.setItem("token", response.token);
        localStorage.setItem("user", JSON.stringify(response.user));

        setSuccessMessage("Login successful... redirecting");

        setTimeout(() => navigate("/app"), 700);
      } else {
        setError("Invalid server response");
      }
    } catch (err) {
      setError(err?.response?.data?.message || err.message || "Login failed");
    } finally {
      setLoading(false);
    }
  };

  return (
    <div className="relative min-h-screen flex items-center justify-center bg-white dark:bg-gray-950 px-4 overflow-hidden">

      {/* BACKGROUND GLOW */}
      <div className="absolute inset-0 -z-10">
        <div className="absolute top-[-200px] left-1/2 -translate-x-1/2 w-[900px] h-[900px] bg-gradient-to-r from-indigo-500/10 via-violet-500/10 to-cyan-500/10 blur-3xl rounded-full" />
      </div>

      {/* LOGIN CARD */}
      <motion.div
        initial={{ opacity: 0, y: 30, scale: 0.98 }}
        animate={{ opacity: 1, y: 0, scale: 1 }}
        transition={{ duration: 0.5 }}
        className="w-full max-w-md"
      >
        <div className="rounded-3xl border border-gray-200 dark:border-gray-800 bg-white/80 dark:bg-gray-900/80 backdrop-blur-2xl shadow-2xl p-8 md:p-10">

          {/* HEADER */}
          <h2 className="text-3xl font-bold text-center text-gray-900 dark:text-white">
            Welcome Back
          </h2>

          <p className="text-sm text-center text-gray-500 dark:text-gray-400 mt-2">
            Login to continue SmartBudget
          </p>

          {/* FORM */}
          <form onSubmit={handleSubmit} className="mt-7 space-y-5">

            {/* EMAIL */}
            <input
              name="email"
              type="email"
              value={form.email}
              onChange={handleChange}
              placeholder="Email Address"
              className="w-full h-12 px-4 rounded-2xl border border-gray-200 dark:border-gray-700 bg-white/70 dark:bg-gray-900/60 backdrop-blur text-gray-900 dark:text-white placeholder-gray-400 dark:placeholder-gray-500 focus:outline-none focus:ring-2 focus:ring-indigo-500 transition"
            />

            {/* PASSWORD */}
            <div className="relative">
              <input
                name="password"
                type={showPassword ? "text" : "password"}
                value={form.password}
                onChange={handleChange}
                placeholder="Password"
                className="w-full h-12 px-4 pr-16 rounded-2xl border border-gray-200 dark:border-gray-700 bg-white/70 dark:bg-gray-900/60 backdrop-blur text-gray-900 dark:text-white placeholder-gray-400 dark:placeholder-gray-500 focus:outline-none focus:ring-2 focus:ring-indigo-500 transition"
              />

              <button
                type="button"
                onClick={() => setShowPassword(!showPassword)}
                className="absolute right-4 top-1/2 -translate-y-1/2 text-sm text-gray-500 hover:text-gray-900 dark:hover:text-white"
              >
                {showPassword ? "Hide" : "Show"}
              </button>
            </div>

            {/* ERROR */}
            {error && (
              <motion.div
                initial={{ opacity: 0, y: -6 }}
                animate={{ opacity: 1, y: 0 }}
                className="rounded-2xl border border-red-200 bg-red-50 dark:bg-red-500/10 dark:border-red-500/20 px-4 py-3 text-sm text-red-600"
              >
                {error}
              </motion.div>
            )}

            {/* SUCCESS */}
            {successMessage && (
              <motion.div
                initial={{ opacity: 0, y: -6 }}
                animate={{ opacity: 1, y: 0 }}
                className="rounded-2xl border border-green-200 bg-green-50 dark:bg-green-500/10 dark:border-green-500/20 px-4 py-3 text-sm text-green-600"
              >
                {successMessage}
              </motion.div>
            )}

            {/* BUTTON */}
            <motion.button
              whileHover={{ y: -2 }}
              whileTap={{ scale: 0.98 }}
              type="submit"
              disabled={loading}
              className="w-full h-12 rounded-2xl cursor-pointer bg-gradient-to-r from-indigo-600 via-violet-600 to-cyan-500 text-white font-semibold shadow-xl disabled:opacity-60 flex items-center justify-center"
            >
              {loading ? (
                <div className="flex items-center gap-2">
                  <span className="w-4 h-4 border-2 border-white/40 border-t-white rounded-full animate-spin" />
                  Logging in...
                </div>
              ) : (
                "Login"
              )}
            </motion.button>

          </form>

          {/* FOOTER */}
          <p className="text-sm text-center text-gray-500 mt-6">
            Don’t have an account?{" "}
            <span
              onClick={() => navigate("/signup")}
              className="text-indigo-600 cursor-pointer font-medium hover:underline"
            >
              Sign up
            </span>
          </p>

        </div>
      </motion.div>
    </div>
  );
};

export default Login;