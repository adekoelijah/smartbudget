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


const [loading,setLoading] = useState(false);



const subscription = {

plan:"SmartBudget Premium",

status:"Active",

price:"₦1,000",

cycle:"month",

renewalDate:"August 28, 2026",

features:[

"AI Financial Insights",

"Unlimited Budgets",

"Advanced Analytics",

"Smart Recommendations",

"Priority Support",

],

};




const paymentMethod = {

type:"Visa",

last4:"4242",

expiry:"08/28",

};




const invoices=[

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
Future:
Paystack customer portal
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
    space-y-6
  "
>



{/* HEADER */}

<div>

<h1
  className="
    font-bold text-slate-900 text-2xl tracking-tight
  "
>
Billing & Subscription
</h1>


<p
  className="
    mt-2
    text-slate-500 text-sm
  "
>
Manage your SmartBudget plan,
payments and invoices securely.
</p>

</div>









{/* SUBSCRIPTION */}

<section
  className="
    relative overflow-hidden
    p-6
    bg-white
    border border-slate-200 rounded-3xl
    shadow-sm
  "
>


<div
  className="
    top-0 right-0 absolute
    w-40 h-40
    bg-blue-100/60
    rounded-full
    blur-3xl
  "
  /
>



<div
  className="
    relative flex flex-col md:flex-row md:justify-between md:items-center
    gap-6
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
    flex justify-center items-center
    w-12 h-12
    text-blue-600
    bg-blue-50
    rounded-2xl
  "
>

<Sparkles size={22}/>

</div>



<div>

<h2
  className="
    font-semibold text-slate-900 text-lg
  "
>

{subscription.plan}

</h2>


<div
  className="
    flex items-center
    mt-1
    text-emerald-600 text-sm
    gap-2
  "
>

<CheckCircle2 size={15}/>

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
    font-bold text-slate-900 text-4xl
  "
>

{subscription.price}

</span>


<span
  className="
    mb-1
    text-slate-500 text-sm
  "
>
/
{subscription.cycle}

</span>


</div>




<p
  className="
    mt-3
    text-slate-500 text-sm
  "
>

Next billing date:

<span
  className="
    ml-2
    font-medium text-slate-900
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
    inline-flex justify-center items-center
    px-6 py-3
    font-semibold text-white text-sm
    bg-slate-900 hover:bg-black
    rounded-2xl
    disabled:opacity-60 transition
    gap-2
  "
>


{
loading
?
"Processing..."
:
"Manage Subscription"
}


<ArrowRight size={17}/>


</button>





</div>








{/* FEATURES */}

<div
  className="
    grid sm:grid-cols-2 lg:grid-cols-5
    mt-8
    gap-3
  "
>

{
subscription.features.map(feature=>(

<div
  key={feature}
  className="
    flex items-center
    p-3
    text-slate-700 text-sm
    bg-slate-50
    border border-slate-200 rounded-xl
    gap-2
  "
>

<CheckCircle2
  size={16}
  className="
    text-emerald-500
  "
  /
>

{feature}


</div>


))

}


</div>



</section>









{/* LOWER SECTION */}

<div
  className="
    grid lg:grid-cols-2
    gap-6
  "
>










{/* PAYMENT */}

<section
  className="
    p-6
    bg-white
    border border-slate-200 rounded-3xl
    shadow-sm
  "
>


<div
  className="
    flex items-center
    gap-3
  "
>


<div
  className="
    flex justify-center items-center
    w-11 h-11
    text-blue-600
    bg-blue-50
    rounded-xl
  "
>

<CreditCard size={20}/>

</div>



<div>

<h3
  className="
    font-semibold text-slate-900
  "
>
Payment Method
</h3>


<p
  className="
    text-slate-500 text-xs
  "
>
Secure payment information
</p>


</div>


</div>





<div
  className="
    mt-6 p-5
    bg-slate-50
    border border-slate-200 rounded-2xl
  "
>


<p
  className="
    text-slate-500 text-xs
  "
>
Card
</p>


<p
  className="
    mt-2
    font-semibold text-slate-900 text-lg
  "
>

{paymentMethod.type}

**** {paymentMethod.last4}

</p>



<p
  className="
    mt-2
    text-slate-500 text-sm
  "
>

Expires {paymentMethod.expiry}

</p>




<button
  className="
    w-full
    mt-5 py-3
    font-medium text-slate-700 text-sm
    hover:bg-white
    border border-slate-200 rounded-xl
    transition
  "
>

Update Payment Method

</button>



</div>


</section>









{/* INVOICES */}

<section
  className="
    p-6
    bg-white
    border border-slate-200 rounded-3xl
    shadow-sm
  "
>


<div
  className="
    flex items-center
    gap-3
  "
>


<div
  className="
    flex justify-center items-center
    w-11 h-11
    text-blue-600
    bg-blue-50
    rounded-xl
  "
>

<Receipt size={20}/>

</div>



<div>

<h3
  className="
    font-semibold text-slate-900
  "
>
Billing History
</h3>


<p
  className="
    text-slate-500 text-xs
  "
>
Recent transactions
</p>


</div>


</div>







<div
  className="
    space-y-3 mt-6
  "
>

{
invoices.map(invoice=>(


<div
  key={invoice.id}
  className="
    flex justify-between items-center
    p-4
    bg-slate-50
    border border-slate-200 rounded-2xl
  "
>


<div>

<p
  className="
    font-medium text-slate-900 text-sm
  "
>

{invoice.id}

</p>


<p
  className="
    text-slate-500 text-xs
  "
>

{invoice.date}

</p>


</div>





<div
  className="
    flex items-center
    gap-4
  "
>


<div
  className="
    text-right
  "
>


<p
  className="
    font-semibold text-slate-900 text-sm
  "
>

{invoice.amount}

</p>



<span
  className="
    flex justify-end items-center
    text-emerald-600 text-xs
    gap-1
  "
>

<CheckCircle2 size={13}/>

{invoice.status}

</span>


</div>





<button
  className="
    text-slate-400 hover:text-slate-900
    transition
  "
>

<Download size={17}/>

</button>



</div>





</div>


))

}


</div>


</section>







</div>









{/* SECURITY */}

<section
  className="
    flex items-start
    p-6
    bg-white
    border border-slate-200 rounded-3xl
    shadow-sm
    gap-4
  "
>


<div
  className="
    flex justify-center items-center
    w-12 h-12
    text-emerald-600
    bg-emerald-50
    rounded-2xl
  "
>

<ShieldCheck size={22}/>

</div>



<div>

<h3
  className="
    font-semibold text-slate-900
  "
>

Bank-grade payment security

</h3>


<p
  className="
    mt-1
    text-slate-500 text-sm leading-relaxed
  "
>

Your payment information is protected
using secure encryption and trusted
payment processing infrastructure.

</p>


</div>



</section>





</div>

);

};


export default BillingSettings;