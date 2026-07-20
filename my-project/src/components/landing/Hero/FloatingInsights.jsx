import {
  motion,
  AnimatePresence,
} from "framer-motion";

import {
  Sparkles,
  TrendingUp,
  ShieldAlert,
  Target,
  BrainCircuit,
  ArrowUpRight,
} from "lucide-react";

import { useEffect, useState } from "react";



const insights = [

  {
    icon: TrendingUp,
    title: "Savings Growth",
    message:
      "Your saving habit improved by 24% compared to last month.",
    value:
      "+₦85,000",
    color:
      "emerald",
  },


  {
    icon: ShieldAlert,
    title: "Smart Alert",
    message:
      "Entertainment spending is approaching your monthly limit.",
    value:
      "82%",
    color:
      "amber",
  },


  {
    icon: Target,
    title: "Goal Prediction",
    message:
      "You are projected to reach your emergency fund goal early.",
    value:
      "14 days",
    color:
      "cyan",
  },

];





const FloatingInsights = () => {


  const [active,setActive] = useState(0);



  useEffect(()=>{


    const timer =
      setInterval(()=>{


        setActive(
          prev =>
          (prev + 1)
          %
          insights.length
        );


      },5000);



    return ()=>clearInterval(timer);


  },[]);





const InsightIcon =
  insights[active].icon;



return (

<div
className="
relative
w-full
h-full
pointer-events-none
"
>


{/* =========================
AI CORE ORB
========================= */}


<motion.div

animate={{

scale:[
1,
1.15,
1
],

opacity:[
0.4,
0.8,
0.4

]

}}

transition={{

duration:3,

repeat:Infinity

}}


className="
absolute

top-1/2
left-1/2

-translate-x-1/2
-translate-y-1/2

h-28
w-28

rounded-full

bg-emerald-500/20

blur-2xl

"

/>




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

top-1/2
left-1/2

-translate-x-1/2
-translate-y-1/2

h-40
w-40

rounded-full

border

border-emerald-400/20

"


/>





{/* =========================
MAIN INSIGHT CARD
========================= */}


<AnimatePresence mode="wait">


<motion.div


key={active}


initial={{

opacity:0,

scale:.85,

y:40

}}


animate={{

opacity:1,

scale:1,

y:0

}}


exit={{

opacity:0,

scale:.85,

y:-40

}}


transition={{

duration:.6,

ease:[

0.22,

1,

0.36,

1

]

}}


className="
absolute

right-0

top-10

w-[290px]

rounded-[30px]

border

border-white/10

bg-white/[0.08]

backdrop-blur-3xl

p-6

shadow-[0_30px_100px_rgba(0,0,0,.45)]

"

>


<div
className="
flex
items-center
justify-between
"
>


<div

className="
flex
items-center
gap-3

"

>


<div

className="
h-12
w-12

rounded-2xl

bg-emerald-500/15

flex
items-center
justify-center

"

>


<InsightIcon

size={22}

className="
text-emerald-400
"

/>


</div>



<div>

<p
className="
text-xs

uppercase

tracking-widest

text-emerald-300

font-semibold

"
>
Smart AI
</p>


<h3

className="
text-white

font-semibold

text-sm

mt-1

"

>

{insights[active].title}

</h3>


</div>



</div>




<motion.div

animate={{

rotate:360

}}

transition={{

duration:5,

repeat:Infinity,

ease:"linear"

}}

>

<Sparkles

size={18}

className="text-emerald-400"

/>


</motion.div>



</div>






<p

className="
mt-6

text-sm

leading-6

text-slate-300

"

>

{insights[active].message}

</p>






<div

className="
mt-6

flex

items-center

justify-between

"

>


<h4

className="
text-3xl

font-bold

text-white

"

>

{insights[active].value}

</h4>



<div

className="
h-10

w-10

rounded-xl

bg-white/10

flex

items-center

justify-center

"

>

<ArrowUpRight

size={18}

className="text-emerald-400"

/>


</div>


</div>





<div

className="
mt-6

h-1.5

rounded-full

bg-white/10

overflow-hidden

"

>


<motion.div

key={active}

initial={{
width:0
}}

animate={{
width:"100%"
}}

transition={{

duration:5,

ease:"linear"

}}

className="
h-full

rounded-full

bg-gradient-to-r

from-emerald-400

to-cyan-400

"

/>


</div>





</motion.div>


</AnimatePresence>






{/* =========================
FLOATING MINI SIGNALS
========================= */}



<motion.div

animate={{

y:[0,-20,0],

x:[0,10,0]

}}

transition={{

duration:6,

repeat:Infinity

}}

className="
absolute

left-0

bottom-20

rounded-2xl

border

border-white/10

bg-black/30

backdrop-blur-xl

px-5

py-4

"

>


<div

className="
flex

items-center

gap-2

"

>

<BrainCircuit

size={16}

className="text-cyan-400"

/>


<span

className="
text-xs

text-slate-300

font-medium

"

>
AI Monitoring Active
</span>


</div>


</motion.div>





<motion.div

animate={{

y:[0,15,0]

}}

transition={{

duration:4,

repeat:Infinity

}}


className="
absolute

right-10

bottom-0

h-3

w-3

rounded-full

bg-emerald-400

shadow-[0_0_30px_rgba(16,185,129,1)]

"

/>



</div>

);


};



export default FloatingInsights;