import { motion } from "framer-motion";
import {
  MailCheck,
  ShieldCheck,
  ArrowRight,
  RefreshCcw,
  Lock,
} from "lucide-react";
import { useLocation, useNavigate } from "react-router-dom";
import { useState } from "react";
import { resendVerificationEmail } from "../../services/authService";


const VerifyEmail = () => {

  const navigate = useNavigate();

  const location = useLocation();


  const email =
    location.state?.email || "";


  const [loading,setLoading] =
    useState(false);


  const [message,setMessage] =
    useState("");



  const handleResend = async()=>{


    if(!email){

      setMessage(
        "Please enter your email again."
      );

      return;

    }


    try{

      setLoading(true);

      const res =
      await resendVerificationEmail(email);


      setMessage(
        res.message ||
        "Verification email sent."
      );


    }catch(error){

      setMessage(
        error?.response?.data?.message ||
        "Unable to resend email."
      );


    }finally{

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


{/* Background */}

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
    right-[-120px] bottom-[-120px] absolute
    w-[400px] h-[400px]
    bg-emerald-400/10
    rounded-full
    blur-[130px]
  "
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
  className="
    relative
    w-full max-w-md
  "
>


<div
  className="
    p-8 sm:p-10
    bg-white/[0.06]
    border border-white/10 rounded-[28px]
    shadow-[0_40px_120px_rgba(0,0,0,.6)] backdrop-blur-2xl
  "
>



{/* ICON */}

<div
  className="
    flex justify-center
  "
>

<div
  className="
    flex justify-center items-center
    w-20 h-20
    bg-gradient-to-br from-blue-500 via-cyan-400 to-emerald-400
    rounded-3xl
    shadow-xl
  "
>

<MailCheck
  size={38}
  className="
    text-white
  "
  /
>


</div>


</div>




<h1
  className="
    mt-7
    font-bold text-white text-2xl text-center
  "
>

Verify your email

</h1>


<p
  className="
    mt-3
    text-slate-400 text-sm text-center leading-6
  "
>

We sent a verification link to

</p>


{
email &&

<p
  className="
    mt-2
    font-medium text-cyan-300 text-center break-all
  "
>

{email}

</p>

}




<div
  className="
    mt-7 p-4
    bg-emerald-400/10
    border border-emerald-400/20 rounded-2xl
  "
>

<div
  className="
    flex items-start
    gap-3
  "
>

<ShieldCheck
  size={18}
  className="
    mt-0.5
    text-emerald-400
  "
  /
>


<p
  className="
    text-emerald-200 text-xs leading-5
  "
>

Your account remains protected until your email address is verified.

</p>


</div>


</div>





{
message &&

<div
  className="
    mt-5 p-3
    text-slate-300 text-sm text-center
    bg-white/5
    border border-white/10 rounded-xl
  "
>

{message}

</div>

}





<button
  onClick={handleResend}

disabled={loading}
  className="
    flex justify-center items-center
    w-full h-12
    mt-6
    text-white
    bg-white/10 hover:bg-white/20
    border border-white/10 rounded-xl
    disabled:opacity-50 transition
    gap-2
  "
>

<RefreshCcw
size={17}
className={
loading
?
"animate-spin"
:
""
}
/>

{
loading
?
"Sending..."
:
"Resend verification email"
}


</button>





<button

onClick={()=>navigate("/login")}

className="
mt-4
w-full
h-12
rounded-xl
flex
items-center
justify-center
gap-2
bg-gradient-to-r
from-blue-500
via-cyan-400
to-emerald-400
text-white
font-semibold
shadow-lg
hover:opacity-90
transition
"

>

Continue to login

<ArrowRight size={17}/>

</button>






<div
  className="
    space-y-3 mt-8 pt-6
    border-white/10 border-t
  "
>


<div
  className="
    flex items-center
    text-slate-400 text-xs
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

Secure authentication protection

</div>



<div
  className="
    flex items-center
    text-slate-400 text-xs
    gap-2
  "
>

<ShieldCheck
  size={14}
  className="
    text-emerald-400
  "
  /
>

Bank-grade account verification

</div>


</div>



</div>


</motion.div>


</div>

);


};


export default VerifyEmail;