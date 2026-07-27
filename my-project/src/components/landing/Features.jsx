



import { motion } from "framer-motion";
import {
  BrainCircuit,
  Wallet,
  BarChart3,
  ShieldCheck,
  Activity,
  Target,
  Sparkles,
  ArrowUpRight,
} from "lucide-react";


const container = {
  hidden: {},

  show: {
    transition: {
      staggerChildren: 0.08,
    },
  },
};


const item = {
  hidden: {
    opacity: 0,
    y: 25,
  },

  show: {
    opacity: 1,
    y: 0,

    transition: {
      duration: 0.5,
      ease: [0.22, 1, 0.36, 1],
    },
  },
};




const features = [

  {
    title: "Smart Budget Intelligence",

    description:
      "Automatically organize income, expenses, and financial goals into a clear spending strategy.",

    icon: Wallet,

    color:
      "from-blue-500/20 to-cyan-400/20",
  },


  {
    title: "Real-Time Cashflow Tracking",

    description:
      "Monitor every financial movement with instant visibility into your money flow.",

    icon: Activity,

    color:
      "from-emerald-500/20 to-teal-400/20",
  },


  {
    title: "AI Financial Insights",

    description:
      "Understand your spending behavior through intelligent recommendations and patterns.",

    icon: BrainCircuit,

    color:
      "from-purple-500/20 to-indigo-400/20",
  },


  {
    title: "Advanced Analytics",

    description:
      "Transform financial activity into meaningful reports, trends, and future decisions.",

    icon: BarChart3,

    color:
      "from-orange-500/20 to-yellow-400/20",
  },


  {
    title: "Secure Financial Protection",

    description:
      "Your financial information is protected with secure authentication and privacy controls.",

    icon: ShieldCheck,

    color:
      "from-green-500/20 to-lime-400/20",
  },


  {
    title: "Goal-Based Money Planning",

    description:
      "Create targets, track progress, and build disciplined habits toward your financial goals.",

    icon: Target,

    color:
      "from-pink-500/20 to-rose-400/20",
  },


];





const FeatureCard = ({feature}) => {


const Icon = feature.icon;


return (

<motion
  .div

variants={item}

whileHover={{
 y:-8,
}}
  className="group relative bg-white/60 shadow-[0_20px_50px_rgba(15,23,42,0.08)] hover:shadow-[0_30px_70px_rgba(15,23,42,0.15)] backdrop-blur-xl p-7 border border-white/40 rounded-[28px] overflow-hidden transition-all duration-500"
>


{/* PRISM LIGHT */}

<div

className={`
absolute
-top-20
-right-20
h-48
w-48
rounded-full
blur-3xl
bg-gradient-to-br
${feature.color}
opacity-70
group-hover:opacity-100
transition
`}

/>





{/* ICON */}

<div
  className="relative flex justify-between items-center"
>


<div
  className="flex justify-center items-center bg-white shadow-sm border border-slate-200 rounded-2xl w-14 h-14"
>


<Icon
  size={25}
  className="text-slate-700"
  /
>


</div>




<div
  className="flex justify-center items-center bg-slate-100 opacity-0 group-hover:opacity-100 rounded-full w-8 h-8 transition"
>

<ArrowUpRight
size={15}
/>


</div>


</div>






{/* CONTENT */}


<h3
  className="relative mt-7 font-semibold text-slate-900 text-lg tracking-tight"
>

{feature.title}


</h3>




<p
  className="relative mt-3 text-slate-600 text-sm leading-6"
>

{feature.description}


</p>






{/* MODULE FOOTER */}


<div
  className="relative flex items-center gap-2 mt-7 text-[10px] text-slate-400 uppercase tracking-[0.18em]"
>

<Sparkles
size={12}
/>

Smart financial Savings


</div>



</motion.div>

);


};








const Features = () => {


return (


<section
  className="relative bg-[#F8FAFC] py-32 overflow-hidden"
>




{/* BACKGROUND PRISM SYSTEM */}


<div
  className="absolute inset-0"
>


<div
  className="top-[-200px] left-1/2 absolute bg-blue-400/20 blur-[140px] rounded-full w-[600px] h-[600px] -translate-x-1/2"
  /
>



<div
  className="right-[-100px] bottom-[-200px] absolute bg-emerald-300/20 blur-[120px] rounded-full w-[500px] h-[500px]"
  /
>



<div
  className="
    absolute inset-0
    bg-[linear-gradient(to_right,#cbd5e1_1px,transparent_1px), bg-[size:70px_70px]
    opacity-[0.35]
    linear-gradient(to_bottom,#cbd5e1_1px,transparent_1px)]
  "
  /
>


</div>









<div
  className="relative mx-auto px-6 max-w-7xl"
>




{/* HEADER */}


<div
  className="max-w-3xl"
>


<div
  className="inline-flex items-center gap-2 bg-white shadow-sm px-4 py-2 border border-slate-200 rounded-full text-slate-600 text-xs"
>


<Sparkles
  size={14}
  className="text-blue-500"
  /
>


Smart financial ecosystem


</div>




<h2
  className="mt-8 font-bold text-slate-900 text-4xl md:text-6xl leading-[1.05] tracking-tight"
>
How It Works
</h2>

<p
  className="mt-6 max-w-2xl text-slate-600 text-base leading-7"
>


SmartBudget combines intelligent budgeting,
financial analytics, security, and goal planning
into one powerful personal finance platform.


</p>


</div>







{/* FEATURE GRID */}


<motion
  .div

variants={container}

initial="hidden"

whileInView="show"

viewport={{
once:true,
amount:.2
}}
  className="gap-7 grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 mt-16"
>


{
features.map((feature,index)=>(

<FeatureCard

key={index}

feature={feature}

/>

))
}



</motion.div>






</div>



</section>


);


};


export default Features;