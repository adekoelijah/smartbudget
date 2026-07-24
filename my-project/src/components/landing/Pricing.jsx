

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
"Your personal money system",

price:"₦0",

plan:"free",

description:
"Start with a clean view of your income, spending, and savings habits so your budget becomes steady, not stressful.",


features:[
"Expense and income tracking",
"Simple budget planning",
"Personal savings goals",
"Essential financial reports"
],

highlight:false

},

{
name:"Smart Intelligence",

subtitle:
"For a financially disciplined lifestyle",

price:"₦5,000",

period:" / month",

plan:"pro",

description:
"Upgrade to real-time budget control, AI-powered insights, and automated guidance that keeps your money decisions intentional.",


features:[
"Live cashflow monitoring",
"AI spending recommendations",
"Automated budget alerts",
"Advanced reporting & trend visibility",
"Priority SmartBudget intelligence tools"
],


highlight:true

}

];

const PricingCard = ({ plan, onSelect }) => {
  return (
    <motion.div
  whileHover={{ y: -10 }}
  transition={{ duration: 0.3 }}
  className={`
    relative overflow-hidden rounded-[30px] border p-7 md:p-8
    transition-all duration-500
    ${
      plan.highlight
        ? "border-blue-400/40 bg-[linear-gradient(180deg,rgba(255,255,255,0.98),rgba(239,246,255,0.94))] shadow-[0_30px_100px_rgba(37,99,235,0.22)]"
        : "border-white/10 bg-white/[0.06] shadow-[0_25px_80px_rgba(15,23,42,0.25)]"
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

<div
  className="
    z-10 relative
  "
>
  <div
    className="
      flex justify-between items-start
      gap-4
    "
  >
  <div>
    <div
      className="
        flex items-center
        gap-2
      "
    >
      {plan.highlight ? (
        <div
          className="
            flex justify-center items-center
            w-9 h-9
            bg-blue-500/10
            rounded-2xl ring-1 ring-blue-200/80
          "
        >
          <Crown
            size={18}
            className="
              text-blue-600
            "
            /
          >
        </div>
      ) : (
        <div
          className="
            flex justify-center items-center
            w-9 h-9
            bg-slate-100
            rounded-2xl ring-1 ring-slate-200
          "
        >
          <Zap
            size={18}
            className="
              text-slate-500
            "
            /
          >
        </div>
      )}

      <h3 className={`text-xl font-bold tracking-tight ${plan.highlight ? "text-slate-950" : "text-white"}`}>
        {plan.name}
      </h3>
    </div>

    <p className={`mt-3 text-sm ${plan.highlight ? "text-slate-500" : "text-slate-300"}`}>
      {plan.subtitle}
    </p>
  </div>

  {plan.highlight && (
    <div
      className="
        px-3 py-1
        font-bold text-[10px] text-white uppercase tracking-[0.22em]
        bg-blue-600
        rounded-full
      "
    >
      Most Powerful
    </div>
  )}
</div>

{/* PRICE CORE */}

<div
  className={`
    mt-8 rounded-[26px] border p-6
    ${
      plan.highlight
        ? "border-blue-100 bg-[linear-gradient(135deg,rgba(14,116,144,0.08),rgba(255,255,255,0.98))]"
        : "border-white/10 bg-slate-900/50"
    }
  `}
>
  <div className={`text-[11px] font-semibold uppercase tracking-[0.24em] ${plan.highlight ? "text-slate-500" : "text-slate-300"}`}>
    Access to your money workspace
  </div>

  <div
    className="
      flex items-end
      mt-4
      gap-2
    "
  >
    <h2 className={`text-5xl font-bold tracking-tight ${plan.highlight ? "text-slate-950" : "text-white"}`}>
      {plan.price}
    </h2>

    {plan.period && (
      <span className={`mb-2 text-sm ${plan.highlight ? "text-slate-500" : "text-slate-300"}`}>
        {plan.period}
      </span>
    )}
  </div>
</div>
{/* DESCRIPTION */}
<p
  className="
    mt-7
    text-slate-600 text-sm leading-7
  "
>
{plan.description}

</p>
{/* FEATURES */}
<div
  className="
    space-y-4 mt-8
  "
>
{
plan.features.map((feature,index)=>(

<div
  key={index}
  className="
    flex items-center
    gap-3
  "
>
<div
  className="
    flex justify-center items-center
    w-6 h-6
    bg-blue-50
    rounded-full
  "
>
<CheckCircle2
  size={14}
  className="
    text-blue-600
  "
  /
>
</div>
<span
  className="
    text-slate-700 text-sm
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
"Unlock Smart Intelligence"
:
"Start building your budget"
}
<ArrowRight size={17}/>
</button>
<div
  className="
    flex justify-center items-center
    mt-6
    text-slate-400 text-xs
    gap-2
  "
>
<ShieldCheck size={13}/>

Protected financial workspace
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
    relative overflow-hidden
    py-32
    bg-[radial-gradient(circle_at_top,rgba(59,130,246,0.18),transparent_30%),linear-gradient(180deg,#020617_0%,#0f172a_48%,#020617_100%)]
  "
>
  <div
    className="
      absolute inset-0
      opacity-[0.18]
      [background-image:linear-gradient(to_right,rgba(255,255,255,0.12)_1px,transparent_1px),linear-gradient(to_bottom,rgba(255,255,255,0.12)_1px,transparent_1px)]
      [background-size:88px_88px]
    "
    /
  >

  <div
    className="
      top-[-220px] left-1/2 absolute
      w-[680px] h-[680px]
      bg-blue-400/20
      rounded-full
      blur-[150px]
      -translate-x-1/2
    "
    /
  >
  <div
    className="
      right-[-80px] bottom-[-180px] absolute
      w-[480px] h-[480px]
      bg-cyan-300/16
      rounded-full
      blur-[140px]
    "
    /
  >

  <div
    className="
      relative
      max-w-6xl
      mx-auto px-6
    "
  >
    <div
      className="
        max-w-3xl
        mx-auto
        text-center
      "
    >
      <div
        className="
          inline-flex items-center
          px-4 py-2
          font-semibold text-[11px] text-blue-100 uppercase tracking-[0.24em]
          bg-white/8
          border border-white/10 rounded-full
          backdrop-blur-xl
          gap-2
        "
      >
        <Sparkles
          size={14}
          className="
            text-cyan-300
          "
          /
        >
        SmartBudget plans built for real money habits
      </div>

      <h2
        className="
          mt-8
          font-semibold text-white text-5xl md:text-6xl tracking-tight
        "
      >
        Choose the plan that fits your money rhythm
      </h2>
      <p
        className="
          max-w-2xl
          mx-auto mt-6
          text-slate-300 text-base leading-7
        "
      >
        Start simple, build consistency, and upgrade when you want smarter visibility into every dollar you earn and spend.
      </p>
    </div>

    <div
      className="
        grid md:grid-cols-2
        mt-16
        gap-8
      "
    >
      {plans.map((plan, index) => (
        <PricingCard key={index} plan={plan} onSelect={handleCheckout} />
      ))}
    </div>

    <div
      className="
        flex justify-center
        mt-16
      "
    >
      <div
        className="
          flex items-center
          px-5 py-3
          text-slate-300 text-xs
          bg-white/[0.04]
          border border-white/10 rounded-full
          backdrop-blur-3xl
          gap-2
        "
      >
        <ShieldCheck
          size={14}
          className="
            text-emerald-400
          "
          /
        >
        Protected payment infrastructure
      </div>
    </div>
  </div>
</section>
);
};
export default Pricing;