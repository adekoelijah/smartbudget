import {
  motion
} from "framer-motion";

import {
  ShieldCheck,
  LockKeyhole,
  Fingerprint,
  Radar,
  CheckCircle2,
  ScanFace
} from "lucide-react";



const securityFeatures = [

  {
    icon: LockKeyhole,
    title:"256-bit Encryption",
    description:
      "Your financial data is protected with advanced encryption technology."
  },


  {
    icon: Radar,
    title:"AI Fraud Detection",
    description:
      "Smart monitoring detects unusual activities in real time."
  },


  {
    icon: Fingerprint,
    title:"Identity Protection",
    description:
      "Secure authentication keeps your account protected."
  },


];




const SecurityBadge = () => {


return (

<motion.div

initial={{
opacity:0,
y:40
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
w-full
max-w-md
mx-auto
px-4
sm:px-0
"

>


{/* ==========================
SECURITY CORE
========================== */}


<div

className="
relative

overflow-hidden

rounded-[32px]

border

border-white/10

bg-white/[0.06]

backdrop-blur-3xl

p-6

shadow-[0_30px_100px_rgba(0,0,0,.45)]

"

>



{/* animated glow */}

<motion.div

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
absolute

top-[-80px]

right-[-80px]

h-64

w-64

rounded-full

bg-emerald-500/20

blur-3xl

"

/>





{/* HEADER */}

<div

className="
relative

flex

items-center

justify-between

"

>


<div

className="
flex

items-center

gap-4

"

>


<motion.div

animate={{

rotate:[0,5,-5,0]

}}

transition={{

duration:4,

repeat:Infinity

}}


className="
h-14

w-14

rounded-2xl

bg-gradient-to-br

from-emerald-400

to-emerald-600

flex

items-center

justify-center

shadow-[0_20px_50px_rgba(16,185,129,.35)]

"

>

<ShieldCheck

size={30}

className="text-black"

/>


</motion.div>





<div>

<p

className="
text-xs

uppercase

tracking-[0.25em]

text-emerald-300

font-semibold

"

>
Security Layer
</p>



<h3

className="
mt-1

text-lg

font-semibold

text-white

"

>

Bank-Grade Protection

</h3>


</div>


</div>






{/* LIVE STATUS */}

<div

className="
flex

items-center

gap-2

rounded-full

bg-emerald-500/10

border

border-emerald-400/20

px-3

py-2

"

>

<motion.span

animate={{

scale:[
1,
1.6,
1

]

}}

transition={{

duration:2,

repeat:Infinity

}}


className="
h-2

w-2

rounded-full

bg-emerald-400

"


/>


<span

className="
text-xs

font-medium

text-emerald-300

"

>
Protected
</span>


</div>



</div>







{/* SECURITY SCORE */}



<div

className="
mt-8

rounded-3xl

bg-black/20

border

border-white/10

p-5

"

>


<div

className="
flex

items-center

justify-between

"

>


<div>


<p

className="
text-xs

text-slate-400

"

>
Security Score
</p>


<h4

className="
mt-2

text-4xl

font-bold

text-white

"

>
99.9%
</h4>


</div>





<div

className="
relative

h-20

w-20

rounded-full

border

border-emerald-400/30

flex

items-center

justify-center

"

>


<motion.div

animate={{

rotate:360

}}

transition={{

duration:8,

repeat:Infinity,

ease:"linear"

}}

className="
absolute

inset-2

rounded-full

border

border-dashed

border-emerald-400/40

"

/>


<ScanFace

size={30}

className="text-emerald-400"

/>


</div>



</div>





<div

className="
mt-5

h-2

rounded-full

bg-white/10

overflow-hidden

"

>


<motion.div

initial={{
width:0
}}

whileInView={{
width:"99.9%"
}}

transition={{
duration:1.5
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



</div>








{/* FEATURES */}

<div

className="
mt-6

space-y-3

"

>


{

securityFeatures.map((item,index)=>{


const Icon=item.icon;


return (

<motion.div

key={index}

whileHover={{

x:8

}}


className="
group

flex

gap-4

rounded-2xl

border

border-white/10

bg-white/[0.03]

p-4

transition

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

<Icon

size={18}

className="text-emerald-400"

/>


</div>




<div>


<h4

className="
text-sm

font-semibold

text-white

"

>

{item.title}

</h4>



<p

className="
mt-1

text-xs

leading-5

text-slate-400

"

>

{item.description}

</p>


</div>



<CheckCircle2

size={16}

className="
ml-auto

text-emerald-400

opacity-0

group-hover:opacity-100

transition

"

/>



</motion.div>


)


})

}


</div>






</div>





</motion.div>


)

}


export default SecurityBadge;