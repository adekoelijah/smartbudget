

// import { useEffect, useRef, useState } from "react";
// import { motion } from "framer-motion";
// import {
//   Wallet2,
//   Activity,
//   ShieldCheck,
//   TrendingUp,
// } from "lucide-react";

// /* =========================
//    COUNT UP HOOK (UNCHANGED CORE)
// ========================= */
// const useCountUp = (end, duration = 1400) => {
//   const [count, setCount] = useState(0);
//   const ref = useRef(null);
//   const started = useRef(false);

//   useEffect(() => {
//     const observer = new IntersectionObserver(
//       ([entry]) => {
//         if (entry.isIntersecting && !started.current) {
//           started.current = true;

//           let start = 0;
//           const step = end / (duration / 16);

//           const animate = () => {
//             start += step;

//             if (start < end) {
//               setCount(Math.floor(start));
//               requestAnimationFrame(animate);
//             } else {
//               setCount(end);
//             }
//           };

//           animate();
//         }
//       },
//       { threshold: 0.35 }
//     );

//     if (ref.current) observer.observe(ref.current);
//     return () => observer.disconnect();
//   }, [end, duration]);

//   return { count, ref };
// };

// /* =========================
//    DATA (FINANCIAL METRICS)
// ========================= */
// const statsData = [
//   {
//     title: "Total Assets Under Management",
//     value: 285000000,
//     prefix: "₦",
//     subtitle: "Aggregated across verified accounts",
//     icon: Wallet2,
//     trend: "+18.2%",
//   },
//   {
//     title: "Monthly Transaction Volume",
//     value: 920000,
//     suffix: "+",
//     subtitle: "Processed through secured rails",
//     icon: Activity,
//     trend: "+11.6%",
//   },
//   {
//     title: "System Integrity Score",
//     value: 99.98,
//     suffix: "%",
//     subtitle: "Uptime + encryption reliability index",
//     icon: ShieldCheck,
//     trend: "Stable",
//   },
// ];

// /* =========================
//    CARD
// ========================= */
// const StatCard = ({ data, index }) => {
//   const { count, ref } = useCountUp(data.value);

//   return (
//     <motion.div
//       ref={ref}
//       initial={{ opacity: 0, y: 18 }}
//       whileInView={{ opacity: 1, y: 0 }}
//       viewport={{ once: true, amount: 0.4 }}
//       transition={{ duration: 0.45, delay: index * 0.05 }}
//       className="
//         relative
//         rounded-2xl
//         border border-slate-200
//         bg-white
//         p-7
//         transition
//         hover:border-slate-300
//       "
//     >
//       {/* top structural line */}
//       <div className="absolute inset-x-0 top-0 h-px bg-slate-100" />

//       {/* HEADER */}
//       <div className="flex items-start justify-between">

//         {/* ICON BLOCK (controlled, not flashy) */}
//         <div className="h-11 w-11 rounded-xl bg-slate-900 flex items-center justify-center">
//           <data.icon size={18} className="text-white" />
//         </div>

//         {/* TREND */}
//         <div className="flex items-center gap-2 text-[11px] font-semibold text-slate-500">
//           <TrendingUp size={12} className="text-slate-400" />
//           {data.trend}
//         </div>
//       </div>

//       {/* VALUE */}
//       <div className="mt-8">
//         <h3 className="text-[34px] font-semibold tracking-[-0.04em] text-slate-950">
//           {data.prefix || ""}
//           {typeof data.value === "number"
//             ? data.value % 1 !== 0
//               ? count.toFixed(2)
//               : count.toLocaleString()
//             : count}
//           {data.suffix || ""}
//         </h3>

//         <p className="mt-3 text-[14px] font-semibold text-slate-900">
//           {data.title}
//         </p>

//         <p className="mt-2 text-[13px] leading-6 text-slate-500">
//           {data.subtitle}
//         </p>
//       </div>

//       {/* SYSTEM FOOTER (BANK SIGNATURE ELEMENT) */}
//       <div className="mt-7 pt-5 border-t border-slate-100 flex items-center justify-between">

//         <div className="flex items-center gap-2">
//           <div className="h-1.5 w-1.5 rounded-full bg-emerald-500" />
//           <span className="text-[11px] text-slate-500">
//             Live financial metric
//           </span>
//         </div>

//         <span className="text-[11px] text-slate-400">
//           real-time sync
//         </span>
//       </div>
//     </motion.div>
//   );
// };

// /* =========================
//    SECTION
// ========================= */
// const Stats = () => {
//   return (
//     <section className="relative bg-white py-28 overflow-hidden">

//       {/* CONTROLLED BACKGROUND (NO DISTRACTION) */}
//       <div className="absolute inset-0 -z-10">
//         <div className="absolute inset-0 bg-[linear-gradient(to_right,#0f172a03_1px,transparent_1px),linear-gradient(to_bottom,#0f172a03_1px,transparent_1px)] bg-[size:80px_80px]" />

//         {/* soft vertical fade only (institutional depth) */}
//         <div className="absolute inset-0 bg-gradient-to-b from-white via-white to-slate-50" />
//       </div>

//       <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8">

//         {/* HEADER */}
//         <div className="max-w-3xl">

//           <div className="inline-flex items-center gap-2 px-4 py-2 rounded-full border border-slate-200 bg-white">
//             <div className="h-2 w-2 rounded-full bg-slate-900" />
//             <span className="text-[12px] font-semibold text-slate-600 uppercase tracking-wide">
//               Financial Systems Overview
//             </span>
//           </div>

//           <h2 className="mt-8 text-[46px] md:text-[58px] leading-[1.02] tracking-[-0.05em] font-semibold text-slate-950">
//             Financial infrastructure
//             <br />
//             built for measurable trust
//           </h2>

//           <p className="mt-7 text-[16px] leading-7 text-slate-600 max-w-2xl">
//             A structured financial intelligence layer designed to deliver
//             transparency, system stability, and consistent financial accuracy
//             across all user operations.
//           </p>
//         </div>

//         {/* GRID */}
//         <div className="mt-20 grid grid-cols-1 md:grid-cols-3 gap-6">
//           {statsData.map((item, index) => (
//             <StatCard key={index} data={item} index={index} />
//           ))}
//         </div>

//       </div>
//     </section>
//   );
// };

// export default Stats;

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

<motion.div

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
group
relative
overflow-hidden
rounded-[30px]
border
border-white/60
bg-white/70
backdrop-blur-xl
p-8
shadow-[0_25px_70px_rgba(15,23,42,.08)]
transition
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





<div className="relative">


{/* HEADER */}

<div
className="
flex
items-center
justify-between
"
>


<div

className="
h-14
w-14
rounded-2xl
bg-white
border
border-slate-200
shadow-sm
flex
items-center
justify-center
"

>

<Icon

size={24}

className="
text-slate-800
"

/>

</div>





<div

className="
flex
items-center
gap-1
rounded-full
bg-emerald-50
px-3
py-1.5
text-xs
font-medium
text-emerald-600
"

>

<TrendingUp size={13}/>

{data.trend}


</div>



</div>







{/* VALUE */}

<div className="mt-10">


<h3

className="
text-4xl
font-bold
tracking-tight
text-slate-950
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
text-base
font-semibold
text-slate-900
"

>

{data.title}

</p>




<p

className="
mt-2
text-sm
leading-6
text-slate-500
"

>

{data.subtitle}

</p>


</div>







{/* FOOTER */}

<div

className="
mt-8
pt-5
border-t
border-slate-200
flex
items-center
justify-between
"

>


<div

className="
flex
items-center
gap-2
text-xs
text-slate-500
"

>

<div
className="
h-2
w-2
rounded-full
bg-emerald-500
"
/>


Live monitoring


</div>



<Sparkles

size={15}

className="
text-blue-400
"

/>


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
relative
overflow-hidden
py-32
bg-[#F8FAFC]
"

>





{/* BACKGROUND SYSTEM */}


<div className="absolute inset-0">


<div

className="
absolute
top-[-200px]
left-1/2
-translate-x-1/2
h-[600px]
w-[600px]
rounded-full
bg-blue-400/20
blur-[150px]
"

/>



<div

className="
absolute
bottom-[-150px]
right-[-100px]
h-[450px]
w-[450px]
rounded-full
bg-emerald-300/20
blur-[120px]
"

/>




<div

className="
absolute
inset-0
opacity-30
bg-[linear-gradient(to_right,#cbd5e1_1px,transparent_1px),
linear-gradient(to_bottom,#cbd5e1_1px,transparent_1px)]
bg-[size:80px_80px]
"

/>



</div>








<div

className="
relative
max-w-7xl
mx-auto
px-6
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
inline-flex
items-center
gap-2
rounded-full
bg-white
border
border-slate-200
px-4
py-2
text-xs
text-slate-600
shadow-sm
"

>

<Sparkles

size={14}

className="
text-blue-500
"

/>


Financial intelligence layer


</div>





<h2

className="
mt-8
text-4xl
md:text-6xl
font-bold
leading-[1.05]
tracking-tight
text-slate-950
"

>

Built on visibility.
Designed for financial confidence.


</h2>





<p

className="
mt-6
max-w-2xl
text-base
leading-7
text-slate-600
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
mt-20
grid
grid-cols-1
md:grid-cols-3
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