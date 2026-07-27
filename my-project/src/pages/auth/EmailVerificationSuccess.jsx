import { motion } from "framer-motion";
import {
  CheckCircle2,
  ShieldCheck,
  ArrowRight,
  LockKeyhole,
  Sparkles,
} from "lucide-react";
import { useNavigate } from "react-router-dom";


const EmailVerificationSuccess = () => {

  const navigate = useNavigate();


  return (

<div
  className="
    relative flex justify-center items-center overflow-hidden
    min-h-screen
    px-4
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



{/* SUCCESS ICON */}

<div
  className="
    flex justify-center
  "
>

<div
  className="
    relative flex justify-center items-center
    w-24 h-24
    bg-gradient-to-br from-emerald-400 via-cyan-400 to-blue-500
    rounded-full
    shadow-xl
  "
>

<CheckCircle2
  size={48}
  className="
    text-white
  "
  /
>


<div
  className="
    top-2 right-2 absolute
    - -
  "
>

<Sparkles
  size={20}
  className="
    text-cyan-200
  "
  /
>

</div>


</div>


</div>




<h1
  className="
    mt-8
    font-bold text-white text-3xl text-center
  "
>

Email verified successfully

</h1>



<p
  className="
    mt-4
    text-slate-400 text-sm text-center leading-6
  "
>

Your SmartBudget account is now activated.
You can securely access your financial dashboard.

</p>




{/* SECURITY CARD */}

<div
  className="
    mt-8 p-4
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
  size={20}
  className="
    mt-0.5
    text-emerald-400
  "
  /
>


<div>

<p
  className="
    font-medium text-white text-sm
  "
>

Account secured

</p>


<p
  className="
    mt-1
    text-emerald-200 text-xs leading-5
  "
>

Your email identity has been confirmed and your account protection is active.

</p>


</div>


</div>


</div>




{/* NEXT STEP */}

<button

onClick={()=>navigate("/login")}

className="
mt-7
w-full
h-14
rounded-2xl
flex
items-center
justify-center
gap-2
font-semibold
text-white
bg-gradient-to-r
from-blue-500
via-cyan-400
to-emerald-400
shadow-lg
hover:opacity-90
transition
"

>

Sign in to SmartBudget

<ArrowRight size={18}/>

</button>





{/* TRUST FOOTER */}

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

<LockKeyhole
  size={14}
  className="
    text-blue-400
  "
  /
>

Encrypted authentication system

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

Protected financial environment

</div>


</div>
</div>


</motion.div>


</div>

  );

};


export default EmailVerificationSuccess;