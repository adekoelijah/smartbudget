
import { useState } from "react";
import { useNavigate } from "react-router-dom";
import { motion } from "framer-motion";
import { Eye, EyeOff, Lock, ShieldCheck } from "lucide-react";

const Signup = () => {
  const navigate = useNavigate();

  const [form, setForm] = useState({
    name: "",
    email: "",
    password: "",
    confirmPassword: "",
  });

  const [showPassword, setShowPassword] = useState(false);
  const [showConfirmPassword, setShowConfirmPassword] = useState(false);

  const [loading, setLoading] = useState(false);
  const [error, setError] = useState("");

  const API_URL =
    import.meta.env.VITE_API_URL || "https://nexatech-smartbudget-backend.vercel.app/api";

  const handleChange = (e) => {
    setForm((prev) => ({
      ...prev,
      [e.target.name]: e.target.value,
    }));
    setError("");
  };

  const validate = () => {
    const emailRegex = /^[^\s@]+@[^\s@]+\.[^\s@]+$/;

    if (!form.name || !form.email || !form.password || !form.confirmPassword) {
      return "All required fields must be completed";
    }

    if (!emailRegex.test(form.email)) {
      return "Email format is invalid";
    }

    if (form.password.length < 8) {
      return "Password must be at least 8 characters";
    }

    if (form.password !== form.confirmPassword) {
      return "Password confirmation does not match";
    }

    return null;
  };


  console.log("SIGNUP URL:", `${API_URL}/auth/signup`);
console.log("FORM DATA:", {
  name: form.name,
  email: form.email
});

  const handleSubmit = async (e) => {
    e.preventDefault();

    const err = validate();
    if (err) return setError(err);

    try {
      setLoading(true);

      const res = await fetch(`${API_URL}/auth/signup`, {
        method: "POST",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify({
          name: form.name.trim(),
          email: form.email.trim().toLowerCase(),
          password: form.password,
        }),
      });

      const data = await res.json();

      if (!res.ok) throw new Error(data.message || "Account creation failed");

      localStorage.setItem("token", data.token);
      localStorage.setItem("user", JSON.stringify(data.user));

      navigate("/app");
    } catch (err) {
      setError(err.message || "System error occurred");
    } finally {
      setLoading(false);
    }
  };

  return (
    <div className="min-h-screen flex items-center justify-center bg-[#0B1220] px-4">

      {/* STRUCTURED GRID BACKGROUND (BANK SYSTEM IDENTITY) */}
      <div className="absolute inset-0 opacity-[0.05] bg-[linear-gradient(to_right,#ffffff14_1px,transparent_1px),linear-gradient(to_bottom,#ffffff14_1px,transparent_1px)] bg-[size:72px_72px]" />

      <motion.div
        initial={{ opacity: 0, y: 18 }}
        animate={{ opacity: 1, y: 0 }}
        className="w-full max-w-md relative"
      >
        {/* CARD */}
        <div className="rounded-2xl border border-white/10 bg-white/5 backdrop-blur-2xl shadow-[0_30px_120px_rgba(0,0,0,0.5)] p-8">

          {/* HEADER */}
          <div className="text-center">
            <div className="flex justify-center mb-4">
              <div className="h-12 w-12 rounded-xl border border-white/10 bg-white/5 flex items-center justify-center">
                <Lock size={18} className="text-slate-200" />
              </div>
            </div>

            <h1 className="text-lg font-semibold text-white">
              Create Secure Account
            </h1>

            <p className="text-sm text-slate-400 mt-2 leading-6">
              Establish a verified financial identity to access your budgeting system.
            </p>
          </div>

          {/* SECURITY LABEL */}
          <div className="mt-6 flex items-center justify-center gap-2 text-xs text-slate-400">
            <ShieldCheck size={14} className="text-emerald-400" />
            Encrypted onboarding session
          </div>

          {/* FORM */}
          <form onSubmit={handleSubmit} className="mt-8 space-y-4">

            {/* NAME */}
            <div>
              <label className="text-xs text-slate-400">Full name</label>
              <input
                name="name" 
                value={form.name}
                onChange={handleChange}
                className="mt-2 w-full h-12 px-4 rounded-xl bg-white/5 border border-white/10 text-white outline-none focus:border-white/30"
                placeholder="Enter your full name"
              />
            </div>

            {/* EMAIL */}
            <div>
              <label className="text-xs text-slate-400">Email address</label>
              <input
                name="email" 
                value={form.email}
                onChange={handleChange}
                className="mt-2 w-full h-12 px-4 rounded-xl bg-white/5 border border-white/10 text-white outline-none focus:border-white/30"
                placeholder="Enter your email address"
              />
            </div>

            {/* PASSWORD */}
            <div>
              <label className="text-xs text-slate-400">Password</label>

              <div className="relative mt-2">
                <input
                  name="password" 
                  type={showPassword ? "text" : "password"}
                  value={form.password}
                  onChange={handleChange}
                  className="w-full h-12 px-4 rounded-xl bg-white/5 border border-white/10 text-white outline-none focus:border-white/30"
                  placeholder="Enter your password"
                />

                <button
                  type="button"
                  onClick={() => setShowPassword(!showPassword)}
                  className="absolute right-3 top-1/2 -translate-y-1/2 text-slate-400"
                >
                  {showPassword ? <EyeOff size={18} /> : <Eye size={18} />}
                </button>
              </div>
            </div>

            {/* CONFIRM PASSWORD */}
            <div>
              <label className="text-xs text-slate-400">
                Confirm password
              </label>

              <div className="relative mt-2">
                <input
                  name="confirmPassword" 
                  type={showConfirmPassword ? "text" : "password"}
                  value={form.confirmPassword}
                  onChange={handleChange}
                  className="w-full h-12 px-4 rounded-xl bg-white/5 border border-white/10 text-white outline-none focus:border-white/30"
                  placeholder="Confirm your password"
                />

                <button
                  type="button"
                  onClick={() => setShowConfirmPassword(!showConfirmPassword)}
                  className="absolute right-3 top-1/2 -translate-y-1/2 text-slate-400"
                >
                  {showConfirmPassword ? <EyeOff size={18} /> : <Eye size={18} />}
                </button>
              </div>
            </div>

            {/* ERROR */}
            {error && (
              <div className="text-sm text-red-400 bg-red-500/10 border border-red-500/20 px-4 py-3 rounded-xl">
                {error}
              </div>
            )}

            {/* SUBMIT */}
            <button
              type="submit"
              disabled={loading}
              className="w-full h-12 rounded-xl bg-white text-black font-semibold hover:bg-slate-200 transition"
            >
              {loading ? "Creating account..." : "Create secure account"}
            </button>
          </form>

          {/* TRUST FOOTER */}
          <div className="mt-8 pt-6 border-t border-white/10 text-center">
            <p className="text-xs text-slate-500 leading-5">
              All credentials are encrypted and processed in a secured environment.
              Fraud detection systems are active during onboarding.
            </p>

            <p
              onClick={() => navigate("/login")}
              className="mt-4 text-xs text-slate-300 cursor-pointer hover:text-white"
            >
              Already registered? Sign in
            </p>
          </div>
        </div>
      </motion.div>
    </div>
  );
};

export default Signup;