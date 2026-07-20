

import { useState } from "react";
import { useNavigate } from "react-router-dom";
import { motion } from "framer-motion";
import { Eye, EyeOff, Lock, ShieldCheck } from "lucide-react";
import { useAuth } from "../../hooks/useAuth";

const Login = () => {
  const navigate = useNavigate();
  const { login } = useAuth();

  const [form, setForm] = useState({
    email: "",
    password: "",
  });

  const [showPassword, setShowPassword] = useState(false);
  const [loading, setLoading] = useState(false);
  const [error, setError] = useState("");

  const handleChange = (e) => {
    setForm((prev) => ({
      ...prev,
      [e.target.name]: e.target.value,
    }));

    setError("");
  };


  const validate = () => {
    const emailRegex = /^[^\s@]+@[^\s@]+\.[^\s@]+$/;

    if (!form.email || !form.password) {
      return "All fields are required";
    }

    if (!emailRegex.test(form.email)) {
      return "Invalid email format";
    }

    if (form.password.length < 6) {
      return "Password must contain at least 6 characters";
    }

    return null;
  };


  const handleSubmit = async (e) => {
    e.preventDefault();

    const validationError = validate();

    if (validationError) {
      setError(validationError);
      return;
    }


    try {
      setLoading(true);
      setError("");

      const result = await login({
        email: form.email.trim().toLowerCase(),
        password: form.password,
      });


      if (!result.success) {
        setError(result.message);
        return;
      }


      navigate("/app", {
        replace: true,
      });


    } catch (error) {

      console.error("LOGIN ERROR:", error);

      setError(
        error?.message ||
        "Authentication failed. Please try again."
      );

    } finally {
      setLoading(false);
    }
  };


  return (
    <div className="min-h-screen flex items-center justify-center bg-[#0B1220] px-4">

      <div className="absolute inset-0 opacity-[0.06] bg-[linear-gradient(to_right,#ffffff12_1px,transparent_1px),linear-gradient(to_bottom,#ffffff12_1px,transparent_1px)] bg-[size:70px_70px]" />


      <motion.div
        initial={{
          opacity: 0,
          y: 18,
        }}
        animate={{
          opacity: 1,
          y: 0,
        }}
        className="w-full max-w-md relative"
      >


        <div className="rounded-2xl border border-white/10 bg-white/5 backdrop-blur-2xl shadow-[0_20px_80px_rgba(0,0,0,0.45)] p-8">


          <div className="text-center">

            <div className="flex justify-center mb-4">

              <div className="h-12 w-12 rounded-xl bg-white/5 border border-white/10 flex items-center justify-center">

                <Lock
                  size={18}
                  className="text-slate-200"
                />

              </div>

            </div>


            <h1 className="text-xl font-semibold text-white">
              Secure Authentication
            </h1>


            <p className="text-sm text-slate-400 mt-2 leading-6">
              Access your financial workspace through encrypted identity verification.
            </p>


          </div>



          <div className="mt-6 flex items-center justify-center gap-2 text-xs text-slate-400">

            <ShieldCheck
              size={14}
              className="text-emerald-400"
            />

            Bank-grade encrypted session

          </div>



          <form
            onSubmit={handleSubmit}
            className="mt-8 space-y-4"
          >


            <div>

              <label className="text-xs text-slate-400">
                Email
              </label>


              <input
                name="email"
                type="email"
                value={form.email}
                onChange={handleChange}
                placeholder="user@domain.com"
                autoComplete="email"
                className="mt-2 w-full h-12 px-4 rounded-xl bg-white/5 border border-white/10 text-white outline-none focus:border-white/30 transition"
              />

            </div>




            <div>

              <label className="text-xs text-slate-400">
                Password
              </label>


              <div className="relative mt-2">


                <input
                  name="password"
                  type={
                    showPassword
                    ? "text"
                    : "password"
                  }
                  value={form.password}
                  onChange={handleChange}
                  placeholder="••••••••"
                  autoComplete="current-password"
                  className="w-full h-12 px-4 rounded-xl bg-white/5 border border-white/10 text-white outline-none focus:border-white/30 transition"
                />


                <button
                  type="button"
                  onClick={() =>
                    setShowPassword((prev)=>!prev)
                  }
                  className="absolute right-3 top-1/2 -translate-y-1/2 text-slate-400"
                >

                  {
                    showPassword
                    ? <EyeOff size={18}/>
                    : <Eye size={18}/>
                  }

                </button>


              </div>


            </div>




            {error && (

              <div className="text-sm text-red-400 bg-red-500/10 border border-red-500/20 px-3 py-2 rounded-lg">

                {error}

              </div>

            )}





            <button
              type="submit"
              disabled={loading}
              className="w-full h-12 rounded-xl bg-white text-black font-semibold hover:bg-slate-200 transition disabled:opacity-50"
            >

              {
                loading
                ? "Authenticating..."
                : "Sign in securely"
              }


            </button>



          </form>




          <div className="mt-8 pt-6 border-t border-white/10 text-center">


            <p className="text-xs text-slate-500 leading-5">
              Sessions are encrypted and monitored for fraud prevention.
              Unauthorized access attempts are logged and blocked.
            </p>



            <button
              type="button"
              onClick={() => navigate("/signup")}
              className="mt-4 text-xs text-slate-300 hover:text-white"
            >

              Create new secure account

            </button>


          </div>


        </div>


      </motion.div>


    </div>
  );
};


export default Login;