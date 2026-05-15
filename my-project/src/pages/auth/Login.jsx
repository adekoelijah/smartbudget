


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

//   const handleChange = (e) => {
//     const { name, value } = e.target;

//     setForm((prev) => ({
//       ...prev,
//       [name]: value,
//     }));

//     if (error) setError("");
//     if (successMessage) setSuccessMessage("");
//   };

//   const validate = () => {
//     if (!form.email.trim()) return "Email is required";
//     if (!form.password.trim()) return "Password is required";
//     if (!form.email.includes("@")) return "Enter a valid email";
//     if (form.password.length < 6) return "Password must be at least 6 characters";
//     return null;
//   };

//   const handleSubmit = async (e) => {
//     e.preventDefault();

//     setError("");
//     setSuccessMessage("");

//     const validationError = validate();
//     if (validationError) return setError(validationError);

//     try {
//       setLoading(true);

//       const response = await loginUser({
//         email: form.email.trim().toLowerCase(),
//         password: form.password,
//       });

//       if (response?.token && response?.user) {
//         localStorage.setItem("token", response.token);
//         localStorage.setItem("user", JSON.stringify(response.user));

//         setSuccessMessage("Login successful... redirecting");

//         setTimeout(() => navigate("/app"), 700);
//       } else {
//         setError("Invalid server response");
//       }
//     } catch (err) {
//       setError(err?.response?.data?.message || err.message || "Login failed");
//     } finally {
//       setLoading(false);
//     }
//   };

//   return (
//     <div className="relative min-h-screen flex items-center justify-center bg-white dark:bg-gray-950 px-4 overflow-hidden">

//       {/* BACKGROUND GLOW */}
//       <div className="absolute inset-0 -z-10">
//         <div className="absolute top-[-200px] left-1/2 -translate-x-1/2 w-[900px] h-[900px] bg-gradient-to-r from-indigo-500/10 via-violet-500/10 to-cyan-500/10 blur-3xl rounded-full" />
//       </div>

//       {/* LOGIN CARD */}
//       <motion.div
//         initial={{ opacity: 0, y: 30, scale: 0.98 }}
//         animate={{ opacity: 1, y: 0, scale: 1 }}
//         transition={{ duration: 0.5 }}
//         className="w-full max-w-md"
//       >
//         <div className="rounded-3xl border border-gray-200 dark:border-gray-800 bg-white/80 dark:bg-gray-900/80 backdrop-blur-2xl shadow-2xl p-8 md:p-10">

//           {/* HEADER */}
//           <h2 className="text-3xl font-bold text-center text-gray-900 dark:text-white">
//             Welcome Back
//           </h2>

//           <p className="text-sm text-center text-gray-500 dark:text-gray-400 mt-2">
//             Login to continue SmartBudget
//           </p>

//           {/* FORM */}
//           <form onSubmit={handleSubmit} className="mt-7 space-y-5">

//             {/* EMAIL */}
//             <input
//               name="email"
//               type="email"
//               value={form.email}
//               onChange={handleChange}
//               placeholder="Email Address"
//               className="w-full h-12 px-4 rounded-2xl border border-gray-200 dark:border-gray-700 bg-white/70 dark:bg-gray-900/60 backdrop-blur text-gray-900 dark:text-white placeholder-gray-400 dark:placeholder-gray-500 focus:outline-none focus:ring-2 focus:ring-indigo-500 transition"
//             />

//             {/* PASSWORD */}
//             <div className="relative">
//               <input
//                 name="password"
//                 type={showPassword ? "text" : "password"}
//                 value={form.password}
//                 onChange={handleChange}
//                 placeholder="Password"
//                 className="w-full h-12 px-4 pr-16 rounded-2xl border border-gray-200 dark:border-gray-700 bg-white/70 dark:bg-gray-900/60 backdrop-blur text-gray-900 dark:text-white placeholder-gray-400 dark:placeholder-gray-500 focus:outline-none focus:ring-2 focus:ring-indigo-500 transition"
//               />

//               <button
//                 type="button"
//                 onClick={() => setShowPassword(!showPassword)}
//                 className="absolute right-4 top-1/2 -translate-y-1/2 text-sm text-gray-500 hover:text-gray-900 dark:hover:text-white"
//               >
//                 {showPassword ? "Hide" : "Show"}
//               </button>
//             </div>

//             {/* ERROR */}
//             {error && (
//               <motion.div
//                 initial={{ opacity: 0, y: -6 }}
//                 animate={{ opacity: 1, y: 0 }}
//                 className="rounded-2xl border border-red-200 bg-red-50 dark:bg-red-500/10 dark:border-red-500/20 px-4 py-3 text-sm text-red-600"
//               >
//                 {error}
//               </motion.div>
//             )}

//             {/* SUCCESS */}
//             {successMessage && (
//               <motion.div
//                 initial={{ opacity: 0, y: -6 }}
//                 animate={{ opacity: 1, y: 0 }}
//                 className="rounded-2xl border border-green-200 bg-green-50 dark:bg-green-500/10 dark:border-green-500/20 px-4 py-3 text-sm text-green-600"
//               >
//                 {successMessage}
//               </motion.div>
//             )}

//             {/* BUTTON */}
//             <motion.button
//               whileHover={{ y: -2 }}
//               whileTap={{ scale: 0.98 }}
//               type="submit"
//               disabled={loading}
//               className="w-full h-12 rounded-2xl cursor-pointer bg-gradient-to-r from-indigo-600 via-violet-600 to-cyan-500 text-white font-semibold shadow-xl disabled:opacity-60 flex items-center justify-center"
//             >
//               {loading ? (
//                 <div className="flex items-center gap-2">
//                   <span className="w-4 h-4 border-2 border-white/40 border-t-white rounded-full animate-spin" />
//                   Logging in...
//                 </div>
//               ) : (
//                 "Login"
//               )}
//             </motion.button>

//           </form>

//           {/* FOOTER */}
//           <p className="text-sm text-center text-gray-500 mt-6">
//             Don’t have an account?{" "}
//             <span
//               onClick={() => navigate("/signup")}
//               className="text-indigo-600 cursor-pointer font-medium hover:underline"
//             >
//               Sign up
//             </span>
//           </p>

//         </div>
//       </motion.div>
//     </div>
//   );
// };

// export default Login;


import { useState } from "react";
import { useNavigate } from "react-router-dom";
import { motion } from "framer-motion";
import { loginUser, googleLogin } from "../../services/authService";
import { ShieldCheck, Lock , Eye, EyeOff} from "lucide-react";

const Login = () => {
  const navigate = useNavigate();

  const [loading, setLoading] = useState(false);
  const [googleLoading, setGoogleLoading] = useState(false);
  const [error, setError] = useState("");
  const [successMessage, setSuccessMessage] = useState("");

  const [form, setForm] = useState({
    email: "",
    password: "",
  });

  const [showPassword, setShowPassword] = useState(false);

  const handleChange = (e) => {
    setForm({ ...form, [e.target.name]: e.target.value });
    setError("");
  };

  const validate = () => {
    if (!form.email || !form.password) return "All fields are required";
    if (!form.email.includes("@")) return "Invalid email format";
    if (form.password.length < 6) return "Password too weak";
    return null;
  };

  const handleSubmit = async (e) => {
    e.preventDefault();

    const err = validate();
    if (err) return setError(err);

    try {
      setLoading(true);

      const res = await loginUser({
        email: form.email.toLowerCase(),
        password: form.password,
      });

      if (res?.token) {
        localStorage.setItem("token", res.token);
        localStorage.setItem("user", JSON.stringify(res.user));

        setSuccessMessage("Authentication successful");
        setTimeout(() => navigate("/app"), 600);
      }
    } catch (e) {
      setError(e?.response?.data?.message || "Authentication failed");
    } finally {
      setLoading(false);
    }
  };

  const handleGoogleLogin = async () => {
    try {
      setGoogleLoading(true);

      const res = await googleLogin();

      if (res?.token) {
        localStorage.setItem("token", res.token);
        localStorage.setItem("user", JSON.stringify(res.user));

        navigate("/app");
      }
    } catch {
      setError("Google authentication failed");
    } finally {
      setGoogleLoading(false);
    }
  };

  return (
    <div className="min-h-screen flex items-center justify-center bg-[#0B1220] px-4 pt-16 pb-10 relative overflow-hidden">

      {/* background grid */}
      <div className="absolute inset-0 opacity-[0.08] bg-[linear-gradient(to_right,#ffffff10_1px,transparent_1px),linear-gradient(to_bottom,#ffffff10_1px,transparent_1px)] bg-[size:60px_60px]" />

      <motion.div
        initial={{ opacity: 0, y: 20 }}
        animate={{ opacity: 1, y: 0 }}
        className="w-full max-w-md"
      >

        {/* MAIN CARD */}
        <div className="rounded-3xl border border-white/10 bg-white/5 backdrop-blur-2xl shadow-2xl p-8">

          {/* HEADER */}
          <div className="text-center mb-6">
            <div className="flex justify-center mb-3">
              <div className="h-12 w-12 rounded-2xl bg-indigo-500/10 flex items-center justify-center">
                <Lock size={18} className="text-indigo-400" />
              </div>
            </div>

            <h1 className="text-2xl font-semibold text-white">
              Secure Sign In
            </h1>

            <p className="text-sm text-gray-400 mt-1">
              Access your SmartBudget financial workspace
            </p>
          </div>

          {/* GOOGLE AUTH (SECONDARY BUT PROMINENT) */}
          <button
            onClick={handleGoogleLogin}
            disabled={googleLoading}
            className="w-full h-12 mb-5 rounded-2xl bg-white text-black font-medium flex items-center justify-center gap-2 hover:bg-gray-100 transition"
          >
            {googleLoading ? "Authenticating..." : "Continue with Google"}
          </button>

          {/* DIVIDER */}
          <div className="flex items-center gap-3 mb-5">
            <div className="h-px flex-1 bg-white/10" />
            <span className="text-xs text-gray-400">
              or use email authentication
            </span>
            <div className="h-px flex-1 bg-white/10" />
          </div>

          {/* FORM */}
          <form onSubmit={handleSubmit} className="space-y-4">

            <input
              name="email"
              type="email"
              placeholder="Email address"
              value={form.email}
              onChange={handleChange}
              className="w-full h-12 px-4 rounded-xl bg-white/5 border border-white/10 text-white placeholder-gray-500 focus:ring-2 focus:ring-indigo-500 outline-none"
            />

            <div className="relative">
              <input
                name="password"
                type={showPassword ? "text" : "password"}
                placeholder="Password"
                value={form.password}
                onChange={handleChange}
                className="w-full h-12 px-4 rounded-xl bg-white/5 border border-white/10 text-white placeholder-gray-500 focus:ring-2 focus:ring-indigo-500 outline-none"
              />
              <button
  type="button"
  onClick={() => setShowPassword(!showPassword)}
 className="
  absolute right-3 top-1/2 -translate-y-1/2
  text-slate-400
  hover:text-slate-200
  hover:bg-white/5
  rounded-md
  p-1
  transition-all duration-200
"
>
  {showPassword ? (
    <EyeOff size={18} />
  ) : (
    <Eye size={18} />
  )}
</button>

            </div>

            {/* ERROR */}
            {error && (
              <p className="text-red-400 text-sm">{error}</p>
            )}

            {/* SUCCESS */}
            {successMessage && (
              <p className="text-green-400 text-sm">{successMessage}</p>
            )}

            {/* SUBMIT */}
            <button
              type="submit"
              disabled={loading}
              className="w-full h-12 rounded-xl bg-gradient-to-r from-indigo-500 to-cyan-500 text-white font-semibold"
            >
              {loading ? "Signing in..." : "Sign In"}
            </button>
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

          {/* TRUST INDICATORS */}
          <div className="mt-6 flex items-center justify-center gap-4 text-xs text-gray-400">
            <span className="flex items-center gap-1">
              <ShieldCheck size={14} /> Encrypted
            </span>
            <span>•</span>
            <span>Bank-grade security</span>
            <span>•</span>
            <span>Session protected</span>
          </div>

          {/* FOOTNOTE */}
          <p className="text-center text-xs text-gray-500 mt-6">
            By signing in you agree to SmartBudget financial terms
          </p>

        </div>
      </motion.div>
    </div>
  );
};

export default Login;