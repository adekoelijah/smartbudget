import {
  CreditCard,
  ShieldCheck,
  Receipt,
  CheckCircle2,
  Sparkles,
  ArrowRight,
  Download,
} from "lucide-react";

import { useState } from "react";


const BillingSettings = () => {


  const [loading, setLoading] = useState(false);



  /*
  ========================================
  MOCK DATA
  Replace with API later
  ========================================
  */


  const subscription = {

    plan: "SmartBudget Premium",

    status: "Active",

    price: "₦1,000",

    cycle: "month",

    renewalDate: "August 28, 2026",

    features: [

      "AI financial insights",

      "Unlimited budgets",

      "Advanced analytics",

      "Smart recommendations",

      "Priority support",

    ],

  };



  const paymentMethod = {

    type: "Visa",

    last4: "4242",

    expiry: "08/28",

  };



  const invoices = [

    {

      id:"INV-001",

      date:"July 28, 2026",

      amount:"₦1,000",

      status:"Paid",

    },

    {

      id:"INV-002",

      date:"June 28, 2026",

      amount:"₦1,000",

      status:"Paid",

    },

  ];




  const handleManageSubscription = async()=>{


    try{

      setLoading(true);


      /*
        TODO:
        Connect Paystack customer portal
      */


      console.log(
        "Manage subscription"
      );


    }

    finally{

      setLoading(false);

    }

  };




return (

<div
  className="
    space-y-8
    text-white
  "
>


{/* HEADER */}

<div>

<h1
  className="
    font-bold text-3xl tracking-tight
  "
>

Billing & Subscription

</h1>


<p
  className="
    mt-2
    text-slate-400 text-sm
  "
>

Manage your SmartBudget membership,
payments and invoices.

</p>


</div>





{/* SUBSCRIPTION CARD */}

<div
  className="
    relative overflow-hidden
    p-8
    bg-white/[0.04]
    border border-white/10 rounded-[32px]
    shadow-xl backdrop-blur-xl
  "
>


<div
  className="
    top-0 right-0 absolute
    w-40 h-40
    bg-blue-500/20
    rounded-full
    blur-3xl
  "
  /
>



<div
  className="
    relative flex flex-col lg:flex-row lg:justify-between lg:items-center
    gap-8
  "
>


<div>


<div
  className="
    flex items-center
    gap-3
  "
>


<div
  className="
    p-3
    bg-blue-500/20
    rounded-2xl
  "
>

<Sparkles
  size={22}
  className="
    text-blue-400
  "
  /
>

</div>


<div>

<h2
  className="
    font-semibold text-xl
  "
>

{subscription.plan}

</h2>


<div
  className="
    flex items-center
    mt-1
    text-emerald-400 text-sm
    gap-2
  "
>

<CheckCircle2 size={16}/>

{subscription.status}

</div>


</div>


</div>



<div
  className="
    flex items-end
    mt-6
    gap-2
  "
>


<span
  className="
    font-bold text-4xl
  "
>

{subscription.price}

</span>


<span
  className="
    mb-1
    text-slate-400
  "
>

/ {subscription.cycle}

</span>


</div>



<p
  className="
    mt-3
    text-slate-400 text-sm
  "
>

Next billing date:
<span
  className="
    ml-2
    font-medium text-white
  "
>

{subscription.renewalDate}

</span>

</p>



</div>





<button
  onClick={handleManageSubscription}

disabled={loading}
  className="
    flex justify-center items-center
    px-6 py-3
    font-semibold text-white
    bg-blue-500 hover:bg-blue-400
    rounded-2xl
    disabled:opacity-50 transition
    gap-2
  "
>

{loading
?
"Processing..."
:
"Manage Subscription"
}


<ArrowRight size={18}/>


</button>



</div>





{/* FEATURES */}

<div
  className="
    grid sm:grid-cols-2 lg:grid-cols-5
    mt-8
    gap-4
  "
>


{
subscription.features.map(
(feature)=>(
<div
  key={feature}
  className="
    flex items-center
    px-4 py-3
    text-slate-300 text-sm
    bg-black/20
    border border-white/10 rounded-2xl
    gap-2
  "
>

<CheckCircle2
  size={16}
  className="
    text-blue-400
  "
  /
>


{feature}


</div>
)

)

}


</div>


</div>









{/* LOWER GRID */}


<div
  className="
    grid lg:grid-cols-2
    gap-8
  "
>






{/* PAYMENT METHOD */}


<div
  className="
    p-7
    bg-white/[0.04]
    border border-white/10 rounded-[32px]
    backdrop-blur-xl
  "
>


<div
  className="
    flex items-center
    mb-6
    gap-3
  "
>

<div
  className="
    p-3
    bg-blue-500/20
    rounded-xl
  "
>

<CreditCard
  size={20}
  className="
    text-blue-400
  "
  /
>

</div>


<div>

<h3
  className="
    font-semibold
  "
>

Payment Method

</h3>


<p
  className="
    text-slate-400 text-sm
  "
>

Secure payment information

</p>


</div>


</div>




<div
  className="
    p-5
    bg-black/20
    border border-white/10 rounded-2xl
  "
>


<p
  className="
    text-slate-400 text-sm
  "
>

Card

</p>


<h4
  className="
    mt-2
    font-semibold text-lg
  "
>

{paymentMethod.type}

**** {paymentMethod.last4}

</h4>


<p
  className="
    mt-2
    text-slate-400 text-sm
  "
>

Expires {paymentMethod.expiry}

</p>



<button
  className="
    w-full
    mt-5 py-3
    font-medium text-sm
    hover:bg-white/5
    border border-white/10 rounded-xl
    transition
  "
>

Update Card

</button>


</div>


</div>









{/* BILLING HISTORY */}


<div
  className="
    p-7
    bg-white/[0.04]
    border border-white/10 rounded-[32px]
    backdrop-blur-xl
  "
>


<div
  className="
    flex items-center
    mb-6
    gap-3
  "
>


<div
  className="
    p-3
    bg-blue-500/20
    rounded-xl
  "
>

<Receipt
  size={20}
  className="
    text-blue-400
  "
  /
>


</div>


<div>

<h3
  className="
    font-semibold
  "
>

Billing History

</h3>


<p
  className="
    text-slate-400 text-sm
  "
>

Your recent payments

</p>


</div>


</div>





<div
  className="
    space-y-4
  "
>


{
invoices.map(
(invoice)=>(
<div
  key={invoice.id}
  className="
    flex justify-between items-center
    p-4
    bg-black/20
    border border-white/10 rounded-2xl
  "
>


<div>

<p
  className="
    font-medium
  "
>

{invoice.id}

</p>


<p
  className="
    text-slate-400 text-sm
  "
>

{invoice.date}

</p>


</div>


<div
  className="
    text-right
  "
>


<p
  className="
    font-semibold
  "
>

{invoice.amount}

</p>


<div
  className="
    flex justify-end items-center
    text-emerald-400 text-sm
    gap-2
  "
>

<CheckCircle2 size={14}/>

{invoice.status}

</div>


</div>


<button
  className="
    ml-4
    text-slate-400 hover:text-white
  "
>

<Download size={18}/>

</button>



</div>

)

)

}


</div>


</div>


</div>










{/* SECURITY */}


<div
  className="
    p-7
    bg-white/[0.04]
    border border-white/10 rounded-[32px]
    backdrop-blur-xl
  "
>


<div
  className="
    flex items-center
    gap-3
  "
>


<ShieldCheck
  size={24}
  className="
    text-blue-400
  "
  /
>


<div>

<h3
  className="
    font-semibold
  "
>

Bank-grade payment security

</h3>


<p
  className="
    mt-1
    text-slate-400 text-sm
  "
>

Your financial information is protected
with secure encryption.

</p>


</div>


</div>


</div>

</div>

);

};


export default BillingSettings;