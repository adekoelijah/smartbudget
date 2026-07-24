


import { useState } from "react";
import { useNavigate } from "react-router-dom";
import { motion } from "framer-motion";
import {
  Eye,
  EyeOff,
  Lock,
  ShieldCheck,
  User,
  Mail,
  Sparkles,
  CheckCircle2,
} from "lucide-react";

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
    import.meta.env.VITE_API_URL ||
    "https://nexatech-smartbudget-backend.vercel.app/api";


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


  const handleSubmit = async (e) => {
    e.preventDefault();

    const err = validate();

    if (err) return setError(err);


    try {
      setLoading(true);


      const res = await fetch(`${API_URL}/auth/signup`, {
        method: "POST",

        headers: {
          "Content-Type": "application/json",
        },

        body: JSON.stringify({
          name: form.name.trim(),
          email: form.email.trim().toLowerCase(),
          password: form.password,
        }),
      });
      const data = await res.json();
      if (!res.ok)
        throw new Error(data.message || "Account creation failed");
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
    <div
      className="
        relative flex justify-center items-center overflow-hidden
        min-h-screen
        px-4 py-10
        bg-[#050B18]
      "
    >
      {/* PREMIUM BACKGROUND */}

      <div
        className="
          absolute inset-0
        "
      >

        <div
          className="
            top-[-150px] left-[-120px] absolute
            w-[420px] h-[420px]
            bg-blue-500/20
            rounded-full
            blur-[140px]
          "
          /
        >
        <div
          className="
            right-[-100px] bottom-[-120px] absolute
            w-[400px] h-[400px]
            bg-emerald-400/10
            rounded-full
            blur-[130px]
          "
          /
        >
        <div
          className="
            absolute inset-0
            bg-[linear-gradient(to_right,#ffffff12_1px,transparent_1px), bg-[size:60px_60px]
            opacity-[0.08]
            linear-gradient(to_bottom,#ffffff12_1px,transparent_1px)]
          "
          /
        >
      </div>
      <motion
        .div
        initial={{
          opacity:0,
          y:30
        }}
        animate={{
          opacity:1,
          y:0
        }}

        transition={{
          duration:.6
        }}
        className="
          relative
          w-full max-w-lg
        "
      >
        {/* CARD */}
        <div
          className="
            p-7 sm:p-10
            bg-white/[0.06]
            border border-white/10 rounded-[28px]
            shadow-[0_40px_120px_rgba(0,0,0,.6)] backdrop-blur-2xl
          "
        >
          {/* HEADER */}

          <div
            className="
              text-center
            "
          >
            <motion
              .div
              whileHover={{
                scale:1.08
              }}
              className="
                flex justify-center items-center
                w-16 h-16
                mx-auto
                bg-gradient-to-br from-blue-500 to-cyan-400
                rounded-2xl
                shadow-xl
              "
            >
              <Sparkles
                className="
                  text-white
                "
                size={28}
              /
              >

            </motion.div>



            <h1
              className="
                mt-6
                font-bold text-white text-2xl
              "
            > Welcome to SmartBudget</h1>
            <p
              className="
                mt-3
                text-slate-400 text-sm leading-6
              "
            >
              Create your secure financial identity
              and take control of your money journey.
            </p>
          </div>
          {/* SECURITY BADGE */}

          <div
            className="
              flex justify-center items-center
              mt-7 py-3
              text-emerald-300 text-xs
              bg-emerald-400/10
              border border-emerald-400/20 rounded-xl
              gap-2
            "
          >

            <ShieldCheck size={15}/>

            Bank-grade encrypted onboarding

          </div>
          <form
            onSubmit={handleSubmit}
            className="
              space-y-5 mt-8
            "
          >
            {/* NAME */}
            <Input
              icon={<User size={17}/>}
              label="Full name"
              name="name"
              value={form.name}
              onChange={handleChange}
              placeholder="John Smith"
            />
            {/* EMAIL */}
            <Input
              icon={<Mail size={17}/>}
              label="Email address"
              name="email"
              value={form.email}
              onChange={handleChange}
              placeholder="you@example.com"
            />
            {/* PASSWORD */}
            <PasswordInput
              label="Password"
              name="password"
              value={form.password}
              onChange={handleChange}
              show={showPassword}
              toggle={()=>setShowPassword(!showPassword)}
              placeholder="Create strong password"

            />
            {/* CONFIRM PASSWORD */}
            <PasswordInput
              label="Confirm password"
              name="confirmPassword"
              value={form.confirmPassword}
              onChange={handleChange}
              show={showConfirmPassword}
              toggle={()=>setShowConfirmPassword(!showConfirmPassword)}
              placeholder="Confirm password"

            />
            {/* ERROR */}
            {error && (
              <motion
                .div
                initial={{opacity:0}}
                animate={{opacity:1}}
                className="
                  px-4 py-3
                  text-red-300 text-sm
                  bg-red-500/10
                  border border-red-500/20 rounded-xl
                "
              >
                {error}
              </motion.div>
            )}
            {/* BUTTON */}

            <motion
              .button

              whileHover={{
                scale:1.02
              }}

              whileTap={{
                scale:.98
              }}

              disabled={loading}
              className="
                w-full h-14
                mt-3
                font-semibold text-white
                bg-gradient-to-r from-blue-500 via-cyan-400 to-emerald-400
                rounded-2xl
                shadow-blue-500/20 shadow-lg transition
                cursor-pointer
              "
            >

              {
                loading
                ?
                "Creating your account..."
                :
                "Create Secure Account"
              }


            </motion.button>
          </form>
          {/* TRUST AREA */}
          <div
            className="
              mt-8 pt-6
              border-white/10 border-t
            "
          >
            <div
              className="
                flex flex-col
                text-slate-400 text-xs
                gap-3
              "
            >
              <p
                className="
                  flex items-center
                  gap-2
                "
              >

                <CheckCircle2
                  size={14}
                  className="
                    text-emerald-400
                  "
                  /
                >256-bit encrypted financial protection</p>
              <p
                className="
                  flex items-center
                  gap-2
                "
              >
                <CheckCircle2
                  size={14}
                  className="
                    text-emerald-400
                  "
                  /
                >
                Smart fraud monitoring enabled
              </p>
              <p
                className="
                  flex items-center
                  gap-2
                "
              >
                <Lock
                  size={14}
                  className="
                    text-blue-400
                  "
                  /
                >
                Your personal information stays private
              </p>
            </div>
            <p
              onClick={()=>navigate("/login")}

              className="mt-6 text-slate-300 hover:text-white text-sm text-center transition cursor-pointer"
            >
              Already have an account?
              <span
                className="
                  ml-1
                  text-cyan-400
                "
              >
                Sign in
              </span>
            </p>
          </div>
        </div>
      </motion.div>
    </div>
  );
};
// REUSABLE INPUT COMPONENT
const Input = ({
  icon,
  label,
  ...props
}) => (

<div>
<label
  className="
    text-xs text-slate-400
  "
>
{label}
</label>
<div
  className="
    relative
    mt-2
  "
>
<span
  className="
    absolute left-4 top-1/2
    text-slate-400
    -translate-y-1/2
  "
>
{icon}
</span>
<input
  {...props}
  className="
    h-14 w-full
    pl-12 pr-4
    text-white placeholder:text-slate-500
    bg-white/5 focus:bg-white/10
    rounded-2xl border border-white/10 focus:border-cyan-400/50 outline-none
    transition
  "
  /
>
</div>
</div>
);
const PasswordInput = ({
label,
show,
toggle,
...props
}) => (

<div>

<label
  className="
    text-xs text-slate-400
  "
>
{label}
</label>
<div
  className="
    relative
    mt-2
  "
>
<input
  {...props}

type={show ? "text":"password"}
  className="
    h-14 w-full
    px-4 pr-12
    text-white placeholder:text-slate-500
    bg-white/5 focus:bg-white/10
    rounded-2xl border border-white/10 focus:border-cyan-400/50 outline-none
    transition
  "
  /
>
<button
  type="button"
onClick={toggle}
  className="
    top-1/2 right-3 absolute
    text-slate-300 hover:text-white
    transition
    -translate-y-1/2
  "
>
{
show
?
<EyeOff size={18}/>
:
<Eye size={18}/>
}
</button>
</div>
</div>
);
export default Signup;