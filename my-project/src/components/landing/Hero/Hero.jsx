
import { motion } from "framer-motion";
import { Link } from "react-router-dom";

import {
  ArrowRight,
  ShieldCheck,
  CheckCircle2,
} from "lucide-react";
import HeroBackground from "./HeroBackground";
import FinancialDashboard from "./FinancialDashboard";
import FloatingInsights from "./FloatingInsights";
import SecurityBadge from "./SecurityBadge";
import AIPreview from "./AIPreview";



const fadeUp = {

  hidden:{
    opacity:0,
    y:40
  },


  visible:(delay=0)=>({

    opacity:1,

    y:0,

    transition:{
      duration:.8,
      delay,
      ease:[
        0.22,
        1,
        0.36,
        1
      ]
    }

  })

};





const trustPoints=[

"Bank-grade security",

"AI financial intelligence",

"Real-time analytics",

"Smart budgeting automation"

];





const Hero = ()=>{


return (

<section
  className="
    relative overflow-hidden
    pt-36 pb-32
    bg-[#020617]
  "
>


{/* BACKGROUND */}

<HeroBackground />





<div
  className="
    relative
    max-w-7xl
    mx-auto px-5 sm:px-8 lg:px-10
  "
>



<div
  className="
    grid lg:grid-cols-[1fr_.95fr] items-center
    gap-20
  "
>





{/* ==========================
LEFT CONTENT
========================== */}


<div>


{/* SECURITY BADGE */}


<motion
  .div

variants={fadeUp}

initial="hidden"

animate="visible"

custom={0}
  className="
    inline-flex items-center
    px-5 py-3
    bg-white/[0.05]
    rounded-full border border-white/10
    backdrop-blur-xl
    gap-3
  "
>


<div
  className="
    flex items-center justify-center
    h-8 w-8
    bg-emerald-500/20
    rounded-full
  "
>

<ShieldCheck
  size={17}
  className="
    text-emerald-400
  "
  /
>


</div>



<span
  className="
    text-sm text-slate-200 font-medium
  "
>

Secure intelligent money management

</span>



</motion.div>







{/* HEADLINE */}


<motion
  .h1

variants={fadeUp}

initial="hidden"

animate="visible"

custom={.1}
  className="
    mt-10
    text-white text-[52px] sm:text-[68px] lg:text-[82px] font-semibold
    tracking-[-0.06em] leading-[.92]
  "
>


From daily chaos

<br/>


to 

<br/>


<span
  className="
    text-emerald-400
  "
>

structured clarity.

</span>


</motion.h1>







{/* DESCRIPTION */}



<motion
  .p

variants={fadeUp}

initial="hidden"

animate="visible"

custom={.2}
  className="
    max-w-xl
    mt-8
    text-lg text-slate-400 leading-8
  "
>

SmartBudget combines AI-powered financial
intelligence, automated budgeting, secure
transactions, and real-time insights into one
powerful financial operating system.


</motion.p>









{/* BUTTONS */}



<motion
  .div

variants={fadeUp}

initial="hidden"

animate="visible"

custom={.3}
  className="
    flex flex-col sm:flex-row
    mt-10
    gap-4
  "
>



<Link
  to="/signup"
  className="
    relative overflow-hidden flex items-center justify-center
    h-14
    px-8
    text-black font-semibold
    bg-emerald-400
    rounded-2xl
    shadow-[0_20px_60px_rgba(16,185,129,.35)] transition
    hover:scale-[1.03]
    group gap-3
  "
>


<span
  className="
    relative z-10
  "
>

Start Managing Money

</span>



<ArrowRight
  size={18}
  className="
    relative z-10
    transition
    group-hover:translate-x-1
  "
  /
>


<div
  className="
    absolute inset-0
    bg-gradient-to-r from-emerald-300 to-cyan-300
    opacity-0 transition
    group-hover:opacity-100
  "
  /
>


</Link>







<Link
  to="/login"
  className="
    flex items-center justify-center
    h-14
    px-8
    text-white font-semibold
    bg-white/[0.05] hover:bg-white/10
    rounded-2xl border border-white/10
    backdrop-blur-xl transition
  "
>

View Dashboard

</Link>



</motion.div>










{/* TRUST */}

<motion
  .div

variants={fadeUp}

initial="hidden"

animate="visible"

custom={.4}
  className="
    grid sm:grid-cols-2
    mt-12
    gap-4
  "
>


{

trustPoints.map((item,index)=>(


<div
  key={index}
  className="
    flex items-center
    gap-3
  "
>


<CheckCircle2
  size={17}
  className="
    text-emerald-400
  "
  /
>


<span
  className="
    text-sm text-slate-300
  "
>

{item}

</span>


</div>


))


}


</motion.div>






</div>









{/* ==========================
RIGHT INTELLIGENCE AREA
========================== */}



<motion
  .div

initial={{
opacity:0,
x:60
}}

animate={{
opacity:1,
x:0
}}

transition={{

duration:1,

delay:.3

}}
  className="
    relative
  "
>


<FinancialDashboard />



{/* FLOATING ELEMENTS */}


<div
  className="
    absolute inset-0
    pointer-events-none
  "
>


<FloatingInsights />

</div>



</motion.div>



</div>









{/* ==========================
BOTTOM INTELLIGENCE ROW
========================== */}



<div
  className="
    grid lg:grid-cols-2 items-center
    mt-24
    gap-10
  "
>


<AIPreview />

<SecurityBadge />


</div>





</div>



</section>


)

}



export default Hero;