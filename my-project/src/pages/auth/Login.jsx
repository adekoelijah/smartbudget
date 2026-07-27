



import { useState } from "react";
import { useNavigate } from "react-router-dom";
import {
  Eye,
  EyeOff,
  Lock,
  ShieldCheck,
  Fingerprint,
  ArrowRight,
} from "lucide-react";
import { useAuth } from "../../hooks/useAuth";
import { googleLogin } from "../../services/authService";

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


    if (form.password.length < 8) {
  return "Invalid email or password";
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


if(
result.message.includes("verify")
){

setTimeout(()=>{

navigate(
"/verify-email"
);

},1500);

}


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

    <div
      className="
        relative flex justify-center items-center overflow-hidden
        min-h-screen
        px-4
        bg-[#050B18]
      "
    >


      {/* Background Effects */}

      <div
        className="
          absolute inset-0
        "
      >

        <div
          className="
            top-[-200px] left-[-150px] absolute
            w-[500px] h-[500px]
            bg-blue-600/20
            rounded-full
            blur-[120px]
          "
          /
        >


        <div
          className="
            right-[-150px] bottom-[-200px] absolute
            w-[500px] h-[500px]
            bg-cyan-500/20
            rounded-full
            blur-[120px]
          "
          /
        >


        <div
          className="
            absolute inset-0
            bg-[linear-gradient(to_right,#fff_1px,transparent_1px),linear-gradient(to_bottom,#fff_1px,transparent_1px)] bg-[size:60px_60px]
            opacity-[0.04]
          "
          /
        >


      </div>




      <div
        className="
          relative
          w-full max-w-md
        "
      >



        <div
          className="
            isolate relative
            p-6 sm:p-8
            bg-white/[0.06]
            border border-white/10 rounded-3xl
            shadow-[0_30px_100px_rgba(0,0,0,.55)] backdrop-blur-xl
          "
        >



          {/* Header */}


          <div
            className="
              text-center
            "
          >


            <div
              className="
                flex justify-center items-center
                w-16 h-16
                mx-auto mb-5
                bg-gradient-to-br from-blue-500 to-cyan-400
                rounded-2xl
                shadow-lg
              "
            >

              <Fingerprint
                size={30}
                className="
                  text-white
                "
                /
              >

            </div>




            <h1
              className="
                font-bold text-white text-2xl tracking-tight
              "
            >

              Welcome Back

            </h1>



            <p
              className="
                mt-2
                text-slate-400 text-sm leading-6
              "
            >

              Securely access your SmartBudget financial workspace.

            </p>


          </div>





          {/* Security Badge */}


          <div
            className="
              flex justify-center items-center
              mt-6 py-3
              text-emerald-300 text-xs
              bg-emerald-500/10
              border border-emerald-400/20 rounded-xl
              gap-2
            "
          >


            <ShieldCheck size={15}/>

            256-bit encrypted authentication


          </div>





          <form
            onSubmit={handleSubmit}
            className="
              space-y-5 mt-7
            "
          >




            {/* Email */}


            <div>


              <label
                className="
                  ml-1
                  text-slate-400 text-xs
                "
              >

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
                  w-full h-12
                  mt-2 px-4
                  text-white placeholder:text-slate-500
                  bg-white/10
                  border border-white/10 focus:border-blue-400 rounded-xl
                  outline-none focus:ring-4 focus:ring-blue-500/20
                  transition
                "
                /
              >


            </div>







            {/* Password */}



            <div>


              <label
                className="
                  ml-1
                  text-slate-400 text-xs
                "
              >

                Password

              </label>




              <div
                className="
                  relative
                  mt-2
                "
              >


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
                    w-full h-12
                    px-4 pr-12
                    text-white placeholder:text-slate-500
                    bg-white/10
                    border border-white/10 focus:border-blue-400 rounded-xl
                    outline-none focus:ring-4 focus:ring-blue-500/20
                    transition
                  "
                  /
                >




                <button

                  type="button"

                  onClick={() =>
                    setShowPassword((prev)=>!prev)
                  }

                  className="top-1/2 right-3 absolute text-slate-300 hover:text-white transition -translate-y-1/2"

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

                <div
                  className="
                    px-4 py-3
                    text-red-300 text-sm
                    bg-red-500/10
                    border border-red-400/20 rounded-xl
                  "
                >

                  {error}

                </div>

              )
            }


            <div
              className="
                flex justify-end
              "
            >

<button

type="button"

onClick={()=>navigate("/forgot-password")}

className="
text-xs
text-blue-300
hover:text-white
transition
"

>

Forgot password?

</button>


</div>







            <button
              type="submit"

              disabled={loading}
              className="
                relative
                w-full h-12
                font-semibold text-white
                bg-gradient-to-r from-blue-500 to-cyan-400
                rounded-xl
                disabled:opacity-50 shadow-blue-500/20 shadow-lg transition
                hover:scale-[1.02]
                group
              "
            >


              <span
                className="
                  flex justify-center items-center
                  gap-2
                "
              >


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
                      transition
                      group-hover:translate-x-1
                    "
                    /
                  >
                </>
              }


              </span>


            </button>


            <div
              className="
                flex items-center
                my-6
                gap-3
              "
            >

<div
  className="
    flex-1
    h-px
    bg-white/10
  "
  /
>

<span
  className="
    text-slate-500 text-xs
  "
>
OR
</span>

<div
  className="
    flex-1
    h-px
    bg-white/10
  "
  /
>

</div>



<button
  type="button"

onClick={googleLogin}
  className="
    w-full h-12
    font-medium text-white
    bg-white/5 hover:bg-white/10
    border border-white/10 rounded-xl
    transition
    curson-pointer
  "
>

Continue with Google 

</button>





          </form>






          {/* Footer */}


          <div
            className="
              mt-7 pt-6
              text-center
              border-white/10 border-t
            "
          >


            <div
              className="
                flex justify-center items-center
                text-slate-500 text-xs
                gap-2
              "
            >

              <Lock size={13}/>

              Protected by enterprise security

            </div>



            <button

              type="button"

              onClick={() => navigate("/signup")}

              className="mt-4 text-blue-300 hover:text-white text-sm transition"

            >

              Create a new secure account

            </button>

            


          </div>




        </div>


      </div>



    </div>

  );
};


export default Login;