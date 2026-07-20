



import { useState } from "react";
import { useNavigate } from "react-router-dom";
import { motion } from "framer-motion";
import {
  Eye,
  EyeOff,
  Lock,
  ShieldCheck,
  Fingerprint,
  Sparkles,
  ArrowRight,
} from "lucide-react";
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
        replace:true,
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

    <div className="relative min-h-screen overflow-hidden bg-[#050B18] flex items-center justify-center px-4">


      {/* Background Effects */}

      <div className="absolute inset-0">

        <div className="
          absolute
          top-[-200px]
          left-[-150px]
          w-[500px]
          h-[500px]
          bg-blue-600/20
          rounded-full
          blur-[120px]
        "/>


        <div className="
          absolute
          bottom-[-200px]
          right-[-150px]
          w-[500px]
          h-[500px]
          bg-cyan-500/20
          rounded-full
          blur-[120px]
        "/>


        <div className="
          absolute
          inset-0
          opacity-[0.04]
          bg-[linear-gradient(to_right,#fff_1px,transparent_1px),linear-gradient(to_bottom,#fff_1px,transparent_1px)]
          bg-[size:60px_60px]
        "/>


      </div>




      <motion.div

        initial={{
          opacity:0,
          y:30,
          scale:.96
        }}

        animate={{
          opacity:1,
          y:0,
          scale:1
        }}

        transition={{
          duration:.6
        }}

        className="
          relative
          w-full
          max-w-md
        "

      >



        <div className="
          rounded-3xl
          border
          border-white/10
          bg-white/[0.06]
          backdrop-blur-2xl
          shadow-[0_30px_100px_rgba(0,0,0,.55)]
          p-6
          sm:p-8
        ">



          {/* Header */}


          <div className="text-center">


            <motion.div

              initial={{
                rotate:-20,
                scale:.8
              }}

              animate={{
                rotate:0,
                scale:1
              }}

              className="
                mx-auto
                mb-5
                w-16
                h-16
                rounded-2xl
                bg-gradient-to-br
                from-blue-500
                to-cyan-400
                flex
                items-center
                justify-center
                shadow-lg
              "

            >

              <Fingerprint
                size={30}
                className="text-white"
              />

            </motion.div>




            <h1 className="
              text-2xl
              font-bold
              text-white
              tracking-tight
            ">

              Welcome Back

            </h1>



            <p className="
              mt-2
              text-sm
              text-slate-400
              leading-6
            ">

              Securely access your SmartBudget financial workspace.

            </p>


          </div>





          {/* Security Badge */}


          <div className="
            mt-6
            flex
            items-center
            justify-center
            gap-2
            rounded-xl
            bg-emerald-500/10
            border
            border-emerald-400/20
            py-3
            text-xs
            text-emerald-300
          ">


            <ShieldCheck size={15}/>

            256-bit encrypted authentication


          </div>





          <form
            onSubmit={handleSubmit}
            className="mt-7 space-y-5"
          >




            {/* Email */}


            <div>


              <label className="
                text-xs
                text-slate-400
                ml-1
              ">

                Email Address

              </label>



              <input

                name="email"

                type="email"

                value={form.email}

                onChange={handleChange}

                placeholder="name@example.com"

                autoComplete="email"

                className="
                  mt-2
                  w-full
                  h-12
                  rounded-xl
                  bg-white/10
                  border
                  border-white/10
                  px-4
                  text-white
                  placeholder:text-slate-500
                  outline-none
                  transition
                  focus:border-blue-400
                  focus:ring-4
                  focus:ring-blue-500/20
                "

              />


            </div>







            {/* Password */}



            <div>


              <label className="
                text-xs
                text-slate-400
                ml-1
              ">

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

                  placeholder="Enter your password"

                  autoComplete="current-password"

                  className="
                    w-full
                    h-12
                    rounded-xl
                    bg-white/10
                    border
                    border-white/10
                    px-4
                    pr-12
                    text-white
                    placeholder:text-slate-500
                    outline-none
                    transition
                    focus:border-blue-400
                    focus:ring-4
                    focus:ring-blue-500/20
                  "

                />




                <button

                  type="button"

                  onClick={() =>
                    setShowPassword((prev)=>!prev)
                  }

                  className="
                    absolute
                    right-3
                    top-1/2
                    -translate-y-1/2
                    text-slate-300
                    hover:text-white
                    transition
                  "

                >


                  {
                    showPassword
                    ?
                    <EyeOff size={19}/>
                    :
                    <Eye size={19}/>
                  }


                </button>


              </div>


            </div>







            {
              error && (

                <motion.div

                  initial={{
                    opacity:0,
                    y:-10
                  }}

                  animate={{
                    opacity:1,
                    y:0
                  }}

                  className="
                    rounded-xl
                    border
                    border-red-400/20
                    bg-red-500/10
                    px-4
                    py-3
                    text-sm
                    text-red-300
                  "

                >

                  {error}

                </motion.div>

              )
            }







            <button

              type="submit"

              disabled={loading}

              className="
                group
                relative
                w-full
                h-12
                rounded-xl
                bg-gradient-to-r
                from-blue-500
                to-cyan-400
                text-white
                font-semibold
                shadow-lg
                shadow-blue-500/20
                transition
                hover:scale-[1.02]
                disabled:opacity-50
              "

            >


              <span className="
                flex
                items-center
                justify-center
                gap-2
              ">


              {
                loading
                ?
                "Authenticating..."
                :
                <>
                  Sign in securely
                  <ArrowRight
                    size={18}
                    className="
                      group-hover:translate-x-1
                      transition
                    "
                  />
                </>
              }


              </span>


            </button>





          </form>






          {/* Footer */}


          <div className="
            mt-7
            pt-6
            border-t
            border-white/10
            text-center
          ">


            <div className="
              flex
              items-center
              justify-center
              gap-2
              text-xs
              text-slate-500
            ">

              <Lock size={13}/>

              Protected by enterprise security

            </div>



            <button

              type="button"

              onClick={() => navigate("/signup")}

              className="
                mt-4
                text-sm
                text-blue-300
                hover:text-white
                transition
              "

            >

              Create a new secure account

            </button>


          </div>




        </div>


      </motion.div>



    </div>

  );
};


export default Login;