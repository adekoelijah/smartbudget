import { useState } from "react";
import { motion } from "framer-motion";
import {
  Mail,
  ArrowLeft,
  ShieldCheck,
  LockKeyhole,
  Send,
  CheckCircle2,
} from "lucide-react";
import { useNavigate } from "react-router-dom";
import { forgotPassword } from "../../services/authService";


const ForgotPassword = () => {

  const navigate = useNavigate();


  const [email,setEmail] = useState("");

  const [loading,setLoading] = useState(false);

  const [message,setMessage] = useState("");

  const [error,setError] = useState("");



  const handleSubmit = async(e)=>{

    e.preventDefault();


    setError("");
    setMessage("");


    if(!email){

      setError(
        "Please enter your email address."
      );

      return;

    }



    try{

      setLoading(true);


      const res =
      await forgotPassword(
        email.trim().toLowerCase()
      );


      setMessage(
        res.message ||
        "Password reset instructions have been sent."
      );


    }catch(err){

      setError(
        err?.response?.data?.message ||
        "Unable to process request."
      );


    }finally{

      setLoading(false);

    }


  };



return (

<div
  className="relative flex justify-center items-center bg-[#050B18] px-4 min-h-screen overflow-hidden"
>


{/* BACKGROUND */}

<div
  className="absolute inset-0"
>

<div
  className="top-[-150px] left-[-120px] absolute bg-blue-500/20 blur-[140px] rounded-full w-[420px] h-[420px]"
  /
>


<div
  className="right-[-120px] bottom-[-120px] absolute bg-emerald-400/10 blur-[130px] rounded-full w-[420px] h-[420px]"
  /
>


</div>





<motion
  .div

initial={{
opacity:0,
y:25
}}

animate={{
opacity:1,
y:0
}}

transition={{
duration:.5
}}
  className="relative w-full max-w-md"
>


<div
  className="bg-white/[0.06] shadow-[0_40px_120px_rgba(0,0,0,.6)] backdrop-blur-2xl p-8 sm:p-10 border border-white/10 rounded-[28px]"
>



{/* ICON */}

<div
  className="flex justify-center"
>

<div
  className="flex justify-center items-center bg-gradient-to-br from-blue-500 via-cyan-400 to-emerald-400 shadow-xl rounded-3xl w-20 h-20"
>

<LockKeyhole
  size={38}
  className="text-white"
  /
>


</div>

</div>





<h1
  className="mt-7 font-bold text-white text-2xl text-center"
>

Forgot your password?

</h1>



<p
  className="mt-3 text-slate-400 text-sm text-center leading-6"
>

Enter your registered email address and we will send you a secure password reset link.

</p>






<form
  onSubmit={handleSubmit}
  className="space-y-5 mt-8"
>


<div>

<label
  className="text-slate-400 text-xs"
>

Email address

</label>


<div
  className="relative mt-2"
>


<Mail
  size={18}
  className="top-1/2 left-4 absolute text-slate-400 -translate-y-1/2"
  /
>


<input

type="email"

value={email}

onChange={(e)=>setEmail(e.target.value)}

placeholder="you@example.com"

className="
w-full
h-14
pl-12
pr-4
rounded-2xl
bg-white/5
border
border-white/10
text-white
placeholder:text-slate-500
outline-none
focus:border-cyan-400/50
focus:bg-white/10
transition
"

/>


</div>


</div>





{
error &&

<div
  className="bg-red-500/10 p-3 border border-red-500/20 rounded-xl text-red-300 text-sm"
>

{error}

</div>

}






{
message &&

<div
  className="flex items-start gap-2 bg-emerald-400/10 p-4 border border-emerald-400/20 rounded-xl text-emerald-200 text-sm"
>

<CheckCircle2
  size={18}
  className="text-emerald-400"
  /
>

<span>

{message}

</span>

</div>

}






<button
  disabled={loading}
  className="flex justify-center items-center gap-2 bg-gradient-to-r from-blue-500 via-cyan-400 to-emerald-400 hover:opacity-90 disabled:opacity-50 shadow-lg rounded-2xl w-full h-14 font-semibold text-white transition"
>

<Send size={18}/>


{
loading
?
"Sending reset link..."
:
"Send reset link"
}


</button>


</form>







<button

onClick={()=>navigate("/login")}

className="
mt-7
w-full
flex
items-center
justify-center
gap-2
text-sm
text-slate-400
hover:text-white
transition
"

>

<ArrowLeft size={16}/>

Back to login

</button>







{/* SECURITY */}

<div
  className="space-y-3 mt-8 pt-6 border-white/10 border-t"
>


<div
  className="flex items-center gap-2 text-slate-400 text-xs"
>

<ShieldCheck
  size={14}
  className="text-emerald-400"
  /
>

Secure password recovery

</div>



<div
  className="flex items-center gap-2 text-slate-400 text-xs"
>

<LockKeyhole
  size={14}
  className="text-blue-400"
  /
>

Encrypted account protection

</div>


</div>




</div>

</motion.div>



</div>


);

};
export default ForgotPassword;