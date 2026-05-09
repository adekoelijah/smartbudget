
// export default Signup;

// import { useState } from "react";
// import { useNavigate } from "react-router-dom";
// import { motion } from "framer-motion";

// const Signup = () => {
//   const navigate = useNavigate();

//   const [form, setForm] = useState({
//     name: "",
//     email: "",
//     password: "",
//   });

//   const [showPassword, setShowPassword] = useState(false);
//   const [loading, setLoading] = useState(false);
//   const [localError, setLocalError] = useState("");

//   const API_URL =
//     import.meta.env.VITE_API_URL || "http://localhost:5000/api";

//   const handleChange = (e) => {
//     setForm((prev) => ({
//       ...prev,
//       [e.target.name]: e.target.value,
//     }));
//   };

//   const validate = () => {
//     if (!form.name || !form.email || !form.password) {
//       return "All fields are required";
//     }

//     if (!form.email.includes("@")) {
//       return "Enter a valid email";
//     }

//     if (form.password.length < 6) {
//       return "Password must be at least 6 characters";
//     }

//     return null;
//   };

//   const handleSubmit = async (e) => {
//     e.preventDefault();
//     setLocalError("");

//     const validationError = validate();

//     if (validationError) {
//       setLocalError(validationError);
//       return;
//     }

//     try {
//       setLoading(true);

//       const res = await fetch(`${API_URL}/auth/signup`, {
//         method: "POST",
//         headers: {
//           "Content-Type": "application/json",
//         },
//         body: JSON.stringify(form),
//       });

//       const data = await res.json();

//       if (!res.ok) {
//         throw new Error(data.message || "Signup failed");
//       }

//       localStorage.setItem("token", data.token);
//       localStorage.setItem("user", JSON.stringify(data.user));

//       navigate("/app");
//     } catch (err) {
//       setLocalError(err.message || "Something went wrong");
//     } finally {
//       setLoading(false);
//     }
//   };

//   const handleGoogleSignup = () => {
//     window.location.href = `${API_URL}/auth/google`;
//   };

//   return (
//     <div className="relative min-h-screen overflow-hidden bg-white dark:bg-gray-950 flex items-center justify-center px-4 py-10">
      
//       {/* Background Glow */}
//       <div className="absolute inset-0 -z-10">
//         <div className="absolute top-[-180px] left-1/2 -translate-x-1/2 w-[850px] h-[850px] rounded-full bg-gradient-to-r from-indigo-500/15 via-violet-500/15 to-cyan-500/15 blur-3xl" />
//         <div className="absolute bottom-[-200px] right-[-100px] w-[420px] h-[420px] rounded-full bg-indigo-500/10 blur-3xl" />
//       </div>

//       <div className="grid lg:grid-cols-2 gap-10 w-full max-w-7xl items-center">

//         {/* LEFT CONTENT */}
//         <motion.div
//           initial={{ opacity: 0, x: -40 }}
//           animate={{ opacity: 1, x: 0 }}
//           transition={{ duration: 0.6 }}
//           className="hidden lg:block"
//         >
//           <div className="max-w-xl">
//             <div className="inline-flex px-4 py-1.5 rounded-full text-sm font-medium bg-indigo-50 dark:bg-indigo-500/10 text-indigo-600 dark:text-indigo-300 border border-indigo-100 dark:border-indigo-500/20">
//               SmartBudget Platform
//             </div>

//             <h1 className="mt-6 text-5xl font-bold leading-tight text-gray-900 dark:text-white">
//               Build smarter
//               <span className="block bg-gradient-to-r from-indigo-600 via-violet-600 to-cyan-500 bg-clip-text text-transparent">
//                 financial habits
//               </span>
//             </h1>

//             <p className="mt-5 text-lg text-gray-600 dark:text-gray-400 leading-relaxed">
//               Join thousands using SmartBudget to manage expenses, grow savings,
//               and gain total clarity over their money.
//             </p>
//           </div>
//         </motion.div>

//         {/* RIGHT FORM */}
//         <motion.div
//           initial={{ opacity: 0, y: 35 }}
//           animate={{ opacity: 1, y: 0 }}
//           transition={{ duration: 0.55 }}
//           className="w-full max-w-md mx-auto"
//         >
//           <div className="rounded-3xl border border-gray-200 dark:border-gray-800 bg-white/80 dark:bg-gray-900/80 backdrop-blur-2xl shadow-2xl p-8 md:p-10">

//             <h2 className="text-3xl font-bold text-center text-gray-900 dark:text-white">
//               Create Account
//             </h2>

//             <p className="text-sm text-center text-gray-500 dark:text-gray-400 mt-2">
//               Start your journey to smarter finance today
//             </p>

//             {/* Google */}
//             <button
//               type="button"
//               onClick={handleGoogleSignup}
//               className="w-full mt-7 h-12 bg-white cursor-pointer rounded-2xl border border-gray-200 dark:border-gray-700 flex items-center justify-center gap-3 font-medium hover:bg-gray-100 dark:hover:bg-gray-300  transition"
//             >
//               <img
//                 src="https://www.svgrepo.com/show/355037/google.svg"
//                 alt="Google"
//                 className="w-5 h-5"
//               />
//               Continue with Google
//             </button>

//             {/* Divider */}
//             <div className="flex items-center gap-3 my-6">
//               <div className="flex-1 h-px bg-gray-200 dark:bg-gray-800" />
//               <span className="text-xs text-gray-400 uppercase tracking-wider">
//                 or
//               </span>
//               <div className="flex-1 h-px bg-gray-200 dark:bg-gray-800" />
//             </div>

//             {/* FORM */}
//             <form onSubmit={handleSubmit} className="space-y-5">

//               {/* NAME */}
//               <input
//                 type="text"
//                 name="name"
//                 value={form.name}
//                 onChange={handleChange}
//                 placeholder="Full Name"
//                 className="w-full h-12 px-4 rounded-2xl border border-gray-200 dark:border-gray-700 bg-white/70 dark:bg-gray-900/60 backdrop-blur text-gray-900 dark:text-white placeholder-gray-400 dark:placeholder-gray-500 focus:outline-none focus:ring-2 focus:ring-indigo-500 transition"
//               />

//               {/* EMAIL */}
//               <input
//                 type="email"
//                 name="email"
//                 value={form.email}
//                 onChange={handleChange}
//                 placeholder="Email Address"
//                 className="w-full h-12 px-4 rounded-2xl border border-gray-200 dark:border-gray-700 bg-white/70 dark:bg-gray-900/60 backdrop-blur text-gray-900 dark:text-white placeholder-gray-400 dark:placeholder-gray-500 focus:outline-none focus:ring-2 focus:ring-indigo-500 transition"
//               />

//               {/* PASSWORD */}
//               <div className="relative">
//                 <input
//                   type={showPassword ? "text" : "password"}
//                   name="password"
//                   value={form.password}
//                   onChange={handleChange}
//                   placeholder="Password"
//                   className="w-full h-12 px-4 pr-16 rounded-2xl border border-gray-200 dark:border-gray-700 bg-white/70 dark:bg-gray-900/60 backdrop-blur text-gray-900 dark:text-white placeholder-gray-400 dark:placeholder-gray-500 focus:outline-none focus:ring-2 focus:ring-indigo-500 transition"
//                 />

//                 <button
//                   type="button"
//                   onClick={() => setShowPassword(!showPassword)}
//                   className="absolute right-4 top-1/2 -translate-y-1/2 text-sm text-gray-500 hover:text-gray-900 dark:hover:text-white"
//                 >
//                   {showPassword ? "Hide" : "Show"}
//                 </button>
//               </div>

//               {/* ERROR */}
//               {localError && (
//                 <motion.div
//                   initial={{ opacity: 0, y: -6 }}
//                   animate={{ opacity: 1, y: 0 }}
//                   className="rounded-2xl border border-red-200 bg-red-50 dark:bg-red-500/10 dark:border-red-500/20 px-4 py-3 text-sm text-red-600"
//                 >
//                   {localError}
//                 </motion.div>
//               )}

//               {/* BUTTON */}
//               <motion.button
//                 whileHover={{ y: -2 }}
//                 whileTap={{ scale: 0.98 }}
//                 type="submit"
//                 disabled={loading}
//                 className="w-full h-12 cursor-pointer rounded-2xl bg-gradient-to-r from-indigo-600 via-violet-600 to-cyan-500 text-white font-semibold shadow-xl disabled:opacity-60"
//               >
//                 {loading ? "Creating account..." : "Create Account"}
//               </motion.button>
//             </form>

//             {/* FOOTER */}
//             <p className="text-sm text-center text-gray-500 mt-6">
//               Already have an account?{" "}
//               <span
//                 onClick={() => navigate("/login")}
//                 className="font-medium text-indigo-600 cursor-pointer hover:underline"
//               >
//                 Login
//               </span>
//             </p>

//           </div>
//         </motion.div>
//       </div>
//     </div>
//   );
// };

// export default Signup;



import { useState } from "react";
import { useNavigate } from "react-router-dom";
import { motion } from "framer-motion";

const Signup = () => {
  const navigate = useNavigate();

  const [form, setForm] = useState({
    name: "",
    email: "",
    password: "",
    confirmPassword: "",
  });

  const [showPassword, setShowPassword] = useState(false);
  const [showConfirmPassword, setShowConfirmPassword] =
    useState(false);

  const [loading, setLoading] = useState(false);
  const [localError, setLocalError] = useState("");

  const API_URL =
    import.meta.env.VITE_API_URL || "http://localhost:5000/api";

  const handleChange = (e) => {
    setForm((prev) => ({
      ...prev,
      [e.target.name]: e.target.value,
    }));

    if (localError) setLocalError("");
  };

  const validate = () => {
    const name = form.name.trim();
    const email = form.email.trim().toLowerCase();
    const password = form.password.trim();
    const confirmPassword = form.confirmPassword.trim();

    if (
      !name ||
      !email ||
      !password ||
      !confirmPassword
    ) {
      return "All fields are required";
    }

    const emailRegex =
      /^[^\s@]+@[^\s@]+\.[^\s@]+$/;

    if (!emailRegex.test(email)) {
      return "Enter a valid email address";
    }

    if (password.length < 6) {
      return "Password must be at least 6 characters";
    }

    if (password !== confirmPassword) {
      return "Passwords do not match";
    }

    return null;
  };

  const handleSubmit = async (e) => {
    e.preventDefault();
    setLocalError("");

    const validationError = validate();

    if (validationError) {
      setLocalError(validationError);
      return;
    }

    try {
      setLoading(true);

      const payload = {
        name: form.name.trim(),
        email: form.email.trim().toLowerCase(),
        password: form.password.trim(),
        confirmPassword: form.confirmPassword.trim(),
      };

      const res = await fetch(
        `${API_URL}/auth/signup`,
        {
          method: "POST",
          headers: {
            "Content-Type":
              "application/json",
          },
          body: JSON.stringify(payload),
        }
      );

      const data = await res.json();

      if (!res.ok) {
        throw new Error(
          data.message || "Signup failed"
        );
      }

      localStorage.setItem(
        "token",
        data.token
      );

      localStorage.setItem(
        "user",
        JSON.stringify(data.user)
      );

      navigate("/app");
    } catch (err) {
      setLocalError(
        err.message ||
          "Something went wrong"
      );
    } finally {
      setLoading(false);
    }
  };

  const handleGoogleSignup = () => {
    window.location.href =
      `${API_URL}/auth/google`;
  };

  return (
    <div className="relative min-h-screen overflow-hidden bg-white dark:bg-gray-950 flex items-center justify-center px-4 py-10">
      {/* Background Glow */}
      <div className="absolute inset-0 -z-10">
        <div className="absolute top-[-180px] left-1/2 -translate-x-1/2 w-[850px] h-[850px] rounded-full bg-gradient-to-r from-indigo-500/15 via-violet-500/15 to-cyan-500/15 blur-3xl" />
        <div className="absolute bottom-[-200px] right-[-100px] w-[420px] h-[420px] rounded-full bg-indigo-500/10 blur-3xl" />
      </div>

      <div className="grid lg:grid-cols-2 gap-10 w-full max-w-7xl items-center">
        {/* LEFT CONTENT */}
        <motion.div
          initial={{
            opacity: 0,
            x: -40,
          }}
          animate={{
            opacity: 1,
            x: 0,
          }}
          transition={{
            duration: 0.6,
          }}
          className="hidden lg:block"
        >
          <div className="max-w-xl">
            <div className="inline-flex px-4 py-1.5 rounded-full text-sm font-medium bg-indigo-50 dark:bg-indigo-500/10 text-indigo-600 dark:text-indigo-300 border border-indigo-100 dark:border-indigo-500/20">
              SmartBudget Platform
            </div>

            <h1 className="mt-6 text-5xl font-bold leading-tight text-gray-900 dark:text-white">
              Build smarter
              <span className="block bg-gradient-to-r from-indigo-600 via-violet-600 to-cyan-500 bg-clip-text text-transparent">
                financial habits
              </span>
            </h1>

            <p className="mt-5 text-lg text-gray-600 dark:text-gray-400 leading-relaxed">
              Join thousands using
              SmartBudget to manage
              expenses, grow savings,
              and gain total clarity
              over their money.
            </p>
          </div>
        </motion.div>

        {/* RIGHT FORM */}
        <motion.div
          initial={{
            opacity: 0,
            y: 35,
          }}
          animate={{
            opacity: 1,
            y: 0,
          }}
          transition={{
            duration: 0.55,
          }}
          className="w-full max-w-md mx-auto"
        >
          <div className="rounded-3xl border border-gray-200 dark:border-gray-800 bg-white/80 dark:bg-gray-900/80 backdrop-blur-2xl shadow-2xl p-8 md:p-10">
            <h2 className="text-3xl font-bold text-center text-gray-900 dark:text-white">
              Create Account
            </h2>

            <p className="text-sm text-center text-gray-500 dark:text-gray-400 mt-2">
              Start your journey to
              smarter finance today
            </p>

            {/* Google */}
            <button
              type="button"
              onClick={
                handleGoogleSignup
              }
              className="w-full mt-7 h-12 bg-white cursor-pointer rounded-2xl border border-gray-200 dark:border-gray-700 flex items-center justify-center gap-3 font-medium hover:bg-gray-100 dark:hover:bg-gray-300 transition"
            >
              <img
                src="https://www.svgrepo.com/show/355037/google.svg"
                alt="Google"
                className="w-5 h-5"
              />
              Continue with Google
            </button>

            {/* Divider */}
            <div className="flex items-center gap-3 my-6">
              <div className="flex-1 h-px bg-gray-200 dark:bg-gray-800" />
              <span className="text-xs text-gray-400 uppercase tracking-wider">
                or
              </span>
              <div className="flex-1 h-px bg-gray-200 dark:bg-gray-800" />
            </div>

            {/* FORM */}
            <form
              onSubmit={
                handleSubmit
              }
              className="space-y-5"
            >
              {/* NAME */}
              <input
                type="text"
                name="name"
                value={form.name}
                onChange={
                  handleChange
                }
                placeholder="Full Name"
                className="w-full h-12 px-4 rounded-2xl border border-gray-200 dark:border-gray-700 bg-white/70 dark:bg-gray-900/60 backdrop-blur text-gray-900 dark:text-white placeholder-gray-400 dark:placeholder-gray-500 focus:outline-none focus:ring-2 focus:ring-indigo-500 transition"
              />

              {/* EMAIL */}
              <input
                type="email"
                name="email"
                value={form.email}
                onChange={
                  handleChange
                }
                placeholder="Email Address"
                className="w-full h-12 px-4 rounded-2xl border border-gray-200 dark:border-gray-700 bg-white/70 dark:bg-gray-900/60 backdrop-blur text-gray-900 dark:text-white placeholder-gray-400 dark:placeholder-gray-500 focus:outline-none focus:ring-2 focus:ring-indigo-500 transition"
              />

              {/* PASSWORD */}
              <div className="relative">
                <input
                  type={
                    showPassword
                      ? "text"
                      : "password"
                  }
                  name="password"
                  value={
                    form.password
                  }
                  onChange={
                    handleChange
                  }
                  placeholder="Password"
                  className="w-full h-12 px-4 pr-16 rounded-2xl border border-gray-200 dark:border-gray-700 bg-white/70 dark:bg-gray-900/60 backdrop-blur text-gray-900 dark:text-white placeholder-gray-400 dark:placeholder-gray-500 focus:outline-none focus:ring-2 focus:ring-indigo-500 transition"
                />

                <button
                  type="button"
                  onClick={() =>
                    setShowPassword(
                      !showPassword
                    )
                  }
                  className="absolute right-4 top-1/2 -translate-y-1/2 text-sm text-gray-500 hover:text-gray-900 dark:hover:text-white"
                >
                  {showPassword
                    ? "Hide"
                    : "Show"}
                </button>
              </div>

              {/* CONFIRM PASSWORD */}
              <div className="relative">
                <input
                  type={
                    showConfirmPassword
                      ? "text"
                      : "password"
                  }
                  name="confirmPassword"
                  value={
                    form.confirmPassword
                  }
                  onChange={
                    handleChange
                  }
                  placeholder="Confirm Password"
                  className="w-full h-12 px-4 pr-16 rounded-2xl border border-gray-200 dark:border-gray-700 bg-white/70 dark:bg-gray-900/60 backdrop-blur text-gray-900 dark:text-white placeholder-gray-400 dark:placeholder-gray-500 focus:outline-none focus:ring-2 focus:ring-indigo-500 transition"
                />

                <button
                  type="button"
                  onClick={() =>
                    setShowConfirmPassword(
                      !showConfirmPassword
                    )
                  }
                  className="absolute right-4 top-1/2 -translate-y-1/2 text-sm text-gray-500 hover:text-gray-900 dark:hover:text-white"
                >
                  {showConfirmPassword
                    ? "Hide"
                    : "Show"}
                </button>
              </div>

              {/* ERROR */}
              {localError && (
                <motion.div
                  initial={{
                    opacity: 0,
                    y: -6,
                  }}
                  animate={{
                    opacity: 1,
                    y: 0,
                  }}
                  className="rounded-2xl border border-red-200 bg-red-50 dark:bg-red-500/10 dark:border-red-500/20 px-4 py-3 text-sm text-red-600"
                >
                  {localError}
                </motion.div>
              )}

              {/* BUTTON */}
              <motion.button
                whileHover={{
                  y: -2,
                }}
                whileTap={{
                  scale: 0.98,
                }}
                type="submit"
                disabled={loading}
                className="w-full h-12 cursor-pointer rounded-2xl bg-gradient-to-r from-indigo-600 via-violet-600 to-cyan-500 text-white font-semibold shadow-xl disabled:opacity-60"
              >
                {loading
                  ? "Creating account..."
                  : "Create Account"}
              </motion.button>
            </form>

            {/* FOOTER */}
            <p className="text-sm text-center text-gray-500 mt-6">
              Already have an
              account?{" "}
              <span
                onClick={() =>
                  navigate("/login")
                }
                className="font-medium text-indigo-600 cursor-pointer hover:underline"
              >
                Login
              </span>
            </p>
          </div>
        </motion.div>
      </div>
    </div>
  );
};

export default Signup;