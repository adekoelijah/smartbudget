import {
  motion
} from "framer-motion";

import {
  BrainCircuit,
  Sparkles,
  TrendingDown,
  Target,
  Zap,
  ShieldCheck,
  ArrowRight
} from "lucide-react";



const analysisItems = [

{
 icon:TrendingDown,
 title:"Spending Pattern Detected",
 text:"Your food expenses increased 14% this month.",
 status:"Attention"
},


{
 icon:Target,
 title:"Goal Prediction",
 text:"You will reach your emergency fund 18 days earlier.",
 status:"Excellent"
},


{
 icon:ShieldCheck,
 title:"Financial Protection",
 text:"No suspicious transaction detected.",
 status:"Secure"
}


];





const AIPreview =()=>{


return (

<motion
  .div

initial={{
opacity:0,
y:50
}}

whileInView={{
opacity:1,
y:0
}}

viewport={{
once:true
}}

transition={{
duration:.8
}}
  className="
    relative
    w-full max-w-lg
  "
>



<div
  className="
    relative overflow-hidden
    p-7
    bg-white/[0.06]
    rounded-[40px] border border-white/10
    backdrop-blur-3xl shadow-[0_40px_120px_rgba(0,0,0,.5)]
  "
>



{/* AI AMBIENT LIGHT */}


<motion
  .div

animate={{

scale:[
1,
1.3,
1
],

opacity:[
.2,
.5,
.2

]

}}

transition={{

duration:5,

repeat:Infinity

}}
  className="
    absolute top-[-100px] left-1/2
    h-[350px] w-[350px]
    bg-cyan-500/20
    rounded-full
    blur-[100px]
    -translate-x-1/2
  "
  /
>








{/* HEADER */}


<div
  className="
    relative flex items-center justify-between
  "
>


<div
  className="
    flex items-center
    gap-4
  "
>


<motion
  .div

animate={{

rotate:[
0,
360

]

}}

transition={{

duration:15,

repeat:Infinity,

ease:"linear"

}}
  className="
    relative flex items-center justify-center
    h-16 w-16
    bg-gradient-to-br from-cyan-400 to-emerald-500
    rounded-3xl
    shadow-[0_20px_50px_rgba(34,211,238,.4)]
  "
>


<BrainCircuit
  size={32}
  className="
    text-black
  "
  /
>


</motion.div>





<div>


<p
  className="
    text-xs text-cyan-300 tracking-[0.3em] uppercase font-semibold
  "
>
Smart AI
</p>



<h3
  className="
    mt-1
    text-xl text-white font-bold
  "
>

Financial Intelligence

</h3>


</div>


</div>






<div
  className="
    flex items-center
    px-4 py-2
    bg-cyan-500/10
    rounded-full border border-cyan-400/20
    gap-2
  "
>


<motion
  .span

animate={{

scale:[
1,
1.8,
1
]

}}

transition={{

duration:1.5,

repeat:Infinity

}}
  className="
    h-2 w-2
    bg-cyan-400
    rounded-full
  "
  /
>



<span
  className="
    text-xs text-cyan-300 font-semibold
  "
>
ANALYZING
</span>


</div>



</div>







{/* AI CORE */}



<div
  className="
    relative flex items-center justify-center
    h-48
    mt-10
  "
>


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
    absolute
    h-40 w-40
    rounded-full border border-cyan-400/30
  "
  /
>



<motion
  .div

animate={{

scale:[
1,
1.15,
1

]

}}

transition={{

duration:2,

repeat:Infinity

}}
  className="
    flex items-center justify-center
    h-24 w-24
    bg-gradient-to-br from-cyan-400 to-emerald-500
    rounded-full
    shadow-[0_0_80px_rgba(34,211,238,.8)]
  "
>

<Sparkles
  size={35}
  className="
    text-black
  "
  /
>


</motion.div>



</div>









{/* CONFIDENCE */}


<div
  className="
    p-5
    bg-black/20
    rounded-3xl border border-white/10
  "
>


<div
  className="
    flex justify-between items-center
  "
>

<p
  className="
    text-sm text-slate-400
  "
>
AI Confidence
</p>



<h4
  className="
    text-xl text-white font-bold
  "
>
98.7%
</h4>


</div>



<div
  className="
    overflow-hidden
    h-2
    mt-4
    bg-white/10
    rounded-full
  "
>


<motion
  .div

initial={{
width:0
}}

whileInView={{
width:"98.7%"
}}

transition={{
duration:1.5
}}
  className="
    h-full
    bg-gradient-to-r from-cyan-400 to-emerald-400
    rounded-full
  "
  /
>


</div>


</div>









{/* INSIGHTS */}



<div
  className="
    mt-6 space-y-3
  "
>


{
analysisItems.map((item,index)=>{


const Icon=item.icon;


return (

<motion
  .div


key={index}

initial={{
opacity:0,
x:30
}}

whileInView={{
opacity:1,
x:0
}}

transition={{
delay:index*.15
}}
  className="
    flex
    p-4
    bg-white/[0.04]
    rounded-2xl border border-white/10
    gap-4
  "
>


<div
  className="
    flex items-center justify-center
    h-10 w-10
    bg-cyan-500/10
    rounded-xl
  "
>


<Icon
  size={18}
  className="
    text-cyan-400
  "
  /
>


</div>



<div
  className="
    flex-1
  "
>


<h4
  className="
    text-sm text-white font-semibold
  "
>

{item.title}

</h4>


<p
  className="
    mt-1
    text-xs text-slate-400 leading-5
  "
>

{item.text}

</p>


</div>


<span
  className="
    text-[10px] text-emerald-300 uppercase font-bold
  "
>

{item.status}

</span>



</motion.div>


)


})

}


</div>






{/* FOOTER */}


<motion
  .div

whileHover={{
scale:1.02
}}
  className="
    flex items-center justify-between
    mt-6 p-5
    bg-gradient-to-r from-cyan-500/20 to-emerald-500/20
    rounded-2xl border border-white/10
  "
>


<div>


<p
  className="
    text-xs text-slate-400
  "
>
AI Recommendation
</p>



<p
  className="
    mt-1
    text-sm text-white font-semibold
  "
>
Save ₦20,000 this week
</p>


</div>



<ArrowRight
  size={20}
  className="
    text-emerald-400
  "
  /
>


</motion.div>




</div>



</motion.div>


)

}


export default AIPreview;

