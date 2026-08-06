import {
  memo,
  useMemo,
} from "react";


import {
  User,
  ShieldCheck,
  Bell,
  CreditCard,
  SlidersHorizontal,
  BadgeCheck,
  Activity,
  Wifi,
  LockKeyhole,
} from "lucide-react";


import {
  useLocation,
} from "react-router-dom";


import {
  motion,
} from "framer-motion";


import {
  useUser,
} from "../../../hooks/useUser";





const SECTION_CONFIG = {


profile:{
title:"Profile Settings",
description:
"Manage your identity, personal information and account details.",
icon:User,
},


security:{
title:"Security Center",
description:
"Protect your account with authentication and session controls.",
icon:ShieldCheck,
},


notifications:{
title:"Notification Settings",
description:
"Control alerts, financial updates and account communication.",
icon:Bell,
},


preferences:{
title:"Preferences",
description:
"Customize your SmartBudget experience.",
icon:SlidersHorizontal,
},


billing:{
title:"Billing & Subscription",
description:
"Manage your plans, payments and subscription settings.",
icon:CreditCard,
},


};







const SettingsHeader = ()=>{


const location = useLocation();



const {
user,
loading,
}=useUser();





const sectionKey =
location.pathname
.split("/")
.filter(Boolean)
.pop();





const section =
SECTION_CONFIG[sectionKey]
||
SECTION_CONFIG.profile;





const SectionIcon =
section.icon;







const fullName =
useMemo(()=>{


const name = [

user?.firstName,

user?.lastName,

]

.filter(Boolean)
.join(" ");



return (
name ||
"SmartBudget User"
);


},[
user
]);







const initials =
useMemo(()=>{


return fullName

.split(" ")

.map(
item=>item[0]
)

.slice(0,2)

.join("")

.toUpperCase();



},[
fullName
]);








const securityScore =
useMemo(()=>{


let score = 40;



if(user?.emailVerified)
score +=20;


if(user?.phoneVerified)
score +=15;


if(user?.twoFactorEnabled)
score +=25;




return Math.min(
score,
100
);


},[
user
]);








return (

<motion
  .section

initial={{
opacity:0,
y:-8,
}}

animate={{
opacity:1,
y:0,
}}

transition={{
duration:0.25,
}}
  className="
    relative overflow-hidden
    bg-white
    border border-slate-200 rounded-3xl
    shadow-sm
  "
>


{/* Accent */}

<div
  className="
    top-0 right-0 left-0 absolute
    h-1
    bg-gradient-to-r from-blue-700 via-indigo-600 to-emerald-500
  "
  /
>







<div
  className="
    space-y-6 p-6
  "
>





{/* USER AREA */}


<div
  className="
    flex flex-col lg:flex-row lg:justify-between lg:items-center
    gap-6
  "
>





<div
  className="
    flex items-center
    gap-4
  "
>





{/* AVATAR */}

<div
  className="
    relative flex justify-center items-center overflow-hidden
    w-16 h-16
    font-bold text-white text-xl
    bg-slate-900
    rounded-2xl
    shrink-0
  "
>


{

user?.avatar

?

<img
  src={user.avatar}

alt={fullName}
  className="
    object-cover
    w-full h-full
  "
  /
>

:

initials

}



</div>







<div>


<div
  className="
    flex flex-wrap items-center
    gap-2
  "
>


<h2
  className="
    font-semibold text-slate-950 text-xl
  "
>

{

loading

?
"Loading..."

:

fullName

}

</h2>





<span
  className="
    inline-flex items-center
    px-2.5 py-1
    font-semibold text-emerald-700 text-xs
    bg-emerald-50
    border border-emerald-200 rounded-full
    gap-1
  "
>

<BadgeCheck size={13}/>

Verified

</span>



</div>





<p
  className="
    mt-1
    text-slate-500 text-sm
  "
>

{
user?.email
||
"No email connected"
}

</p>





<div
  className="
    flex flex-wrap
    mt-3
    gap-2
  "
>

<StatusPill

icon={Wifi}

text="Live Sync"

/>



<StatusPill

icon={Activity}

text="System Healthy"

/>


</div>



</div>






</div>









{/* SECURITY SCORE */}



<div
  className="
    w-full lg:w-72
    p-5
    bg-slate-50
    border border-slate-200 rounded-2xl
  "
>


<div
  className="
    flex justify-between items-center
  "
>


<div>


<p
  className="
    font-medium text-slate-500 text-xs uppercase tracking-wide
  "
>

Security Score

</p>



<h3
  className="
    mt-1
    font-bold text-slate-900 text-3xl
  "
>

{securityScore}%

</h3>



</div>



<ShieldCheck
  size={32}
  className="
    text-blue-600
  "
  /
>



</div>





<div
  role="progressbar"

aria-valuenow={securityScore}
  className="
    overflow-hidden
    h-2
    mt-4
    bg-slate-200
    rounded-full
  "
>

<div
  className="
    h-full
    bg-blue-600
    transition-all
  "
  style={{
width:`${securityScore}%`
}}

/
>


</div>




</div>






</div>









{/* CURRENT MODULE */}



<div
  className="
    flex flex-col md:flex-row md:justify-between md:items-center
    p-5
    bg-slate-50
    border border-slate-200 rounded-3xl
    gap-5
  "
>





<div
  className="
    flex items-center
    gap-4
  "
>



<div
  className="
    flex justify-center items-center
    w-12 h-12
    text-white
    bg-slate-950
    rounded-xl
  "
>

<SectionIcon size={22}/>

</div>





<div>


<p
  className="
    font-semibold text-slate-400 text-xs uppercase tracking-widest
  "
>

Settings Module

</p>




<h1
  className="
    mt-1
    font-bold text-slate-950 text-2xl
  "
>

{section.title}

</h1>



<p
  className="
    mt-2
    text-slate-500 text-sm
  "
>

{section.description}

</p>




</div>




</div>









<div
  className="
    flex items-center
    p-3
    bg-white
    border border-emerald-200 rounded-2xl
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
    font-semibold text-slate-900 text-sm
  "
>

Protection Active

</p>



<p
  className="
    text-slate-500 text-xs
  "
>

Encrypted financial workspace

</p>



</div>


</div>





</div>








</div>





</motion.section>


);

};









const StatusPill = ({
icon:Icon,
text,
})=>(


<div
  className="
    inline-flex items-center
    px-3 py-1.5
    font-medium text-slate-600 text-xs
    bg-white
    border border-slate-200 rounded-full
    gap-2
  "
>

<Icon
  size={13}
  className="
    text-emerald-600
  "
  /
>

{text}


</div>


);






export default memo(SettingsHeader);