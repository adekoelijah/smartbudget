import { memo } from "react";
import { motion } from "framer-motion";

import {
  User,
  ShieldCheck,
  Bell,
  SlidersHorizontal,
  CreditCard,
  LockKeyhole,
} from "lucide-react";



const tabs = [
  {
    id:"profile",
    label:"Profile",
    icon:User,
  },

  {
    id:"security",
    label:"Security",
    icon:ShieldCheck,
  },

  {
    id:"notifications",
    label:"Notifications",
    icon:Bell,
  },

  {
    id:"preferences",
    label:"Preferences",
    icon:SlidersHorizontal,
  },

  {
    id:"billing",
    label:"Billing",
    icon:CreditCard,
  },
];






const SettingsNav = ({
  activeTab,
  onNavigate,
}) => {


return (


<aside
  className="
    lg:top-6 lg:sticky overflow-hidden
    w-full lg:w-[320px]
    bg-white
    border border-slate-200 rounded-[28px]
    shadow-[0_18px_50px_rgba(15,23,42,0.08)]
  "
>




{/* HEADER */}


<div
  className="
    relative overflow-hidden
    px-5 py-5
    bg-gradient-to-br from-slate-950 via-slate-900 to-indigo-950
  "
>


<div
  className="
    absolute inset-0
    bg-[radial-gradient(circle_at_top_right,_#6366f1,_transparent_40%)]
    opacity-10
  "
  /
>



<div
  className="
    relative flex justify-between items-center
  "
>


<div>

<p
  className="
    font-semibold text-[10px] text-slate-400 uppercase tracking-[0.25em]
  "
>

SMARTBUDGET

</p>



<h2
  className="
    mt-2
    font-semibold text-white text-xl
  "
>

Settings

</h2>


</div>




<div
  className="
    flex items-center
    px-3 py-1.5
    bg-emerald-400/10
    border border-emerald-400/20 rounded-full
    gap-2
  "
>


<span
  className="
    w-2 h-2
    bg-emerald-400
    rounded-full
    animate-pulse
  "
  /
>



<span
  className="
    font-semibold text-emerald-300 text-xs
  "
>

Secure

</span>


</div>



</div>



</div>







{/* NAVIGATION */}



<nav
  className="
    flex lg:flex-col overflow-x-auto
    p-3
    gap-2 scrollbar-hide
  "
>


{
tabs.map(
(tab,index)=>{


const Icon = tab.icon;

const active =
activeTab === tab.id;



return (


<motion.button

key={tab.id}

onClick={()=>
onNavigate?.(tab.id)
}

whileTap={{
scale:.98
}}

initial={{
opacity:0,
x:-5
}}

animate={{
opacity:1,
x:0
}}

transition={{
delay:index * .04
}}

aria-current={
active
?
"page"
:
undefined
}


className={`

relative

flex

items-center

gap-3


min-w-fit

lg:w-full


px-4

py-3


rounded-2xl


border

transition-all


${

active

?

`
bg-slate-950
text-white
border-slate-950

shadow-[0_12px_30px_rgba(15,23,42,0.18)]
`

:

`

bg-white
text-slate-700

border-slate-200

hover:bg-slate-50

hover:border-slate-300

`

}

`}

>



{
active &&

<span
  className="
    hidden lg:block left-0 absolute
    w-1 h-8
    bg-indigo-400
    rounded-r-full
  "
  /
>

}





<div

className={`

flex
items-center
justify-center

h-10
w-10

rounded-xl


${

active

?

"bg-white/10"

:

"bg-slate-100"

}

`}

>


<Icon

size={18}

/>


</div>






<span
  className="
    font-semibold text-sm whitespace-nowrap
  "
>

{tab.label}

</span>





</motion.button>


)

}

)

}


</nav>







{/* SECURITY FOOTER */}



<div
  className="
    px-5 py-4
    bg-slate-50
    border-slate-100 border-t
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
    w-10 h-10
    bg-emerald-50
    rounded-xl
  "
>


<LockKeyhole
  size={18}
  className="
    text-emerald-600
  "
  /
>


</div>




<div>

<p
  className="
    text-slate-500 text-xs
  "
>

Bank-grade protection

</p>



<p
  className="
    font-semibold text-slate-900 text-sm
  "
>

Encrypted & Active

</p>


</div>



</div>



</div>




</aside>


);

};





export default memo(SettingsNav);