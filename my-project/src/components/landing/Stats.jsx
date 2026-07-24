

import { useEffect, useRef, useState } from "react";
import { motion } from "framer-motion";
import {
  Wallet2,
  Activity,
  ShieldCheck,
  TrendingUp,
  Sparkles,
} from "lucide-react";



/* =========================
   COUNT UP ENGINE
========================= */

const useCountUp = (end, duration = 1400) => {

  const [count, setCount] = useState(0);
  const ref = useRef(null);
  const started = useRef(false);


  useEffect(() => {

    const observer = new IntersectionObserver(
      ([entry]) => {

        if(entry.isIntersecting && !started.current){

          started.current = true;

          let start = 0;

          const increment =
            end / (duration / 16);


          const animate = () => {

            start += increment;


            if(start < end){

              setCount(Math.floor(start));
              requestAnimationFrame(animate);

            }else{

              setCount(end);

            }

          };


          animate();

        }

      },
      {
        threshold:.35
      }
    );


    if(ref.current)
      observer.observe(ref.current);


    return ()=>observer.disconnect();


  },[end,duration]);


  return {
    count,
    ref
  };

};






/* =========================
   TRUST METRICS
========================= */


const statsData = [

{
 title:"Financial Activity Managed",

 value:285000000,

 prefix:"₦",

 subtitle:
 "Organized financial records across user accounts",

 icon:Wallet2,

 trend:"+18.2%",

 gradient:
 "from-blue-400/20 to-cyan-400/20"

},


{
 title:"Transactions Tracked",

 value:920000,

 suffix:"+",

 subtitle:
 "Real-time expense and income monitoring",

 icon:Activity,

 trend:"+11.6%",

 gradient:
 "from-emerald-400/20 to-teal-400/20"

},



{
 title:"Platform Reliability",

 value:99.98,

 suffix:"%",

 subtitle:
 "Secure and consistent system availability",

 icon:ShieldCheck,

 trend:"Stable",

 gradient:
 "from-purple-400/20 to-indigo-400/20"

}

];








/* =========================
   CARD COMPONENT
========================= */


const StatCard = ({
 data,
 index
})=>{


const {
 count,
 ref
}=useCountUp(data.value);



const Icon=data.icon;



return (

<motion
  .div

ref={ref}

initial={{
 opacity:0,
 y:25
}}

whileInView={{
 opacity:1,
 y:0
}}

viewport={{
 once:true
}}

transition={{
 duration:.5,
 delay:index*.1
}}


whileHover={{
 y:-8
}}
  className="
    relative overflow-hidden
    p-8
    bg-white/70
    rounded-[30px] border border-white/60
    backdrop-blur-xl shadow-[0_25px_70px_rgba(15,23,42,.08)] transition
    group
  "
>


{/* PRISM LIGHT */}

<div

className={`
absolute
top-[-80px]
right-[-80px]
h-56
w-56
rounded-full
blur-3xl
bg-gradient-to-br
${data.gradient}
group-hover:scale-125
transition
duration-700
`}

/>





<div
  className="
    relative
  "
>


{/* HEADER */}

<div
  className="
    flex items-center justify-between
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
  size={24}
  className="
    text-slate-800
  "
  /
>

</div>





<div
  className="
    flex items-center
    px-3 py-1.5
    text-xs text-emerald-600 font-medium
    bg-emerald-50
    rounded-full
    gap-1
  "
>

<TrendingUp size={13}/>

{data.trend}


</div>



</div>







{/* VALUE */}

<div
  className="
    mt-10
  "
>


<h3
  className="
    text-4xl text-slate-950 font-bold tracking-tight
  "
>


{data.prefix || ""}

{
data.value % 1 !== 0

?

count.toFixed(2)

:

count.toLocaleString()

}


{data.suffix || ""}



</h3>




<p
  className="
    mt-4
    text-base text-slate-900 font-semibold
  "
>

{data.title}

</p>




<p
  className="
    mt-2
    text-sm text-slate-500 leading-6
  "
>

{data.subtitle}

</p>


</div>







{/* FOOTER */}

<div
  className="
    flex items-center justify-between
    mt-8 pt-5
    border-t border-slate-200
  "
>


<div
  className="
    flex items-center
    text-xs text-slate-500
    gap-2
  "
>

<div
  className="
    h-2 w-2
    bg-emerald-500
    rounded-full
  "
  /
>


Live monitoring


</div>



<Sparkles
  size={15}
  className="
    text-blue-400
  "
  /
>


</div>



</div>



</motion.div>

);

};









/* =========================
   SECTION
========================= */


const Stats =()=>{


return (

<section
  className="
    relative overflow-hidden
    py-32
    bg-[#F8FAFC]
  "
>





{/* BACKGROUND SYSTEM */}


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
    blur-[150px]
    -translate-x-1/2
  "
  /
>



<div
  className="
    absolute bottom-[-150px] right-[-100px]
    h-[450px] w-[450px]
    bg-emerald-300/20
    rounded-full
    blur-[120px]
  "
  /
>




<div
  className="
    absolute inset-0
    bg-[linear-gradient(to_right,#cbd5e1_1px,transparent_1px), bg-[size:80px_80px]
    opacity-30
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


Financial intelligence layer


</div>





<h2
  className="
    mt-8
    text-4xl text-slate-950 md:text-6xl font-bold leading-[1.05] tracking-tight
  "
>

How We Transform Your Daily Data into Financial Power


</h2>





<p
  className="
    max-w-2xl
    mt-6
    text-base text-slate-600 leading-7
  "
>


SmartBudget transforms everyday financial activity
into structured insights, helping users understand,
control, and improve their money decisions.


</p>


</div>








{/* CARDS */}

<div
  className="
    grid grid-cols-1 md:grid-cols-3
    mt-20
    gap-7
  "
>


{
statsData.map((item,index)=>(

<StatCard

key={index}

data={item}

index={index}

/>

))
}


</div>





</div>


</section>

);

};


export default Stats;