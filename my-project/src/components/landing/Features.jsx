



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
  className="
    relative overflow-hidden
    p-7
    bg-white/60
    rounded-[28px] border border-white/40
    backdrop-blur-xl
    shadow-[0_20px_50px_rgba(15,23,42,0.08)] hover:shadow-[0_30px_70px_rgba(15,23,42,0.15)]
    transition-all duration-500
    group
  "
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
  className="
    relative flex items-center justify-between
  "
>


<div
  className="
    flex items-center justify-center
    h-14 w-14
    bg-white
    rounded-2xl border border-slate-200
    shadow-sm
  "
>


<Icon
  size={25}
  className="
    text-slate-700
  "
  /
>


</div>




<div
  className="
    flex items-center justify-center
    h-8 w-8
    bg-slate-100
    rounded-full
    opacity-0 transition
    group-hover:opacity-100
  "
>

<ArrowUpRight
size={15}
/>


</div>


</div>






{/* CONTENT */}


<h3
  className="
    relative
    mt-7
    text-lg text-slate-900 font-semibold tracking-tight
  "
>

{feature.title}


</h3>




<p
  className="
    relative
    mt-3
    text-sm text-slate-600 leading-6
  "
>

{feature.description}


</p>






{/* MODULE FOOTER */}


<div
  className="
    relative flex items-center
    mt-7
    text-[10px] text-slate-400 uppercase tracking-[0.18em]
    gap-2
  "
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
  className="
    relative overflow-hidden
    py-32
    bg-[#F8FAFC]
  "
>




{/* BACKGROUND PRISM SYSTEM */}


<div
  className="
    absolute inset-0
  "
>


<div
  className="
    absolute top-[-200px] left-1/2
    h-[600px] w-[600px]
    bg-blue-400/20
    rounded-full
    blur-[140px]
    -translate-x-1/2
  "
  /
>



<div
  className="
    absolute bottom-[-200px] right-[-100px]
    h-[500px] w-[500px]
    bg-emerald-300/20
    rounded-full
    blur-[120px]
  "
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
  className="
    relative
    max-w-7xl
    mx-auto px-6
  "
>




{/* HEADER */}


<div
  className="
    max-w-3xl
  "
>


<div
  className="
    inline-flex items-center
    px-4 py-2
    text-xs text-slate-600
    bg-white
    rounded-full border border-slate-200
    shadow-sm
    gap-2
  "
>


<Sparkles
  size={14}
  className="
    text-blue-500
  "
  /
>


Smart financial ecosystem


</div>




<h2
  className="
    mt-8
    text-4xl text-slate-900 md:text-6xl font-bold tracking-tight leading-[1.05]
  "
>
How It Works
</h2>





<p
  className="
    max-w-2xl
    mt-6
    text-base text-slate-600 leading-7
  "
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
  className="
    grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3
    mt-16
    gap-7
  "
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