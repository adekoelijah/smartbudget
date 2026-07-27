import { motion } from "framer-motion";
import {
  ShieldCheck,
  Loader2,
  WalletCards,
} from "lucide-react";


const AuthLoading = ({
  message = "Securing your SmartBudget session..."
}) => {


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
    top-[-120px] left-[-120px] absolute
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
    w-[420px] h-[420px]
    bg-emerald-400/10
    rounded-full
    blur-[140px]
  "
  /
>


</div>






<motion
  .div

initial={{
opacity:0,
scale:.96
}}

animate={{
opacity:1,
scale:1
}}

transition={{
duration:.4
}}
  className="
    relative
    w-full max-w-sm
  "
>


<div
  className="
    p-8
    text-center
    bg-white/[0.06]
    border border-white/10 rounded-[30px]
    shadow-[0_40px_120px_rgba(0,0,0,.5)] backdrop-blur-2xl
  "
>



{/* Logo Icon */}

<div
  className="
    flex justify-center
  "
>

<div
  className="
    relative flex justify-center items-center
    w-20 h-20
    bg-gradient-to-br from-blue-500 via-cyan-400 to-emerald-400
    rounded-3xl
    shadow-xl
  "
>


<WalletCards
  size={38}
  className="
    text-white
  "
  /
>



<motion
  .div

animate={{
rotate:360
}}

transition={{
duration:2,
repeat:Infinity,
ease:"linear"
}}
  className="
    absolute
    border border-cyan-400/20 rounded-[32px]
    -inset-2
  "
  /
>


</div>

</div>







<h2
  className="
    mt-7
    font-bold text-white text-xl
  "
>

SmartBudget

</h2>




<p
  className="
    mt-3
    text-slate-400 text-sm leading-6
  "
>

{message}

</p>






<div
  className="
    flex justify-center
    mt-8
  "
>


<div
  className="
    flex items-center
    text-slate-300 text-sm
    gap-3
  "
>


<Loader2
  size={18}
  className="
    text-cyan-400
    animate-spin
  "
  /
>


Authenticating securely...

</div>


</div>







<div
  className="
    mt-8 pt-6
    border-white/10 border-t
  "
>


<div
  className="
    flex justify-center items-center
    text-slate-400 text-xs
    gap-2
  "
>


<ShieldCheck
  size={15}
  className="
    text-emerald-400
  "
  /
>


Bank-grade account protection


</div>


</div>






</div>


</motion.div>



</div>


);


};


export default AuthLoading;