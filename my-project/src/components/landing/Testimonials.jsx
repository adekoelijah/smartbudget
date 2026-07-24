


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
    <div
      className="
        absolute inset-0 overflow-hidden
        pointer-events-none
      "
    >

      {[...Array(18)].map((_,i)=>(
        <motion
          .div
          key={i}
          className="
            absolute
            h-2 w-2
            bg-blue-400/40
            rounded-full
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
        /
        >
      ))}


      <div
        className="
          absolute top-1/2 left-1/2
          h-[500px] w-[500px]
          bg-blue-500/10
          rounded-full
          blur-3xl
          -translate-x-1/2 -translate-y-1/2
        "
        /
      >


    </div>
  )
}



/* =============================
        CARD
============================= */

const Card = ({ item }) => {
  return (
    <motion
      .div
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
        relative overflow-hidden
        p-[1px]
        bg-gradient-to-br from-blue-400/40 via-cyan-300/10 to-emerald-400/40
        rounded-[32px]
        group
      "
    >


      {/* Animated border glow */}
      <motion
        .div
        animate={{
          rotate:360
        }}
        transition={{
          duration:20,
          repeat:Infinity,
          ease:"linear"
        }}
        className="
          absolute inset-[-100%]
          bg-[conic-gradient(from_90deg_at_50%_50%,transparent,rgba(59,130,246,.5),transparent)]
        "
        /
      >



      {/* Main card */}
      <div
        className="
          relative overflow-hidden
          p-7
          bg-[#071426]
          rounded-[31px]
          backdrop-blur-xl shadow-2xl
        "
      >



        {/* Financial network background */}

        <div
          className="
            absolute inset-0
            opacity-40
          "
        >

          <div
            className="
              absolute top-10 right-10
              h-32 w-32
              bg-blue-500/20
              rounded-full
              blur-3xl
            "
            /
          >


          <div
            className="
              absolute bottom-0 left-0
              h-40 w-40
              bg-emerald-500/10
              rounded-full
              blur-3xl
            "
            /
          >


          {/* grid */}
          <div
            className="
              absolute inset-0
              bg-[linear-gradient(rgba(255,255,255,.04)_1px,transparent_1px),linear-gradient(90deg,rgba(255,255,255,.04)_1px,transparent_1px)] bg-[size:40px_40px]
            "
            /
          >


        </div>




        <div
          className="
            relative z-10
          "
        >


        {/* Header */}

        <div
          className="
            flex justify-between items-start
          "
        >


          <div
            className="
              flex
              gap-4
            "
          >


            <div
              className="
                relative flex items-center justify-center
                h-14 w-14
                text-white text-xl font-bold
                bg-gradient-to-br from-blue-500 to-cyan-400
                rounded-2xl
                shadow-lg
              "
            >

            {item.name.charAt(0)}


            <div
              className="
                absolute
                h-5 w-5
                bg-emerald-400
                rounded-full border-4 border-[#071426]
                -bottom-1 -right-1
              "
              /
            >


            </div>




            <div>

            <h3
              className="
                text-white text-lg font-semibold
              "
            >
            {item.name}
            </h3>


            <p
              className="
                text-xs text-slate-400
              "
            >
            {item.role}
            </p>



            <p
              className="
                mt-1
                text-[11px] text-blue-300
              "
            >
            {item.company}
            </p>


            </div>


          </div>



          <div
            className="
              flex items-center
              px-3 py-1
              bg-emerald-400/10
              rounded-full border border-emerald-400/20
              gap-1
            "
          >

          <ShieldCheck
            size={14}
            className="
              text-emerald-400
            "
            /
          >

          <span
            className="
              text-[10px] text-emerald-300
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
            text-slate-300 text-sm leading-7
          "
        >

        "{item.statement}"

        </p>


        </div>






        {/* AI Financial Insight */}

        <div
          className="
            flex items-center justify-between
            mt-7 p-4
            bg-white/[0.05]
            rounded-2xl border border-white/10
          "
        >


        <div>


        <p
          className="
            text-[10px] text-slate-500 uppercase tracking-widest
          "
        >
        SmartBudget AI Insight
        </p>


        <p
          className="
            mt-2
            text-sm text-white font-semibold
          "
        >

        {item.impact}

        </p>


        </div>



        <div
          className="
            flex items-center justify-center
            h-12 w-12
            bg-gradient-to-br from-emerald-400 to-green-600
            rounded-xl
          "
        >

        <TrendingUp
          className="
            text-white
          "
          /
        >


        </div>



        </div>





        {/* Bottom banking metrics */}

        <div
          className="
            flex justify-between
            mt-5
            text-xs
          "
        >


        <div>

        <p
          className="
            text-slate-500
          "
        >
        Status
        </p>

        <p
          className="
            text-emerald-400 font-medium
          "
        >
        Financial Growth
        </p>

        </div>




        <div
          className="
            text-right
          "
        >

        <p
          className="
            text-slate-500
          "
        >
        AI Score
        </p>

        <p
          className="
            text-blue-300 font-bold
          "
        >
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
    relative overflow-hidden
    py-32
    bg-gradient-to-b from-slate-950 via-slate-900 to-slate-950
  "
>


<FinanceParticles/>



<div
  className="
    relative
    max-w-7xl
    mx-auto px-6
  "
>


<div
  className="
    max-w-3xl
  "
>


<div
  className="
    inline-flex items-center
    px-4 py-2
    text-white text-xs
    bg-white/10
    rounded-full border border-white/20
    gap-2
  "
>

<Sparkles size={14}/>

AI Verified Financial Experiences

</div>



<h2
  className="
    mt-8
    text-5xl text-white md:text-6xl font-bold tracking-tight
  "
>

What Our Users
<br/>

Have To Say

</h2>



<p
  className="
    mt-5
    text-slate-300 text-lg
  "
>

SmartBudget transforms everyday money management
into an intelligent financial operating system.

</p>



</div>



<motion
  .div
layout
  className="
    grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3
    mt-16
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
    flex justify-center
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
    transition
    group-hover:translate-x-1
  "
  /
>

</button>


</div>

}



</div>



</section>


)

}


export default Testimonials;