


import { useState } from "react";
import { motion, AnimatePresence } from "framer-motion";

import {
  ShieldCheck,
  CheckCircle2,
  ArrowRight,
  TrendingUp,
  Sparkles,
  Wallet,
  Activity,
} from "lucide-react";


const testimonials = [
  {
    id: 1,
    name: "David O.",
    role: "Independent Consultant",
    company: "Upwork",
    statement:
      "SmartBudget gives structured visibility into monthly cashflow. Everything is now intentional and traceable.",
    impact: "Savings discipline improved by 38%",
  },

  {
    id: 2,
    name: "Sarah K.",
    role: "E-commerce Founder",
    company: "Shopify Merchant",
    statement:
      "Expense governance became proactive. We now detect financial leaks before they scale.",
    impact: "Overspending reduced by 42%",
  },

  {
    id: 3,
    name: "John M.",
    role: "Software Engineer",
    company: "GitHub",
    statement:
      "The system feels engineered like infrastructure, not a budgeting app.",
    impact: "Stable monthly savings achieved",
  },

  {
    id: 4,
    name: "Grace A.",
    role: "Financial Consultant",
    company: "Deloitte",
    statement:
      "Reporting clarity is enterprise-grade. It matches institutional financial tools.",
    impact: "Reporting accuracy +64%",
  },

  {
    id: 5,
    name: "Michael T.",
    role: "Startup Founder",
    company: "Stripe Ecosystem",
    statement:
      "We use SmartBudget for internal financial governance across teams.",
    impact: "Burn rate reduced significantly",
  },

  {
    id: 6,
    name: "Ada N.",
    role: "Product Manager",
    company: "Notion",
    statement:
      "Forecasting became reliable. Financial planning is now structured and predictable.",
    impact: "Forecast accuracy improved",
  },
];



/* =============================
   FLOATING FINANCIAL NETWORK
============================= */

const FinanceParticles = () => {

  return (
    <div className="absolute inset-0 overflow-hidden pointer-events-none">

      {[...Array(18)].map((_,i)=>(
        <motion.div
          key={i}
          className="
            absolute
            h-2
            w-2
            rounded-full
            bg-blue-400/40
          "
          initial={{
            x:Math.random()*100+"%",
            y:Math.random()*100+"%",
          }}

          animate={{
            y:[
              Math.random()*100+"%",
              Math.random()*100+"%"
            ],

            opacity:[
              .2,
              1,
              .2
            ]
          }}

          transition={{
            duration:6+Math.random()*5,
            repeat:Infinity,
            ease:"easeInOut"
          }}
        />
      ))}


      <div
      className="
      absolute
      top-1/2
      left-1/2
      -translate-x-1/2
      -translate-y-1/2
      h-[500px]
      w-[500px]
      rounded-full
      bg-blue-500/10
      blur-3xl
      "
      />


    </div>
  )
}



/* =============================
        CARD
============================= */

const Card = ({ item }) => {
  return (
    <motion.div
      whileHover={{
        y: -12,
        rotateX: 5,
        rotateY: -5,
        scale: 1.03,
      }}
      transition={{
        type: "spring",
        stiffness: 180,
      }}
      className="
      group
      relative
      rounded-[32px]
      overflow-hidden
      p-[1px]
      bg-gradient-to-br
      from-blue-400/40
      via-cyan-300/10
      to-emerald-400/40
      "
    >


      {/* Animated border glow */}
      <motion.div
        animate={{
          rotate:360
        }}
        transition={{
          duration:20,
          repeat:Infinity,
          ease:"linear"
        }}
        className="
        absolute
        inset-[-100%]
        bg-[conic-gradient(from_90deg_at_50%_50%,transparent,rgba(59,130,246,.5),transparent)]
        "
      />



      {/* Main card */}
      <div
        className="
        relative
        rounded-[31px]
        overflow-hidden
        bg-[#071426]
        backdrop-blur-xl
        p-7
        shadow-2xl
        "
      >



        {/* Financial network background */}

        <div
          className="
          absolute
          inset-0
          opacity-40
          "
        >

          <div
          className="
          absolute
          top-10
          right-10
          h-32
          w-32
          rounded-full
          bg-blue-500/20
          blur-3xl
          "
          />


          <div
          className="
          absolute
          bottom-0
          left-0
          h-40
          w-40
          rounded-full
          bg-emerald-500/10
          blur-3xl
          "
          />


          {/* grid */}
          <div
          className="
          absolute
          inset-0
          bg-[linear-gradient(rgba(255,255,255,.04)_1px,transparent_1px),linear-gradient(90deg,rgba(255,255,255,.04)_1px,transparent_1px)]
          bg-[size:40px_40px]
          "
          />


        </div>




        <div className="relative z-10">


        {/* Header */}

        <div
        className="
        flex
        justify-between
        items-start
        "
        >


          <div className="flex gap-4">


            <div
            className="
            relative
            h-14
            w-14
            rounded-2xl
            bg-gradient-to-br
            from-blue-500
            to-cyan-400
            flex
            items-center
            justify-center
            text-white
            text-xl
            font-bold
            shadow-lg
            "
            >

            {item.name.charAt(0)}


            <div
            className="
            absolute
            -bottom-1
            -right-1
            h-5
            w-5
            rounded-full
            bg-emerald-400
            border-4
            border-[#071426]
            "
            />


            </div>




            <div>

            <h3
            className="
            text-white
            font-semibold
            text-lg
            "
            >
            {item.name}
            </h3>


            <p
            className="
            text-xs
            text-slate-400
            "
            >
            {item.role}
            </p>



            <p
            className="
            mt-1
            text-[11px]
            text-blue-300
            "
            >
            {item.company}
            </p>


            </div>


          </div>



          <div
          className="
          flex
          items-center
          gap-1
          rounded-full
          px-3
          py-1
          bg-emerald-400/10
          border
          border-emerald-400/20
          "
          >

          <ShieldCheck
          size={14}
          className="text-emerald-400"
          />

          <span
          className="
          text-[10px]
          text-emerald-300
          "
          >
          VERIFIED
          </span>


          </div>


        </div>





        {/* Statement */}

        <div
        className="
        mt-8
        "
        >

        <p
        className="
        text-slate-300
        leading-7
        text-sm
        "
        >

        "{item.statement}"

        </p>


        </div>






        {/* AI Financial Insight */}

        <div
        className="
        mt-7
        flex
        items-center
        justify-between
        rounded-2xl
        bg-white/[0.05]
        border
        border-white/10
        p-4
        "
        >


        <div>


        <p
        className="
        text-[10px]
        uppercase
        tracking-widest
        text-slate-500
        "
        >
        SmartBudget AI Insight
        </p>


        <p
        className="
        mt-2
        text-sm
        font-semibold
        text-white
        "
        >

        {item.impact}

        </p>


        </div>



        <div
        className="
        h-12
        w-12
        rounded-xl
        bg-gradient-to-br
        from-emerald-400
        to-green-600
        flex
        items-center
        justify-center
        "
        >

        <TrendingUp
        className="text-white"
        />


        </div>



        </div>





        {/* Bottom banking metrics */}

        <div
        className="
        mt-5
        flex
        justify-between
        text-xs
        "
        >


        <div>

        <p className="text-slate-500">
        Status
        </p>

        <p className="text-emerald-400 font-medium">
        Financial Growth
        </p>

        </div>




        <div className="text-right">

        <p className="text-slate-500">
        AI Score
        </p>

        <p className="text-blue-300 font-bold">
        98.4%
        </p>


        </div>


        </div>



        </div>



      </div>


    </motion.div>
  );
};



/* =============================
        MAIN
============================= */


const Testimonials =()=>{


const [visibleCount,setVisibleCount]=useState(3);


const visible=testimonials.slice(0,visibleCount);



return (

<section
className="
relative
overflow-hidden
py-32
bg-gradient-to-b
from-slate-950
via-slate-900
to-slate-950
"
>


<FinanceParticles/>



<div
className="
relative
max-w-7xl
mx-auto
px-6
"
>


<div
className="
max-w-3xl
"
>


<div
className="
inline-flex
items-center
gap-2
rounded-full
px-4
py-2
bg-white/10
border
border-white/20
text-white
text-xs
"
>

<Sparkles size={14}/>

AI Verified Financial Experiences

</div>



<h2
className="
mt-8
text-5xl
md:text-6xl
font-bold
tracking-tight
text-white
"
>

Thousands of decisions.
<br/>

One smarter financial future.

</h2>



<p
className="
mt-5
text-slate-300
text-lg
"
>

SmartBudget transforms everyday money management
into an intelligent financial operating system.

</p>



</div>



<motion.div
layout
className="
mt-16
grid
grid-cols-1
md:grid-cols-2
lg:grid-cols-3
gap-7
"
>


<AnimatePresence>


{
visible.map(item=>(

<motion.div
layout
key={item.id}
initial={{
opacity:0,
y:40
}}
animate={{
opacity:1,
y:0
}}
>

<Card item={item}/>


</motion.div>

))
}


</AnimatePresence>



</motion.div>




{
visibleCount < testimonials.length &&

<div
className="
flex
justify-center
mt-14
"
>

<button

onClick={()=>setVisibleCount(v=>v+3)}

className="
group
flex
items-center
gap-3
rounded-xl
px-7
py-3
bg-white
text-slate-900
font-medium
hover:scale-105
transition
"
>

View more financial journeys

<ArrowRight
size={17}
className="
group-hover:translate-x-1
transition
"
/>

</button>


</div>

}



</div>



</section>


)

}


export default Testimonials;