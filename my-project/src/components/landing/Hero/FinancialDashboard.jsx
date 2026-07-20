import {
  motion,
  useMotionValue,
  useSpring,
  useTransform,
} from "framer-motion";

import {
  ArrowUpRight,
  BrainCircuit,
  ShieldCheck,
  TrendingUp,
  Wallet,
  Activity,
  Sparkles,
} from "lucide-react";

import { useState } from "react";



const FinancialDashboard = () => {


  // =====================================
  // 3D MOUSE TILT
  // =====================================

 const rotateX = useMotionValue(0);
const rotateY = useMotionValue(0);


// Track hovered transaction
const [activeTransaction, setActiveTransaction] = useState(null);


  const springX = useSpring(
    rotateX,
    {
      stiffness:120,
      damping:15
    }
  );


  const springY = useSpring(
    rotateY,
    {
      stiffness:120,
      damping:15
    }
  );

  // Dynamic 3D shadow movement
const shadowX = useTransform(
  springY,
  [-8,8],
  [-40,40]
);


const shadowY = useTransform(
  springX,
  [-8,8],
  [-40,40]
);


const dynamicShadow = useTransform(
  [shadowX, shadowY],
  ([x,y]) =>
    `${x}px ${y}px 80px rgba(16,185,129,0.25)`
);



  const handleMouseMove = (e)=>{

    const rect =
      e.currentTarget.getBoundingClientRect();


    const x =
      e.clientX - rect.left;


    const y =
      e.clientY - rect.top;


    const centerX =
      rect.width / 2;


    const centerY =
      rect.height / 2;



    rotateY.set(
      ((x-centerX)/centerX)*8
    );


    rotateX.set(
      -((y-centerY)/centerY)*8
    );

  };



  const resetTilt = ()=>{
    rotateX.set(0);
    rotateY.set(0);
  };




  // =====================================
  // CHART DATA
  // =====================================

  const bars=[
    70,
    110,
    90,
    160,
    130,
    210,
    180
  ];



  const transactions=[
    {
      title:"Salary Payment",
      amount:"+₦850,000",
      type:"income"
    },

    {
      title:"Investment Return",
      amount:"+₦120,000",
      type:"income"
    },

    {
      title:"Food & Lifestyle",
      amount:"-₦45,000",
      type:"expense"
    }

  ];




return (

<motion.div

onMouseMove={handleMouseMove}

onMouseLeave={resetTilt}


style={{

rotateX:springX,

rotateY:springY,

transformPerspective:1200,

boxShadow:dynamicShadow

}}


className="
relative
w-full
"


>


{/* ==================================
MAIN CARD
================================== */}

<div

className="
relative
overflow-hidden

rounded-[36px]

border
border-white/10

bg-white/[0.06]

backdrop-blur-3xl

p-7

shadow-[0_40px_120px_rgba(0,0,0,0.5)]

"

>


{/* GLOW */}

<div

className="
absolute
top-0
right-0

w-[300px]
h-[300px]

rounded-full

bg-emerald-500/20

blur-[100px]

"

/>




{/* HEADER */}

<div className="
relative
flex
justify-between
items-start
">


<div>


<div

className="
inline-flex
items-center
gap-2

rounded-full

bg-emerald-500/10

border
border-emerald-400/20

px-4
py-2

"

>

<Sparkles
size={14}
className="text-emerald-400"
/>


<span
className="
text-xs
font-semibold
text-emerald-300
"
>
AI FINANCIAL ENGINE
</span>


</div>



<p
className="
mt-6
text-sm
text-slate-400
"
>
Total Available Balance
</p>



<h2
className="
mt-2

text-5xl

font-semibold

tracking-tight

text-white

"
>
₦24,850,000
</h2>



<div
className="
mt-5

flex
items-center
gap-2

text-emerald-400

"
>

<TrendingUp size={18}/>


<span
className="
text-sm
font-semibold
"
>
+18.4% this month
</span>


</div>



</div>





{/* SECURITY ICON */}

<div

className="
flex
items-center
justify-center

h-16
w-16

rounded-2xl

bg-gradient-to-br

from-emerald-400
to-emerald-600

shadow-[0_20px_50px_rgba(16,185,129,.4)]

"

>

<ShieldCheck
size={30}
className="text-black"
/>


</div>


</div>






{/* ==================================
AI MESSAGE
================================== */}


<motion.div

animate={{

y:[0,-5,0]

}}

transition={{

duration:4,

repeat:Infinity

}}


className="
mt-8

rounded-2xl

border
border-white/10

bg-black/20

p-5

flex
gap-4

"

>


<div

className="
h-10
w-10

rounded-xl

bg-emerald-500/20

flex
items-center
justify-center

"

>

<BrainCircuit

size={22}

className="text-emerald-400"

/>

</div>



<div>

<p
className="
text-sm
font-semibold
text-white
"
>
SmartBudget AI Insight
</p>


<p
className="
mt-1

text-xs

leading-5

text-slate-400

"
>
Your savings rate improved by 24%.
You are on track to reach your yearly goal.
</p>


</div>



</motion.div>






{/* ==================================
CHART
================================== */}


<div
className="
mt-10
"
>


<div
className="
flex
items-end

gap-3

h-[230px]

"
>

{

bars.map((height,index)=>(


<motion.div

key={index}


initial={{
height:0
}}

animate={{
height
}}


transition={{
duration:1,

delay:index*.1

}}



className="
flex-1

rounded-t-2xl

bg-gradient-to-t

from-emerald-700

to-emerald-300

shadow-[0_15px_40px_rgba(16,185,129,.25)]

"

/>


))

}


</div>


<div

className="
mt-4

flex
justify-between

text-xs

text-slate-500

"

>

<span>Jan</span>
<span>Feb</span>
<span>Mar</span>
<span>Apr</span>
<span>May</span>
<span>Jun</span>
<span>Jul</span>


</div>


</div>






{/* ==================================
TRANSACTIONS
================================== */}


<div

className="
mt-8

space-y-3

"

>


{
transactions.map((item,index)=>(


<motion.div

key={index}

onMouseEnter={() =>
setActiveTransaction(index)
}

onMouseLeave={() =>
setActiveTransaction(null)
}

animate={{

scale:
activeTransaction === index
?
1.03
:
1,

x:
activeTransaction === index
?
8
:
0

}}


initial={{
opacity:0,
x:30
}}

animate={{
opacity:1,
x:0
}}


transition={{
delay:index*.2
}}



className="
flex
items-center
justify-between

rounded-2xl

bg-white/[0.04]

border
border-white/10

p-4

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
h-10
w-10

rounded-xl

bg-emerald-500/10

flex
items-center
justify-center

"

>

<Wallet

size={18}

className="text-emerald-400"

/>

</div>



<div>

<p
className="
text-sm
text-white
font-medium
"
>
{item.title}
</p>


<p
className="
text-xs
text-slate-500
"
>
Today
</p>


</div>


</div>




<p
className={`
text-sm
font-semibold

${
item.type==="income"

?
"text-emerald-400"

:

"text-red-400"

}

`}
>

{item.amount}

</p>


</motion.div>


))
}


</div>





</div>





{/* FLOATING AI BADGE */}

<motion.div

animate={{

y:[0,-12,0]

}}

transition={{

duration:5,

repeat:Infinity

}}


className="
absolute

-right-10

bottom-20

hidden

xl:flex

"

>


<div

className="
rounded-3xl

border
border-white/10

bg-white/[0.08]

backdrop-blur-2xl

p-5

w-[230px]

shadow-xl

"

>


<div
className="
flex
items-center
gap-2
"
>

<Activity

size={18}

className="text-cyan-400"

/>


<span
className="
text-xs
text-cyan-300
font-semibold
"
>
LIVE ANALYTICS
</span>


</div>



<h3
className="
mt-4

text-3xl

font-bold

text-white

"
>
94%
</h3>



<p
className="
mt-2

text-xs

text-slate-400
"
>
Financial health score
</p>



</div>


</motion.div>




</motion.div>

);

};


export default FinancialDashboard;