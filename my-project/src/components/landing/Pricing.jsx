

// import { motion } from "framer-motion";
// import { createCheckoutSession } from "../../services/billingService";
// import { CheckCircle2, ShieldCheck, ArrowRight } from "lucide-react";

// /* =========================
//    PRICING TIERS (FINTECH MODEL)
// ========================= */
// const plans = [
//   {
//     name: "Basic Financial Layer",
//     subtitle: "Account visibility & manual control layer",
//     price: "₦0",
//     plan: "free",
//     description:
//       "Entry-level financial observability for personal expense tracking and structured budgeting.",
//     features: [
//       "Transaction visibility dashboard",
//       "Manual budget controls",
//       "Basic financial reports",
//       "Single-user financial space",
//     ],
//     accent: "slate",
//   },
//   {
//     name: "Financial Intelligence Core",
//     subtitle: "Automated control + predictive insights layer",
//     price: "₦5,000",
//     period: "/ month",
//     plan: "pro",
//     description:
//       "Advanced financial intelligence system for automation, forecasting, and structured cashflow governance.",
//     features: [
//       "Real-time transaction ingestion",
//       "Automated budget enforcement engine",
//       "Predictive cashflow insights",
//       "Advanced reporting & analytics layer",
//       "Multi-account financial aggregation",
//     ],
//     accent: "emerald",
//     highlighted: true,
//   },
// ];

// /* =========================
//    CARD
// ========================= */
// const PricingCard = ({ plan, onSelect }) => {
//   const isPro = plan.highlighted;

//   return (
//     <motion.div
//       initial={{ opacity: 0, y: 24 }}
//       whileInView={{ opacity: 1, y: 0 }}
//       viewport={{ once: true, amount: 0.3 }}
//       transition={{ duration: 0.5 }}
//       className={`
//         relative rounded-3xl p-8 border
//         transition-all duration-300

//         ${
//           isPro
//             ? "border-emerald-500/40 bg-gradient-to-b from-white to-emerald-50/40 shadow-xl"
//             : "border-slate-200 bg-white"
//         }
//       `}
//     >
//       {/* TOP SECURITY STRIP */}
//       <div className="absolute inset-x-0 top-0 h-[1px] bg-gradient-to-r from-transparent via-slate-300 to-transparent" />

//       {/* HEADER */}
//       <div className="flex items-start justify-between">
//         <div>
//           <h3 className="text-[18px] font-semibold text-slate-950">
//             {plan.name}
//           </h3>

//           <p className="mt-1 text-sm text-slate-500">
//             {plan.subtitle}
//           </p>
//         </div>

//         {isPro && (
//           <div className="flex items-center gap-1 px-3 py-1 rounded-full bg-emerald-500/10 text-emerald-700 text-[11px] font-semibold">
//             <ShieldCheck size={14} />
//             CORE SYSTEM
//           </div>
//         )}
//       </div>

//       {/* PRICE */}
//       <div className="mt-8 flex items-end gap-2">
//         <h2 className="text-[42px] font-semibold tracking-tight text-slate-950">
//           {plan.price}
//         </h2>

//         {plan.period && (
//           <span className="text-sm text-slate-500 mb-2">
//             {plan.period}
//           </span>
//         )}
//       </div>

//       <p className="mt-1 text-xs text-slate-500">
//         Transparent pricing • No hidden financial fees
//       </p>

//       {/* DESCRIPTION */}
//       <p className="mt-6 text-sm leading-6 text-slate-600">
//         {plan.description}
//       </p>

//       {/* FEATURES */}
//       <div className="mt-7 space-y-3">
//         {plan.features.map((f, i) => (
//           <div key={i} className="flex items-start gap-2">
//             <CheckCircle2
//               size={15}
//               className={
//                 isPro ? "text-emerald-600" : "text-slate-400"
//               }
//             />
//             <span className="text-sm text-slate-600">{f}</span>
//           </div>
//         ))}
//       </div>

//       {/* CTA */}
//       <button
//         onClick={() => onSelect(plan.plan)}
//         className={`
//           mt-10 w-full h-12 rounded-xl text-sm font-semibold
//           transition flex items-center justify-center gap-2

//           ${
//             isPro
//               ? "bg-slate-950 text-white hover:bg-slate-800"
//               : "bg-white border border-slate-200 text-slate-900 hover:border-slate-400"
//           }
//         `}
//       >
//         {isPro ? "Activate Financial Core" : "Start Free Layer"}
//         <ArrowRight size={16} />
//       </button>

//       {/* FOOT NOTE */}
//       <p className="mt-4 text-[11px] text-slate-400 text-center">
//         Financial infrastructure access subject to compliance review
//       </p>
//     </motion.div>
//   );
// };

// /* =========================
//    MAIN SECTION
// ========================= */
// const Pricing = () => {
//   const handleCheckout = async (plan) => {
//     try {
//       const { url } = await createCheckoutSession(plan);
//       window.location.assign(url);
//     } catch {
//       alert("Transaction initialization failed");
//     }
//   };

//   return (
//     <section className="relative py-32 bg-slate-50 overflow-hidden">

//       {/* BACKGROUND GRID */}
//       <div className="absolute inset-0 -z-10">
//         <div className="absolute inset-0 bg-[linear-gradient(to_right,#0f172a08_1px,transparent_1px),linear-gradient(to_bottom,#0f172a08_1px,transparent_1px)] bg-[size:80px_80px]" />
//       </div>

//       <div className="max-w-6xl mx-auto px-6">

//         {/* HEADER */}
//         <div className="max-w-3xl mx-auto text-center">
//           <h2 className="text-[44px] font-semibold tracking-tight text-slate-950">
//             Financial access architecture
//           </h2>

//           <p className="mt-5 text-slate-600 text-[15px] leading-7">
//             SmartBudget is structured as a financial control system.
//             Each tier defines the depth of financial intelligence,
//             automation, and governance available to the user.
//           </p>
//         </div>

//         {/* GRID */}
//         <div className="mt-16 grid grid-cols-1 md:grid-cols-2 gap-8">
//           {plans.map((p, i) => (
//             <PricingCard
//               key={i}
//               plan={p}
//               onSelect={handleCheckout}
//             />
//           ))}
//         </div>

//         {/* TRUST FOOTER */}
//         <div className="mt-16 text-center">
//           <div className="inline-flex items-center gap-2 text-xs text-slate-500">
//             <ShieldCheck size={14} />
//             Encrypted financial infrastructure • No banking license required
//           </div>
//         </div>
//       </div>
//     </section>
//   );
// };

// export default Pricing;



import { motion } from "framer-motion";
import { createCheckoutSession } from "../../services/billingService";
import {
  CheckCircle2,
  ShieldCheck,
  ArrowRight,
  Sparkles,
  Crown,
  Zap,
} from "lucide-react";


const plans = [

{
name:"Smart Start",

subtitle:
"Personal financial foundation",

price:"₦0",

plan:"free",

description:
"Build healthy financial habits with essential tracking and budgeting tools.",


features:[
"Expense tracking dashboard",
"Manual budget planning",
"Basic financial reports",
"Personal finance workspace"
],

highlight:false

},



{
name:"Smart Intelligence",

subtitle:
"Advanced financial control system",

price:"₦5,000",

period:" / month",

plan:"pro",

description:
"Unlock deeper financial insights, automation, and intelligent money management.",


features:[
"Automated budget monitoring",
"Advanced financial analytics",
"Cashflow intelligence",
"Smart spending insights",
"Priority platform features"
],


highlight:true

}

];







const PricingCard = ({
plan,
onSelect
})=>{


return (

<motion.div

whileHover={{
y:-10
}}

transition={{
duration:.3
}}

className={`
relative
overflow-hidden
rounded-[34px]
p-8
border
backdrop-blur-xl
transition

${
plan.highlight

?

"border-blue-400/40 bg-white/70 shadow-[0_30px_90px_rgba(37,99,235,.18)]"

:

"border-white/60 bg-white/60"

}

`}

>




{/* PRISM GLOW */}


<div

className={`
absolute
top-[-120px]
right-[-80px]
h-64
w-64
rounded-full
blur-3xl

${
plan.highlight
?
"bg-blue-400/30"
:
"bg-slate-300/20"
}

`}

/>






<div className="relative">



{/* HEADER */}


<div className="flex justify-between items-start">


<div>


<div
className="
flex
items-center
gap-2
"
>

{

plan.highlight

?

<Crown
size={18}
className="text-blue-500"
/>

:

<Zap
size={18}
className="text-slate-400"
/>

}


<h3

className="
text-xl
font-bold
text-slate-900
"

>

{plan.name}

</h3>


</div>


<p

className="
mt-2
text-sm
text-slate-500
"

>

{plan.subtitle}

</p>


</div>





{

plan.highlight && (

<div

className="
rounded-full
bg-blue-500/10
px-3
py-1
text-xs
font-semibold
text-blue-600
"

>

MOST POWERFUL

</div>

)

}



</div>








{/* PRICE CORE */}



<div

className="
mt-10
rounded-3xl
bg-gradient-to-br
from-blue-50
to-white
border
border-blue-100
p-6
"

>


<div

className="
text-xs
uppercase
tracking-widest
text-slate-400
"

>

Monthly Access


</div>


<div

className="
mt-3
flex
items-end
"

>


<h2

className="
text-5xl
font-bold
tracking-tight
text-slate-950
"

>

{plan.price}


</h2>


{
plan.period &&

<span

className="
mb-2
text-sm
text-slate-500
"

>

{plan.period}

</span>

}


</div>



</div>








{/* DESCRIPTION */}


<p

className="
mt-7
text-sm
leading-7
text-slate-600
"

>

{plan.description}

</p>








{/* FEATURES */}


<div

className="
mt-8
space-y-4
"

>


{
plan.features.map((feature,index)=>(


<div

key={index}

className="
flex
items-center
gap-3
"

>


<div

className="
h-6
w-6
rounded-full
bg-blue-50
flex
items-center
justify-center
"

>


<CheckCircle2

size={14}

className="
text-blue-600
"

/>


</div>



<span

className="
text-sm
text-slate-700
"

>

{feature}

</span>



</div>


))

}


</div>









{/* BUTTON */}



<button

onClick={()=>onSelect(plan.plan)}

className={`
mt-10
w-full
h-14
rounded-2xl
font-semibold
flex
items-center
justify-center
gap-3
transition

${
plan.highlight

?

"bg-gradient-to-r from-blue-600 to-cyan-500 text-white shadow-lg shadow-blue-500/20"

:

"bg-white border border-slate-200 text-slate-900 hover:border-blue-300"

}

`}

>


{
plan.highlight
?
"Activate Intelligence"
:
"Start Free"
}


<ArrowRight size={17}/>


</button>






<div

className="
mt-6
flex
items-center
justify-center
gap-2
text-xs
text-slate-400
"

>


<ShieldCheck size={13}/>

Secure financial access


</div>




</div>



</motion.div>

);

};









const Pricing =()=>{


const handleCheckout = async(plan)=>{

try{

const {url}=await createCheckoutSession(plan);

window.location.assign(url);


}catch{

alert(
"Transaction initialization failed"
);

}

};





return (

<section

className="
relative
overflow-hidden
py-32
bg-[#F5F9FF]
"

>





{/* BLUE PRISM BACKGROUND */}


<div className="absolute inset-0">


<div

className="
absolute
top-[-200px]
left-1/2
-translate-x-1/2
h-[650px]
w-[650px]
rounded-full
bg-blue-400/20
blur-[150px]
"

/>



<div

className="
absolute
bottom-[-200px]
right-[-100px]
h-[500px]
w-[500px]
rounded-full
bg-cyan-300/20
blur-[130px]
"

/>


</div>








<div

className="
relative
max-w-6xl
mx-auto
px-6
"

>




{/* HEADER */}


<div

className="
text-center
max-w-3xl
mx-auto
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
border-blue-100
px-4
py-2
text-xs
text-blue-600
"

>


<Sparkles size={14}/>

SmartBudget Intelligence Plans


</div>




<h2

className="
mt-8
text-5xl
md:text-6xl
font-bold
tracking-tight
text-slate-950
"

>

Choose your level
of financial control.


</h2>




<p

className="
mt-6
text-slate-600
leading-7
"

>

Start with the essentials and upgrade when
you are ready for deeper financial intelligence.

</p>


</div>








{/* PLANS */}


<div

className="
mt-16
grid
md:grid-cols-2
gap-8
"

>


{
plans.map((plan,index)=>(


<PricingCard

key={index}

plan={plan}

onSelect={handleCheckout}

/>


))

}


</div>






<div

className="
mt-16
flex
justify-center
"

>


<div

className="
flex
items-center
gap-2
rounded-full
bg-white/70
border
border-slate-200
px-5
py-3
text-xs
text-slate-500
"

>

<ShieldCheck size={14}/>

Protected payment infrastructure


</div>


</div>




</div>



</section>

);

};


export default Pricing;